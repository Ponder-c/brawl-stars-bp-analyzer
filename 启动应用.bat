@echo off
chcp 65001 >nul
cd /d "%~dp0"
set PATH=C:\Program Files\nodejs;%PATH%
set ELECTRON_MIRROR=https://npmmirror.com/mirrors/electron/
npm.cmd run dev
pause
