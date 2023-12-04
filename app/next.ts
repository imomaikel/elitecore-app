import next from 'next';

export const getPort = () => {
  let port = process.env.PORT || 3000;
  if (typeof port === 'string') port = parseInt(port);
  return port;
};

export const nextApp = next({
  dev: process.env.NODE_ENV !== 'production',
  port: getPort(),
});

export const nextRequestHandler = nextApp.getRequestHandler();
