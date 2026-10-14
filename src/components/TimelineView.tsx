import React from 'react';
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Flag, 
  User, 
  DollarSign, 
  ChevronRight,
  Filter
} from 'lucide-react';
import { ConferenceTask, TaskPriority } from '../types/conference';
import { CATEGORY_COLORS, getLeadInfo } from '../utils/initialData';
import { formatZAR } from '../utils/currency';

interface TimelineViewProps {
  tasks: ConferenceTask[];
  onEditTask: (task: ConferenceTask) => void;
}

export const TimelineView: React.FC<TimelineViewProps> = ({ tasks, onEditTask }) => {
  // Sort tasks by due date
  const sortedTasks = React.useMemo(() => {
    return [...tasks].sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  }, [tasks]);

  // Group by month YYYY-MM
  const monthGroups = React.useMemo(() => {
    const groups: Record<string, ConferenceTask[]> = {};

    for (const task of sortedTasks) {
      const monthKey = task.dueDate ? task.dueDate.substring(0, 7) : 'Unscheduled';
      if (!groups[monthKey]) {
        groups[monthKey] = [];
      }
      groups[monthKey].push(task);
    }

    return Object.entries(groups).map(([month, items]) => {
      let label = month;
      if (month !== 'Unscheduled') {
        const [year, m] = month.split('-');
        const dateObj = new Date(parseInt(year), parseInt(m) - 1, 1);
        label = dateObj.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      }
      return { monthKey: month, label, items };
    });
  }, [sortedTasks]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-2">
      <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-xs flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-500" />
            Conference Execution Roadmap & Milestones
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Chronological task deadlines grouped by milestone delivery windows
          </p>
        </div>
        <div className="text-xs text-slate-500 font-medium">
          {tasks.length} scheduled checkpoints
        </div>
      </div>

      {monthGroups.map(group => {
        const groupBudget = group.items.reduce((sum, t) => sum + (t.budgetedCost || 0), 0);
        const groupCompleted = group.items.filter(t => t.status === 'Complete').length;

        return (
          <div key={group.monthKey} className="relative">
            {/* Month Header Banner */}
            <div className="sticky top-20 z-10 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-md flex items-center justify-between mb-4 border border-slate-700">
              <div className="flex items-center gap-2.5">
                <Calendar className="w-4 h-4 text-indigo-400" />
                <h4 className="font-bold text-sm tracking-wide">{group.label}</h4>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  {group.items.length} tasks
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs text-slate-300">
                <span>Budget: <strong className="text-white">{formatZAR(groupBudget)}</strong></span>
                <span>Finished: <strong className="text-emerald-400">{groupCompleted}/{group.items.length}</strong></span>
              </div>
            </div>

            {/* Vertical timeline spine */}
            <div className="relative pl-6 md:pl-10 space-y-4 before:content-[''] before:absolute before:left-3 md:before:left-5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-300 dark:before:bg-slate-700">
              {group.items.map(task => {
                const leadInfo = getLeadInfo(task.assignedLead);
                const categoryStyle = CATEGORY_COLORS[task.category] || {
                  bg: 'bg-slate-100',
                  text: 'text-slate-700',
                  border: 'border-slate-200'
                };

                const dueDateObj = new Date(task.dueDate);
                dueDateObj.setHours(0, 0, 0, 0);
                const isOverdue = dueDateObj < today && task.status !== 'Complete';
                const isDone = task.status === 'Complete';

                return (
                  <div key={task.id} className="relative flex items-start gap-4">
                    {/* Node Dot */}
                    <div className={`absolute -left-6 md:-left-10 mt-3.5 w-6 h-6 rounded-full flex items-center justify-center border-2 bg-white dark:bg-slate-900 z-10 ${
                      isDone 
                        ? 'border-emerald-500 text-emerald-500' 
                        : isOverdue 
                        ? 'border-rose-500 text-rose-500' 
                        : task.status === 'In Progress' 
                        ? 'border-blue-500 text-blue-500' 
                        : 'border-slate-400 text-slate-400'
                    }`}>
                      {isDone ? (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      ) : isOverdue ? (
                        <AlertCircle className="w-3.5 h-3.5" />
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-current" />
                      )}
                    </div>

                    {/* Timeline Item Card */}
                    <div 
                      onClick={() => onEditTask(task)}
                      className={`flex-1 bg-white dark:bg-slate-800 p-4 rounded-xl border shadow-xs hover:shadow-md cursor-pointer transition ${
                        isDone
                          ? 'border-slate-200 dark:border-slate-700 opacity-90'
                          : isOverdue
                          ? 'border-rose-300 dark:border-rose-800 bg-rose-50/20'
                          : 'border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-[10px] px-2 py-0.5 rounded font-semibold border ${categoryStyle.bg} ${categoryStyle.text} ${categoryStyle.border}`}>
                            {task.category}
                          </span>
                          <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                            task.status === 'Complete' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                            task.status === 'In Progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' :
                            task.status === 'Blocked' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' :
                            'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                          }`}>
                            {task.status}
                          </span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                            task.priority === 'Urgent' ? 'bg-rose-50 text-rose-700 font-bold' :
                            task.priority === 'High' ? 'bg-orange-50 text-orange-700 font-semibold' :
                            'text-slate-500'
                          }`}>
                            {task.priority} Priority
                          </span>
                        </div>

                        {/* Due Date Indicator */}
                        <div className="flex items-center gap-1.5 text-xs font-semibold">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span className={isOverdue ? 'text-rose-600 font-bold' : 'text-slate-700 dark:text-slate-300'}>
                            Due {task.dueDate}
                          </span>
                          {isOverdue && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-100 text-rose-700">Overdue</span>
                          )}
                        </div>
                      </div>

                      {/* Title */}
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-2">
                        {task.taskName}
                      </h4>

                      {/* Notes snippet */}
                      {task.notes && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 italic">
                          "{task.notes}"
                        </p>
                      )}

                      {/* Footer: Lead + Cost */}
                      <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${leadInfo.color}`}>
                            {leadInfo.initials}
                          </div>
                          <span className="text-slate-600 dark:text-slate-300 font-medium">
                            Lead: {task.assignedLead}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 font-mono text-xs">
                          <span className="text-slate-500">Budget: {formatZAR(task.budgetedCost)}</span>
                          {task.actualCost !== null && (
                            <span className="text-slate-900 dark:text-white font-semibold">
                              (Actual: {formatZAR(task.actualCost)})
                            </span>
                          )}
                        </div>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};
