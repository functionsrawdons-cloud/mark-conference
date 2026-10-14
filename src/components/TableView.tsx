import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  MoreHorizontal, 
  Edit3, 
  Trash2, 
  Copy, 
  Check, 
  AlertCircle, 
  X, 
  ChevronRight, 
  Calendar, 
  User, 
  CheckSquare, 
  Square,
  DollarSign
} from 'lucide-react';
import { ConferenceTask, FilterOptions, TaskPriority, TaskStatus } from '../types/conference';
import { CATEGORY_COLORS, getLeadInfo } from '../utils/initialData';
import { formatZAR, formatZARDiff } from '../utils/currency';

interface TableViewProps {
  tasks: ConferenceTask[];
  categories: string[];
  leads: string[];
  filters: FilterOptions;
  setFilters: React.Dispatch<React.SetStateAction<FilterOptions>>;
  onEditTask: (task: ConferenceTask) => void;
  onDeleteTask: (id: string) => void;
  onDuplicateTask: (task: ConferenceTask) => void;
  onBatchUpdateStatus: (ids: string[], status: TaskStatus) => void;
  onBatchDelete: (ids: string[]) => void;
  onBatchUpdateLead: (ids: string[], lead: string) => void;
  onQuickUpdateTask: (task: ConferenceTask) => void;
}

type SortField = 'taskName' | 'category' | 'assignedLead' | 'status' | 'priority' | 'dueDate' | 'budgetedCost' | 'actualCost';

