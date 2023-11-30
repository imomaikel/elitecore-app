from tkinter.simpledialog import askstring
from actions.addServer import addServer
from lib.db import handleRCONPassword
from ui.serverList import ServerList
from ui.rconStatus import RconStatus
from ttkbootstrap.constants import *
import ttkbootstrap as ttk


# Main Menu
class MainMenu(ttk.Frame):
    def __init__(self, rootWindow):
        super().__init__(rootWindow)

        self.pack(expand=True)

        # Server List Actions
        ttk.Label(self, text='Server List', style='bold.TLabel').grid(
            row=0, column=0, columnspan=2, pady=(0, 5))
        ttk.Button(
            self, text='Add a Server', width=15, command=self._addServer).grid(row=1, column=0, padx=5)
        ttk.Button(
            self, text='Remove a Server', width=15, command=self._removeServer).grid(row=1, column=1, padx=5)

        # Server Control Actions
        ttk.Label(
            self, text='Server Control', style='bold.TLabel').grid(row=2, column=0, columnspan=2, pady=(15, 5))
        ttk.Button(
            self, text='Start a Server', width=15, command=self._startServer).grid(row=3, column=0, padx=5)
        ttk.Button(
            self, text='Stop a Server', width=15, command=self._stopServer).grid(row=3, column=1, padx=5)
        ttk.Button(
            self, text='Restart a Server', width=15, command=self._restartServer).grid(row=4, column=0, padx=5, pady=(10, 0))
        ttk.Button(
            self, text='Server Status', width=15, command=self._statusServer).grid(row=4, column=1, padx=5, pady=(10, 0))

        # Misc Actions
        ttk.Label(self, text='Miscellaneous', style='bold.TLabel').grid(
            row=5, column=0, columnspan=2, pady=(15, 5))
        ttk.Button(self, text='RCON Status', width=15, command=self._rconStatus).grid(
            row=6, column=0, padx=5)
        ttk.Button(self, text='RCON Password', width=15, command=self._rconPassword).grid(
            row=6, column=1, padx=5)
        ttk.Button(self, text='Exit', width=15, command=self._exit).grid(
            row=7, column=0, columnspan=2, padx=0, pady=(10, 0))

        # Loader handler
        self.rootShowLoader = rootWindow.showLoader
        self.rootHideLoader = rootWindow.hideLoader

    def hide(self):
        self.pack_forget()

    def show(self):
        self.pack(expand=True)

    def _addServer(self):
        addServer()

    def _removeServer(self):
        ServerList('Remove a Server', 'ACTION_REMOVE', self)

    def _startServer(self):
        ServerList('Start a Server', 'ACTION_START', self)

    def _stopServer(self):
        ServerList('Stop a Server', 'ACTION_STOP', self)

    def _restartServer(self):
        ServerList('Restart a Server', 'ACTION_RESTART', self)

    def _statusServer(self):
        ServerList('Server Status', 'ALL', self)

    def _rconPassword(self):
        password = askstring('ARK Server Manager',
                             'Enter your RCON password. (the same for all servers)', initialvalue=handleRCONPassword())
        if not password == None:
            handleRCONPassword(password)

    def _rconStatus(self):
        RconStatus(self)

    def _exit(self):
        self.quit()
