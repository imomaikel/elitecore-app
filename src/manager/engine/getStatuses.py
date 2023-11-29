from engine.getRunningServers import getRunningServers
from lib.db import dbGetAllServers, dbAppendNewLog
from utils.constans import ServerDetails
from typing import List


# Get the status of each server
def getStatuses(checkServerId=None) -> List[ServerDetails] | bool:
    allServers = dbGetAllServers()
    runningServers = getRunningServers()

    response = []

    for server in allServers:
        try:
            # Check if the server is running
            res = next(
                (entry for entry in runningServers if entry.mapName
                 == server.mapName and entry.queryPort == server.queryPort and entry.rconPort == server.rconPort),
                None)

            # Returning only one server status
            if not checkServerId == None:
                if server.id == int(checkServerId):
                    return True if not res == None else False

            server.status = 'online' if not res == None else 'offline'
            response.append(server)
        except:
            dbAppendNewLog('Failed to get server status', 'getStatuses')

    return response
