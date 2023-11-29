from engine.restartServer import restartServer
from engine.startServer import startServer
from engine.stopServer import stopServer
from utils.constans import actionModes
from lib.db import dbGetAllServers
from lib.db import dbRemoveServer
from ui.notify import notify


# Handle UI Control Buttons
def handler(serverId, mode: actionModes, window, root):
    if mode == 'ACTION_REMOVE':
        dbRemoveServer(serverId)
        window.destroy()
        return

    # Destroy server list
    window.destroy()
    # Show loader
    root.rootShowLoader()

    # Handle action
    if mode == 'ACTION_STOP':
        newStatuses = stopServer(serverId)
        createStatusNotify(newStatuses)
    if mode == 'ACTION_START':
        newStatuses = startServer(serverId)
        createStatusNotify(newStatuses)
    elif mode == 'ACTION_RESTART':
        newStatuses = restartServer(serverId)
        createStatusNotify(newStatuses)

    # Hide loader
    root.rootHideLoader()


# Display action notify
def createStatusNotify(statuses):
    servers = dbGetAllServers()
    notifyContent = ''
    for newStatus in statuses:
        serverData = next(
            entry for entry in servers if entry.id == newStatus['serverId']
        )
        newStatusLabel = newStatus['status']
        notifyContent += f'{serverData.mapName} - {serverData.gameType} : {newStatusLabel}\n'
    notify(notifyContent, 'info')
