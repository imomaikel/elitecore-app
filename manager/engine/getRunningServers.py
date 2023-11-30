from actions.getDetails import getDetails
from utils.constans import ServerDetails
from typing import List
import psutil


# Check which servers from the database are active
def getRunningServers() -> List[ServerDetails] | List:
    serverList = []
    for p in psutil.process_iter():
        try:
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
                server = getDetails(cmdline)
                if not server == None:
                    serverList.append(server)
        except:
            pass
    return serverList
