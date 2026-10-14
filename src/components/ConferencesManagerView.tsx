import React, { useState } from 'react';
import { 
  Building2, 
  Calendar, 
  MapPin, 
  Users, 
  DollarSign, 
  Plus, 
  Copy, 
  Download, 
  Upload, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle, 
  ExternalLink, 
  Clock, 
  ShieldCheck, 
  ShieldAlert,
  Search,
  FileSpreadsheet,
  Layers,
  Sparkles,
  Edit3,
  X
} from 'lucide-react';
import { BookingConflict, ConferenceDetails, ConferenceRecord, ManagementUser } from '../types/conference';
import { formatZAR } from '../utils/currency';
import { detectVenueConflicts } from '../utils/conflictDetector';
import { INITIAL_ACCOMMODATION_ROOMS, INITIAL_CLIENT_DATA, INITIAL_GUESTS_DATA, INITIAL_MENU_COSTING, INITIAL_STAFF_DATA } from '../utils/csvTemplates';
import { INITIAL_TASKS } from '../utils/initialData';

interface ConferencesManagerViewProps {
  conferences: ConferenceRecord[];
  activeConferenceId: string;
  onSelectConference: (id: string) => void;
  onSaveConference: (conf: ConferenceRecord) => void;
  onDeleteConference: (id: string) => void;
  onOpenConflictModal: () => void;
  conflicts: BookingConflict[];
  currentUser: ManagementUser | null;
}

const VENUE_HALLS = [
  'Drakensberg Main Hall',
  'Highland Pavilion & Lawns',
  'Brookside Executive Suite',
  'Mooi River Private Lounge',
  'Nottingham Road Arena'
];

