import React from 'react';
import { 
  Plus, 
  Clock, 
  DollarSign, 
  ArrowRight, 
  ArrowLeft, 
  Edit3, 
  Trash2, 
  AlertCircle,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { ConferenceTask, TaskStatus } from '../types/conference';
import { CATEGORY_COLORS, getLeadInfo } from '../utils/initialData';
import { formatZAR } from '../utils/currency';

interface KanbanViewProps {
  tasks: ConferenceTask[];
  onEditTask: (task: ConferenceTask) => void;
  onDeleteTask: (id: string) => void;
  onUpdateStatus: (id: string, status: TaskStatus) => void;
  onAddTaskWithStatus: (status: TaskStatus) => void;
}

const COLUMNS: { status: TaskStatus; title: string; color: string; border: string; headerBg: string }[] = [
  { status: 'Not Started', title: 'Not Started', color: 'text-slate-700 dark:text-slate-300', border: 'border-slate-300 dark:border-slate-700', headerBg: 'bg-slate-100 dark:bg-slate-800' },
  { status: 'In Progress', title: 'In Progress', color: 'text-blue-700 dark:text-blue-300', border: 'border-blue-300 dark:border-blue-800', headerBg: 'bg-blue-50 dark:bg-blue-950/40' },
  { status: 'Under Review', title: 'Under Review', color: 'text-purple-700 dark:text-purple-300', border: 'border-purple-300 dark:border-purple-800', headerBg: 'bg-purple-50 dark:bg-purple-950/40' },
  { status: 'Blocked', title: 'Blocked / At Risk', color: 'text-rose-700 dark:text-rose-300', border: 'border-rose-300 dark:border-rose-800', headerBg: 'bg-rose-50 dark:bg-rose-950/40' },
  { status: 'Complete', title: 'Completed', color: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-300 dark:border-emerald-800', headerBg: 'bg-emerald-50 dark:bg-emerald-950/40' },
];

export const KanbanView: React.FC<KanbanViewProps> = ({
  tasks,
  onEditTask,
  onDeleteTask,
  onUpdateStatus,
  onAddTaskWithStatus
}) => {
  const getPrevStatus = (current: TaskStatus): TaskStatus | null => {
    const order: TaskStatus[] = ['Not Started', 'In Progress', 'Under Review', 'Complete'];
    const idx = order.indexOf(current);
    if (idx > 0) return order[idx - 1];
    if (current === 'Blocked') return 'In Progress';
    return null;
  };

  const getNextStatus = (current: TaskStatus): TaskStatus | null => {
    const order: TaskStatus[] = ['Not Started', 'In Progress', 'Under Review', 'Complete'];
    const idx = order.indexOf(current);
    if (idx !== -1 && idx < order.length - 1) return order[idx + 1];
    if (current === 'Blocked') return 'In Progress';
    return null;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4 items-start">
      {COLUMNS.map(col => {
        const columnTasks = tasks.filter(t => t.status === col.status);
        const columnBudget = columnTasks.reduce((sum, t) => sum + (t.budgetedCost || 0), 0);

        return (
          <div 
            key={col.status}
            className="bg-slate-100/70 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[calc(100vh-220px)] overflow-hidden"
          >
            {/* Column Header */}
            <div className={`p-3 border-b ${col.border} ${col.headerBg} flex items-center justify-between`}>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className={`text-xs font-bold uppercase tracking-wider ${col.color}`}>
                    {col.title}
                  </h3>
                  <span className="text-xs px-2 py-0.2 rounded-full font-bold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 shadow-xs border border-slate-200 dark:border-slate-700">
                    {columnTasks.length}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {formatZAR(columnBudget)} allocated
                </div>
              </div>

              <button
                onClick={() => onAddTaskWithStatus(col.status)}
                className="p-1 rounded-md text-slate-500 hover:text-indigo-600 hover:bg-white dark:hover:bg-slate-800 transition"
                title={`Add task in ${col.title}`}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Task Cards List */}
            <div className="p-2 space-y-2.5 overflow-y-auto flex-1 min-h-[140px]">
              {columnTasks.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
                  No tasks in this stage
                </div>
              ) : (
                columnTasks.map(task => {
                  const leadInfo = getLeadInfo(task.assignedLead);
                  const categoryStyle = CATEGORY_COLORS[task.category] || {
                    bg: 'bg-slate-100 dark:bg-slate-800',
                    text: 'text-slate-700 dark:text-slate-300',
                    border: 'border-slate-200 dark:border-slate-700'
                  };

                  const prevStatus = getPrevStatus(task.status);
                  const nextStatus = getNextStatus(task.status);

                  // Due date & overdue check
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  const dueObj = new Date(task.dueDate);
                  dueObj.setHours(0, 0, 0, 0);
                  const isOverdue = dueObj < today && task.status !== 'Complete';

                  return (
                    <div
                      key={task.id}
                      className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700 shadow-xs hover:shadow-md transition group"
                    >
                      {/* Category & Priority Badge */}
                      <div className="flex items-center justify-between gap-1 mb-2">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium truncate max-w-[130px] ${categoryStyle.bg} ${categoryStyle.text} ${categoryStyle.border}`}>
                          {task.category}
                        </span>

                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                          task.priority === 'Urgent' 
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300' 
                            : task.priority === 'High' 
                            ? 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300' 
                            : task.priority === 'Medium' 
                            ? 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300' 
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                        }`}>
                          {task.priority}
                        </span>
                      </div>

                      {/* Task Name */}
                      <h4 
                        onClick={() => onEditTask(task)}
                        className="text-xs font-semibold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer line-clamp-2"
                      >
                        {task.taskName}
                      </h4>

                      {/* Notes snippet */}
                      {task.notes && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 italic">
                          {task.notes}
                        </p>
                      )}

                      {/* Financial info */}
                      <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                          <span className="font-semibold text-slate-800 dark:text-slate-200">{formatZAR(task.budgetedCost)}</span>
                          {task.actualCost !== null && (
                            <span className="text-[10px] text-slate-400">
                              (Act: {formatZAR(task.actualCost)})
                            </span>
                          )}
                        </div>

                        {/* Due date */}
                        <div className={`flex items-center gap-1 text-[11px] ${
                          isOverdue ? 'text-rose-600 font-bold' : 'text-slate-500 dark:text-slate-400'
                        }`}>
                          <Clock className="w-3 h-3" />
                          <span>{task.dueDate}</span>
                        </div>
                      </div>

                      {/* Bottom Footer: Lead + Move Controls */}
                      <div className="mt-2.5 flex items-center justify-between">
                        {/* Lead */}
                        <div className="flex items-center gap-1.5">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${leadInfo.color}`}>
                            {leadInfo.initials}
                          </div>
                          <span className="text-[11px] text-slate-700 dark:text-slate-300 font-medium">
                            {task.assignedLead}
                          </span>
                        </div>

                        {/* Quick stage transition buttons */}
                        <div className="flex items-center gap-1">
                          {prevStatus && (
                            <button
                              onClick={() => onUpdateStatus(task.id, prevStatus)}
                              className="p-1 rounded text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-700"
                              title={`Move back to ${prevStatus}`}
                            >
                              <ArrowLeft className="w-3 h-3" />
                            </button>
                          )}

                          {task.status !== 'Blocked' ? (
                            <button
                              onClick={() => onUpdateStatus(task.id, 'Blocked')}
                              className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950"
                              title="Mark as Blocked"
                            >
                              <AlertCircle className="w-3 h-3" />
                            </button>
                          ) : (
                            <button
                              onClick={() => onUpdateStatus(task.id, 'In Progress')}
                              className="p-1 rounded text-rose-500 hover:text-emerald-600 hover:bg-emerald-50"
                              title="Unblock (Move to In Progress)"
                            >
                              <CheckCircle2 className="w-3 h-3" />
                            </button>
                          )}

                          {nextStatus && (
                            <button
                              onClick={() => onUpdateStatus(task.id, nextStatus)}
                              className="p-1 rounded text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-700"
                              title={`Advance to ${nextStatus}`}
                            >
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          )}

                          <button
                            onClick={() => onEditTask(task)}
                            className="p-1 rounded text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-700"
                            title="Edit task"
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
