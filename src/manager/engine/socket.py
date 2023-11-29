from lib.db import dbAppendNewLog
from threading import Thread
from ui.notify import notify
from sys import exit
import socket
import json

# Global Thread
socketThread = None

# Global variables
server = None
clientSockets = []


# Start the socket server
def createSocketServer(rootWindow):
    global socketThread
    global server
    try:
        server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        server.bind(('127.0.0.1', 3101))
        server.listen(5)
    except socket.error as e:
        if e.errno == 10048:
            notify('The app is already launched.', 'error')
            exit()
        else:
            notify('An error has occurred.')
            dbAppendNewLog(e, 'socket')
            exit()

    rootWindow.deiconify()
    socketThread = Thread(target=__initializeServer)
    socketThread.setDaemon(True)
    socketThread.start()


# Function to send data to the client
def sendToClient(clientSocket, message):
    if clientSocket == 'all':
        try:
            for s in clientSockets:
                s.send(bytes(message, 'utf-8'))
        except:
            pass
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

            if messageFromClient == 'ping':

                sendToClient(clientSocket, 'pong')
        clientSocket.close()
    except socket.error:
        # TODO array
        pass


# Wait for clients
def __initializeServer():
    while True:
        # Accept the client
        clientSocket, addr = server.accept()
        clientSockets.append(clientSocket)

        # Handle the client
        client_handler = Thread(
            target=__handleClient, args=(clientSocket,))
        client_handler.setDaemon(True)
        client_handler.start()
