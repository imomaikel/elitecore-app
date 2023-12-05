from lib.db import dbCreateTables, dbCreateConnection
from engine.observer import observeServers
from engine.api import startAPI
from ui.root import RootWindow
import ctypes


# App Icon
ctypes.windll.shell32.SetCurrentProcessExplicitAppUserModelID(
    'elitecore.server.manager')


# Start the App
def main():

    # Create a database file if it does not exist
    conn = dbCreateConnection()
    conn.close()
    dbCreateTables()

    # Create UI
    rootWindow = RootWindow()

    # Start http server
    startAPI(rootWindow)

    # Observe servers
    observeServers()

    # Start UI
    rootWindow.mainloop()


if __name__ == '__main__':
    main()
