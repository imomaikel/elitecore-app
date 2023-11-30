from utils.constans import serversTableTemplate, logsTableTemplate, schemaTableTemplate, ServerDetails
from mysql.connector import errorcode
from typing import List, Literal
from ui.notify import notify
import mysql.connector
from sys import exit
import dotenv
import os


# .env variables
dotenv.load_dotenv()
DATABASE_USER = os.getenv('DATABASE_USER')
DATABASE_SCHEMA = os.getenv('DATABASE_SCHEMA')
DATABASE_PASSWORD = os.getenv('DATABASE_PASSWORD')
DATABASE_HOST = os.getenv('DATABASE_HOST')


# Global variables
lastConn = None
isNotifyOpened = None


# Create connection
def dbCreateConnection():
    global lastConn
    global isNotifyOpened
    conn = None
    try:
        conn = mysql.connector.connect(
            user=DATABASE_USER, database=DATABASE_SCHEMA, password=DATABASE_PASSWORD, host=DATABASE_HOST)
    except mysql.connector.Error as e:
        print(e)
        if e.errno == errorcode.ER_ACCESS_DENIED_ERROR:
            notify('Database auth error', 'error')
        else:
            notify('Database connection error', 'error')
        exit()
    except:
        if not isNotifyOpened:
            isNotifyOpened = True
            notify('Database connection error', 'error')
            isNotifyOpened = False
        exit()
    lastConn = conn
    return conn


# Create a new log
def dbAppendNewLog(content: str, fileName: str):
    global isNotifyOpened
    try:
        if not isinstance(content, str):
            content = str(content)

        conn = dbCreateConnection()
        cur = conn.cursor()
        cur.execute(
            'INSERT INTO app_logs(content, file) VALUES (%s, %s);', (content, fileName))
        conn.commit()
        conn.close()
    except:
        if not isNotifyOpened:
            isNotifyOpened = True
            notify('Something went wrong. (1)\nShutting down...', 'error')
            isNotifyOpened = False
        exit()
    return


# Get all servers from the database
def dbGetAllServers() -> List[ServerDetails] | List:
    try:
        conn = dbCreateConnection()
        cur = conn.cursor()
        cur.execute('SELECT * FROM servers;')
        rows = cur.fetchall()
        conn.close()

        response = []
        for row in rows:
            response.append(
                ServerDetails(row[1], row[8], row[9], row[3], row[4],
                              row[6], row[7], row[0], 'unknown', row[5], row[2], row[10])
            )
        return response
    except Exception as e:
        lastConn.close()
        dbAppendNewLog(e, 'dbGetAllServers')
        return []


# Find server in the database (path or id)
def dbFindServer(pathOrId) -> None | ServerDetails:
    try:
        conn = dbCreateConnection()
        cur = conn.cursor()
        cur.execute('SELECT * FROM servers WHERE path = %s;', (pathOrId,))
        row = cur.fetchone()
        if row == None:
            cur.execute('SELECT * FROM servers WHERE id = %s;', (pathOrId,))
            row = cur.fetchone()
        conn.close()
        if row == None:
            return None
        else:
            return ServerDetails(row[1], row[8], row[9], row[3], row[4], row[6], row[7], row[0], 'unknown', row[5], row[2], row[10])
    except Exception as e:
        lastConn.close()
        dbAppendNewLog(e, 'dbFindServer')
        return None


# Update server auto restart value
def dbUpdateAutoRestart(serverId: int, newState: bool):
    try:
        conn = dbCreateConnection()
        cur = conn.cursor()
        cur.execute(
            'UPDATE servers SET autoRestart = %s WHERE ID = %s;', (newState, serverId))
        conn.commit()
        conn.close()
    except Exception as e:
        lastConn.close()
        notify('An error has occurred.', 'error')
        dbAppendNewLog(e, 'dbUpdateAutoRestart')
    return


# Update server status
def dbUpdateLastStatus(serverId: int, newStatus: Literal['online', 'offline']):
    try:
        conn = dbCreateConnection()
        cur = conn.cursor()
        cur.execute(
            'UPDATE servers SET lastStatus = %s WHERE ID = %s;', (newStatus, serverId))
        conn.commit()
        conn.close()
    except Exception as e:
        lastConn.close()
        notify('An error has occurred.', 'error')
        dbAppendNewLog(e, 'dbUpdateLastStatus')
    return


# Add a new server to the database
def dbAddNewServer(serverDetails: ServerDetails, path: str):
    try:
        isAlreadyAdded = dbFindServer(path)
        if isAlreadyAdded:
            notify('This server is already added', 'warning')
            return
        conn = dbCreateConnection()
        cur = conn.cursor()
        cur.execute(
            'INSERT INTO servers(mapName, queryPort, rconPort, gameMode, gameType, customName, multiHome, path, autoRestart) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s);', (
                serverDetails.mapName,
                serverDetails.queryPort,
                serverDetails.rconPort,
                serverDetails.gameMode,
                serverDetails.gameType,
                serverDetails.customName,
                serverDetails.multiHome,
                path,
                False
            ))
        conn.commit()
        conn.close()
        return True
    except Exception as e:
        lastConn.close()
        notify(f'An error has occurred.', 'error')
        dbAppendNewLog(e, 'dbAddNewServer')
        return False


# Remove a server from the database
def dbRemoveServer(serverId: int):
    try:
        conn = dbCreateConnection()
        cur = conn.cursor()
        if not serverId == 'all':
            cur.execute('DELETE FROM servers WHERE id = %s;', (serverId,))
        else:
            cur.execute('DELETE FROM servers;')
        conn.commit()
        conn.close()
    except Exception as e:
        lastConn.close()
        notify('An error has occurred.', 'error')
        dbAppendNewLog(e, 'dbRemoveServer')
    return


# Update or get the RCON password
def handleRCONPassword(password: str | None = None):
    try:
        conn = dbCreateConnection()
        cur = conn.cursor()

        cur.execute('SELECT * FROM config;')
        row = cur.fetchone()

        if row == None:
            if password == None:
                return ''
            else:
                cur.execute(
                    'INSERT INTO config (rconPassword) VALUES (%s)', (password, ))
                conn.commit()
        else:
            if password == None:
                return row[1]
            else:
                cur.execute(
                    'UPDATE config SET rconPassword = %s WHERE id = 1;', (password, ))
                conn.commit()

        conn.close()

    except Exception as e:
        lastConn.close()
        notify(f'An error has occurred.', 'error')
        dbAppendNewLog(e, 'handleRCONPassword')
    return ''


# Create all tables
def dbCreateTables():
    try:
        conn = dbCreateConnection()
        cur = conn.cursor()
        cur.execute(logsTableTemplate)
        cur.execute(serversTableTemplate)
        cur.execute(schemaTableTemplate)
        conn.close()
    except Exception as e:
        if not isNotifyOpened:
            isNotifyOpened = True
            notify('Something went wrong. (2)\nShutting down...', 'error')
            isNotifyOpened = False
        dbAppendNewLog(e, 'dbCreateTables')
        exit()
    return
