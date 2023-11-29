from engine.socket import createSocketServer
from engine.observer import observeServers
from lib.db import dbCreateTables
from ui.root import RootWindow
import ctypes


# App Icon
ctypes.windll.shell32.SetCurrentProcessExplicitAppUserModelID(
    'elitecore.server.manager')


# Start the App
def main():
    # Create a database file if it does not exist
    dbCreateTables()

    # Create UI
    rootWindow = RootWindow()

    # Start socket server
    createSocketServer(rootWindow)

    # Observe servers
    observeServers()

    # Start UI
    rootWindow.mainloop()


if __name__ == '__main__':
    main()
