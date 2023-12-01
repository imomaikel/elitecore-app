from engine.restartServer import restartServer
from engine.getStatuses import getStatuses
from engine.startServer import startServer
from engine.stopServer import stopServer
from lib.db import dbAppendNewLog
from threading import Thread
from ui.notify import notify
from json import dumps
from sys import exit
import socket

# Global Thread
socketThread = None

# Global variables
skipAutoRestartWhileClientUseIt = False
server = None
clientSockets = []
socketId = 0


# Get variable
def getSkipAutoRestart():
    return skipAutoRestartWhileClientUseIt


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
    rootWindow.deiconify()
    socketThread = Thread(target=__initializeServer)
    socketThread.daemon = True
    socketThread.start()


# Function to send data to the client
def sendToClient(clientSocket, message):
    if not type(message) == 'str':
        message = dumps(message)
    disconnectedUsers = []
    if clientSocket == 'all':
        index = 0
        for client in clientSockets:
            try:
                client.send(bytes(message, 'utf-8'))
            except:
                disconnectedUsers.append(index)
                continue
            index += 1
        for disconnectedUserIndex in disconnectedUsers:
            del clientSockets[disconnectedUserIndex]
    else:
        clientSocket.send(bytes(message, 'utf-8'))


# Handle client
def __handleClient(clientSocket):
    global skipAutoRestartWhileClientUseIt
    try:
        while True:
            data = clientSocket.recv(1024)
            if not data:
                break
            messageFromClient = str(data.decode('utf-8'))
            if messageFromClient.startswith('start'):
                skipAutoRestartWhileClientUseIt = True
                serverId = messageFromClient.split(':')[1]
                action = startServer(serverId)
                skipAutoRestartWhileClientUseIt = False
                payload = {
                    'type': 'serverControl',
                    'data': action
                }
                sendToClient('all', payload)
            elif messageFromClient.startswith('stop'):
                skipAutoRestartWhileClientUseIt = True
                serverId = messageFromClient.split(':')[1]
                action = stopServer(serverId)
                skipAutoRestartWhileClientUseIt = False
                payload = {
                    'type': 'serverControl',
                    'data': action
                }
                sendToClient('all', payload)
            elif messageFromClient.startswith('restart'):
                skipAutoRestartWhileClientUseIt = True
                print('TRUE')
                serverId = messageFromClient.split(':')[1]
                action = restartServer(serverId)
                print("FALSE")
                skipAutoRestartWhileClientUseIt = False
                payload = {
                    'type': 'serverControl',
                    'data': action
                }
                sendToClient('all', payload)
            elif messageFromClient == 'getStatuses':
                statuses = getStatuses()
                if type(statuses) == bool:
                    return
                response = []
                for server in statuses:
                    response.append({
                        'serverId': server.id,
                        'currentStatus': server.status
                    })
                payload = {
                    'type': 'getStatuses',
                    'data': response
                }
                sendToClient('all', payload)
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
        # Handle the client
        client_handler = Thread(
            target=__handleClient, args=(clientSocket,))
        client_handler.daemon = True
        client_handler.start()
