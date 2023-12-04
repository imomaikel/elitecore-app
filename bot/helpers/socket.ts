import { sendToPython } from '../../server/socket';
import serverControlLog from '../plugins/server-control/logs';
import sendServerStatusNotifications from '../plugins/server-status/notifications';
import logger from '../scripts/logger';

export type TCommands = 'getStatuses' | 'serverControl';

export type TControlServer = {
  serverId: number;
  status: 'error' | 'success';
};
type TGetStatusesData = {
  serverId: number;
  currentStatus: 'online' | 'offline';
};

type TWaitingStatuses = {
  getStatuses: {
    isWaiting: boolean;
    lastData: TGetStatusesData[] | null;
  };
  serverControl: {
    isWaiting: boolean;
    lastData: TControlServer[] | null;
  };
};
const waitingStatuses: TWaitingStatuses = {
  getStatuses: {
    isWaiting: false,
    lastData: null,
  },
  serverControl: {
    isWaiting: false,
    lastData: null,
  },
};

type TSocketMessage<T> = {
  timeoutInSeconds?: number;
  commandToSend: T;
  detailedCommand?: string;
};

// Send a message to the Python Server Socket
export const socketMessage = async <T extends TCommands>({
  commandToSend,
  timeoutInSeconds = 10,
  detailedCommand,
}: TSocketMessage<T>): Promise<null | TWaitingStatuses[T]['lastData']> => {
  if (waitingStatuses[commandToSend].isWaiting) return null;
  waitingStatuses[commandToSend].isWaiting = true;
  waitingStatuses[commandToSend].lastData = null;

  const receivedResponse = await new Promise((resolve, reject) => {
    sendToPython(detailedCommand ?? commandToSend);
    let index = 0;
    const check = setInterval(() => {
      if (waitingStatuses[commandToSend].lastData !== null) {
        clearInterval(check);
        resolve(true);
      }
      if (index >= timeoutInSeconds) {
        clearInterval(check);
        reject(false);
      }
      index++;
    }, 1000);
  }).catch(() => {
    return false;
  });

  if (receivedResponse !== true) {
    waitingStatuses[commandToSend].isWaiting = false;
    return null;
  } else {
    return waitingStatuses[commandToSend].lastData;
  }
};

// Receive a message from the Python Server Socket
export const receiveSocketMessage = (buffer: Buffer) => {
  try {
    const parsedMessage = JSON.parse(buffer.toString());
    if (!(parsedMessage.type && parsedMessage.data)) return;

    if (parsedMessage.type === 'serverStatusUpdate') {
      sendServerStatusNotifications(parsedMessage.data);
    } else if (parsedMessage.type === 'autoRestart') {
      sendServerStatusNotifications(parsedMessage.data);
      serverControlLog({
        action: 'restart',
        restartedBy: 'auto',
        serversOrId: parsedMessage.data,
      });
    } else if (parsedMessage.type === 'getStatuses') {
      if (!waitingStatuses['getStatuses'].isWaiting) return;
      waitingStatuses['getStatuses'].isWaiting = false;
      waitingStatuses['getStatuses'].lastData = parsedMessage.data;
    } else if (parsedMessage.type === 'serverControl') {
      if (!waitingStatuses['serverControl'].isWaiting) return;
      waitingStatuses['serverControl'].isWaiting = false;
      waitingStatuses['serverControl'].lastData = parsedMessage.data;
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
