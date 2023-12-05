import sendServerStatusNotifications from '../plugins/server-status/notifications';
import serverControlLog from '../plugins/server-control/logs';
import logger from '../scripts/logger';

// Receive a message from the Python Server
export const dataReceived = (action: any, data: any) => {
  try {
    if (action === 'autoRestart') {
      sendServerStatusNotifications(data);
      serverControlLog({
        action: 'restart',
        restartedBy: 'auto',
        serversOrId: data,
      });
    } else if (action === 'serverStatusUpdate') {
      sendServerStatusNotifications(data);
    }
    return;
  } catch (error) {
    logger({
      type: 'error',
      message: 'Could not parse the socket data',
      data: JSON.stringify(error),
    });
  }
};

// Types that can be received from the Python Server
export type TServerControlResponse = {
  serverId: number;
  status: 'error' | 'success';
};
export type TGetStatusesResponse = {
  serverId: number;
  currentStatus: 'online' | 'offline';
};

// All commands
type TFetchCommand =
  | {
      commandName: 'start';
      payload: {
        serverId: number | 'all';
      };
      response: TServerControlResponse[];
    }
  | {
      commandName: 'stop';
      payload: {
        serverId: number | 'all';
      };
      response: TServerControlResponse[];
    }
  | {
      commandName: 'restart';
      payload: {
        serverId: number | 'all';
      };
      response: TServerControlResponse[];
    }
  | { commandName: 'getStatuses'; response: TGetStatusesResponse[] };

// All Python Server responses depend on the command
type TFetchRequestResponse<T extends TFetchCommand['commandName']> = Extract<
  TFetchCommand,
  { commandName: T }
>['response'];

// Send a request with autocompletion for extra data depending on the command
export const fetchRequest = async <T extends TFetchCommand['commandName']>(
  ...args: Extract<TFetchCommand, { commandName: T }> extends {
    payload: infer TPayload;
  }
    ? [commandName: T, payload: TPayload]
    : [commandName: T]
): Promise<TFetchRequestResponse<T> | null> => {
  // Extract all args
  const reqBody = JSON.stringify({ command: args['0'], ...(typeof args['1'] === 'object' && args['1']) });

  const req = (await new Promise((resolve, reject) => {
    fetch('http://127.0.0.1:3201/api/manager', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: reqBody,
    })
      .then(async (res) => resolve(await res.json()))
      .catch(() => reject(null));
  }).catch(() => null)) as null | {
    data: any;
    status: 'success' | 'error';
  };

  if (!req || !req?.data || req.status === 'error') return null;

  return req.data as TFetchRequestResponse<T> | null;
};
