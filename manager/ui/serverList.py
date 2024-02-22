from utils.constans import actionModes, ServerDetails
from engine.getStatuses import getStatuses
from lib.db import dbUpdateAutoRestart
from ttkbootstrap.constants import *
from ui.handler import handler
from ui.notify import notify
import ttkbootstrap as ttk
from typing import List


# Server List Window
class ServerList(ttk.Toplevel):
    def __init__(self, title, mode: actionModes, rootWindow):
        super().__init__()

        # Window settings
        self.configure(padx=10, pady=10)
        self.title(title)
        self.resizable(0, 0)
        self.withdraw()
        self.buttons = []

        # Get all servers
        servers: List[ServerDetails] = getStatuses()

        # Count online servers
        onlineServers = len(
            [entry for entry in servers if entry.status == "online"])
        # Count offline servers
        offlineServers = len(
            [entry for entry in servers if entry.status == "offline"])

        # Find possible options depending on the action
        if (len(servers) == 0 or ((mode == "ACTION_STOP" or mode == "ACTION_RESTART") and onlineServers == 0) or (mode == "ACTION_START" and offlineServers == 0)):
            notify("No servers in here.", "info")
            self.destroy()
            return

        # Show window
        self.deiconify()

        # Get action name
        action = "" if mode == "ALL" else mode.split(
            "_")[1].lower().capitalize()

        # Search for online or offline server depending on action
        if not mode == "ALL" and not mode == "ACTION_REMOVE":
            searchFor = ""
            if mode == "ACTION_STOP" or mode == "ACTION_RESTART":
                searchFor = "online"
            else:
                searchFor = "offline"
            servers = list(filter(lambda f: f.status == searchFor, servers))

        # Sort by game
        servers.sort(key=lambda k: k.gameType)

        # Map name label
        ttk.Label(self, text="Map / Custom Name").grid(
            row=0, column=0, padx=5, pady=(5, 25)
        )
        # Game type label
        ttk.Label(self, text="ARK").grid(row=0, column=1, padx=5, pady=(5, 25))
        # Game mode label
        ttk.Label(self, text="Game Mode").grid(
            row=0, column=2, padx=5, pady=(5, 25))
        # Auto restart, status and action label
        if mode == "ALL":
            ttk.Label(self, text="Auto Restart").grid(
                row=0, column=3, padx=5, pady=(5, 25)
            )
            ttk.Label(self, text="Status").grid(
                row=0, column=4, padx=5, pady=(5, 25))
            ttk.Label(self, text="Server").grid(
                row=0, column=5, padx=5, pady=(5, 25))
        else:
            ttk.Label(self, text="Action").grid(
                row=0, column=3, padx=5, pady=(5, 25))

        # Display servers
        index = 1
        for server in servers:
            name = server.mapName
            if server.customName:
                name = f"{name}({server.customName})"
            # Map name
            ttk.Label(self, text=name, bootstyle=INFO).grid(
                row=index, column=0, padx=5, pady=5
            )
            # Game type
            ttk.Label(self, text=server.gameType).grid(
                row=index, column=1, padx=5, pady=5
            )
            # Game mode
            ttk.Label(self, text=server.gameMode).grid(
                row=index, column=2, padx=5, pady=5
            )
            # Show server status or check button
            if not mode == "ALL":
                ttk.Button(
                    self,
                    text=action,
                    command=lambda i=server.id: handler(
                        i, mode, self, rootWindow),
                ).grid(row=index, column=3, padx=5, pady=5)
            else:
                self.buttons.append({
                    "serverId": server.id,
                    "buttonObject": ttk.Checkbutton(
                        self, bootstyle="primary=round-toggle"
                    )}
                )

                # Get current checkbutton index
                currentIndex = len(self.buttons) - 1

                # Check if auto-restart is enabled
                if server.autoRestart:
                    self.buttons[currentIndex]["buttonObject"].state([
                                                                     "selected"])
                self.buttons[currentIndex]["buttonObject"].grid(
                    row=index, column=3, padx=5, pady=5
                )
                # Server status
                ttk.Label(
                    self,
                    text=server.status.upper(),
                    bootstyle=SUCCESS if server.status == "online" else DANGER,
                ).grid(row=index, column=4, padx=5, pady=5)
                # Server network
                ttk.Label(
                    self,
                    text=server.serverName,
                    bootstyle=INFO,
                ).grid(row=index, column=5, padx=5, pady=5)
            index += 1

        # Bind action to each check button
        if mode == "ALL":
            for button in self.buttons:
                button["buttonObject"].config(
                    command=lambda values={
                        "buttonObject": button["buttonObject"],
                        "serverId": button["serverId"],
                    }: dbUpdateAutoRestart(
                        values["serverId"], values["buttonObject"].instate([
                                                                           "selected"])
                    )
                )

        # Bulk action button
        if not mode == "ALL" and len(servers) >= 2:
            ttk.Label(self, text="All Servers", bootstyle=WARNING).grid(
                row=index, column=0, padx=5, pady=5
            )
            ttk.Button(
                self,
                text=action,
                width=15,
                command=lambda: handler("all", mode, self, rootWindow),
            ).grid(row=index, column=1, columnspan=3, padx=5, pady=5)

        # Window settings
        x, y = rootWindow.winfo_rootx(), rootWindow.winfo_rooty()
        self.bind("<Escape>", lambda x: self.destroy())
        self.focus()
        self.geometry("+%d+%d" % (x, y))
        self.grab_set()
