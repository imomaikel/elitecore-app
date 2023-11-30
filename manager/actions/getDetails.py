from utils.constans import ServerDetails
from lib.db import dbAppendNewLog
from ui.notify import notify
import re

# Define regex
customNameRegex = "CustomName=[^\s]*"
queryPortRegex = "QueryPort=[0-9]{0,5}"
multiHomeRegex = "MULTIHOME=[^\s*]*"
rconPortRegex = "RCONPort=[0-9]{0,5}"
mapNameRegex = "\s.{2,20}\?listen"
pveCheck = "PvE"
asaCheck = "ASA"


# Extract data using regex
def findUsingRegex(script, regex):
    output = None
    findInScript = re.findall(regex, script)
    if findInScript and findInScript[0]:
        output = findInScript[0].split('=')[1]
    return output


# Get all needed details from a cmdline
def getDetails(script: str) -> ServerDetails | None:
    try:
        gameMode = 'PvE' if (script.find(pveCheck) > 10) else 'PvP'
        gameType = 'Ascendend' if (script.find(asaCheck) > 10) else 'Evolved'
        customName = findUsingRegex(script, customNameRegex)
        multiHome = findUsingRegex(script, multiHomeRegex)
        queryPort = findUsingRegex(script, queryPortRegex)
        rconPort = findUsingRegex(script, rconPortRegex)
        mapName = 'Error'

        if queryPort == None:
            notify('Failed to get Query Port.', 'error')
            return None
        if (rconPort == None):
            notify('Failed to get RCON Port.', 'error')
            return None
        queryPort = int(queryPort)
        rconPort = int(rconPort)

        if '.exe' in script:
            extractMap = re.findall(mapNameRegex, script)
            if extractMap and extractMap[0]:
                entry = extractMap[0]
                mapName = entry[1::].split('?')[0]
        if len(mapName) < 1:
            return None

        response = ServerDetails(
            mapName, queryPort, rconPort, gameMode, gameType, customName, multiHome, None)

        return response
    except Exception as e:
        dbAppendNewLog(e, 'getDetails')
        return None


'''
Example cmdline

echo off
:start
C:\Servers\steamcmd.exe +force_install_dir "C:\Servers\Island" +login anonymous +app_update 2430930 +quit
start ArkAscendedServer.exe TheIsland_WP?listen?Port=1234?QueryPort=1235?RCONPort=1236 -UseBattlEye -CustomName=IslandMap -clusterid=ASA
exit
'''
