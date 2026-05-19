@echo off
title Capnceedee Chat Bridge
echo.
echo  Installing dependencies (first run only)...
call npm install --silent 2>nul
echo.
echo  Starting chat bridge...
echo  Keep this window open while you stream.
echo  Close it to stop the bridge.
echo.
node bridge.js
pause
