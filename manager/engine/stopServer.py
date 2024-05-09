from lib.db import dbFindServer, dbAppendNewLog, dbUpdateAutoRestart
from engine.getStatuses import getStatuses
from actions.getDetails import getDetails
from utils.constans import ServerDetails
from typing import List
from time import sleep
import psutil


# Stop server
def stopServer(serverId):
    # One server
    if not serverId == 'all':
        dbUpdateAutoRestart(serverId, False)
        server = dbFindServer(serverId)
        action = __killServers([server])
        return action

    # All servers
    servers: List[ServerDetails] = getStatuses()
    onlineServers = [
        entry for entry in servers if entry.status == 'online']
    action = __killServers(onlineServers)
    for entry in onlineServers:
        dbUpdateAutoRestart(entry.id, False)
    return action


# Kill process server
def __killServers(servers: List[ServerDetails]):
    response = []
    try:
        for p in psutil.process_iter():
            if not psutil.pid_exists(p.pid):
                continue
            processName = p.name()
            if 'ShooterGame' in processName or 'ArkAscendedServer' in processName or 'AsaApiLoader' in processName:
                cmdlineArgs = p.cmdline()
                cmdline = ' '.join(cmdlineArgs)
                # Skip test servers
                if not '-UseBattlEye' in cmdline:
                    continue
                # Get details
                matchingServer = getDetails(cmdline)
                # Match servers
                for server in servers:
                    if matchingServer.mapName == server.mapName and matchingServer.queryPort == server.queryPort and matchingServer.queryPort == server.queryPort:
                        p.terminate()
    except Exception as e:
        dbAppendNewLog(e, 'stopServer')
    sleep(1.5)
    # Make sure that servers are closed
    for server in servers:
        checkServer: ServerDetails = getStatuses(server.id)
        response.append({
            'serverId': server.id,
            'status': 'error' if checkServer == True else 'success'
        })
    return response
