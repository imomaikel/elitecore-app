import sendServerStatusNotifications from '../bot/plugins/server-status/notifications';
import net from 'net';

let isConnecting = false;
let client: net.Socket;

export const sendToPython = (data: string) => {
    if (client && client.writable) {
        client.write(data, 'utf-8');
        return true;
    } else {
        return false;
    }
};

// Get socket status
export const socketStatus = () => {
    return client && client.writable && !client.destroyed;
};

export const connectToSocketServer = () => {
    if (isConnecting) {
        setTimeout(() => {
            isConnecting = false;
            connectToSocketServer();
        }, 2000);
        return;
    }

    // Create socket client
    client = new net.Socket();

    // Connect to the python socket server
    if (!(process.env.SOCKET_PORT && process.env.SOCKET_HOST)) {
        console.log('No socket settings provided. Shutting down...');
        process.exit(0);
    }
    client.connect(
        parseInt(process.env.SOCKET_PORT),
        process.env.SOCKET_HOST,
        () => {
            isConnecting = false;
        },
    );

    // Receive data
    client.on('data', async (buffer) => {
        try {
            const parsedMessage = JSON.parse(buffer.toString());
            if (parsedMessage.type && parsedMessage.data) {
                if (parsedMessage.type === 'serverStatusUpdate') {
                    sendServerStatusNotifications(parsedMessage.data);
                }
            }
        } catch (error) {
            console.log('Could not parse the socket data', error);
        }
    });

    client.on('timeout', () => socketReconnect());
    client.on('error', () => socketReconnect());
    client.on('close', () => socketReconnect());
};

const socketReconnect = () => {
    if (!isConnecting) {
        isConnecting = true;
        setTimeout(connectToSocketServer, 2000);
    }
};
