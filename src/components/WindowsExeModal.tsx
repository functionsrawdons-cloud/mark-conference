import React, { useState } from 'react';
import { 
  X, 
  Monitor, 
  Terminal, 
  Download, 
  Copy, 
  Check, 
  ExternalLink, 
  Cpu, 
  ShieldCheck, 
  HardDrive, 
  FolderDown, 
  ChevronRight,
  PackageCheck,
  Sparkles,
  Layers
} from 'lucide-react';

interface WindowsExeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WindowsExeModal: React.FC<WindowsExeModalProps> = ({
  isOpen,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'batch' | 'electron' | 'pkg' | 'data'>('batch');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const handleDownloadBatch = () => {
    const batchContent = `@echo off
setlocal enabledelayedexpansion

title Rawdons Conference Platform - Windows .EXE Builder

echo =====================================================================
echo    Rawdons - Conference Planning and Operations Platform
echo    Windows Standalone Executable (.EXE) Builder
echo =====================================================================
echo.

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

if exist "node_modules\\" goto CHECK_ELECTRON
echo [2/3] Installing project dependencies - first time setup...
call npm install --legacy-peer-deps
if errorlevel 1 goto INSTALLFAIL
echo [OK] Base dependencies installed successfully.

:CHECK_ELECTRON
if exist "node_modules\\electron\\" goto BUILDFRONTEND
echo [2/3] Electron runtime not detected in node_modules.
echo Installing electron and electron-builder...
call npm install electron electron-builder --save-dev --legacy-peer-deps
if errorlevel 1 goto INSTALLFAIL
echo [OK] Electron packages installed successfully.
goto BUILDFRONTEND

:INSTALLFAIL
echo [ERROR] Dependency installation failed.
pause
exit /b 1

:BUILDFRONTEND
echo.
echo [3/3] Compiling web application bundle with Vite...
if exist "node_modules\\vite\\bin\\vite.js" (
  call node "%~dp0node_modules\\vite\\bin\\vite.js" build
) else (
  call npm run build
)
if errorlevel 1 goto BUILDFAIL
echo [OK] Frontend bundle compiled successfully into .\\dist\\
echo.

echo =====================================================================
echo   Select Windows .EXE Packaging Format:
echo =====================================================================
echo   [1] Electron Portable .EXE (Single standalone file, no installer)
echo   [2] Electron Setup Installer (Standard Windows .exe wizard)
echo   [3] Node.js Single-File Portable Server .EXE (via pkg)
echo   [4] Run Desktop Preview Now (Electron)
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
echo Packaging Standalone Windows Portable .EXE...
if exist "node_modules\\electron-builder\\cli.js" (
  call node "%~dp0node_modules\\electron-builder\\cli.js" --win portable
) else (
  call npx electron-builder --win portable
)
if exist "dist-electron\\" explorer "dist-electron"
goto DONE

:OPTION2
echo.
echo Building Windows NSIS Setup Installer...
if exist "node_modules\\electron-builder\\cli.js" (
  call node "%~dp0node_modules\\electron-builder\\cli.js" --win nsis
) else (
  call npx electron-builder --win nsis
)
if exist "dist-electron\\" explorer "dist-electron"
goto DONE

:OPTION3
echo.
echo Packaging Node.js Standalone Executable via pkg...
if not exist "dist-exe\\" mkdir dist-exe
call npx @yao-pkg/pkg standalone/server.cjs --targets node18-win-x64 --output dist-exe/RawdonsConference.exe
if exist "dist-exe\\" explorer "dist-exe"
goto DONE

:OPTION4
echo.
echo Launching Electron Desktop Preview...
call npx electron electron/main.cjs
goto DONE

:OPTION5
echo.
echo Starting Standalone Local Server...
call node standalone/server.cjs
goto DONE

:BUILDFAIL
echo [ERROR] Web build failed. Please review the Vite output above.
pause
exit /b 1

:DONE
echo.
echo Press any key to exit builder...
pause >nul
`;
    const blob = new Blob([batchContent], { type: 'application/x-bat' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'build-windows-exe.bat';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
      <div 
        className="relative bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 px-6 py-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400">
              <Monitor className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white tracking-tight">
                  Windows Standalone .EXE Desktop Builder
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                  Node.js Ready
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Pre-Configured
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Ready to package into a standalone Windows executable with offline storage, zero dependencies, and native desktop window controls.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feature Badges Banner */}
        <div className="bg-slate-950/60 px-6 py-3 border-b border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>100% Offline & Private</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <HardDrive className="w-4 h-4 text-sky-400 shrink-0" />
            <span>Local Storage Persistence</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <Cpu className="w-4 h-4 text-purple-400 shrink-0" />
            <span>Native Node.js & Electron</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <PackageCheck className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Single Portable .EXE</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-900/90 px-6 pt-3 gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('batch')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'batch'
                ? 'border-sky-500 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>1-Click Batch Script (.bat)</span>
          </button>

          <button
            onClick={() => setActiveTab('electron')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'electron'
                ? 'border-sky-500 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Option 1: Electron Desktop .EXE (Recommended)</span>
          </button>

          <button
            onClick={() => setActiveTab('pkg')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'pkg'
                ? 'border-sky-500 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Option 2: Node.js Single Executable (pkg)</span>
          </button>

          <button
            onClick={() => setActiveTab('data')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'data'
                ? 'border-sky-500 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Data Storage & Backups</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm text-slate-300 flex-1">
          {activeTab === 'batch' && (
            <div className="space-y-4">
              <div className="bg-sky-950/40 border border-sky-800/60 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h4 className="font-bold text-white text-sm flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-sky-400" />
                    Double-Click Automation Script Ready
                  </h4>
                  <p className="text-xs text-slate-300 mt-1">
                    The root directory includes a ready-to-run Windows script: <code className="text-sky-300 bg-slate-900 px-1.5 py-0.5 rounded">build-windows-exe.bat</code>. Run it directly on your Windows PC!
                  </p>
                </div>
                <button
                  onClick={handleDownloadBatch}
                  className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-2 shadow-md shrink-0 transition"
                >
                  <Download className="w-4 h-4" />
                  <span>Download .BAT Script</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4">
                  <div className="w-7 h-7 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center font-bold text-xs mb-2">1</div>
                  <h5 className="font-bold text-white text-xs">Clone or Extract</h5>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Copy the project folder to your Windows machine where Node.js (v18+) is installed.
                  </p>
                </div>
                <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4">
                  <div className="w-7 h-7 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center font-bold text-xs mb-2">2</div>
                  <h5 className="font-bold text-white text-xs">Run the Batch File</h5>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Double-click <code className="text-sky-300">build-windows-exe.bat</code>. It installs packages and builds automatically.
                  </p>
                </div>
                <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-xs mb-2">3</div>
                  <h5 className="font-bold text-white text-xs">Launch Standalone .EXE</h5>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Find <code className="text-emerald-300">RawdonsConference-Portable.exe</code> in the <code className="text-slate-300">dist-electron\</code> folder.
                  </p>
                </div>
              </div>

              {/* Code preview */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-xs">
                  <span className="font-mono text-slate-400">Terminal Command (PowerShell or Command Prompt)</span>
                  <button
                    onClick={() => handleCopy('.\\build-windows-exe.bat', 'bat-cmd')}
                    className="flex items-center gap-1 text-sky-400 hover:text-sky-300 text-xs"
                  >
                    {copiedCode === 'bat-cmd' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCode === 'bat-cmd' ? 'Copied' : 'Copy Command'}</span>
                  </button>
                </div>
                <pre className="font-mono text-xs text-sky-300 overflow-x-auto">
                  .\build-windows-exe.bat
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'electron' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-300 leading-relaxed">
                The application comes bundled with complete Electron desktop runtime architecture in <code className="text-sky-300 bg-slate-950 px-1 py-0.5 rounded">electron/main.cjs</code> and <code className="text-sky-300 bg-slate-950 px-1 py-0.5 rounded">electron/preload.cjs</code>.
              </p>

              <div className="space-y-3">
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5">
                  <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-800 text-xs">
                    <span className="font-bold text-sky-400">Step 1: Build Portable Windows .EXE (Single file, no install)</span>
                    <button
                      onClick={() => handleCopy('npm run build:exe', 'exe-cmd')}
                      className="flex items-center gap-1 text-slate-400 hover:text-white"
                    >
                      {copiedCode === 'exe-cmd' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedCode === 'exe-cmd' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <pre className="font-mono text-xs text-emerald-400">npm run build:exe</pre>
                  <p className="text-[11px] text-slate-400 mt-1.5">
                    Compiles the app and generates <code className="text-slate-200">dist-electron/RawdonsConference-Portable.exe</code>. You can copy this file to any USB or Windows PC.
                  </p>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5">
                  <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-800 text-xs">
                    <span className="font-bold text-sky-400">Step 2: Build Standard Windows Setup Installer</span>
                    <button
                      onClick={() => handleCopy('npm run build:installer', 'inst-cmd')}
                      className="flex items-center gap-1 text-slate-400 hover:text-white"
                    >
                      {copiedCode === 'inst-cmd' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedCode === 'inst-cmd' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <pre className="font-mono text-xs text-emerald-400">npm run build:installer</pre>
                  <p className="text-[11px] text-slate-400 mt-1.5">
                    Creates an NSIS Windows installer setup wizard with desktop shortcut and Start Menu entry.
                  </p>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5">
                  <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-800 text-xs">
                    <span className="font-bold text-sky-400">Preview Desktop App Locally</span>
                    <button
                      onClick={() => handleCopy('npm run desktop:start', 'dev-cmd')}
                      className="flex items-center gap-1 text-slate-400 hover:text-white"
                    >
                      {copiedCode === 'dev-cmd' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedCode === 'dev-cmd' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <pre className="font-mono text-xs text-amber-300">npm run desktop:start</pre>
                  <p className="text-[11px] text-slate-400 mt-1.5">
                    Launches the native Electron desktop window immediately in development mode.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'pkg' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-300 leading-relaxed">
                If you prefer a <strong>pure Node.js standalone executable</strong> without Chromium bundling, we've provided <code className="text-sky-300 bg-slate-950 px-1 py-0.5 rounded">standalone/server.cjs</code>. It uses Node's native HTTP engine to serve the compiled application and auto-launches the system's default browser.
              </p>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5">
                <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-800 text-xs">
                  <span className="font-bold text-sky-400">Compile Single-File Executable with pkg</span>
                  <button
                    onClick={() => handleCopy('npm run build:node-exe', 'pkg-cmd')}
                    className="flex items-center gap-1 text-slate-400 hover:text-white"
                  >
                    {copiedCode === 'pkg-cmd' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCode === 'pkg-cmd' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="font-mono text-xs text-emerald-400">npm run build:node-exe</pre>
                <p className="text-[11px] text-slate-400 mt-1.5">
                  Generates <code className="text-slate-200">dist-exe/RawdonsConference.exe</code>. When run, it prints a status terminal and immediately opens the application in Microsoft Edge, Chrome, or Firefox.
                </p>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5">
                <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-800 text-xs">
                  <span className="font-bold text-sky-400">Direct Node.js Server Run (Without packaging)</span>
                  <button
                    onClick={() => handleCopy('npm run desktop:serve', 'serve-cmd')}
                    className="flex items-center gap-1 text-slate-400 hover:text-white"
                  >
                    {copiedCode === 'serve-cmd' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCode === 'serve-cmd' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="font-mono text-xs text-amber-300">npm run desktop:serve</pre>
              </div>
            </div>
          )}

          {activeTab === 'data' && (
            <div className="space-y-4">
              <h4 className="font-bold text-white text-sm">Where is data stored in the Standalone .EXE?</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                In both Electron and Node.js desktop modes, your conference tasks, client contracts, guest lists, room allocations, menu pricing, staff roster, and checklists are securely persisted in:
              </p>
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-xs text-emerald-300">
                %APPDATA%\Rawdons Conference Platform\Local Storage
              </div>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Zero cloud dependency:</strong> No servers, external databases, or internet connection required.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Full CSV Backups:</strong> Use the <em>CSV Templates Hub</em> or the <em>Export CSV</em> button anytime to export full tabular records for spreadsheets.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Printable checklists:</strong> Print directly to Windows printers or save as clean PDFs using the system print dialog.</span>
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-950 px-6 py-4 border-t border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Full documentation is also available in <code className="text-slate-200">README-WINDOWS-EXE.md</code>
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadBatch}
              className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 flex items-center gap-1.5 transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download .BAT</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs shadow transition"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
