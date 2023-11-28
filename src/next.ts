import { getPort } from './utils';
import next from 'next';

export const nextApp = next({
    dev: process.env.NODE_ENV !== 'production',
    port: getPort(),
});

export const nextRequestHandler = nextApp.getRequestHandler();
