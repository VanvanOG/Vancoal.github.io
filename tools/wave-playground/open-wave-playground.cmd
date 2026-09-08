@echo off
setlocal
cd /d "%~dp0\..\.."
title Wave Playground
echo.
echo Starting the wave playground. Keep this window open.
echo.
call npm run dev -- --host 127.0.0.1 --open /tools/wave-playground/index.html
echo.
echo Playground stopped. Press any key to close.
pause >nul
