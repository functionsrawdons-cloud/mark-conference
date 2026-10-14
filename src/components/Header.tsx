import React, { useState } from 'react';
import { 
  Calendar, 
  MapPin, 
  Download, 
  Upload, 
  Plus, 
  Settings, 
  FileSpreadsheet, 
  Kanban, 
  Clock, 
  Users, 
  RotateCcw,
  Sparkles,
  ChevronDown,
  Building2,
  UtensilsCrossed,
  Bed,
  Printer,
  Monitor,
  FileCode,
  ShieldCheck,
  AlertTriangle,
  KeyRound,
  Lock,
  Layers,
  ChevronRight,
  DollarSign
} from 'lucide-react';
import { BookingConflict, ConferenceDetails, ConferenceRecord, MainSection, ManagementUser, ViewMode } from '../types/conference';

interface HeaderProps {
  conference: ConferenceDetails;
  mainSection: MainSection;
  setMainSection: (section: MainSection) => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  onOpenNewTask: () => void;
  onOpenImportModal: () => void;
  onExportCsv: () => void;
  onOpenSettings: () => void;
  onResetToUserExact: () => void;
  onResetToFullDemo: () => void;
  onOpenWindowsExe?: () => void;
  taskCount: number;
  completedCount: number;
  guestCount: number;
  roomCount?: number;
  staffCount?: number;
  menuItemCount: number;
  // Multi-conference & RBAC
  allConferences: ConferenceRecord[];
  activeConferenceId: string;
  onSelectConference: (id: string) => void;
  currentUser: ManagementUser | null;
  onOpenLogonModal: () => void;
  conflicts: BookingConflict[];
  onOpenConflictModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  conference,
  mainSection,
  setMainSection,
  viewMode,
  setViewMode,
  onOpenNewTask,
  onOpenImportModal,
  onExportCsv,
  onOpenSettings,
  onResetToUserExact,
  onResetToFullDemo,
  onOpenWindowsExe,
  taskCount,
  completedCount,
  guestCount,
  roomCount = 0,
  staffCount = 0,
  menuItemCount,
  allConferences,
  activeConferenceId,
  onSelectConference,
  currentUser,
  onOpenLogonModal,
  conflicts,
  onOpenConflictModal
}) => {
  const [showResetMenu, setShowResetMenu] = useState(false);
  const [showConfSelector, setShowConfSelector] = useState(false);

  // Calculate days until conference
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const confDate = new Date(conference.startDate);
  confDate.setHours(0, 0, 0, 0);
  const diffTime = confDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  const completionPct = taskCount > 0 ? Math.round((completedCount / taskCount) * 100) : 0;
  const currentHall = conference.hall || 'Rawdons Main Hall';

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30 shadow-md">
      {/* Top Banner & Quick Info */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          
          {/* Title, Multi-Conference Selector & Meta */}
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-sky-400 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white shrink-0 mt-0.5">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                {/* Conference Switcher Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowConfSelector(!showConfSelector)}
                    className="flex items-center gap-1.5 text-base sm:text-lg font-black tracking-tight text-white hover:text-indigo-300 transition text-left"
                    title="Switch Conference or View Portfolio"
                  >
                    <span>{conference.title}</span>
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  </button>

                  {showConfSelector && (
                    <div 
                      className="absolute left-0 mt-2 w-80 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl py-1 z-50 text-xs"
                      onMouseLeave={() => setShowConfSelector(false)}
                    >
                      <div className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-700 flex items-center justify-between">
                        <span>Saved Conferences ({allConferences.length})</span>
                        <span className="text-emerald-400">Independent Saves</span>
                      </div>
                      <div className="max-h-64 overflow-y-auto divide-y divide-slate-700/50">
                        {allConferences.map(c => {
                          const isCur = c.id === activeConferenceId;
                          return (
                            <button
                              key={c.id}
                              onClick={() => {
                                onSelectConference(c.id);
                                setShowConfSelector(false);
                              }}
                              className={`w-full text-left px-3 py-2.5 hover:bg-slate-700 transition flex items-start justify-between gap-2 ${
                                isCur ? 'bg-indigo-950/60 text-white font-bold' : 'text-slate-300'
                              }`}
                            >
                              <div className="truncate">
                                <div className="truncate font-semibold text-xs flex items-center gap-1.5">
                                  {c.details.title}
                                  {isCur && <span className="text-[10px] text-indigo-400">✓</span>}
                                </div>
                                <div className="text-[10px] text-slate-400 truncate mt-0.5">
                                  {c.details.hall || 'Main Hall'} &bull; {c.details.startDate}
                                </div>
                              </div>
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 shrink-0">
                                {c.status}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                      <div className="p-2 border-t border-slate-700 bg-slate-900/60">
                        <button
                          onClick={() => {
                            setMainSection('conferences');
                            setShowConfSelector(false);
                          }}
                          className="w-full py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-center text-xs flex items-center justify-center gap-1"
                        >
                          <Layers className="w-3.5 h-3.5" />
                          Open All Conferences Hub & Saved Records
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <span className="text-[11px] px-2 py-0.5 rounded-md font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {currentHall}
                </span>

                <span className="text-[11px] px-2 py-0.5 rounded-md font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  ZAR (Rands)
                </span>

                {diffDays >= 0 ? (
                  <span className="text-[11px] px-2 py-0.5 rounded-md font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    T-{diffDays} Days
                  </span>
                ) : (
                  <span className="text-[11px] px-2 py-0.5 rounded-md font-medium bg-slate-700 text-slate-300">
                    Concluded
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3 text-xs text-slate-400 mt-1 flex-wrap">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  {conference.startDate} &mdash; {conference.endDate}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {conference.venue}, {conference.city}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  {conference.expectedAttendees} Attendees
                </span>
              </div>
            </div>
          </div>

          {/* Right Action Area: Clearance User Badge + Double Booking Shield + Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            {/* Double Booking Prevention Badge */}
            <button
              onClick={onOpenConflictModal}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold border transition shadow-sm ${
                conflicts.length === 0
                  ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40 hover:bg-emerald-900/60'
                  : 'bg-red-950/80 text-red-200 border-red-500/60 hover:bg-red-900/80 animate-pulse'
              }`}
              title="Click to view Venue & Accommodation Double-Booking diagnostics"
            >
              {conflicts.length === 0 ? (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="hidden sm:inline">No Conflicts</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                  <span>{conflicts.length} Collision</span>
                </>
              )}
            </button>

            {/* Management Clearance Staff Operator Button */}
            <button
              onClick={onOpenLogonModal}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 shadow-sm transition"
              title="Log In / Switch Operator / View Allocated Codes"
            >
              <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-indigo-500 to-sky-400 flex items-center justify-center text-[10px] font-bold text-white">
                {currentUser?.name.charAt(0) || '👑'}
              </div>
              <div className="text-left hidden sm:block">
                <div className="font-bold leading-tight truncate max-w-[110px] text-xs">
                  {currentUser?.name || 'Log In'}
                </div>
                <div className="text-[10px] text-amber-300 leading-tight">
                  {currentUser?.isMasterAdmin ? 'Master Admin L5' : `Clearance L${currentUser?.clearanceLevel || 0}`}
                </div>
              </div>
              <KeyRound className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Quick Reset Menu */}
            <div className="relative">
              <button
                onClick={() => setShowResetMenu(!showResetMenu)}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white border border-slate-700 transition"
                title="Reset or load presets"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Presets</span>
                <ChevronDown className="w-3 h-3" />
              </button>

              {showResetMenu && (
                <div 
                  className="absolute right-0 mt-2 w-64 bg-slate-800 border border-slate-700 rounded-lg shadow-xl py-1 z-50 text-xs"
                  onMouseLeave={() => setShowResetMenu(false)}
                >
                  <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-700">
                    Dataset Presets
                  </div>
                  <button
                    onClick={() => {
                      onResetToUserExact();
                      setShowResetMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 text-slate-200 hover:bg-slate-700 flex items-center justify-between"
                  >
                    <span>User's Exact 3 Tasks</span>
                    <span className="text-[10px] bg-indigo-900/60 text-indigo-300 px-1.5 py-0.5 rounded">Prompt CSV</span>
                  </button>
                  <button
                    onClick={() => {
                      onResetToFullDemo();
                      setShowResetMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 text-slate-200 hover:bg-slate-700 flex items-center justify-between"
                  >
                    <span>Complete 14 Operations Tasks</span>
                    <span className="text-[10px] bg-emerald-900/60 text-emerald-300 px-1.5 py-0.5 rounded">Comprehensive</span>
                  </button>
                </div>
              )}
            </div>

            {/* CSV Import */}
            <button
              onClick={onOpenImportModal}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white border border-slate-700 transition"
              title="Import tasks from CSV file"
            >
              <Upload className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Import</span>
            </button>

            {/* CSV Export */}
            <button
              onClick={onExportCsv}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white border border-slate-700 transition"
              title="Download tasks as CSV file"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Export</span>
            </button>

            {/* Windows EXE Builder */}
            {onOpenWindowsExe && (
              <button
                onClick={onOpenWindowsExe}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-sky-500/40 hover:border-sky-400 transition shadow-sm"
                title="Windows Standalone Executable (.exe) Packager"
              >
                <Monitor className="w-3.5 h-3.5 text-sky-400" />
                <span className="hidden sm:inline">Windows .EXE</span>
                <span className="sm:hidden">.EXE</span>
              </button>
            )}

            {/* Settings */}
            <button
              onClick={onOpenSettings}
              className="p-1.5 rounded-lg text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white border border-slate-700 transition"
              title="Conference Details & Budget Limit"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* New Task Button */}
            <button
              onClick={onOpenNewTask}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Task</span>
            </button>
          </div>
        </div>

        {/* Primary Module Navigation Tabs */}
        <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-800/80 overflow-x-auto">
          <div className="flex items-center space-x-1 sm:space-x-1.5">
            
            {/* Conferences Portfolio Hub */}
            <button
              onClick={() => setMainSection('conferences')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                mainSection === 'conferences'
                  ? 'bg-gradient-to-r from-indigo-600 to-sky-600 text-white shadow-sm ring-1 ring-white/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-sky-400" />
              <span>Conferences Hub</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                mainSection === 'conferences' ? 'bg-sky-900 text-white' : 'bg-slate-800 text-slate-400'
              }`}>
                {allConferences.length}
              </span>
            </button>

            {/* Tasks & Operations */}
            <button
              onClick={() => setMainSection('tasks')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                mainSection === 'tasks'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Tasks & Operations</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                mainSection === 'tasks' ? 'bg-indigo-700 text-white' : 'bg-slate-800 text-slate-400'
              }`}>
                {taskCount}
              </span>
            </button>

            {/* Client Details */}
            <button
              onClick={() => setMainSection('client')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                mainSection === 'client'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>1. Client Details</span>
            </button>

            {/* Guest Details */}
            <button
              onClick={() => setMainSection('guests')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                mainSection === 'guests'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>2. Guest Details</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                mainSection === 'guests' ? 'bg-sky-700 text-white' : 'bg-slate-800 text-slate-400'
              }`}>
                {guestCount}
              </span>
            </button>

            {/* Rooms & Accommodation */}
            <button
              onClick={() => setMainSection('accommodation')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                mainSection === 'accommodation'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Bed className="w-3.5 h-3.5" />
              <span>3. Rooms</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                mainSection === 'accommodation' ? 'bg-purple-700 text-white' : 'bg-slate-800 text-slate-400'
              }`}>
                {roomCount}
              </span>
            </button>

            {/* Food Menu & Catering */}
            <button
              onClick={() => setMainSection('catering')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                mainSection === 'catering'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <UtensilsCrossed className="w-3.5 h-3.5" />
              <span>4. Catering Costing</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                mainSection === 'catering' ? 'bg-amber-700 text-white' : 'bg-slate-800 text-slate-400'
              }`}>
                {menuItemCount}
              </span>
            </button>

            {/* Staff & Crew */}
            <button
              onClick={() => setMainSection('staff')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                mainSection === 'staff'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>5. Staff & Crew</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                mainSection === 'staff' ? 'bg-purple-700 text-white' : 'bg-slate-800 text-slate-400'
              }`}>
                {staffCount}
              </span>
            </button>

            {/* Checklists */}
            <button
              onClick={() => setMainSection('checklists')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                mainSection === 'checklists'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Printer className="w-3.5 h-3.5 text-indigo-400" />
              <span>6. Checklists</span>
            </button>

            {/* Templates Hub */}
            <button
              onClick={() => setMainSection('templates')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                mainSection === 'templates'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-emerald-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>CSV Templates</span>
            </button>

            {/* Management Clearance Matrix */}
            <button
              onClick={() => setMainSection('clearance')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                mainSection === 'clearance'
                  ? 'bg-red-600 text-white shadow-sm ring-1 ring-red-400/50'
                  : 'text-red-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5 text-red-400" />
              <span>Staff Clearance</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-red-950 text-red-300 border border-red-800">
                L1-L5
              </span>
            </button>

            {/* Profit & Loss (P&L) Report */}
            <button
              onClick={() => setMainSection('profit_loss')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                mainSection === 'profit_loss'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-sm ring-1 ring-emerald-400/50'
                  : 'text-emerald-400 hover:text-white hover:bg-slate-800'
              }`}
              title="Per-Conference Profit and Loss Report (Printable & Exportable exclusively by Master Admin Mark Mikealson)"
            >
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
              <span>P&L Report</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                Master Admin
              </span>
            </button>
          </div>

          {/* Quick Progress indicator */}
          <div className="hidden lg:flex items-center gap-2.5 text-xs text-slate-300 pl-4">
            <span className="text-slate-400">Tasks:</span>
            <div className="w-20 bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700">
              <div 
                className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${completionPct}%` }}
              />
            </div>
            <span className="font-semibold text-emerald-400">{completionPct}%</span>
          </div>
        </div>

        {/* Sub-navigation for Tasks & Operations mode */}
        {mainSection === 'tasks' && (
          <div className="flex items-center space-x-1 sm:space-x-2 mt-2 pt-2 border-t border-slate-800/40 overflow-x-auto">
            <span className="text-[11px] uppercase font-bold text-slate-500 mr-1 whitespace-nowrap">Views:</span>
            <button
              onClick={() => setViewMode('table')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition whitespace-nowrap ${
                viewMode === 'table' ? 'bg-slate-800 text-white font-bold ring-1 ring-slate-700' : 'text-slate-400 hover:text-white'
              }`}
            >
              Spreadsheet Table
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition whitespace-nowrap ${
                viewMode === 'kanban' ? 'bg-slate-800 text-white font-bold ring-1 ring-slate-700' : 'text-slate-400 hover:text-white'
              }`}
            >
              Kanban Board
            </button>
            <button
              onClick={() => setViewMode('budget')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition whitespace-nowrap ${
                viewMode === 'budget' ? 'bg-slate-800 text-white font-bold ring-1 ring-slate-700' : 'text-slate-400 hover:text-white'
              }`}
            >
              Budget & Financials (ZAR)
            </button>
            <button
              onClick={() => setViewMode('timeline')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition whitespace-nowrap ${
                viewMode === 'timeline' ? 'bg-slate-800 text-white font-bold ring-1 ring-slate-700' : 'text-slate-400 hover:text-white'
              }`}
            >
              Timeline / Roadmap
            </button>
            <button
              onClick={() => setViewMode('leads')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition whitespace-nowrap ${
                viewMode === 'leads' ? 'bg-slate-800 text-white font-bold ring-1 ring-slate-700' : 'text-slate-400 hover:text-white'
              }`}
            >
              Assigned Leads
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
