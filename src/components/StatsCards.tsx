import React from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  PieChart 
} from 'lucide-react';
import { ConferenceDetails, ConferenceTask } from '../types/conference';
import { formatZAR, formatZARDiff } from '../utils/currency';

interface StatsCardsProps {
  tasks: ConferenceTask[];
  conference: ConferenceDetails;
  onSelectQuickFilter?: (filterType: string, value: string) => void;
}

export const StatsCards: React.FC<StatsCardsProps> = ({ tasks, conference, onSelectQuickFilter }) => {
  const totalBudgeted = tasks.reduce((sum, t) => sum + (t.budgetedCost || 0), 0);
  
  // Settled actual cost (where actualCost is recorded)
  const settledTasks = tasks.filter(t => t.actualCost !== null);
  const totalActual = settledTasks.reduce((sum, t) => sum + (t.actualCost || 0), 0);
  const settledBudget = settledTasks.reduce((sum, t) => sum + (t.budgetedCost || 0), 0);
  
  // Variance for settled tasks (Negative = under budget/saved money, Positive = over budget)
  const settledVariance = totalActual - settledBudget;
  const isOverBudget = settledVariance > 0;

  // Unsettled tasks
  const unsettledTasks = tasks.filter(t => t.actualCost === null);
  const unsettledBudget = unsettledTasks.reduce((sum, t) => sum + (t.budgetedCost || 0), 0);

  // Status counts
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'Complete').length;
  const inProgressTasks = tasks.filter(t => t.status === 'In Progress').length;
  const blockedTasks = tasks.filter(t => t.status === 'Blocked').length;
  const urgentOpen = tasks.filter(t => (t.priority === 'Urgent' || t.priority === 'High') && t.status !== 'Complete').length;

  const completionPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const budgetCapUsage = conference.overallBudgetLimit > 0 
    ? Math.round((totalBudgeted / conference.overallBudgetLimit) * 100) 
    : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      
      {/* 1. Total Budget & Overall Cap */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Total Allocated Budget (ZAR)
          </span>
          <div className="px-2 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-bold text-xs">
            ZAR
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-slate-900 dark:text-white">
            {formatZAR(totalBudgeted)}
          </span>
          <span className="text-xs text-slate-400">
            / {formatZAR(conference.overallBudgetLimit)} cap
          </span>
        </div>
        <div className="mt-3">
          <div className="flex justify-between text-xs text-slate-500 mb-1">
            <span>Budget Cap Utilized</span>
            <span className="font-semibold">{budgetCapUsage}%</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-300 ${
                budgetCapUsage > 100 ? 'bg-rose-500' : 'bg-indigo-600'
              }`}
              style={{ width: `${Math.min(budgetCapUsage, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2. Actual Incurred vs Variance */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Actual Incurred Spend
          </span>
          <div className={`p-2 rounded-lg ${
            isOverBudget 
              ? 'bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400' 
              : 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
          }`}>
            {isOverBudget ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-slate-900 dark:text-white">
            {formatZAR(totalActual)}
          </span>
          <span className="text-xs text-slate-400">
            ({settledTasks.length} settled items)
          </span>
        </div>
        <div className="mt-3 flex items-center justify-between text-xs">
          <span className="text-slate-500">Variance:</span>
          {settledTasks.length === 0 ? (
            <span className="text-slate-400">No settled costs yet</span>
          ) : isOverBudget ? (
            <span className="text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-1">
              +{formatZAR(settledVariance)} over budgeted
            </span>
          ) : settledVariance === 0 ? (
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
              R 0 on exact target
            </span>
          ) : (
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
              -{formatZAR(Math.abs(settledVariance))} under budget
            </span>
          )}
        </div>
        <div className="text-[11px] text-slate-400 mt-1">
          {formatZAR(unsettledBudget)} pending in {unsettledTasks.length} open items
        </div>
      </div>

      {/* 3. Task Execution & Progress */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Planning Progress
          </span>
          <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-slate-900 dark:text-white">
            {completionPct}%
          </span>
          <span className="text-xs text-slate-400">
            ({completedTasks} of {totalTasks} finished)
          </span>
        </div>
        <div className="mt-3">
          <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-emerald-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${completionPct}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-2">
            <span>{inProgressTasks} active</span>
            <span>{tasks.filter(t => t.status === 'Not Started').length} todo</span>
            {blockedTasks > 0 && (
              <span className="text-rose-500 font-medium">{blockedTasks} blocked</span>
            )}
          </div>
        </div>
      </div>

      {/* 4. Action Required / Priority Alerts */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Urgent Attention
          </span>
          <div className={`p-2 rounded-lg ${
            blockedTasks > 0 || urgentOpen > 0 
              ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' 
              : 'bg-slate-50 dark:bg-slate-700 text-slate-400'
          }`}>
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-slate-900 dark:text-white">
            {urgentOpen + blockedTasks}
          </span>
          <span className="text-xs text-slate-400">
            items needing focus
          </span>
        </div>
        <div className="mt-3 flex items-center gap-2 flex-wrap">
          {urgentOpen > 0 && (
            <button
              onClick={() => onSelectQuickFilter && onSelectQuickFilter('priority', 'Urgent')}
              className="text-[11px] px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900 hover:opacity-80 transition"
            >
              {urgentOpen} High/Urgent Open
            </button>
          )}
          {blockedTasks > 0 && (
            <button
              onClick={() => onSelectQuickFilter && onSelectQuickFilter('status', 'Blocked')}
              className="text-[11px] px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900 hover:opacity-80 transition"
            >
              {blockedTasks} Blocked
            </button>
          )}
          {urgentOpen === 0 && blockedTasks === 0 && (
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
              No blockers on radar!
            </span>
          )}
        </div>
      </div>

    </div>
  );
};
