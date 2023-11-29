from tkinter.filedialog import askopenfile
from actions.getDetails import getDetails
from ui.notify import notify
from lib.db import dbAddNewServer


def addServer():
    # Open select file menu
    filePath = askopenfile(mode='r', filetypes=[('Bat files', '*.bat')])
    if filePath:

        # Read script content
        filePath = filePath.name
        script = open(filePath).read()

        # Get details from script content
        details = getDetails(script)

        # Add a new server to the database
        action = dbAddNewServer(details, filePath)
        if action == True:
            notify('Server has been added.', 'info')

        # Check if path is relative (if so make it absolute)
        if 'start ArkAscendedServer.exe' in script or 'start ShooterGameServer.exe' in script or 'start AsaApiLoader.exe' in script:
            """
            extracting PATH from the command line
            example input: +force_install_dir "PATH" +login
            output: PATH
            """
            gamePath = script[script.find(
                '_dir') + len('_dir') + 2:script.find('+login') - 2]
            script = script.replace(
                'ArkAscendedServer.exe', '{}\ShooterGame\Binaries\Win64\ArkAscendedServer.exe'.format(gamePath))
            script = script.replace(
                'ShooterGameServer.exe', '{}\ShooterGame\Binaries\Win64\ShooterGameServer.exe'.format(gamePath))
            script = script.replace(
                'AsaApiLoader.exe', '{}\ShooterGame\Binaries\Win64\AsaApiLoader.exe'.format(gamePath))
            with open(filePath, 'r+') as f:
                f.seek(0, 0)
                f.write(script)
