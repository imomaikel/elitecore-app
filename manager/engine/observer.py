from lib.db import dbGetAllServers, dbUpdateLastStatus
from engine.api import sendData, getSkipAutoRestart
from ui.rconStatus import getServerRCONStatus
from engine.getStatuses import getStatuses
from engine.startServer import startServer
from utils.constans import ServerDetails
from lib.db import handleRCONPassword
from threading import Timer
from typing import List


# Loop functions every x seconds
def __set_interval(func, sec):
    def func_wrapper():
        __set_interval(func, sec)
        func()
    t = Timer(sec, func_wrapper)
    t.daemon = True
    t.start()
    return t


# Initialize observer
def observeServers():
    __set_interval(runObserver, 30)


# Check servers
def runObserver():
    if getSkipAutoRestart():
        return

    storedServers: List[ServerDetails] = dbGetAllServers()

    if len(storedServers) == 0:
        return

    currentServers: List[ServerDetails] = getStatuses()

    rconPassword = handleRCONPassword()

    # Check if the status has changed
    changedServers = []
    # Server that should be auto restarted
    idsToStart = []

    for storedServer in storedServers:
        getServerRCONStatus(storedServer.rconPort, rconPassword,
                            storedServer.multiHome, storedServer.mapName, storedServer.id)
        lastStatus = storedServer.lastStatus
        currentStatus = next(
            entry for entry in currentServers if entry.id == storedServer.id).status
        if not lastStatus == currentStatus:
            dbUpdateLastStatus(storedServer.id, currentStatus)
            if currentStatus == 'offline' and storedServer.autoRestart == 1:
                idsToStart.append(storedServer.id)
            if storedServer.serverName == 'EliteCore':
                changedServers.append({
                    'serverId': storedServer.id,
                    'currentStatus': currentStatus
                })
    if len(changedServers) > 0:
        for changedServer in changedServers:
            if changedServer['serverId'] in idsToStart:
                del changedServer
        sendData('serverStatusUpdate', changedServers)
    # Auto restart with Discord notification
    if len(idsToStart) > 0:
        for id in idsToStart:
            action = startServer(id, True)
            if action and action[0] and action[0]['status']:
                if action[0]['status'] == 'success':
                    dbUpdateLastStatus(id, 'online')
                    sendData('autoRestart', id)
