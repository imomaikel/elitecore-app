from typing import Literal

# Possible actions
actionModes = Literal['ALL', 'ACTION_START',
                      'ACTION_STOP', 'ACTION_RESTART', 'ACTION_REMOVE']


# Server Class
class ServerDetails():
    def __init__(self, mapName, queryPort, rconPort, gameMode, gameType, customName, multiHome, id, status='unknown', autoRestart=0, path: str = None, lastStatus: str = None):
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

    def getData(self):
        return {
            'id': self.id,
            'mapName': self.mapName,
            'queryPort': self.mapName,
            'rconPort': self.rconPort,
            'gameMode': self.gameMode,
            'gameType': self.gameType,
            'customName': self.customName,
            'status': self.status
        }


# Servers schema table
serversTableTemplate = '''CREATE TABLE IF NOT EXISTS webapp.servers (
  id INT NOT NULL AUTO_INCREMENT,
  mapName VARCHAR(45) NOT NULL,
  path VARCHAR(200) NOT NULL,
  gameMode VARCHAR(45) NOT NULL,
  gameType VARCHAR(45) NOT NULL,
  autoRestart TINYINT NOT NULL,
  customName VARCHAR(45),
  multiHome VARCHAR(45),
  queryPort INT NOT NULL,
  rconPort INT NOT NULL,
  lastStatus VARCHAR(45) DEFAULT 'offline' NOT NULL,
  lastPlayers TINYINT DEFAULT 0 NOT NULL,
  position TINYINT DEFAULT 1 NOT NULL,
  PRIMARY KEY (id));'''
# Logs schema table
logsTableTemplate = '''CREATE TABLE IF NOT EXISTS webapp.app_logs (
  id INT NOT NULL AUTO_INCREMENT,
  content VARCHAR(1024) NOT NULL,
  file VARCHAR(64) NOT NULL,
  logCreatedAt DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id));'''
# Schema schema table
schemaTableTemplate = '''CREATE TABLE IF NOT EXISTS webapp.config (
  id INT NOT NULL AUTO_INCREMENT,
  rconPassword VARCHAR(1024) NOT NULL,
  PRIMARY KEY (id));'''


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
