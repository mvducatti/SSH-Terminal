@echo off
echo Setting up SSH Terminal Server...
echo.

echo Installing dependencies...
call npm install

echo.
echo Generating SSH host keys...
node generate-keys.js

echo.
echo Setup complete!
echo.
echo To start the server, run: npm start
echo To connect locally, use: ssh -p 2222 user@localhost
echo.
pause
