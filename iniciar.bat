@echo off
title Servidores de MiBanco

echo Iniciando Backend...
start cmd /k "cd /d %~dp0backend && title Backend MiBanco && node server.js"

echo Iniciando Frontend...
start cmd /k "cd /d %~dp0frontend && title Frontend MiBanco && npm run dev"

echo.
echo ==============================================
echo Los servidores se estan iniciando en nuevas ventanas.
echo.
echo Para abrir el banco ve a tu navegador e ingresa:
echo http://localhost:5173
echo ==============================================
pause
