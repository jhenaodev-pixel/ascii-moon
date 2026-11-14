@echo off
title Mi corazon, mi luna - ASCII
cd /d "%~dp0"

where python >nul 2>nul
if %errorlevel%==0 (
  python servidor.py
  goto :eof
)

where py >nul 2>nul
if %errorlevel%==0 (
  py servidor.py
  goto :eof
)

echo.
echo No se encontro Python. Abriendo index.html directamente...
echo.
start "" "index.html"
