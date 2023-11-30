from lib.db import dbGetAllServers, dbUpdateLastStatus
from ui.rconStatus import getServerRCONStatus
from engine.getStatuses import getStatuses
from utils.constans import ServerDetails
from engine.socket import sendToClient
from lib.db import handleRCONPassword
from threading import Timer
from typing import List

# Loop functions every x seconds


def __set_interval(func, sec):
    def func_wrapper():
        __set_interval(func, sec)
        func()
    t = Timer(sec, func_wrapper)
    t.setDaemon(True)
    t.start()
    return t


# Initialize observer
def observeServers():
    __set_interval(runObserver, 10)


# Check servers
def runObserver():
    storedServers: List[ServerDetails] = dbGetAllServers()

    if len(storedServers) == 0:
        return

    currentServers: List[ServerDetails] = getStatuses()

    rconPassword = handleRCONPassword()

    # Check if the status has changed
    changedServers = []
    for storedServer in storedServers:
        getServerRCONStatus(storedServer.rconPort, rconPassword,
                            storedServer.multiHome, storedServer.mapName, storedServer.id)
        lastStatus = storedServer.lastStatus
        currentStatus = next(
            entry for entry in currentServers if entry.id == storedServer.id).status
        if not lastStatus == currentStatus:
            dbUpdateLastStatus(storedServer.id, currentStatus)
            changedServers.append({
                'serverId': storedServer.id,
                'currentStatus': currentStatus
            })
    if len(changedServers) > 0:
        payload = {
            'type': 'serverStatusUpdate',
            'data': changedServers
        }
        sendToClient('all', payload)
