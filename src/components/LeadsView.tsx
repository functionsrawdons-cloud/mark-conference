import React from 'react';
import { 
  Users, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  AlertTriangle, 
  Briefcase, 
  ChevronRight 
} from 'lucide-react';
import { ConferenceTask } from '../types/conference';
import { CATEGORY_COLORS, getLeadInfo } from '../utils/initialData';
import { formatZAR } from '../utils/currency';

interface LeadsViewProps {
  tasks: ConferenceTask[];
  onEditTask: (task: ConferenceTask) => void;
  onFilterByLead: (lead: string) => void;
}

export const LeadsView: React.FC<LeadsViewProps> = ({ tasks, onEditTask, onFilterByLead }) => {
  // Aggregate data per lead
  const leadsData = React.useMemo(() => {
    const map = new Map<string, {
      lead: string;
      tasks: ConferenceTask[];
      completed: number;
      inProgress: number;
      blocked: number;
      notStarted: number;
      overdue: number;
      budgeted: number;
      actual: number;
    }>();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const task of tasks) {
      if (!map.has(task.assignedLead)) {
        map.set(task.assignedLead, {
          lead: task.assignedLead,
          tasks: [],
          completed: 0,
          inProgress: 0,
          blocked: 0,
          notStarted: 0,
          overdue: 0,
          budgeted: 0,
          actual: 0
        });
      }

      const data = map.get(task.assignedLead)!;
      data.tasks.push(task);
      data.budgeted += task.budgetedCost || 0;
      if (task.actualCost !== null) {
        data.actual += task.actualCost;
      }

      if (task.status === 'Complete') data.completed++;
      else if (task.status === 'In Progress') data.inProgress++;
      else if (task.status === 'Blocked') data.blocked++;
      else data.notStarted++;

      const dueObj = new Date(task.dueDate);
      dueObj.setHours(0, 0, 0, 0);
      if (dueObj < today && task.status !== 'Complete') {
        data.overdue++;
      }
    }

    return Array.from(map.values()).sort((a, b) => b.tasks.length - a.tasks.length);
  }, [tasks]);

  return (
    <div className="space-y-6">
      
      <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-xs flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-500" />
            Conference Organizing Team & Lead Accountability
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Workload distribution, deliverables completion, and budget managed per assigned lead
          </p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
          {leadsData.length} Active Leads
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {leadsData.map(item => {
          const leadInfo = getLeadInfo(item.lead);
          const totalTasks = item.tasks.length;
          const pct = totalTasks > 0 ? Math.round((item.completed / totalTasks) * 100) : 0;

          return (
            <div 
              key={item.lead}
              className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs p-5 flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700/60">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shadow-sm ${leadInfo.color}`}>
                      {leadInfo.initials}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">{item.lead}</h4>
                      <p className="text-xs text-slate-500">Organizing Lead &bull; {totalTasks} assigned tasks</p>
                    </div>
                  </div>

                  <button
                    onClick={() => onFilterByLead(item.lead)}
                    className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold flex items-center gap-1"
                  >
                    View in Table &rarr;
                  </button>
                </div>

                {/* Progress bar */}
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-slate-600 dark:text-slate-300 mb-1 font-medium">
                    <span>Task Completion</span>
                    <span className="font-bold text-emerald-600">{pct}% ({item.completed}/{totalTasks})</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                  <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-750 border border-slate-100 dark:border-slate-700">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Budgeted (ZAR)</span>
                    <p className="text-xs font-bold text-slate-900 dark:text-white font-mono mt-0.5">
                      {formatZAR(item.budgeted)}
                    </p>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-750 border border-slate-100 dark:border-slate-700">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Actual Spent</span>
                    <p className="text-xs font-bold text-slate-900 dark:text-white font-mono mt-0.5">
                      {formatZAR(item.actual)}
                    </p>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-750 border border-slate-100 dark:border-slate-700">
                    <span className="text-[10px] uppercase font-bold text-slate-400">In Progress / Blocked</span>
                    <p className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">
                      {item.inProgress} / {item.blocked > 0 ? <span className="text-rose-500">{item.blocked}</span> : '0'}
                    </p>
                  </div>
                </div>

                {/* Task Checklist Excerpt */}
                <div className="mt-4 space-y-1.5">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Deliverables:
                  </span>
                  {item.tasks.slice(0, 4).map(task => {
                    const catStyle = CATEGORY_COLORS[task.category] || { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200' };
                    return (
                      <div 
                        key={task.id}
                        onClick={() => onEditTask(task)}
                        className="p-2 rounded-lg bg-slate-50 dark:bg-slate-750 hover:bg-indigo-50/50 dark:hover:bg-slate-700 text-xs flex items-center justify-between cursor-pointer border border-slate-100 dark:border-slate-700 transition"
                      >
                        <div className="flex items-center gap-2 truncate pr-2">
                          <span className={`w-2 h-2 rounded-full ${
                            task.status === 'Complete' ? 'bg-emerald-500' :
                            task.status === 'In Progress' ? 'bg-blue-500' :
                            task.status === 'Blocked' ? 'bg-rose-500' : 'bg-slate-300'
                          }`} />
                          <span className="font-medium text-slate-800 dark:text-slate-200 truncate">
                            {task.taskName}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400 whitespace-nowrap">
                          Due {task.dueDate}
                        </span>
                      </div>
                    );
                  })}
                  {item.tasks.length > 4 && (
                    <p className="text-[11px] text-slate-400 text-center pt-1">
                      + {item.tasks.length - 4} more tasks
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
