import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  PieChart, 
  AlertTriangle, 
  CheckCircle, 
  ArrowUpRight,
  ShieldAlert,
  Wallet
} from 'lucide-react';
import { ConferenceDetails, ConferenceTask } from '../types/conference';
import { CATEGORY_COLORS, getLeadInfo } from '../utils/initialData';
import { formatZAR, formatZARDiff } from '../utils/currency';

interface BudgetViewProps {
  tasks: ConferenceTask[];
  conference: ConferenceDetails;
  onEditTask: (task: ConferenceTask) => void;
}

export const BudgetView: React.FC<BudgetViewProps> = ({ tasks, conference, onEditTask }) => {
  const totalBudgeted = tasks.reduce((sum, t) => sum + (t.budgetedCost || 0), 0);
  const settledTasks = tasks.filter(t => t.actualCost !== null);
  const totalActual = settledTasks.reduce((sum, t) => sum + (t.actualCost || 0), 0);
  const settledBudget = settledTasks.reduce((sum, t) => sum + (t.budgetedCost || 0), 0);
  const netVariance = totalActual - settledBudget;
  const isOverBudget = netVariance > 0;

  // Unsettled tasks
  const unsettledTasks = tasks.filter(t => t.actualCost === null);
  const unsettledBudget = unsettledTasks.reduce((sum, t) => sum + (t.budgetedCost || 0), 0);

  // Group by Category
  const categoryStats = React.useMemo(() => {
    const map = new Map<string, {
      category: string;
      budgeted: number;
      actual: number;
      settledCount: number;
      totalCount: number;
      tasks: ConferenceTask[];
    }>();

    for (const task of tasks) {
      if (!map.has(task.category)) {
        map.set(task.category, {
          category: task.category,
          budgeted: 0,
          actual: 0,
          settledCount: 0,
          totalCount: 0,
          tasks: []
        });
      }
      const entry = map.get(task.category)!;
      entry.budgeted += task.budgetedCost || 0;
      if (task.actualCost !== null) {
        entry.actual += task.actualCost;
        entry.settledCount += 1;
      }
      entry.totalCount += 1;
      entry.tasks.push(task);
    }

    return Array.from(map.values()).sort((a, b) => b.budgeted - a.budgeted);
  }, [tasks]);

  // Group by Lead
  const leadStats = React.useMemo(() => {
    const map = new Map<string, {
      lead: string;
      budgeted: number;
      actual: number;
      taskCount: number;
    }>();

    for (const task of tasks) {
      if (!map.has(task.assignedLead)) {
        map.set(task.assignedLead, {
          lead: task.assignedLead,
          budgeted: 0,
          actual: 0,
          taskCount: 0
        });
      }
      const entry = map.get(task.assignedLead)!;
      entry.budgeted += task.budgetedCost || 0;
      if (task.actualCost !== null) {
        entry.actual += task.actualCost;
      }
      entry.taskCount += 1;
    }

    return Array.from(map.values()).sort((a, b) => b.budgeted - a.budgeted);
  }, [tasks]);

  // Over budget items
  const overBudgetTasks = tasks.filter(
    t => t.actualCost !== null && t.actualCost > t.budgetedCost
  );

  return (
    <div className="space-y-6">
      
      {/* 1. Overall Financial Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Conference Cap & Budgeted */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase">
            <span>Overall Budget Cap (ZAR)</span>
            <Wallet className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            {formatZAR(conference.overallBudgetLimit)}
          </div>
          <div className="mt-2 text-xs text-slate-500 flex justify-between">
            <span>Total Allocated in Tasks:</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {formatZAR(totalBudgeted)}
            </span>
          </div>
          <div className="mt-1 text-xs text-slate-500 flex justify-between">
            <span>Unallocated Reserve:</span>
            <span className={`font-semibold ${
              conference.overallBudgetLimit - totalBudgeted < 0 ? 'text-rose-600' : 'text-emerald-600'
            }`}>
              {formatZAR(conference.overallBudgetLimit - totalBudgeted)}
            </span>
          </div>
        </div>

        {/* Settled Spend vs Budgeted */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase">
            <span>Settled Actual Costs</span>
            <span className="text-xs px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold">ZAR</span>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            {formatZAR(totalActual)}
          </div>
          <div className="mt-2 text-xs text-slate-500 flex justify-between">
            <span>Budget for Settled Items:</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {formatZAR(settledBudget)}
            </span>
          </div>
          <div className="mt-1 text-xs text-slate-500 flex justify-between">
            <span>Net Variance:</span>
            {settledTasks.length === 0 ? (
              <span className="text-slate-400">No settled costs</span>
            ) : isOverBudget ? (
              <span className="text-rose-600 font-semibold">
                +{formatZAR(netVariance)} (Over budget)
              </span>
            ) : (
              <span className="text-emerald-600 font-semibold">
                -{formatZAR(Math.abs(netVariance))} (Under budget)
              </span>
            )}
          </div>
        </div>

        {/* Pending & Forecast */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase">
            <span>Pending Open Commitments</span>
            <PieChart className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            {formatZAR(unsettledBudget)}
          </div>
          <div className="mt-2 text-xs text-slate-500 flex justify-between">
            <span>Tasks Awaiting Actual Invoices:</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {unsettledTasks.length} tasks
            </span>
          </div>
          <div className="mt-1 text-xs text-slate-500 flex justify-between">
            <span>Forecasted Final Conference Total:</span>
            <span className="font-semibold text-indigo-600 dark:text-indigo-400">
              {formatZAR(totalActual + unsettledBudget)}
            </span>
          </div>
        </div>

      </div>

      {/* 2. Over Budget Warnings (if any) */}
      {overBudgetTasks.length > 0 && (
        <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-xl p-4">
          <div className="flex items-center gap-2 text-rose-800 dark:text-rose-300 font-semibold text-sm mb-2">
            <ShieldAlert className="w-5 h-5 text-rose-600" />
            <span>Budget Alert: {overBudgetTasks.length} items exceeded their initial budgeted cost</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
            {overBudgetTasks.map(t => {
              const diff = (t.actualCost || 0) - t.budgetedCost;
              return (
                <div 
                  key={t.id}
                  onClick={() => onEditTask(t)}
                  className="bg-white dark:bg-slate-800 p-2.5 rounded-lg border border-rose-200 dark:border-rose-800 text-xs flex items-center justify-between cursor-pointer hover:border-rose-400 transition"
                >
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white">{t.taskName}</div>
                    <div className="text-[11px] text-slate-500">{t.category} &bull; Lead: {t.assignedLead}</div>
                  </div>
                  <div className="text-right">
                    <span className="text-rose-600 font-bold font-mono">+{formatZAR(diff)}</span>
                    <div className="text-[10px] text-slate-400">
                      {formatZAR(t.budgetedCost)} &rarr; {formatZAR(t.actualCost)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. Section/Category Financial Ledger */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Budget & Expense Breakdown by Section / Category (ZAR)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Tracks financial allocation and real expenditures across functional conference areas
            </p>
          </div>
          <span className="text-xs text-slate-400">
            {categoryStats.length} operational categories
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700 font-semibold uppercase text-[11px]">
                <th className="py-3 px-4">Section / Category</th>
                <th className="py-3 px-3 text-center">Tasks</th>
                <th className="py-3 px-3 text-right">Budgeted (ZAR)</th>
                <th className="py-3 px-3 text-right">Actual Incurred (ZAR)</th>
                <th className="py-3 px-3 text-right">Variance (ZAR)</th>
                <th className="py-3 px-4 w-44">% of Total Budget</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 font-medium">
              {categoryStats.map(stat => {
                const categoryStyle = CATEGORY_COLORS[stat.category] || {
                  bg: 'bg-slate-100',
                  text: 'text-slate-700',
                  border: 'border-slate-200'
                };
                
                const pct = totalBudgeted > 0 ? Math.round((stat.budgeted / totalBudgeted) * 100) : 0;
                const hasActuals = stat.actual > 0 || stat.settledCount > 0;
                const catSettledBudget = stat.tasks.filter(t => t.actualCost !== null).reduce((sum, t) => sum + t.budgetedCost, 0);
                const variance = stat.actual - catSettledBudget;

                return (
                  <tr key={stat.category} className="hover:bg-slate-50/60 dark:hover:bg-slate-700/30">
                    <td className="py-3 px-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded-md text-xs font-semibold border ${categoryStyle.bg} ${categoryStyle.text} ${categoryStyle.border}`}>
                        {stat.category}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center text-slate-500">
                      {stat.settledCount}/{stat.totalCount} settled
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-semibold text-slate-900 dark:text-white">
                      {formatZAR(stat.budgeted)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono">
                      {hasActuals ? (
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {formatZAR(stat.actual)}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">None yet</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right font-mono">
                      {stat.settledCount > 0 ? (
                        variance > 0 ? (
                          <span className="text-rose-600 font-semibold">+{formatZAR(variance)}</span>
                        ) : variance < 0 ? (
                          <span className="text-emerald-600 font-semibold">-{formatZAR(Math.abs(variance))}</span>
                        ) : (
                          <span className="text-slate-400">R 0</span>
                        )
                      ) : (
                        <span className="text-slate-400">&mdash;</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                          <div 
                            className="bg-indigo-600 h-full rounded-full" 
                            style={{ width: `${Math.min(pct, 100)}%` }}
                          />
                        </div>
                        <span className="text-xs font-mono text-slate-500 w-8 text-right">{pct}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Assigned Leads Financial Accountability */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs p-5">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
          Financial Allocation by Assigned Lead (South African Rands)
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Lead owners managing their assigned conference expenditure
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {leadStats.map(stat => {
            const leadInfo = getLeadInfo(stat.lead);
            const leadPct = totalBudgeted > 0 ? Math.round((stat.budgeted / totalBudgeted) * 100) : 0;

            return (
              <div 
                key={stat.lead}
                className="bg-slate-50 dark:bg-slate-750 p-4 rounded-xl border border-slate-200 dark:border-slate-700"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${leadInfo.color}`}>
                      {leadInfo.initials}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">{stat.lead}</h4>
                      <span className="text-[10px] text-slate-500">{stat.taskCount} tasks assigned</span>
                    </div>
                  </div>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
                    {leadPct}% of budget
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Budgeted:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">
                    {formatZAR(stat.budgeted)}
                  </span>
                </div>
                <div className="mt-1 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Actual Spent:</span>
                  <span className="font-bold text-slate-900 dark:text-white font-mono">
                    {formatZAR(stat.actual)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
