@echo off
setlocal enabledelayedexpansion

title Rawdons Conference Platform - Windows .EXE Builder

echo =====================================================================
echo    Rawdons - Conference Planning and Operations Platform
echo    Windows Standalone Executable (.EXE) Builder
echo =====================================================================
echo.

:: 1. Check Node.js installation
call node -v >nul 2>nul
if errorlevel 1 goto NONODE
goto HAVENODE

:NONODE
echo =====================================================================
echo [ERROR] Node.js is not recognized in this terminal or is not installed!
echo.
echo 1. Download and install Node.js LTS from: https://nodejs.org/
echo 2. During installation, make sure "Add to PATH" is checked.
echo 3. After installing, close and reopen your Command Prompt.
echo =====================================================================
echo.
pause
exit /b 1

:HAVENODE
echo [1/3] Node.js runtime detected:
call node -v
call npm -v
echo.

:: 2. Check dependencies
if exist "node_modules\" goto CHECK_ELECTRON
echo [2/3] Installing project dependencies - first time setup...
call npm install --legacy-peer-deps
if errorlevel 1 goto INSTALLFAIL
echo [OK] Base dependencies installed successfully.

:CHECK_ELECTRON
if exist "node_modules\electron\" goto BUILDFRONTEND
echo [2/3] Electron runtime not detected in node_modules.
echo Installing electron and electron-builder...
call npm install electron electron-builder --save-dev --legacy-peer-deps
if errorlevel 1 goto INSTALLFAIL
echo [OK] Electron packages installed successfully.
goto BUILDFRONTEND

:INSTALLFAIL
echo.
echo =====================================================================
echo [ERROR] Dependency installation failed.
echo Try running: npm install --legacy-peer-deps manually to inspect the error.
echo =====================================================================
echo.
pause
exit /b 1

:BUILDFRONTEND
echo.
echo [3/3] Compiling web application bundle with Vite...
if exist "node_modules\vite\bin\vite.js" (
  call node "%~dp0node_modules\vite\bin\vite.js" build
) else (
  call npm run build
)
if errorlevel 1 goto BUILDFAIL
echo [OK] Frontend bundle compiled successfully into .\dist\
echo.

:: 3. Select Packaging Mode
echo =====================================================================
echo   Select Windows .EXE Packaging Format:
echo =====================================================================
echo   [1] Electron Portable .EXE (Single standalone file, no install required)
echo   [2] Electron Setup Installer (Standard Windows setup wizard)
echo   [3] Node.js Single-File Portable Server .EXE (via pkg)
echo   [4] Launch Desktop Preview Now (Electron)
echo   [5] Launch Standalone Local Server Now (Browser)
echo =====================================================================
set /p CHOICE="Enter choice [1-5] (Default is 1): "

if "%CHOICE%"=="" set CHOICE=1
if "%CHOICE%"=="1" goto OPTION1
if "%CHOICE%"=="2" goto OPTION2
if "%CHOICE%"=="3" goto OPTION3
if "%CHOICE%"=="4" goto OPTION4
if "%CHOICE%"=="5" goto OPTION5
goto OPTION1

:OPTION1
echo.
echo Packaging Standalone Windows Portable .EXE with Electron Builder...
if exist "node_modules\electron-builder\cli.js" (
  call node "%~dp0node_modules\electron-builder\cli.js" --win portable
) else (
  call npx electron-builder --win portable
)
if errorlevel 1 goto PACKAGINGFAIL
echo.
echo =====================================================================
echo [SUCCESS] Windows Portable .EXE created!
echo File: dist-electron\RawdonsConference-Portable.exe
echo =====================================================================
if exist "dist-electron\" explorer "dist-electron"
goto DONE

:OPTION2
echo.
echo Building Windows NSIS Setup Installer...
if exist "node_modules\electron-builder\cli.js" (
  call node "%~dp0node_modules\electron-builder\cli.js" --win nsis
) else (
  call npx electron-builder --win nsis
)
if errorlevel 1 goto PACKAGINGFAIL
echo.
echo =====================================================================
echo [SUCCESS] Windows Installer created!
echo Output folder: dist-electron\
echo =====================================================================
if exist "dist-electron\" explorer "dist-electron"
goto DONE

:OPTION3
echo.
echo Packaging Node.js Standalone Executable via pkg...
if not exist "dist-exe\" mkdir dist-exe
call npx @yao-pkg/pkg standalone/server.cjs --targets node18-win-x64 --output dist-exe/RawdonsConference.exe
if errorlevel 1 goto PACKAGINGFAIL
echo.
echo =====================================================================
echo [SUCCESS] Standalone Node.js .EXE created!
echo File: dist-exe\RawdonsConference.exe
echo =====================================================================
if exist "dist-exe\" explorer "dist-exe"
goto DONE

:OPTION4
echo.
echo Starting Electron Desktop Preview...
if exist "node_modules\electron\cli.js" (
  call node "%~dp0node_modules\electron\cli.js" "%~dp0electron\main.cjs"
) else (
  call npx electron electron/main.cjs
)
goto DONE

:OPTION5
echo.
echo Starting Standalone Local Server...
call node standalone/server.cjs
goto DONE

:BUILDFAIL
echo.
echo =====================================================================
echo [ERROR] Web build failed. Please review the Vite output above.
echo =====================================================================
echo.
pause
exit /b 1

:PACKAGINGFAIL
echo.
echo =====================================================================
echo [ERROR] Packaging failed. Please review the output above.
echo You can run the command directly in CMD:
echo    npx electron-builder --win portable
echo =====================================================================
echo.
goto DONE

:DONE
echo.
echo Press any key to exit builder...
pause >nul
