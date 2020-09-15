const low = require('lowdb');

const { database, configuration } = require('../helpers/db');
const dbAdapter = database();
const configAdapter = configuration();
const { logger } = require('../helpers/logger');

const Conversation = require('google-assistant/components/conversation');

exports.sendTextInput = function (text, name) {
  return new Promise(async (res, rej) => {
    try {
      const db = await low(dbAdapter);
      const config = await low(configAdapter);
      const convo = await config.get('conversation').value();
      const users = await db.get('users').value();

      let nameToUse;
      convo.textQuery = text;

      if (users.length > 0) {
        if (!name) nameToUse = users[0].name;
        else nameToUse = name;
        const conversation = new Conversation(global.assistants[nameToUse], convo);
        logger.log('info', `Conversation from ${nameToUse}: ${text}`, {
          service: 'assistant',
          func: 'sendTextInput',
        });
        return res(conversation);
      }
      logger.log('error', 'Attempted Assistant Conversation. No users found', {
        service: 'assistant',
        func: 'sendTextInput',
      });
      res();
    } catch (e) {
      rej(e);
    }
  });
};
