from typing import Literal

# Possible actions
actionModes = Literal['ALL', 'ACTION_START',
                      'ACTION_STOP', 'ACTION_RESTART', 'ACTION_REMOVE']


# Server Class
class ServerDetails():
    def __init__(self, mapName, queryPort, rconPort, gameMode, gameType, customName, multiHome, id, status='unknown', autoRestart=0, path: str = None, lastStatus: str = None, serverName: str = 'EliteCore'):
        self.mapName = mapName
        self.queryPort = queryPort
        self.rconPort = rconPort
        self.gameMode = gameMode
        self.gameType = gameType
        self.customName = customName
        self.multiHome = multiHome
        self.id = id if id else None
        self.status: Literal['unknown', 'online', 'offline'] = status
        self.autoRestart = autoRestart
        self.path = path
        self.lastStatus = lastStatus
        self.serverName = serverName

    def getData(self):
        return {
            'id': self.id,
            'mapName': self.mapName,
            'queryPort': self.mapName,
            'rconPort': self.rconPort,
            'gameMode': self.gameMode,
            'gameType': self.gameType,
            'customName': self.customName,
            'status': self.status,
            'serverName': self.serverName
        }


# Servers schema table
serversTableTemplate = '''CREATE TABLE IF NOT EXISTS webapp.server (
  `id` int NOT NULL AUTO_INCREMENT,
  `mapName` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `path` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `gameMode` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `gameType` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `autoRestart` tinyint NOT NULL,
  `customName` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `multiHome` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `queryPort` int NOT NULL,
  `rconPort` int NOT NULL,
  `lastStatus` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'offline',
  `lastPlayers` tinyint NOT NULL DEFAULT '0',
  `position` tinyint NOT NULL DEFAULT '1',
  `serverName` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'EliteCore',
  PRIMARY KEY (`id`)
  '''
# Logs schema table
logsTableTemplate = '''CREATE TABLE IF NOT EXISTS webapp.AppLog (
 `id` int NOT NULL AUTO_INCREMENT,
  `content` varchar(1024) NOT NULL,
  `file` varchar(64) NOT NULL,
  `logCreatedAt` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
  '''
# Schema schema table
schemaTableTemplate = '''CREATE TABLE IF NOT EXISTS webapp.config (
  `id` int NOT NULL AUTO_INCREMENT,
  `rconPassword` varchar(1024) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `serverStatusUpdateDelay` tinyint NOT NULL DEFAULT '5',
  `serverControlUpdateDelay` tinyint NOT NULL DEFAULT '3',
  `currenciesLastUpdated` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `monthlyPaymentGoal` int NOT NULL DEFAULT '50',
  `autoCleanTicketFilesDays` tinyint NOT NULL DEFAULT '21',
  `countdownUpdateDelay` tinyint NOT NULL DEFAULT '5',
  `lastWipe` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `discordMembers` int NOT NULL DEFAULT '0',
  `ipAddress` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '127.0.0.1',
  PRIMARY KEY (`id`)
  '''


# App icon (base64 format)
def getIcon():
    icon = None
    try:
        icon = open('./iconBase64.txt', 'r').read()
    except:
        pass
    try:
        icon = open('../iconBase64.txt', 'r').read()
    except:
        pass
    if icon == None or len(icon) < 10:
        print('Could not find the app icon')
        exit()
    return icon
