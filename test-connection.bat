@echo off
echo 🧪 Testing SSH Connection to Local Server...
echo.
echo Make sure the server is running (npm start) before testing.
echo.
echo Press any key to test connection to localhost:2222
pause > nul

echo.
echo Connecting to SSH server...
echo (Use any username/password when prompted)
echo.

ssh -p 2222 -o StrictHostKeyChecking=no user@localhost