export const TableView: React.FC<TableViewProps> = ({
  tasks,
  categories,
  leads,
  filters,
  setFilters,
  onEditTask,
  onDeleteTask,
  onDuplicateTask,
  onBatchUpdateStatus,
  onBatchDelete,
  onBatchUpdateLead,
  onQuickUpdateTask
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [sortField, setSortField] = useState<SortField>('dueDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      // Search
      if (filters.search) {
        const query = filters.search.toLowerCase();
        const matchesName = task.taskName.toLowerCase().includes(query);
        const matchesNotes = task.notes.toLowerCase().includes(query);
        const matchesLead = task.assignedLead.toLowerCase().includes(query);
        const matchesCategory = task.category.toLowerCase().includes(query);
        if (!matchesName && !matchesNotes && !matchesLead && !matchesCategory) return false;
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
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        const due = new Date(task.dueDate);
        due.setHours(0, 0, 0, 0);
        const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

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

  // Sort tasks
  const sortedTasks = useMemo(() => {
    return [...filteredTasks].sort((a, b) => {
      let comparison = 0;
      if (sortField === 'taskName') {
        comparison = a.taskName.localeCompare(b.taskName);
      } else if (sortField === 'category') {
        comparison = a.category.localeCompare(b.category);
      } else if (sortField === 'assignedLead') {
        comparison = a.assignedLead.localeCompare(b.assignedLead);
      } else if (sortField === 'status') {
        const statusOrder: Record<TaskStatus, number> = {
          'Not Started': 0,
          'In Progress': 1,
          'Under Review': 2,
          'Blocked': 3,
          'Complete': 4
        };
        comparison = (statusOrder[a.status] ?? 0) - (statusOrder[b.status] ?? 0);
      } else if (sortField === 'priority') {
        const priorityOrder: Record<TaskPriority, number> = {
          'Low': 0,
          'Medium': 1,
          'High': 2,
          'Urgent': 3
        };
        comparison = (priorityOrder[a.priority] ?? 0) - (priorityOrder[b.priority] ?? 0);
      } else if (sortField === 'dueDate') {
        comparison = a.dueDate.localeCompare(b.dueDate);
      } else if (sortField === 'budgetedCost') {
        comparison = (a.budgetedCost || 0) - (b.budgetedCost || 0);
      } else if (sortField === 'actualCost') {
        const aVal = a.actualCost ?? -1;
        const bVal = b.actualCost ?? -1;
        comparison = aVal - bVal;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [filteredTasks, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Selection handlers
  const handleToggleSelectAll = () => {
    if (selectedIds.length === sortedTasks.length && sortedTasks.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(sortedTasks.map(t => t.id));
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Totals calculations
  const totalBudgeted = sortedTasks.reduce((sum, t) => sum + (t.budgetedCost || 0), 0);
  const totalActual = sortedTasks.reduce((sum, t) => sum + (t.actualCost || 0), 0);
  const settledTasks = sortedTasks.filter(t => t.actualCost !== null);
  const settledBudget = settledTasks.reduce((sum, t) => sum + (t.budgetedCost || 0), 0);
  const settledVariance = totalActual - settledBudget;

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case 'Complete':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800';
      case 'Under Review':
        return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800';
      case 'Blocked':
        return 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800';
      case 'Not Started':
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
    }
  };

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case 'Urgent':
        return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800';
      case 'High':
        return 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800';
      case 'Medium':
        return 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800';
      case 'Low':
      default:
        return 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700';
    }
  };

  const hasActiveFilters = 
    Boolean(filters.search || filters.category || filters.lead || filters.status || filters.priority || filters.costFilter !== 'all' || filters.dateRange !== 'all');

  const clearAllFilters = () => {
    setFilters({
      search: '',
      category: '',
      lead: '',
      status: '',
      priority: '',
      costFilter: 'all',
      dateRange: 'all'
    });
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col">
      
      {/* 1. Filter & Search Toolbar */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/80">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search tasks, categories, leads, notes..."
              value={filters.search}
              onChange={e => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="w-full pl-9 pr-8 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {filters.search && (
              <button
                onClick={() => setFilters(prev => ({ ...prev, search: '' }))}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Dropdowns */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Category */}
            <select
              value={filters.category}
              onChange={e => setFilters(prev => ({ ...prev, category: e.target.value }))}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="">All Categories ({categories.length})</option>
              {categories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            {/* Lead */}
            <select
              value={filters.lead}
              onChange={e => setFilters(prev => ({ ...prev, lead: e.target.value }))}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="">All Leads ({leads.length})</option>
              {leads.map(l => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>

            {/* Status */}
            <select
              value={filters.status}
              onChange={e => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="">All Statuses</option>
              <option value="Not Started">Not Started</option>
              <option value="In Progress">In Progress</option>
              <option value="Under Review">Under Review</option>
              <option value="Blocked">Blocked</option>
              <option value="Complete">Complete</option>
            </select>

            {/* Priority */}
            <select
              value={filters.priority}
              onChange={e => setFilters(prev => ({ ...prev, priority: e.target.value }))}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="">All Priorities</option>
              <option value="Urgent">Urgent</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>

            {/* Cost filter */}
            <select
              value={filters.costFilter}
              onChange={e => setFilters(prev => ({ ...prev, costFilter: e.target.value as any }))}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="all">Cost: All Items</option>
              <option value="over_budget">Over Budget Only</option>
              <option value="under_budget">Under Budget Only</option>
              <option value="unsettled">Pending Actual Cost</option>
            </select>

            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="text-xs text-rose-600 dark:text-rose-400 hover:underline px-2 py-1 font-medium flex items-center gap-1"
              >
                <X className="w-3 h-3" />
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* 2. Bulk Selection Bar (Shows if items selected) */}
        {selectedIds.length > 0 && (
          <div className="mt-3 py-2 px-3 bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 rounded-lg flex items-center justify-between text-xs animate-fadeIn">
            <div className="flex items-center gap-2 text-indigo-900 dark:text-indigo-200 font-medium">
              <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">
                {selectedIds.length}
              </span>
              <span>tasks selected</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onBatchUpdateStatus(selectedIds, 'Complete')}
                className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-medium flex items-center gap-1 shadow-xs"
              >
                <Check className="w-3 h-3" />
                Mark Complete
              </button>

              <select
                onChange={e => {
                  if (e.target.value) {
                    onBatchUpdateStatus(selectedIds, e.target.value as TaskStatus);
                    e.target.value = '';
                  }
                }}
                className="px-2 py-1 rounded bg-white dark:bg-slate-700 border border-indigo-300 dark:border-indigo-700 text-slate-700 dark:text-slate-200"
                defaultValue=""
              >
                <option value="" disabled>Set Status...</option>
                <option value="Not Started">Not Started</option>
                <option value="In Progress">In Progress</option>
                <option value="Under Review">Under Review</option>
                <option value="Blocked">Blocked</option>
                <option value="Complete">Complete</option>
              </select>

              <select
                onChange={e => {
                  if (e.target.value) {
                    onBatchUpdateLead(selectedIds, e.target.value);
                    e.target.value = '';
                  }
                }}
                className="px-2 py-1 rounded bg-white dark:bg-slate-700 border border-indigo-300 dark:border-indigo-700 text-slate-700 dark:text-slate-200"
                defaultValue=""
              >
                <option value="" disabled>Reassign Lead...</option>
                {leads.map(l => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>

              <button
                onClick={() => {
                  if (confirm(`Delete ${selectedIds.length} selected tasks?`)) {
                    onBatchDelete(selectedIds);
                    setSelectedIds([]);
                  }
                }}
                className="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-700 text-white font-medium flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" />
                Delete
              </button>

              <button
                onClick={() => setSelectedIds([])}
                className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 ml-2"
              >
                Deselect
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 3. Data Table */}
      <div className="overflow-x-auto min-h-[380px]">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-100/80 dark:bg-slate-800/90 text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700 select-none uppercase tracking-wider text-[11px] font-semibold">
              <th className="py-3 px-3 w-10 text-center">
                <input
                  type="checkbox"
                  checked={sortedTasks.length > 0 && selectedIds.length === sortedTasks.length}
                  onChange={handleToggleSelectAll}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
              </th>
              
              <th 
                className="py-3 px-3 cursor-pointer hover:text-indigo-600"
                onClick={() => handleSort('taskName')}
              >
                <div className="flex items-center gap-1">
                  <span>Task Name</span>
                  {sortField === 'taskName' ? (
                    sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 text-indigo-600" /> : <ArrowDown className="w-3 h-3 text-indigo-600" />
                  ) : <ArrowUpDown className="w-3 h-3 opacity-30" />}
                </div>
              </th>

              <th 
                className="py-3 px-3 cursor-pointer hover:text-indigo-600"
                onClick={() => handleSort('category')}
              >
                <div className="flex items-center gap-1">
                  <span>Section / Category</span>
                  {sortField === 'category' ? (
                    sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 text-indigo-600" /> : <ArrowDown className="w-3 h-3 text-indigo-600" />
                  ) : <ArrowUpDown className="w-3 h-3 opacity-30" />}
                </div>
              </th>

              <th 
                className="py-3 px-3 cursor-pointer hover:text-indigo-600"
                onClick={() => handleSort('assignedLead')}
              >
                <div className="flex items-center gap-1">
                  <span>Assigned Lead</span>
                  {sortField === 'assignedLead' ? (
                    sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 text-indigo-600" /> : <ArrowDown className="w-3 h-3 text-indigo-600" />
                  ) : <ArrowUpDown className="w-3 h-3 opacity-30" />}
                </div>
              </th>

              <th 
                className="py-3 px-3 cursor-pointer hover:text-indigo-600"
                onClick={() => handleSort('status')}
              >
                <div className="flex items-center gap-1">
                  <span>Status</span>
                  {sortField === 'status' ? (
                    sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 text-indigo-600" /> : <ArrowDown className="w-3 h-3 text-indigo-600" />
                  ) : <ArrowUpDown className="w-3 h-3 opacity-30" />}
                </div>
              </th>

              <th 
                className="py-3 px-3 cursor-pointer hover:text-indigo-600"
                onClick={() => handleSort('priority')}
              >
                <div className="flex items-center gap-1">
                  <span>Priority</span>
                  {sortField === 'priority' ? (
                    sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 text-indigo-600" /> : <ArrowDown className="w-3 h-3 text-indigo-600" />
                  ) : <ArrowUpDown className="w-3 h-3 opacity-30" />}
                </div>
              </th>

              <th 
                className="py-3 px-3 cursor-pointer hover:text-indigo-600"
                onClick={() => handleSort('dueDate')}
              >
                <div className="flex items-center gap-1">
                  <span>Due Date</span>
                  {sortField === 'dueDate' ? (
                    sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 text-indigo-600" /> : <ArrowDown className="w-3 h-3 text-indigo-600" />
                  ) : <ArrowUpDown className="w-3 h-3 opacity-30" />}
                </div>
              </th>

              <th 
                className="py-3 px-3 text-right cursor-pointer hover:text-indigo-600"
                onClick={() => handleSort('budgetedCost')}
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Budgeted (ZAR)</span>
                  {sortField === 'budgetedCost' ? (
                    sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 text-indigo-600" /> : <ArrowDown className="w-3 h-3 text-indigo-600" />
                  ) : <ArrowUpDown className="w-3 h-3 opacity-30" />}
                </div>
              </th>

              <th 
                className="py-3 px-3 text-right cursor-pointer hover:text-indigo-600"
                onClick={() => handleSort('actualCost')}
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Actual (ZAR)</span>
                  {sortField === 'actualCost' ? (
                    sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 text-indigo-600" /> : <ArrowDown className="w-3 h-3 text-indigo-600" />
                  ) : <ArrowUpDown className="w-3 h-3 opacity-30" />}
                </div>
              </th>

              <th className="py-3 px-3 text-right">
                <span>Variance (ZAR)</span>
              </th>

              <th className="py-3 px-3 max-w-[180px]">
                <span>Notes</span>
              </th>

              <th className="py-3 px-3 text-center w-16">
                <span>Actions</span>
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 font-medium">
            {sortedTasks.length === 0 ? (
              <tr>
                <td colSpan={12} className="py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center">
                    <AlertCircle className="w-8 h-8 text-slate-300 mb-2" />
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-300">No tasks match your criteria</p>
                    <p className="text-xs text-slate-400 mt-1">Try resetting filters or import new items via CSV</p>
                    {hasActiveFilters && (
                      <button 
                        onClick={clearAllFilters}
                        className="mt-3 text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                      >
                        Reset all filters
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              sortedTasks.map(task => {
                const isSelected = selectedIds.includes(task.id);
                const leadInfo = getLeadInfo(task.assignedLead);
                const categoryStyle = CATEGORY_COLORS[task.category] || {
                  bg: 'bg-slate-100 dark:bg-slate-800',
                  text: 'text-slate-700 dark:text-slate-300',
                  border: 'border-slate-200 dark:border-slate-700'
                };

                // Due date calculation
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const dueDateObj = new Date(task.dueDate);
                dueDateObj.setHours(0, 0, 0, 0);
                const isOverdue = dueDateObj < today && task.status !== 'Complete';

                // Cost variance
                const hasActual = task.actualCost !== null;
                const variance = hasActual ? task.actualCost! - task.budgetedCost : 0;
                const isOver = variance > 0;
                const isUnder = variance < 0;

                return (
                  <React.Fragment key={task.id}>
                    <tr className={`hover:bg-slate-50/80 dark:hover:bg-slate-700/40 transition-colors ${
                      isSelected ? 'bg-indigo-50/60 dark:bg-indigo-950/30' : ''
                    }`}>
                      {/* Checkbox */}
                      <td className="py-2.5 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(task.id)}
                          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                      </td>

                      {/* Task Name */}
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onEditTask(task)}
                            className="font-semibold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 text-left transition"
                          >
                            {task.taskName}
                          </button>
                        </div>
                      </td>

                      {/* Section / Category */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-medium border ${categoryStyle.bg} ${categoryStyle.text} ${categoryStyle.border}`}>
                          {task.category}
                        </span>
                      </td>

                      {/* Assigned Lead */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${leadInfo.color}`}>
                            {leadInfo.initials}
                          </div>
                          <span className="text-slate-700 dark:text-slate-300 text-xs">
                            {task.assignedLead}
                          </span>
                        </div>
                      </td>

                      {/* Status (Clickable to switch quickly) */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <select
                          value={task.status}
                          onChange={e => onQuickUpdateTask({ ...task, status: e.target.value as TaskStatus })}
                          className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border cursor-pointer focus:outline-none transition ${getStatusColor(task.status)}`}
                        >
                          <option value="Not Started">Not Started</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Under Review">Under Review</option>
                          <option value="Blocked">Blocked</option>
                          <option value="Complete">Complete</option>
                        </select>
                      </td>

                      {/* Priority */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-medium border ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                      </td>

                      {/* Due Date */}
                      <td className="py-2.5 px-3 whitespace-nowrap text-slate-600 dark:text-slate-300">
                        <div className="flex items-center gap-1.5">
                          <span>{task.dueDate}</span>
                          {isOverdue && (
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-300">
                              Overdue
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Budgeted Cost */}
                      <td className="py-2.5 px-3 text-right text-slate-800 dark:text-slate-200 font-mono">
                        {formatZAR(task.budgetedCost)}
                      </td>

                      {/* Actual Cost */}
                      <td className="py-2.5 px-3 text-right font-mono">
                        {hasActual ? (
                          <span className="text-slate-900 dark:text-white font-semibold">
                            {formatZAR(task.actualCost)}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">Pending</span>
                        )}
                      </td>

                      {/* Variance */}
                      <td className="py-2.5 px-3 text-right font-mono">
                        {hasActual ? (
                          isOver ? (
                            <span className="text-rose-600 dark:text-rose-400 font-semibold text-[11px]">
                              +{formatZAR(variance)}
                            </span>
                          ) : isUnder ? (
                            <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">
                              -{formatZAR(Math.abs(variance))}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[11px]">R 0</span>
                          )
                        ) : (
                          <span className="text-slate-400 text-[11px]">&mdash;</span>
                        )}
                      </td>

                      {/* Notes (truncated with expand option) */}
                      <td className="py-2.5 px-3 max-w-[180px] truncate text-slate-500 dark:text-slate-400" title={task.notes}>
                        {task.notes || <span className="italic opacity-40">No notes</span>}
                      </td>

                      {/* Action Menu */}
                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => onEditTask(task)}
                            className="p-1 rounded text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                            title="Edit task"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDuplicateTask(task)}
                            className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                            title="Duplicate task"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteTask(task.id)}
                            className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                            title="Delete task"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  </React.Fragment>
                );
              })
            )}
          </tbody>

          {/* 4. Total Summary Row */}
          {sortedTasks.length > 0 && (
            <tfoot className="bg-slate-100 dark:bg-slate-900 border-t-2 border-slate-300 dark:border-slate-700 font-semibold text-slate-800 dark:text-slate-200">
              <tr>
                <td colSpan={7} className="py-3 px-4 text-right text-xs uppercase tracking-wider text-slate-500">
                  Total for Filtered Tasks ({sortedTasks.length} items):
                </td>
                <td className="py-3 px-3 text-right font-mono text-sm">
                  {formatZAR(totalBudgeted)}
                </td>
                <td className="py-3 px-3 text-right font-mono text-sm text-slate-900 dark:text-white">
                  {formatZAR(totalActual)}
                </td>
                <td className="py-3 px-3 text-right font-mono text-xs">
                  {settledTasks.length > 0 ? (
                    settledVariance > 0 ? (
                      <span className="text-rose-600 dark:text-rose-400">
                        +{formatZAR(settledVariance)} (Over)
                      </span>
                    ) : settledVariance < 0 ? (
                      <span className="text-emerald-600 dark:text-emerald-400">
                        -{formatZAR(Math.abs(settledVariance))} (Saved)
                      </span>
                    ) : (
                      <span className="text-slate-500">R 0 (On target)</span>
                    )
                  ) : (
                    <span className="text-slate-400">&mdash;</span>
                  )}
                </td>
                <td colSpan={2}></td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

    </div>
  );
};
