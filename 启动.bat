@echo off
chcp 65001 >nul
title 考研背单词 - 本地服务器
cd /d "%~dp0"
cls
echo.
echo  ========================================
echo    考研背单词 - 正在启动服务器...
echo  ========================================
echo.
python3 server.py
pause