export const ConferencesManagerView: React.FC<ConferencesManagerViewProps> = ({
  conferences,
  activeConferenceId,
  onSelectConference,
  onSaveConference,
  onDeleteConference,
  onOpenConflictModal,
  conflicts,
  currentUser
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingConference, setEditingConference] = useState<ConferenceRecord | null>(null);

  // New Conference Form State
  const [formTitle, setFormTitle] = useState('');
  const [formTheme, setFormTheme] = useState('');
  const [formStartDate, setFormStartDate] = useState('2026-11-25');
  const [formEndDate, setFormEndDate] = useState('2026-11-27');
  const [formVenue, setFormVenue] = useState('Rawdons Estate & Conference Centre');
  const [formHall, setFormHall] = useState(VENUE_HALLS[0]);
  const [formCity, setFormCity] = useState('Nottingham Road, KwaZulu-Natal');
  const [formAttendees, setFormAttendees] = useState(120);
  const [formBudgetLimit, setFormBudgetLimit] = useState(180000);
  const [formClientName, setFormClientName] = useState('');
  const [formClientOrg, setFormClientOrg] = useState('');
  const [formStatus, setFormStatus] = useState<'Upcoming' | 'In Session' | 'Completed' | 'Draft'>('Upcoming');
  
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);
  const [overrideAllowed, setOverrideAllowed] = useState(false);

  const isMasterAdmin = currentUser?.clearanceLevel === 5 || currentUser?.isMasterAdmin;
  const canManageConferences = (currentUser?.clearanceLevel || 0) >= 4 || isMasterAdmin;

  // Real-time conflict check for form
  const checkFormConflicts = (start: string, end: string, hall: string, currentId: string | null) => {
    const candidate: ConferenceDetails = {
      title: formTitle || 'New Conference',
      theme: formTheme,
      startDate: start,
      endDate: end,
      venue: formVenue,
      hall,
      city: formCity,
      expectedAttendees: formAttendees,
      overallBudgetLimit: formBudgetLimit
    };

    const detected = detectVenueConflicts(candidate, currentId, conferences);
    if (detected.length > 0) {
      setConflictWarning(detected[0].description);
    } else {
      setConflictWarning(null);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingConference(null);
    setFormTitle('');
    setFormTheme('');
    setFormStartDate('2026-11-25');
    setFormEndDate('2026-11-27');
    setFormVenue('Rawdons Estate & Conference Centre');
    setFormHall(VENUE_HALLS[0]);
    setFormCity('Nottingham Road, KwaZulu-Natal');
    setFormAttendees(120);
    setFormBudgetLimit(180000);
    setFormClientName('');
    setFormClientOrg('');
    setFormStatus('Upcoming');
    setConflictWarning(null);
    setOverrideAllowed(false);
    setIsCreateModalOpen(true);
  };

  const handleOpenEditModal = (conf: ConferenceRecord) => {
    setEditingConference(conf);
    setFormTitle(conf.details.title);
    setFormTheme(conf.details.theme);
    setFormStartDate(conf.details.startDate);
    setFormEndDate(conf.details.endDate);
    setFormVenue(conf.details.venue);
    setFormHall(conf.details.hall || VENUE_HALLS[0]);
    setFormCity(conf.details.city);
    setFormAttendees(conf.details.expectedAttendees);
    setFormBudgetLimit(conf.details.overallBudgetLimit);
    setFormClientName(conf.client.clientName);
    setFormClientOrg(conf.client.organization);
    setFormStatus(conf.status);
    setConflictWarning(null);
    setOverrideAllowed(false);
    setIsCreateModalOpen(true);
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();

    // Check conflict
    const candidate: ConferenceDetails = {
      title: formTitle,
      theme: formTheme,
      startDate: formStartDate,
      endDate: formEndDate,
      venue: formVenue,
      hall: formHall,
      city: formCity,
      expectedAttendees: Number(formAttendees),
      overallBudgetLimit: Number(formBudgetLimit)
    };

    const detected = detectVenueConflicts(candidate, editingConference ? editingConference.id : null, conferences);
    if (detected.length > 0 && !overrideAllowed) {
      setConflictWarning(detected[0].description);
      return;
    }

    if (editingConference) {
      // Update existing conference
      const updated: ConferenceRecord = {
        ...editingConference,
        updatedAt: new Date().toISOString(),
        status: formStatus,
        details: candidate,
        client: {
          ...editingConference.client,
          clientName: formClientName || editingConference.client.clientName,
          organization: formClientOrg || editingConference.client.organization,
          eventName: formTitle,
          eventDates: `${formStartDate} to ${formEndDate}`,
          venueBooked: `${formVenue} - ${formHall}`,
          guaranteedAttendees: Number(formAttendees),
          agreedBudgetCap: Number(formBudgetLimit)
        }
      };
      onSaveConference(updated);
    } else {
      // Create brand new conference record with complete initial datasets
      const newId = `conf-${Date.now()}`;
      const newConf: ConferenceRecord = {
        id: newId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: formStatus,
        details: candidate,
        client: {
          ...INITIAL_CLIENT_DATA,
          clientName: formClientName || 'Corporate Client',
          organization: formClientOrg || 'Client Organization',
          eventName: formTitle,
          eventDates: `${formStartDate} to ${formEndDate}`,
          venueBooked: `${formVenue} - ${formHall}`,
          guaranteedAttendees: Number(formAttendees),
          agreedBudgetCap: Number(formBudgetLimit),
          depositPaid: Math.round(Number(formBudgetLimit) * 0.4),
          balanceDue: Math.round(Number(formBudgetLimit) * 0.6)
        },
        tasks: INITIAL_TASKS.map(t => ({
          ...t,
          id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`
        })),
        guests: INITIAL_GUESTS_DATA.map(g => ({
          ...g,
          id: `gst-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`
        })),
        rooms: INITIAL_ACCOMMODATION_ROOMS.map(r => ({
          ...r,
          allocationStatus: 'Vacant',
          allocatedGuestName: null,
          allocatedGuestOrg: null,
          allocatedGuestId: null
        })),
        menuItems: INITIAL_MENU_COSTING.map(m => ({
          ...m,
          id: `menu-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          expectedGuestCount: Number(formAttendees),
          totalCost: (m.unitCostPerHead * Number(formAttendees)) + m.serviceSurcharge
        })),
        staff: INITIAL_STAFF_DATA
      };

      onSaveConference(newConf);
      onSelectConference(newId);
    }

    setIsCreateModalOpen(false);
  };

  const handleDuplicateConference = (conf: ConferenceRecord) => {
    const cloneId = `conf-clone-${Date.now()}`;
    const clone: ConferenceRecord = {
      ...conf,
      id: cloneId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'Draft',
      details: {
        ...conf.details,
        title: `${conf.details.title} (Copy)`,
        startDate: '2026-12-15',
        endDate: '2026-12-17',
        hall: 'Mooi River Private Lounge'
      },
      client: {
        ...conf.client,
        eventName: `${conf.details.title} (Copy)`,
        status: 'Drafting'
      }
    };
    onSaveConference(clone);
    onSelectConference(cloneId);
  };

  const handleExportConference = (conf: ConferenceRecord) => {
    const jsonStr = JSON.stringify(conf, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${conf.details.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_record.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportConference = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.details && parsed.details.title) {
          const imported: ConferenceRecord = {
            ...parsed,
            id: `conf-imported-${Date.now()}`,
            updatedAt: new Date().toISOString()
          };
          onSaveConference(imported);
          onSelectConference(imported.id);
        } else {
          alert('Invalid conference JSON file format.');
        }
      } catch (err) {
        alert('Could not parse conference file. Please ensure it is valid JSON.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Filter conferences
  const filteredConferences = conferences.filter(c => {
    const q = searchTerm.toLowerCase();
    return (
      c.details.title.toLowerCase().includes(q) ||
      (c.details.hall || '').toLowerCase().includes(q) ||
      c.client.organization.toLowerCase().includes(q) ||
      c.details.city.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Banner & Multi-Conference Hub Stats */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Multi-Conference Management System
              </span>
              <button
                onClick={onOpenConflictModal}
                className={`text-xs px-2.5 py-0.5 rounded-full font-bold border transition flex items-center gap-1 ${
                  conflicts.length === 0
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/30'
                    : 'bg-red-500/20 text-red-300 border-red-500/30 hover:bg-red-500/30 animate-pulse'
                }`}
              >
                {conflicts.length === 0 ? (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    No Double Bookings
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                    {conflicts.length} Double Booking Conflict{conflicts.length > 1 ? 's' : ''}
                  </>
                )}
              </button>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
              <Building2 className="w-7 h-7 text-indigo-400" />
              Conference Portfolio & Individual Saves
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              Run and save each conference individually with isolated tasks, client financials, room allocations, catering costing, and staff duty rosters. Built-in real-time double-booking prevention across all Rawdons venues.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <label className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 cursor-pointer shadow-sm transition">
              <Upload className="w-4 h-4 text-slate-400" />
              Import .json
              <input 
                type="file" 
                accept=".json" 
                onChange={handleImportConference} 
                className="hidden" 
              />
            </label>

            <button
              onClick={handleOpenCreateModal}
              disabled={!canManageConferences}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold shadow-lg transition ${
                canManageConferences 
                  ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30' 
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              }`}
              title={canManageConferences ? 'Create a new conference' : 'Requires Level 4 Clearance or Master Admin'}
            >
              <Plus className="w-4 h-4" />
              + Create New Conference
            </button>
          </div>
        </div>

        {/* Quick summary strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-800/80 text-xs">
          <div>
            <div className="text-slate-400 text-[11px]">Total Conferences Saved</div>
            <div className="text-lg font-bold text-white mt-0.5">{conferences.length} Individual Events</div>
          </div>
          <div>
            <div className="text-slate-400 text-[11px]">Active Conference In View</div>
            <div className="text-sm font-bold text-indigo-300 truncate mt-0.5">
              {conferences.find(c => c.id === activeConferenceId)?.details.title || 'None'}
            </div>
          </div>
          <div>
            <div className="text-slate-400 text-[11px]">Conflict Engine Status</div>
            <div className="text-sm font-bold text-emerald-400 mt-0.5 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> Zero Overlaps
            </div>
          </div>
          <div>
            <div className="text-slate-400 text-[11px]">Security Authority</div>
            <div className="text-sm font-bold text-amber-300 mt-0.5 truncate">
              {currentUser ? `${currentUser.name} (L${currentUser.clearanceLevel})` : 'Guest Mode'}
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search by conference title, venue hall, or client..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>
        <div className="text-xs text-slate-500">
          Showing {filteredConferences.length} of {conferences.length} conferences
        </div>
      </div>

      {/* Conferences Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredConferences.map(conf => {
          const isActive = conf.id === activeConferenceId;
          const taskTotal = conf.tasks.length;
          const completedTasks = conf.tasks.filter(t => t.status === 'Complete').length;
          const completionRate = taskTotal > 0 ? Math.round((completedTasks / taskTotal) * 100) : 0;
          const hallName = conf.details.hall || 'Rawdons Main Hall';

          return (
            <div
              key={conf.id}
              className={`rounded-2xl border transition shadow-sm overflow-hidden flex flex-col justify-between ${
                isActive 
                  ? 'bg-gradient-to-b from-indigo-950/20 to-white dark:to-slate-800 border-indigo-500 ring-2 ring-indigo-500/20 shadow-indigo-500/10' 
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
              }`}
            >
              {/* Card Header */}
              <div className="p-5 border-b border-slate-100 dark:border-slate-700/80">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase ${
                    conf.status === 'Upcoming' 
                      ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20' 
                      : conf.status === 'In Session'
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                      : conf.status === 'Completed'
                      ? 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20'
                      : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                  }`}>
                    {conf.status}
                  </span>

                  {isActive && (
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-indigo-600 text-white flex items-center gap-1 shadow-sm">
                      <CheckCircle2 className="w-3 h-3" />
                      Active In View
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white line-clamp-1">
                  {conf.details.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                  {conf.details.theme || 'No theme subtitle specified'}
                </p>

                {/* Key Details */}
                <div className="mt-3.5 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                    <span className="font-medium">{conf.details.startDate} &mdash; {conf.details.endDate}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                    <span className="font-semibold text-slate-900 dark:text-white">{hallName}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{conf.client.organization || conf.client.clientName} &bull; {conf.details.expectedAttendees} Attendees</span>
                  </div>
                </div>

                {/* Mini Progress Bar */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/60">
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="text-slate-500">Tasks Progress</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {completedTasks}/{taskTotal} ({completionRate}%)
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-indigo-600 rounded-full transition-all duration-300" 
                      style={{ width: `${completionRate}%` }} 
                    />
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between gap-2 text-xs">
                {isActive ? (
                  <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Currently Loaded
                  </span>
                ) : (
                  <button
                    onClick={() => onSelectConference(conf.id)}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-sm transition flex items-center gap-1"
                  >
                    Switch to Conference
                  </button>
                )}

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEditModal(conf)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                    title="Edit Dates & Venue Hall"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDuplicateConference(conf)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                    title="Clone / Duplicate Conference"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleExportConference(conf)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                    title="Export Single Conference (.json)"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                  {isMasterAdmin && conferences.length > 1 && (
                    <button
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete "${conf.details.title}"? This cannot be undone.`)) {
                          onDeleteConference(conf.id);
                        }
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition"
                      title="Delete Conference (Master Admin Only)"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create / Edit Conference Modal with Live Conflict Checking */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div 
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl max-w-xl w-full text-slate-900 dark:text-white shadow-2xl overflow-hidden my-6"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold">
                    {editingConference ? 'Edit Conference & Venue Schedule' : 'Create New Saved Conference'}
                  </h2>
                  <p className="text-xs text-slate-400">
                    Proactive double-booking validation across all Rawdons venues
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="p-6 space-y-4 text-xs">
              {/* Conflict Alert Box if double booking detected */}
              {conflictWarning && (
                <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/50 text-red-200 space-y-2">
                  <div className="font-bold text-xs flex items-center gap-2 text-red-300">
                    <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                    DOUBLE BOOKING BLOCKED: Venue / Hall Collision
                  </div>
                  <p className="text-[11px] leading-relaxed">{conflictWarning}</p>
                  
                  {isMasterAdmin ? (
                    <label className="flex items-center gap-2 pt-2 border-t border-red-800/50 text-[11px] text-amber-300 font-semibold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={overrideAllowed}
                        onChange={e => setOverrideAllowed(e.target.checked)}
                        className="rounded border-red-400 text-red-600 focus:ring-red-500"
                      />
                      <span>Master Admin Override (Authorized by Mark Mikealson - Clearance Level 5)</span>
                    </label>
                  ) : (
                    <div className="text-[10px] text-red-400/90 italic">
                      Please pick different dates or select an alternate hall. Only Master Admin Mark Mikealson can override a double-booking.
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Conference Name / Title *
                </label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={e => {
                    setFormTitle(e.target.value);
                    checkFormConflicts(formStartDate, formEndDate, formHall, editingConference ? editingConference.id : null);
                  }}
                  placeholder="e.g. Drakensberg Business Leaders Summit 2026"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Theme / Focus Subtitle
                </label>
                <input
                  type="text"
                  value={formTheme}
                  onChange={e => setFormTheme(e.target.value)}
                  placeholder="e.g. Navigating Economic Expansion in the Midlands"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              {/* Dates & Hall Selection */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    value={formStartDate}
                    onChange={e => {
                      setFormStartDate(e.target.value);
                      checkFormConflicts(e.target.value, formEndDate, formHall, editingConference ? editingConference.id : null);
                    }}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    End Date *
                  </label>
                  <input
                    type="date"
                    value={formEndDate}
                    onChange={e => {
                      setFormEndDate(e.target.value);
                      checkFormConflicts(formStartDate, e.target.value, formHall, editingConference ? editingConference.id : null);
                    }}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    Allocated Venue Hall *
                  </label>
                  <select
                    value={formHall}
                    onChange={e => {
                      setFormHall(e.target.value);
                      checkFormConflicts(formStartDate, formEndDate, e.target.value, editingConference ? editingConference.id : null);
                    }}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-indigo-500 outline-none font-semibold text-indigo-600 dark:text-indigo-400"
                    required
                  >
                    {VENUE_HALLS.map(h => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    Event Lifecycle Status
                  </label>
                  <select
                    value={formStatus}
                    onChange={e => setFormStatus(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="Upcoming">Upcoming</option>
                    <option value="In Session">In Session</option>
                    <option value="Completed">Completed</option>
                    <option value="Draft">Draft</option>
                  </select>
                </div>
              </div>

              {/* Client & Attendees */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    Client Organization
                  </label>
                  <input
                    type="text"
                    value={formClientOrg}
                    onChange={e => setFormClientOrg(e.target.value)}
                    placeholder="e.g. Anglo Platinum SA"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    Primary Client Contact
                  </label>
                  <input
                    type="text"
                    value={formClientName}
                    onChange={e => setFormClientName(e.target.value)}
                    placeholder="e.g. Amanda Dlamini"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    Expected Attendees
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formAttendees}
                    onChange={e => setFormAttendees(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    Overall Budget Limit (ZAR)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="5000"
                    value={formBudgetLimit}
                    onChange={e => setFormBudgetLimit(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={Boolean(conflictWarning && !overrideAllowed)}
                  className={`px-5 py-2 rounded-xl text-xs font-bold shadow-md transition flex items-center gap-1.5 ${
                    conflictWarning && !overrideAllowed
                      ? 'bg-slate-400 text-white cursor-not-allowed'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {editingConference ? 'Update Conference Details' : 'Save & Open Conference'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
