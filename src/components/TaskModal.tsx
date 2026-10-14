import React, { useState, useEffect } from 'react';
import { X, Calendar, DollarSign, User, Tag, AlertCircle, FileText, Check } from 'lucide-react';
import { ConferenceTask, TaskPriority, TaskStatus } from '../types/conference';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: ConferenceTask) => void;
  taskToEdit?: ConferenceTask | null;
  categories: string[];
  leads: string[];
  defaultStatus?: TaskStatus;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  taskToEdit,
  categories,
  leads,
  defaultStatus = 'Not Started'
}) => {
  const [taskName, setTaskName] = useState('');
  const [category, setCategory] = useState(categories[0] || 'General Operations');
  const [customCategory, setCustomCategory] = useState('');
  const [isCustomCategory, setIsCustomCategory] = useState(false);

  const [assignedLead, setAssignedLead] = useState(leads[0] || 'Alice');
  const [customLead, setCustomLead] = useState('');
  const [isCustomLead, setIsCustomLead] = useState(false);

  const [status, setStatus] = useState<TaskStatus>(defaultStatus);
  const [priority, setPriority] = useState<TaskPriority>('Medium');
  const [dueDate, setDueDate] = useState('');
  const [budgetedCost, setBudgetedCost] = useState<string>('0');
  const [actualCost, setActualCost] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (taskToEdit) {
      setTaskName(taskToEdit.taskName);
      if (categories.includes(taskToEdit.category)) {
        setCategory(taskToEdit.category);
        setIsCustomCategory(false);
      } else {
        setIsCustomCategory(true);
        setCustomCategory(taskToEdit.category);
      }

      if (leads.includes(taskToEdit.assignedLead)) {
        setAssignedLead(taskToEdit.assignedLead);
        setIsCustomLead(false);
      } else {
        setIsCustomLead(true);
        setCustomLead(taskToEdit.assignedLead);
      }

      setStatus(taskToEdit.status);
      setPriority(taskToEdit.priority);
      setDueDate(taskToEdit.dueDate);
      setBudgetedCost(String(taskToEdit.budgetedCost || 0));
      setActualCost(taskToEdit.actualCost !== null ? String(taskToEdit.actualCost) : '');
      setNotes(taskToEdit.notes || '');
    } else {
      setTaskName('');
      setCategory(categories[0] || 'Accommodation & Venue');
      setIsCustomCategory(false);
      setCustomCategory('');
      setAssignedLead(leads[0] || 'Alice');
      setIsCustomLead(false);
      setCustomLead('');
      setStatus(defaultStatus);
      setPriority('Medium');
      // Default due date: 14 days from now
      const defaultDate = new Date();
      defaultDate.setDate(defaultDate.getDate() + 14);
      setDueDate(defaultDate.toISOString().split('T')[0]);
      setBudgetedCost('1000');
      setActualCost('');
      setNotes('');
    }
    setError('');
  }, [taskToEdit, isOpen, categories, leads, defaultStatus]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskName.trim()) {
      setError('Please provide a Task Name.');
      return;
    }

    const finalCategory = isCustomCategory ? customCategory.trim() : category;
    if (!finalCategory) {
      setError('Please select or specify a Section / Category.');
      return;
    }

    const finalLead = isCustomLead ? customLead.trim() : assignedLead;
    if (!finalLead) {
      setError('Please select or specify an Assigned Lead.');
      return;
    }

    const parsedBudget = parseFloat(budgetedCost);
    const parsedActual = actualCost.trim() === '' ? null : parseFloat(actualCost);

    const taskData: ConferenceTask = {
      id: taskToEdit ? taskToEdit.id : `task-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      taskName: taskName.trim(),
      category: finalCategory,
      assignedLead: finalLead,
      status,
      priority,
      dueDate: dueDate || new Date().toISOString().split('T')[0],
      budgetedCost: isNaN(parsedBudget) ? 0 : Math.max(0, parsedBudget),
      actualCost: parsedActual === null || isNaN(parsedActual) ? null : Math.max(0, parsedActual),
      notes: notes.trim(),
      createdAt: taskToEdit ? taskToEdit.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onSave(taskData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div 
        className="bg-white dark:bg-slate-800 rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden transform transition-all my-8"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div>
            <h2 className="text-base font-bold flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-400" />
              {taskToEdit ? 'Edit Conference Task' : 'Create New Conference Task'}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Configured as per CSV schema (Category, Lead, Status, Priority, Budget & Actual)
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-900 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* 1. Task Name */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Task Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Book Venue, Finalize Menu, Audio & Video setup..."
              value={taskName}
              onChange={e => setTaskName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
              required
              autoFocus
            />
          </div>

          {/* 2. Category & Assigned Lead (Two Columns) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Category */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Section / Category <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setIsCustomCategory(!isCustomCategory)}
                  className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  {isCustomCategory ? 'Select from list' : '+ Custom Category'}
                </button>
              </div>

              {isCustomCategory ? (
                <input
                  type="text"
                  placeholder="Enter custom category..."
                  value={customCategory}
                  onChange={e => setCustomCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              ) : (
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              )}
            </div>

            {/* Assigned Lead */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Assigned Lead <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setIsCustomLead(!isCustomLead)}
                  className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  {isCustomLead ? 'Select existing lead' : '+ Custom Lead'}
                </button>
              </div>

              {isCustomLead ? (
                <input
                  type="text"
                  placeholder="Enter person's name..."
                  value={customLead}
                  onChange={e => setCustomLead(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              ) : (
                <select
                  value={assignedLead}
                  onChange={e => setAssignedLead(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  {leads.map(lead => (
                    <option key={lead} value={lead}>{lead}</option>
                  ))}
                </select>
              )}
            </div>

          </div>

          {/* 3. Status, Priority, Due Date (3 Columns) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as TaskStatus)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="Not Started">Not Started</option>
                <option value="In Progress">In Progress</option>
                <option value="Under Review">Under Review</option>
                <option value="Blocked">Blocked</option>
                <option value="Complete">Complete</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value as TaskPriority)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Due Date (YYYY-MM-DD)
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          {/* 4. Budgeted Cost & Actual Cost */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-750 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Budgeted Cost (ZAR / R)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-mono font-bold text-xs">R</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={budgetedCost}
                  onChange={e => setBudgetedCost(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-mono text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Actual Cost (ZAR / R) <span className="text-slate-400 font-normal">(Leave empty if pending)</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-mono font-bold text-xs">R</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Leave blank if pending"
                  value={actualCost}
                  onChange={e => setActualCost(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-mono text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* 5. Notes */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Notes & Progress Remarks
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Confirmed with vendor; pending invoice; dietary requirements breakdown..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
            />
          </div>

          {/* Form Actions */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 font-medium transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-md shadow-indigo-600/30 transition flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{taskToEdit ? 'Save Changes' : 'Create Task'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
