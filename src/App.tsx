/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Header } from './components/Header';
import { StatsCards } from './components/StatsCards';
import { TableView } from './components/TableView';
import { KanbanView } from './components/KanbanView';
import { BudgetView } from './components/BudgetView';
import { TimelineView } from './components/TimelineView';
import { LeadsView } from './components/LeadsView';
import { ClientDetailsView } from './components/ClientDetailsView';
import { GuestDirectoryView } from './components/GuestDirectoryView';
import { AccommodationView } from './components/AccommodationView';
import { CateringCostingView } from './components/CateringCostingView';
import { StaffManagementView } from './components/StaffManagementView';
import { PrintableChecklistsView } from './components/PrintableChecklistsView';
import { CsvTemplatesHub } from './components/CsvTemplatesHub';
import { ConferencesManagerView } from './components/ConferencesManagerView';
import { ClearanceControlView } from './components/ClearanceControlView';
import { LogonModal } from './components/LogonModal';
import { ConflictAuditModal } from './components/ConflictAuditModal';
import { TaskModal } from './components/TaskModal';
import { CsvImportModal } from './components/CsvImportModal';
import { ConferenceSettingsModal } from './components/ConferenceSettingsModal';
import { WindowsExeModal } from './components/WindowsExeModal';
import { 
  AccommodationRoom,
  BookingConflict,
  ClientDetails, 
  ConferenceDetails, 
  ConferenceRecord,
  ConferenceTask, 
  FilterOptions, 
  GuestDetails, 
  MainSection, 
  ManagementUser,
  MenuItemCosting, 
  StaffMember,
  TaskStatus, 
  ViewMode 
} from './types/conference';
import { 
  DEFAULT_CATEGORIES, 
  INITIAL_CONFERENCE_DETAILS, 
  INITIAL_TASKS 
} from './utils/initialData';
import { 
  INITIAL_ACCOMMODATION_ROOMS,
  INITIAL_CLIENT_DATA, 
  INITIAL_GUESTS_DATA, 
  INITIAL_MENU_COSTING,
  INITIAL_STAFF_DATA
} from './utils/csvTemplates';
import { downloadCSV, tasksToCSV } from './utils/csv';
import { 
  getStoredConferences, 
  saveStoredConferences, 
  getStoredActiveConferenceId, 
  saveStoredActiveConferenceId 
} from './utils/seedConferences';
import { 
  getStoredCurrentUser, 
  saveStoredCurrentUser, 
  getStoredManagementUsers, 
  saveStoredManagementUsers, 
  authenticateWithCode 
} from './utils/auth';
import { auditAllConferences } from './utils/conflictDetector';

