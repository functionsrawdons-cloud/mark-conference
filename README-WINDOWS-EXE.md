# Rawdons Conference Platform - Standalone Windows .EXE Guide

This application is fully architected and pre-configured to be packaged as a **standalone Windows `.exe`** executable using Node.js.

You have two powerful packaging options depending on your preference:
1. **Option 1 (Recommended): Native Windows Desktop App (`Electron`)**
   - Packages into a single native Windows executable (`RawdonsConference-Portable.exe`) or an installer (`RawdonsConference-Setup.exe`).
   - Runs in its own dedicated, native desktop window with high performance, system menus, window controls, and full offline storage.
2. **Option 2: Standalone Node.js Portable Server (`pkg`)**
   - Compiles a self-contained Node.js web server (`RawdonsConference.exe`) that embeds all assets and launches your default browser with a single double-click.

---

## ⚡ Quick 1-Click Build (Windows)

Simply double-click the included batch script:
```
build-windows-exe.bat
```
This interactive script will:
1. Verify that Node.js is installed.
2. Install any required dependencies.
3. Build the production React web bundle (`npm run build`).
4. Prompt you to choose between **Portable .EXE**, **Installer .EXE**, or **Node.js pkg .EXE**.
5. Automatically open File Explorer showing your newly built `.exe`!

---

## 💻 Manual CLI Commands (PowerShell / Command Prompt)

### Prerequisites
- Install **Node.js** (v18 or higher recommended) from [nodejs.org](https://nodejs.org/).

### Step 1: Install dependencies and compile frontend
```bash
npm install --legacy-peer-deps
npm run build
```

### Step 2: Build the Windows Executable

#### Choice A: Portable Electron Windows .EXE (No installation needed)
```bash
npm run build:exe
```
> Outputs to: `dist-electron/RawdonsConference-Portable.exe`
> Simply copy this single file to any Windows computer or USB drive and double-click to launch!

#### Choice B: Standard Windows Setup Installer
```bash
npm run build:installer
```
> Outputs to: `dist-electron/Rawdons Conference Platform Setup 1.0.0.exe`
> Installs to Program Files, creates a Desktop shortcut, and adds to Start Menu.

#### Choice C: Single-File Node.js .EXE (via pkg)
```bash
npm run build:node-exe
```
> Outputs to: `dist-exe/RawdonsConference.exe`

#### Choice D: Run Desktop App in Development
```bash
npm run desktop:start
```

---

## 📂 Architecture & Files Overview

| File | Purpose |
|---|---|
| `build-windows-exe.bat` | Double-click Windows batch script for automated building |
| `electron/main.cjs` | Native Electron window lifecycle, menus, security isolation & offline loading |
| `electron/preload.cjs` | Context isolation bridge exposing desktop helpers safely |
| `standalone/server.cjs` | Zero-dependency standalone Node.js server with auto-browser launch |
| `vite.config.ts` | Configured with relative base path (`base: './'`) for local file loading |
| `package.json` | Contains all packaging targets (`portable`, `nsis`), icons, and scripts |

---

## 🔒 Data Persistence in Offline / Desktop Mode

- All conference tasks, client details, guest rosters, room allocations, food menu breakdowns, staff schedules, and checklists persist in **Local Storage** within your Windows profile (`%APPDATA%`).
- Data remains intact across reboots and app updates.
- Use the built-in **CSV Templates Hub** or **Export** options to backup your conference data anytime to `.csv`.
