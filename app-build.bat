@echo off
title Building Manager App
taskkill /F /IM ArkServerManager.exe
cd %cd%/manager
start /B /wait pyinstaller.exe --onefile --noconsole --icon=favicon.ico --specpath . -n ArkServerManager --distpath ./ main.py
move ArkServerManager.exe ../
cd ..
echo App built: %cd%\ArkServerManager.exe
pause
exit