export default function App() {
  // Conferences Multi-Event Storage State
  const [conferences, setConferences] = useState<ConferenceRecord[]>(() => getStoredConferences());
  const [activeConferenceId, setActiveConferenceId] = useState<string>(() => getStoredActiveConferenceId(conferences));

  // Management Staff & Clearance Authentication State
  const [managementUsers, setManagementUsers] = useState<ManagementUser[]>(() => getStoredManagementUsers());
  const [currentUser, setCurrentUser] = useState<ManagementUser | null>(() => getStoredCurrentUser());

  // Find active conference record
  const activeConference = useMemo(() => {
    return conferences.find(c => c.id === activeConferenceId) || conferences[0];
  }, [conferences, activeConferenceId]);

  // Main Section navigation
  const [mainSection, setMainSection] = useState<MainSection>('tasks');

  // Active conference individual dataset state
  const [tasks, setTasks] = useState<ConferenceTask[]>(() => activeConference?.tasks || INITIAL_TASKS);
  const [conference, setConference] = useState<ConferenceDetails>(() => activeConference?.details || INITIAL_CONFERENCE_DETAILS);
  const [client, setClient] = useState<ClientDetails>(() => activeConference?.client || INITIAL_CLIENT_DATA);
  const [guests, setGuests] = useState<GuestDetails[]>(() => activeConference?.guests || INITIAL_GUESTS_DATA);
  const [rooms, setRooms] = useState<AccommodationRoom[]>(() => activeConference?.rooms || INITIAL_ACCOMMODATION_ROOMS);
  const [menuItems, setMenuItems] = useState<MenuItemCosting[]>(() => activeConference?.menuItems || INITIAL_MENU_COSTING);
  const [staff, setStaff] = useState<StaffMember[]>(() => activeConference?.staff || INITIAL_STAFF_DATA);

  // Active view in Tasks mode
  const [viewMode, setViewMode] = useState<ViewMode>('table');

  // Task Filter state
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    category: '',
    lead: '',
    status: '',
    priority: '',
    costFilter: 'all',
    dateRange: 'all'
  });

  // Modals state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<ConferenceTask | null>(null);
  const [modalDefaultStatus, setModalDefaultStatus] = useState<TaskStatus>('Not Started');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isWindowsExeModalOpen, setIsWindowsExeModalOpen] = useState(false);
  const [isLogonModalOpen, setIsLogonModalOpen] = useState(false);
  const [isConflictModalOpen, setIsConflictModalOpen] = useState(false);

  // Cross-Conference Double-Booking Audit Engine (computed live)
  const conflicts = useMemo<BookingConflict[]>(() => {
    return auditAllConferences(conferences);
  }, [conferences]);

  // Sync active conference to state when activeConferenceId changes
  const isSwitchingConf = useRef(false);
  useEffect(() => {
    const target = conferences.find(c => c.id === activeConferenceId);
    if (target) {
      isSwitchingConf.current = true;
      setTasks(target.tasks);
      setConference(target.details);
      setClient(target.client);
      setGuests(target.guests);
      setRooms(target.rooms);
      setMenuItems(target.menuItems);
      setStaff(target.staff);
      saveStoredActiveConferenceId(activeConferenceId);
      setTimeout(() => {
        isSwitchingConf.current = false;
      }, 50);
    }
  }, [activeConferenceId]);

  // Automatically sync individual changes back into the active conference record in `conferences`
  useEffect(() => {
    if (isSwitchingConf.current) return;

    setConferences(prev => {
      const idx = prev.findIndex(c => c.id === activeConferenceId);
      if (idx === -1) return prev;
      const current = prev[idx];
      const updated: ConferenceRecord = {
        ...current,
        updatedAt: new Date().toISOString(),
        details: conference,
        client,
        tasks,
        guests,
        rooms,
        menuItems,
        staff
      };

      const copy = [...prev];
      copy[idx] = updated;
      saveStoredConferences(copy);
      return copy;
    });
  }, [conference, client, tasks, guests, rooms, menuItems, staff, activeConferenceId]);

  // Persist management users & current user
  useEffect(() => {
    saveStoredManagementUsers(managementUsers);
  }, [managementUsers]);

  useEffect(() => {
    saveStoredCurrentUser(currentUser);
  }, [currentUser]);

  // Multi-conference handlers
  const handleSelectConference = (id: string) => {
    setActiveConferenceId(id);
  };

  const handleSaveConference = (confRecord: ConferenceRecord) => {
    setConferences(prev => {
      const exists = prev.some(c => c.id === confRecord.id);
      let updated: ConferenceRecord[];
      if (exists) {
        updated = prev.map(c => c.id === confRecord.id ? confRecord : c);
      } else {
        updated = [confRecord, ...prev];
      }
      saveStoredConferences(updated);
      return updated;
    });

    if (confRecord.id === activeConferenceId) {
      setConference(confRecord.details);
      setClient(confRecord.client);
      setTasks(confRecord.tasks);
      setGuests(confRecord.guests);
      setRooms(confRecord.rooms);
      setMenuItems(confRecord.menuItems);
      setStaff(confRecord.staff);
    }
  };

  const handleDeleteConference = (id: string) => {
    setConferences(prev => {
      const updated = prev.filter(c => c.id !== id);
      saveStoredConferences(updated);
      if (activeConferenceId === id && updated.length > 0) {
        setActiveConferenceId(updated[0].id);
      }
      return updated;
    });
  };

  // Authentication Handlers
  const handleLogin = (code: string): boolean => {
    const user = authenticateWithCode(code, managementUsers);
    if (user) {
      setCurrentUser(user);
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const handleAddManagementUser = (newUser: ManagementUser) => {
    setManagementUsers(prev => [...prev, newUser]);
  };

  const handleDeleteManagementUser = (id: string) => {
    setManagementUsers(prev => prev.filter(u => u.id !== id && !u.isMasterAdmin));
  };

  // Derived distinct categories & leads
  const categories = useMemo(() => {
    const set = new Set<string>(DEFAULT_CATEGORIES);
    tasks.forEach(t => {
      if (t.category) set.add(t.category);
    });
    return Array.from(set);
  }, [tasks]);

  const leads = useMemo(() => {
    const set = new Set<string>(['Alice', 'Bob', 'Charlie', 'Elena', 'Marcus', 'Mark Mikealson']);
    tasks.forEach(t => {
      if (t.assignedLead) set.add(t.assignedLead);
    });
    return Array.from(set);
  }, [tasks]);

  // Task actions
  const handleSaveTask = (task: ConferenceTask) => {
    const isNew = !tasks.some(t => t.id === task.id);
    if (isNew) {
      setTasks(prev => [task, ...prev]);
    } else {
      setTasks(prev => prev.map(t => t.id === task.id ? task : t));
    }

    const remainingOpen = tasks.filter(t => t.id !== task.id && t.status !== 'Complete').length;
    if (task.status === 'Complete' && remainingOpen === 0) {
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    }
  };

  const handleDeleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const handleDuplicateTask = (task: ConferenceTask) => {
    const copy: ConferenceTask = {
      ...task,
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      taskName: `${task.taskName} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setTasks(prev => [copy, ...prev]);
  };

  const handleStatusChange = (taskId: string, newStatus: TaskStatus) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          status: newStatus,
          updatedAt: new Date().toISOString()
        };
      }
      return t;
    }));
  };

  const handleImportCsv = (importedTasks: ConferenceTask[], mode: 'append' | 'replace') => {
    if (mode === 'replace') {
      setTasks(importedTasks);
    } else {
      setTasks(prev => [...prev, ...importedTasks]);
    }
  };

  const handleExportCsv = () => {
    const csvContent = tasksToCSV(tasks);
    const filename = `${conference.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_tasks.csv`;
    downloadCSV(csvContent, filename);
  };

  const handleResetToUserExact = () => {
    if (window.confirm('Reset tasks to the original 3 user-provided tasks?')) {
      setTasks(INITIAL_TASKS.slice(0, 3));
    }
  };

  const handleResetToFullDemo = () => {
    if (window.confirm('Reset conference tasks to the comprehensive 14 operations tasks?')) {
      setTasks(INITIAL_TASKS);
    }
  };

  // Filtered tasks computation
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      // Search
      if (filters.search) {
        const query = filters.search.toLowerCase();
        const matchesName = task.taskName.toLowerCase().includes(query);
        const matchesLead = task.assignedLead.toLowerCase().includes(query);
        const matchesCat = task.category.toLowerCase().includes(query);
        const matchesNotes = task.notes.toLowerCase().includes(query);
        if (!matchesName && !matchesLead && !matchesCat && !matchesNotes) return false;
      }

      // Category
      if (filters.category && task.category !== filters.category) return false;

      // Lead
      if (filters.lead && task.assignedLead !== filters.lead) return false;

      // Status
      if (filters.status && task.status !== filters.status) return false;

      // Priority
      if (filters.priority && task.priority !== filters.priority) return false;

      // Cost filter
      if (filters.costFilter === 'over_budget') {
        if (task.actualCost === null || task.actualCost <= task.budgetedCost) return false;
      } else if (filters.costFilter === 'under_budget') {
        if (task.actualCost === null || task.actualCost >= task.budgetedCost) return false;
      } else if (filters.costFilter === 'unsettled') {
        if (task.actualCost !== null) return false;
      }

      // Date Range filter
      if (filters.dateRange !== 'all') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const due = new Date(task.dueDate);
        due.setHours(0, 0, 0, 0);
        const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        if (filters.dateRange === 'overdue') {
          if (diffDays >= 0 || task.status === 'Complete') return false;
        } else if (filters.dateRange === 'upcoming_7d') {
          if (diffDays < 0 || diffDays > 7) return false;
        } else if (filters.dateRange === 'upcoming_30d') {
          if (diffDays < 0 || diffDays > 30) return false;
        }
      }

      return true;
    });
  }, [tasks, filters]);

  // Counts for Stats
  const completedCount = useMemo(() => tasks.filter(t => t.status === 'Complete').length, [tasks]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      
      {/* Top Application Header */}
      <Header
        conference={conference}
        mainSection={mainSection}
        setMainSection={setMainSection}
        viewMode={viewMode}
        setViewMode={setViewMode}
        onOpenNewTask={() => {
          setTaskToEdit(null);
          setModalDefaultStatus('Not Started');
          setIsTaskModalOpen(true);
        }}
        onOpenImportModal={() => setIsImportModalOpen(true)}
        onExportCsv={handleExportCsv}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onResetToUserExact={handleResetToUserExact}
        onResetToFullDemo={handleResetToFullDemo}
        onOpenWindowsExe={() => setIsWindowsExeModalOpen(true)}
        taskCount={tasks.length}
        completedCount={completedCount}
        guestCount={guests.length}
        roomCount={rooms.length}
        staffCount={staff.length}
        menuItemCount={menuItems.length}
        allConferences={conferences}
        activeConferenceId={activeConferenceId}
        onSelectConference={handleSelectConference}
        currentUser={currentUser}
        onOpenLogonModal={() => setIsLogonModalOpen(true)}
        conflicts={conflicts}
        onOpenConflictModal={() => setIsConflictModalOpen(true)}
      />

      {/* Main Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Module: Conferences Manager & Individual Saves Hub */}
        {mainSection === 'conferences' && (
          <ConferencesManagerView
            conferences={conferences}
            activeConferenceId={activeConferenceId}
            onSelectConference={handleSelectConference}
            onSaveConference={handleSaveConference}
            onDeleteConference={handleDeleteConference}
            onOpenConflictModal={() => setIsConflictModalOpen(true)}
            conflicts={conflicts}
            currentUser={currentUser}
          />
        )}

        {/* Module: Management Staff Clearance Matrix */}
        {mainSection === 'clearance' && (
          <ClearanceControlView
            currentUser={currentUser}
            allUsers={managementUsers}
            onLogin={handleLogin}
            onLogout={handleLogout}
            onAddUser={handleAddManagementUser}
            onDeleteUser={handleDeleteManagementUser}
            onOpenLogonModal={() => setIsLogonModalOpen(true)}
          />
        )}

        {/* Section 0: Tasks & Operations Views */}
        {mainSection === 'tasks' && (
          <>
            {/* KPI Stats Cards */}
            <StatsCards
              tasks={tasks}
              conference={conference}
              onSelectQuickFilter={(filterType, value) => {
                if (filterType === 'dateRange') {
                  setFilters(prev => ({ ...prev, dateRange: value as any }));
                } else if (filterType === 'costFilter') {
                  setFilters(prev => ({ ...prev, costFilter: value as any }));
                }
              }}
            />

            {/* View Mode Switching */}
            {viewMode === 'table' && (
              <TableView
                tasks={filteredTasks}
                categories={categories}
                leads={leads}
                filters={filters}
                setFilters={setFilters}
                onEditTask={task => {
                  setTaskToEdit(task);
                  setIsTaskModalOpen(true);
                }}
                onDeleteTask={handleDeleteTask}
                onDuplicateTask={handleDuplicateTask}
                onBatchUpdateStatus={(ids, status) => {
                  setTasks(prev => prev.map(t => ids.includes(t.id) ? { ...t, status } : t));
                }}
                onBatchDelete={ids => {
                  setTasks(prev => prev.filter(t => !ids.includes(t.id)));
                }}
                onBatchUpdateLead={(ids, lead) => {
                  setTasks(prev => prev.map(t => ids.includes(t.id) ? { ...t, assignedLead: lead } : t));
                }}
                onQuickUpdateTask={handleSaveTask}
              />
            )}

            {viewMode === 'kanban' && (
              <KanbanView
                tasks={filteredTasks}
                onEditTask={task => {
                  setTaskToEdit(task);
                  setIsTaskModalOpen(true);
                }}
                onDeleteTask={handleDeleteTask}
                onUpdateStatus={handleStatusChange}
                onAddTaskWithStatus={(status: TaskStatus) => {
                  setTaskToEdit(null);
                  setModalDefaultStatus(status);
                  setIsTaskModalOpen(true);
                }}
              />
            )}

            {viewMode === 'budget' && (
              <BudgetView
                tasks={tasks}
                conference={conference}
                onEditTask={task => {
                  setTaskToEdit(task);
                  setIsTaskModalOpen(true);
                }}
              />
            )}

            {viewMode === 'timeline' && (
              <TimelineView
                tasks={filteredTasks}
                onEditTask={task => {
                  setTaskToEdit(task);
                  setIsTaskModalOpen(true);
                }}
              />
            )}

            {viewMode === 'leads' && (
              <LeadsView
                tasks={tasks}
                onEditTask={task => {
                  setTaskToEdit(task);
                  setIsTaskModalOpen(true);
                }}
                onFilterByLead={lead => setFilters(prev => ({ ...prev, lead }))}
              />
            )}
          </>
        )}

        {/* Section 1: Client Details */}
        {mainSection === 'client' && (
          <ClientDetailsView
            client={client}
            onUpdateClient={setClient}
          />
        )}

        {/* Section 2: Individual Guest Details */}
        {mainSection === 'guests' && (
          <GuestDirectoryView
            guests={guests}
            onUpdateGuests={setGuests}
          />
        )}

        {/* Section 3: Room Accommodation & Housekeeping Checklist */}
        {mainSection === 'accommodation' && (
          <AccommodationView
            rooms={rooms}
            onUpdateRooms={setRooms}
            availableGuests={guests}
          />
        )}

        {/* Section 4: Food Menu Choices & Catering Costing Breakdown */}
        {mainSection === 'catering' && (
          <CateringCostingView
            menuItems={menuItems}
            onUpdateMenuItems={setMenuItems}
            expectedAttendees={conference.expectedAttendees}
          />
        )}

        {/* Section 5: Staff & Crew Management */}
        {mainSection === 'staff' && (
          <StaffManagementView
            staff={staff}
            onUpdateStaff={setStaff}
          />
        )}

        {/* Section 6: Printable Departmental Checklists */}
        {mainSection === 'checklists' && (
          <PrintableChecklistsView
            conference={conference}
            client={client}
            guests={guests}
            rooms={rooms}
            menuItems={menuItems}
          />
        )}

        {/* Section 7: CSV Templates Hub */}
        {mainSection === 'templates' && (
          <CsvTemplatesHub />
        )}

      </main>

      {/* Footer bar with quick navigation & status */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-3 px-4 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Active Conference: <strong className="text-slate-800 dark:text-slate-200">{conference.title}</strong> &bull; Currency: <strong>ZAR (R)</strong></span>
        </div>
        
        <div className="flex items-center gap-3 flex-wrap">
          <button 
            onClick={() => setMainSection('conferences')}
            className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
          >
            Conferences Hub ({conferences.length})
          </button>
          <span>&bull;</span>
          <button 
            onClick={() => setMainSection('clearance')}
            className="text-red-600 dark:text-red-400 font-bold hover:underline"
          >
            Clearance & Logon Codes
          </button>
          <span>&bull;</span>
          <button 
            onClick={() => setIsConflictModalOpen(true)}
            className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
          >
            Double Booking Auditor ({conflicts.length} Overlaps)
          </button>
          <span>&bull;</span>
          <button 
            onClick={() => setIsWindowsExeModalOpen(true)}
            className="text-sky-600 dark:text-sky-400 font-bold hover:underline flex items-center gap-1"
          >
            🖥️ Standalone Windows .EXE
          </button>
        </div>
      </footer>

      {/* Modals */}
      <LogonModal
        isOpen={isLogonModalOpen}
        onClose={() => setIsLogonModalOpen(false)}
        currentUser={currentUser}
        onLogin={handleLogin}
        onLogout={handleLogout}
        allUsers={managementUsers}
        onAddUser={handleAddManagementUser}
        onDeleteUser={handleDeleteManagementUser}
      />

      <ConflictAuditModal
        isOpen={isConflictModalOpen}
        onClose={() => setIsConflictModalOpen(false)}
        conflicts={conflicts}
        conferences={conferences}
        currentUser={currentUser}
        onSelectConference={handleSelectConference}
      />

      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={handleSaveTask}
        taskToEdit={taskToEdit}
        categories={categories}
        leads={leads}
        defaultStatus={modalDefaultStatus}
      />

      <CsvImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImportCsv}
      />

      <ConferenceSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        conference={conference}
        onSave={setConference}
        currentConferenceId={activeConferenceId}
        allConferences={conferences}
        currentUser={currentUser}
      />

      <WindowsExeModal
        isOpen={isWindowsExeModalOpen}
        onClose={() => setIsWindowsExeModalOpen(false)}
      />

    </div>
  );
}
