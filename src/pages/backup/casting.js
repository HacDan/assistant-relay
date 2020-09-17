import Dashboard from '~/src/layouts/Dashboard';
import withAuth from '~/src/helpers/withAuth';
import CastingLogs from '../components/CastingLogs';

import { CopyToClipboard } from 'react-copy-to-clipboard';
import { useContext, useEffect, useState } from 'react';
import { post } from '../helpers/api';
//import SocketConnect from '../helpers/SocketContext';
import moment from 'moment';

function Casting() {
  //const io = useContext(SocketConnect);

  const [devices, setDevices] = useState([]);
  const [command, setCommand] = useState();

  useEffect(() => {
    async function getDevices() {
      try {
        const { data } = await post('/api/cast/devices');
        setDevices(data);
      } catch (e) {
        await post('/api/server/writeLogs', {
          level: 'error',
          message: e.message,
          service: 'web',
          func: 'Casting - getDevices',
        });
      }
    }
    getDevices();
  }, []);

  // useEffect(() => {
  //   io.on('deviceFound', data => {
  //     console.log(data);
  //     setDevices($ => [...$, data]);
  //   });
  // }, []);

  async function forceRefresh(e) {
    e.preventDefault();
    try {
      const { data } = await post('/api/cast/refreshDevices');
      setDevices(data);
    } catch (e) {
      console.log(e);
    }
  }

  console.log(command);

  return (
    <Dashboard title="Casting Sandbox">
      <div className="md:grid md:grid-cols-3 md:gap-6">
        <div className="bg-white rounded-lg shadow-lg p-5 mt-10 md:col-span-2">
          <form>
            <div>
              <div>
                <div>
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Cast Sandbox</h3>
                  <p className="mt-1 text-sm leading-5 text-gray-500">
                    Use the below form to build and test the JSON data to send to the assistant
                    endpoint
                  </p>
                </div>
                <div className="mt-6 grid grid-cols-1 row-gap-6 col-gap-4 sm:grid-cols-6">
                  {/*<div className="sm:col-span-3">*/}
                  {/*  <label*/}
                  {/*    htmlFor="device"*/}
                  {/*    className="block text-sm font-medium leading-5 text-gray-700"*/}
                  {/*  >*/}
                  {/*    Device*/}
                  {/*  </label>*/}
                  {/*  <div className="mt-1">*/}
                  {/*    <div className="flex items-center w-full">*/}
                  {/*      <select*/}
                  {/*        id="user"*/}
                  {/*        className="form-select block transition duration-150 ease-in-out sm:text-sm sm:leading-5 w-full"*/}
                  {/*        onChange={e => {}}*/}
                  {/*      >*/}
                  {/*        {devices.map(d => {*/}
                  {/*          return <option value={d.name}>{d.name}</option>;*/}
                  {/*        })}*/}
                  {/*      </select>*/}
                  {/*      <div className="block mx-3">*/}
                  {/*        <button*/}
                  {/*          onClick={e => forceRefresh(e)}*/}
                  {/*          className="inline-flex justify-center py-1 px-1 border border-transparent text-sm leading-5 font-medium rounded-md text-white bg-gray-400 hover:bg-gray-500 focus:outline-none focus:border-blue-700 focus:shadow-outline-blue active:bg-blue-700 transition duration-150 ease-in-out"*/}
                  {/*        >*/}
                  {/*          <svg*/}
                  {/*            viewBox="0 0 20 20"*/}
                  {/*            fill="currentColor"*/}
                  {/*            className="refresh w-6 h-6"*/}
                  {/*          >*/}
                  {/*            <path*/}
                  {/*              fillRule="evenodd"*/}
                  {/*              d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"*/}
                  {/*              clipRule="evenodd"*/}
                  {/*            ></path>*/}
                  {/*          </svg>*/}
                  {/*        </button>*/}
                  {/*      </div>*/}
                  {/*    </div>*/}
                  {/*  </div>*/}
                  {/*</div>*/}

                  <div className="sm:col-span-6">
                    <label
                      htmlFor="about"
                      className="block text-sm font-medium leading-5 text-gray-700"
                    >
                      Command
                    </label>
                    <div className="mt-1 rounded-md shadow-sm">
                      <input
                        id="device"
                        className="form-input block w-full transition duration-150 ease-in-out sm:text-sm sm:leading-5"
                        onChange={e => setCommand(e.target.value)}
                      />
                    </div>
                    <p className="mt-2 text-sm text-gray-500">Command you wish to pass to CATT</p>
                  </div>

                  <div className="sm:col-span-6">
                    <label
                      htmlFor="apiKey"
                      className="block text-sm font-medium leading-5 text-gray-700"
                    >
                      API Key
                    </label>
                    <div className="mt-1 rounded-md shadow-sm">
                      <input
                        id="apiKey"
                        className="form-input block w-full transition duration-150 ease-in-out sm:text-sm sm:leading-5"
                        onChange={e => {}}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-8 border-t border-gray-200 pt-5">
              <div className="flex justify-end">
                <span className="ml-3 inline-flex rounded-md shadow-sm">
                  <button className="inline-flex justify-center py-2 px-4 border border-transparent text-sm leading-5 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:border-blue-700 focus:shadow-outline-blue active:bg-blue-700 transition duration-150 ease-in-out">
                    <span>Execute</span>
                  </button>
                </span>
              </div>
            </div>
          </form>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-5 mt-10 md:col-span-1">
          <div>
            <div>
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">JSON Data</h3>
                <p className="mt-1 text-sm leading-5 text-gray-500">
                  Use this data in your request to the assistant endpoint
                </p>
              </div>
              <div className="mt-6 grid grid-cols-1 row-gap-6 col-gap-4 sm:grid-cols-6">
                <div className="sm:col-span-6">
                  <label
                    htmlFor="about"
                    className="block text-sm font-medium leading-5 text-gray-700"
                  >
                    Command
                  </label>
                  <div className="mt-1 rounded-md shadow-sm">
                    <textarea
                      id="command"
                      readOnly
                      rows="13"
                      className="form-textarea block w-full transition duration-150 ease-in-out sm:text-sm sm:leading-5"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className=" pt-5">
            <div className="flex justify-end">
              <span className="ml-3 inline-flex rounded-md shadow-sm">
                <CopyToClipboard>
                  <button className="inline-flex justify-center py-2 px-4 border border-transparent text-sm leading-5 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:border-blue-700 focus:shadow-outline-blue active:bg-blue-700 transition duration-150 ease-in-out">
                    Copy JSON
                  </button>
                </CopyToClipboard>
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-lg p-5 mt-5">
        <div>
          <h3 className="text-lg leading-6 font-medium text-gray-900">Cast Events</h3>
        </div>
        <div className="pt-5">
          <CastingLogs />
        </div>
      </div>
    </Dashboard>
  );
}

export default withAuth(Casting);