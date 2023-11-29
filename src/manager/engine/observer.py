from lib.db import dbGetAllServers, dbUpdateLastStatus
from engine.getStatuses import getStatuses
# from engine.socket import sendSocketData
from utils.constans import ServerDetails
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

    # Check if the status has changed
    for storedServer in storedServers:
        lastStatus = storedServer.lastStatus
        currentStatus = next(
            entry for entry in currentServers if entry.id == storedServer.id).status
        if not lastStatus == currentStatus:
            dbUpdateLastStatus(storedServer.id, currentStatus)
            # sendSocketData(f'{storedServer.mapName}:{currentStatus}')
