from lib.db import dbFindServer, dbAppendNewLog
from engine.getStatuses import getStatuses
from utils.constans import ServerDetails
from threading import Thread
from typing import List
from time import sleep
import subprocess


# Global threading values
threadIndex = 0
actionResult = []


# Start server
def startServer(serverId):
    global threadIndex
    global actionResult
    actionResult = []
    threadIndex = 0

    # Start just one server
    if not serverId == 'all':
        server = dbFindServer(serverId)
        if server == None:
            actionResult.append({
                'serverId': serverId,
                'status': 'error'
            })
            return actionResult
        __start(server)
        return actionResult

    # Start all servers
    __startThreads()
    return actionResult


# Start the .bat file
def __start(server: ServerDetails):
    global checkServer
    global threadIndex
    global actionResult
    checkServer = None
    try:
        cmd = subprocess.Popen(
            server.path, creationflags=subprocess.CREATE_NEW_CONSOLE)
        cmd.wait()
        sleep(1)
        # Make sure that the server started
        checkServer = getStatuses(server.id)
    except Exception as e:
        dbAppendNewLog(e, 'startServer')

    actionResult.append({
        'serverId': server.id,
        'status': 'success' if checkServer == True else 'error'
    })
    threadIndex += 1
    return


# Start servers using thread
def __startThreads():
    global threadIndex
    global actionResult
    servers: List[ServerDetails] = getStatuses()
    offlineServers = [
        entry for entry in servers if entry.status == 'offline'
    ]
    queue = 0
    for server in offlineServers:
        queue += 1
        Thread(target=__start, args=(server,)).start()
    sleep(2)
    # Wait for all servers to start
    while True:
        if queue == threadIndex:
            return actionResult
        sleep(1)
