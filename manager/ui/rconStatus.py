from lib.db import handleRCONPassword, dbAppendNewLog, dbUpdatePlayerCount, updatePlayerPlaytime
from engine.getStatuses import getStatuses
from utils.constans import ServerDetails
from utils.constans import ServerDetails
from ttkbootstrap.constants import *
import rcon.exceptions as errors
from rcon.source import Client
from ui.notify import notify
import ttkbootstrap as ttk
from typing import List


# Run a command to check if RCON is responding
def getServerRCONStatus(port: int, password: str, multiHome: str | None, mapName, serverId: int = None):
    status = 'offline'
    try:
        # Find RCON address
        addr = multiHome if not multiHome == None else '127.0.0.1'
        playerCount = 0
        with Client(addr, port, passwd=password, timeout=3) as client:
            response = client.run('ListPlayers')
            if 'no player' in response.lower():
                status = 'online'
            elif '.' in response:
                status = 'online'
                rows = response.split('\n')
                for row in rows:
                    if not '.' in row:
                        continue
                    separator = row.rindex(',') + 2
                    playerId = row[separator::]
                    playerName = row[row.index('.')+2::]
                    playerName = playerName[:playerName.rindex(',')]
                    playerCount += 1
                    updatePlayerPlaytime(playerName, playerId, mapName)
            client.close()
        if serverId:
            dbUpdatePlayerCount(serverId, playerCount)
    # Handle errors
    except errors.SessionTimeout:
        dbAppendNewLog(f'{mapName}:{port} RCON Timeout', 'rconStatus')
    except errors.ConfigReadError:
        dbAppendNewLog(
            f'{mapName}:{port} RCON Config Error', 'rconStatus')
    except errors.EmptyResponse:
        dbAppendNewLog(
            f'{mapName}:{port} RCON Empty Response', 'rconStatus')
    except errors.UserAbort:
        dbAppendNewLog(f'{mapName}:{port} RCON Abort', 'rconStatus')
    except errors.WrongPassword:
        dbAppendNewLog(
            f'{mapName}:{port} RCON Auth Error', 'rconStatus')
    except Exception as e:
        dbAppendNewLog(
            f'{mapName}:{port} RCON Unknown Error {str(e)}', 'rconStatus')
    return status


# RCON Status Window
class RconStatus(ttk.Toplevel):
    def __init__(self, window):
        super().__init__()

        # Window settings
        self.configure(padx=10, pady=10)
        self.title('RCON Status')
        self.resizable(0, 0)
        self.withdraw()

        # Get all servers
        servers: List[ServerDetails] = getStatuses()
        if len(servers) == 0:
            notify('No servers in here.', 'info')
            self.destroy()
            return

        # Show window
        self.deiconify()

        # Sort by game
        servers.sort(key=lambda k: k.gameType)

        # Get the RCON password
        rconPassword = handleRCONPassword()

        # Name
        ttk.Label(self, text='Map / Custom Name').grid(
            row=0, column=0, padx=5, pady=(5, 25))
        # Type
        ttk.Label(self, text='ARK').grid(
            row=0, column=1, padx=5, pady=(5, 25))
        # Mode
        ttk.Label(self, text='Game Mode').grid(
            row=0, column=2, padx=5, pady=(5, 25))
        ttk.Label(self, text='Server Status').grid(
            row=0, column=3, padx=5, pady=(5, 25))
        # Mode
        ttk.Label(self, text='RCON Status').grid(
            row=0, column=4, padx=5, pady=(5, 25))

        index = 1
        # Display servers
        for server in servers:
            rconStatus = 'offline' if not server.status == 'online' else getServerRCONStatus(
                server.rconPort, rconPassword, server.multiHome, server.mapName)

            name = server.mapName
            if server.customName:
                name = f'{name}({server.customName})'
            # Name
            ttk.Label(self, text=name, bootstyle=INFO).grid(
                row=index, column=0, padx=5, pady=5)
            # Type
            ttk.Label(self, text=server.gameType).grid(
                row=index, column=1, padx=5, pady=5)
            # Mode
            ttk.Label(self, text=server.gameMode).grid(
                row=index, column=2, padx=5, pady=5)

            # Server current status
            ttk.Label(self, text=server.status.upper(), bootstyle=SUCCESS if server.status == 'online' else DANGER).grid(
                row=index, column=3, padx=5, pady=5)

            # RCON current status
            ttk.Label(self, text=rconStatus.upper(), bootstyle=SUCCESS if rconStatus == 'online' else DANGER).grid(
                row=index, column=4, padx=5, pady=5)

            index += 1

        # Window settings
        x, y = window.winfo_rootx(), window.winfo_rooty()
        self.bind('<Escape>', lambda x: self.destroy())
        self.focus()
        self.geometry('+%d+%d' % (x, y))
        self.grab_set()
