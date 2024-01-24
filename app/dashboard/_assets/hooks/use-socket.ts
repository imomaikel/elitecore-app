import { io } from 'socket.io-client';
import { useEffect } from 'react';

const socket = io({ path: '/api/socket' });

type TUseSocket = {
  eventName: string;
  callback: (data: any) => void;
};
const useSocket = ({ callback, eventName }: TUseSocket) => {
  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    socket.on(eventName, callback);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventName]);

  useEffect(() => {
    return () => {
      socket.disconnect();
    };
  }, []);

  return socket;
};

export default useSocket;
