from engine.getStatuses import getStatuses
from engine.startServer import startServer
from engine.stopServer import stopServer
from utils.constans import ServerDetails
from typing import List


# Restart server
def restartServer(serverId):
    response = []

    # First stop selected servers
    stoppedServers = stopServer(serverId)
    serversToStart = []
    for server in stoppedServers:
        if server['status'] == 'error':
            response.append({
                'serverId': server['serverId'],
                'status': 'error'
            })
        else:
            serversToStart.append(server['serverId'])

    # Start servers that were successfully closed
    servers: List[ServerDetails] = getStatuses()
    offlineServers = [entry for entry in servers if entry.status == 'offline']

    # Start all servers if there were no closed servers
    if len(serversToStart) == len(offlineServers):
        result = startServer('all')
        return result
    else:
        # Start closed servers
        for serverId in serversToStart:
            action = startServer(serverId)
            response.append({
                'serverId': action[0]['serverId'],
                'status': action[0]['status']
            })
        return response
