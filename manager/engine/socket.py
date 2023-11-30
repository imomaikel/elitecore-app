from lib.db import dbAppendNewLog
from threading import Thread
from ui.notify import notify
from json import dumps
from sys import exit
import socket

# Global Thread
socketThread = None

# Global variables
server = None
clientSockets = []
socketId = 0

# Start the socket server


def createSocketServer(rootWindow):
    global socketThread
    global server
    try:
        server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        server.bind(('127.0.0.1', 3105))
        server.listen(5)
    except socket.error as e:
        if e.errno == 10048 or e.errno == 98:
            notify('The app is already launched.', 'error')
            exit()
        else:
            notify('An error has occurred.')
            dbAppendNewLog(e, 'socket')
            exit()
    print('Socket started')
    rootWindow.deiconify()
    socketThread = Thread(target=__initializeServer)
    socketThread.setDaemon(True)
    socketThread.start()


# Function to send data to the client
def sendToClient(clientSocket, message):
    if not type(message) == 'str':
        message = dumps(message)
    print('len:', len(clientSockets))
    disconnectedUsers = []
    if clientSocket == 'all':
        index = 0
        for client in clientSockets:
            print(f'Now: {index}/{len(clientSockets)-1}')
            try:
                client.send(bytes(message, 'utf-8'))
            except Exception as e:
                print(e)
                disconnectedUsers.append(index)
                print('client-')
                continue
            index += 1
        print('Loop end')
        for disconnectedUserIndex in disconnectedUsers:
            del clientSockets[disconnectedUserIndex]
    else:
        clientSocket.send(bytes(message, 'utf-8'))


# Handle client
def __handleClient(clientSocket):
    try:
        while True:
            data = clientSocket.recv(1024)
            if not data:
                break
            messageFromClient = data.decode('utf-8')
            print('recv', messageFromClient)
            if messageFromClient == 'ping':

                sendToClient(clientSocket, 'pong')
        clientSocket.close()
    except socket.error:
        pass


# Wait for clients
def __initializeServer():
    global socketId
    while True:
        # Accept the client
        clientSocket, addr = server.accept()
        clientSockets.append(clientSocket)
        print('client +')
        # Handle the client
        client_handler = Thread(
            target=__handleClient, args=(clientSocket,))
        client_handler.setDaemon(True)
        client_handler.start()
