from flask import Flask, Response, request, jsonify
from engine.restartServer import restartServer
from engine.getStatuses import getStatuses
from engine.startServer import startServer
from tornado.httpserver import HTTPServer
from engine.stopServer import stopServer
from tkinter.messagebox import showerror
from tornado.wsgi import WSGIContainer
from lib.db import dbAppendNewLog
from tornado.ioloop import IOLoop
from threading import Thread
from json import loads
import requests


# Global variables
skipAutoRestartWhileClientUseIt = False
app = Flask(__name__)


# Get variable
def getSkipAutoRestart():
    return skipAutoRestartWhileClientUseIt


def startAPI(rootWindow):
    server_thread = Thread(target=__runApi, args=(rootWindow,))
    server_thread.daemon = True
    server_thread.start()


# API Routes
@app.route('/api/manager', methods=["GET", "POST"])
def control():
    global skipAutoRestartWhileClientUseIt
    command = None
    serverId = None
    try:
        body = loads(request.data)
        command = body['command']
        if command == 'start' or command == 'stop' or command == 'restart':
            serverId = body['serverId']
    except:
        return Response('Invalid request', status=400)
    skipAutoRestartWhileClientUseIt = True
    result = None
    if command == 'start':
        result = startServer(serverId)
    elif command == 'stop':
        result = stopServer(serverId)
    elif command == 'restart':
        result = restartServer(serverId)
    elif command == 'getStatuses':
        statuses = getStatuses()
        data = []
        for server in statuses:
            data.append({
                'serverId': server.id,
                'currentStatus': server.status
            })
        result = data
    else:
        return Response('Invalid request', status=400)
    skipAutoRestartWhileClientUseIt = False
    return jsonify({'status': 'success', 'data': result})


def __runApi(rootWindow):
    try:
        # Setup the server
        application = WSGIContainer(app)
        http_server = HTTPServer(application)
        http_server.listen('3201', address='127.0.0.1')
        # Show app
        rootWindow.deiconify()
        # Start the server
        IOLoop.instance().start()
    except Exception as e:
        dbAppendNewLog(e, 'api')
        showerror('Ark Server Manager',
                  'Server Manager can not start as the API port is already in use')
        rootWindow.destroy()
        exit()


def sendData(eventType, data):
    try:
        payload = {'command': eventType, 'data': data}
        r = requests.post(
            url='http://127.0.0.1:3000/api/manager', json=payload, timeout=2)
        r.close()
    except:
        pass
