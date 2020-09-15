const low = require('lowdb');
const path = require('path');
const FileWriter = require('wav').FileWriter;
const moment = require('moment');
const fs = require('fs');
const cheerio = require('cheerio');

const { sendTextInput } = require('../../../server/helpers/assistant');
const { logger } = require('../../../server/helpers/logger');

const { database, configuration } = require('../../../server/helpers/db');
const dbAdapter = database();
const configAdapter = configuration();

export default async (req, res) => {
  try {
    let fileStream;
    const timestamp = Date.now();
    const isQH = await isQuietHour();
    let { user, talkback = false, preset, command, broadcast, device } = req.body;
    const type = broadcast ? 'broadcast' : 'command';

    const response = {};

    if (preset) {
      broadcast = true;
      switch (preset) {
        case 'wakeup':
          command = `wake up everyone`;
          break;
        case 'breakfast':
          command = `breakfast is ready`;
          break;
        case 'lunch':
          command = `it's lunch time`;
          break;
        case 'dinner':
          command = `dinner is served`;
          break;
        case 'timetoleave':
          command = `its time to leave`;
          break;
        case 'arrivedhome':
          command = `i'm home`;
          break;
        case 'ontheway':
          command = `i'm on the way`;
          break;
        case 'movietime':
          command = `the movie is about to start`;
          break;
        case 'tvtime':
          command = `the show is about to start`;
          break;
        case 'bedtime':
          command = `we should go to bed`;
          break;
        default:
          command = `you selected a preset broadcast, but didn't say which one`;
      }
    }

    if (!command) return res.status(400).json({ success: false, error: 'No command given' });
    if (broadcast) {
      if (device) command = `broadcast to ${device}, ${command}`;
      else command = `broadcast ${command}`;
    }

    // Required as will create a blank .wav file for every request without.
    if (!broadcast) fileStream = await outputFileStream(timestamp);

    if (broadcast && isQH) {
      logger.log('warn', `Broadcast command received, but quiet hours is enabled`, {
        service: 'assistant',
        func: 'assistant',
      });
      return res.status(200).json({
        success: false,
        error: 'Quiet Time Enabled - Broadcast command detected',
      });
    }

    const conversation = await sendTextInput(command, user);
    conversation
      .on('audio-data', data => {
        /**
         * If the request is a broadcast, don't write audio data
         * as it's empty
         **/
        if (!broadcast) {
          fileStream.write(data);
          response.audio = `/audio-responses/${timestamp}.wav`;
        }
      })
      .on('response', text => {
        response.response = text;
        if (talkback && !isQH) {
          const regex = /(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|\ud83c[\ude32-\ude3a]|\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/g;
          const msg = text.replace(regex, '');
          logger.log('info', 'Talkback requested, not in quiet hours', {
            service: 'assistant',
            func: 'assistant',
          });
          sendTextInput(`broadcast ${msg}`, user);
        } else if (talkback && isQH) {
          logger.log('warn', 'Talkback requested, but quiet hours is enabled', {
            service: 'assistant',
            func: 'assistant',
          });
        }
      })
      .on('volume-percent', percent => {
        // do stuff with a volume percent change (range from 1-100)
      })
      .on('device-action', action => {
        // if you've set this device up to handle actions, you'll get that here
      })
      .on('screen-data', screen => {
        /**
         * If the request is a broadcast, don't write the HTML file
         * as the data is useless
         * Extract the content text from the HTML as text value from Assistant SDK is blank due to bug
         **/
        if (!broadcast) {
          const $ = cheerio.load(screen.data.toString());
          const stringFromHTML = $('.popout-content').text();

          response.text = stringFromHTML;
          response.html = `/html-responses/${timestamp}.html`;
          //response.rawHtml = screen.data.toString();
        }
      })
      .on('ended', async (error, continueConversation) => {
        if (error) {
          response.success = false;
          response.error = error;
          logger.log('error', `Conversation Ended with Error: ${error}`, {
            service: 'assistant',
            func: 'assistant',
          });
        } else {
          logger.log('info', `Conversation completed successfully`, {
            service: 'assistant',
            func: 'assistant',
          });
          response.success = true;
        }
        if (!broadcast) {
          // logger.log('info', 'Command not a broadcast, html file written', {
          //   service: 'assistant',
          //   func: 'assistant',
          // });

          fileStream.end();
        }
        conversation.end();
        await updateResponses(command, response.response, timestamp, type, user);
        res.status(200).json(response);
      })

      .on('error', error => {
        response.success = false;
        response.error = error.message;
        logger.log('error', `Assistant error: ${error.message}`, {
          service: 'assistant',
          func: 'assistant',
        });
        res.status(500).json(response);
      });
  } catch (e) {
    logger.log('error', `Something went wrong: ${e.message}`, {
      service: 'assistant',
      func: 'assistant',
    });
    res.status(500).send(e.message);
  }
};

async function outputFileStream(fileName) {
  const config = await low(configAdapter);
  const conversation = config.get('conversation').value();
  return new FileWriter(`public/audio-responses/${fileName}.wav`, {
    sampleRate: conversation.audio.sampleRateOut,
    channels: 1,
  });
}

function isQuietHour() {
  return new Promise(async (res, rej) => {
    const config = await low(configAdapter);
    const quietHours = config.get('quietHours').value();

    if (!quietHours.enabled) {
      return res(false);
    }

    const start = moment(quietHours.start, 'HH:mm');
    const until = moment(quietHours.end, 'HH:mm');
    let diff = moment.duration(until.diff(start)).asMinutes();

    if (diff < 0) until.add(1, 'days');
    return res(moment().isBetween(start, until));
  });
}

function saveHTMLFile(fileName, data) {
  logger.log('info', `Saving HTML file`, { service: 'server', func: 'saveHTMLFile' });
  fs.writeFile(`public/html-responses/${fileName}.html`, data, err => {
    if (err) {
      logger.log('error', `Failed to write HTML file: ${err}`, {
        service: 'server',
        func: 'saveHTMLFile',
      });
      throw err;
    }
    return;
  });
}

function updateResponses(command, response, timestamp, type, user = 'default') {
  return new Promise(async (res, rej) => {
    const db = await low(dbAdapter);
    const config = await low(configAdapter);
    const size = db.get('responses').size().value();
    const maxResponse = config.get('maxResponses').value();

    if (size >= maxResponse) {
      const results = db.get('responses').sortBy('timestamp').value();
      const timestamp = results[0].timestamp;
      try {
        fs.unlinkSync(path.resolve(`public/audio-responses/${timestamp}.wav`));
        //fs.unlinkSync(path.resolve(`public/html-responses/${timestamp}.html`));
      } catch (e) {
        logger.log('error', `Failed to remove files: ${e.message}`, {
          service: 'server',
          func: 'updateResponses',
        });
      }
      const entries = db.get('responses').sortBy('timestamp').drop(1).value();
      logger.log('info', `Removed oldest response and updated`, {
        service: 'server',
        func: 'updateResponses',
      });
      await db.set('responses', entries).write();
    }
    logger.log('info', `Updating responses`, { service: 'server', func: 'updateResponses' });
    await db.get('responses').push({ command, response, timestamp, type, user }).write();
    res();
  });
}
