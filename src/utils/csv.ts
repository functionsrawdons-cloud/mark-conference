import { ConferenceTask, TaskPriority, TaskStatus } from '../types/conference';

export const CSV_HEADERS = [
  'Task Name',
  'Section/Category',
  'Assigned Lead',
  'Status',
  'Priority',
  'Due Date',
  'Budgeted Cost',
  'Actual Cost',
  'Notes'
] as const;

/**
 * Parses a standard CSV string into rows of strings handling escaped quotes and commas.
 */
export function parseCSV(csvText: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let insideQuotes = false;

  const text = csvText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        // Escaped quote
        currentField += '"';
        i++;
      } else {
        // Toggle quote state
        insideQuotes = !insideQuotes;
      }
    } else if (char === ',' && !insideQuotes) {
      currentRow.push(currentField.trim());
      currentField = '';
    } else if (char === '\n' && !insideQuotes) {
      currentRow.push(currentField.trim());
      if (currentRow.some(field => field.length > 0)) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentField = '';
    } else {
      currentField += char;
    }
  }

  // Handle final trailing field
  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    if (currentRow.some(field => field.length > 0)) {
      rows.push(currentRow);
    }
  }

  return rows;
}

/**
 * Maps parsed CSV rows to ConferenceTask objects based on the example CSV header structure.
 */
export function mapCsvToTasks(rows: string[][]): {
  tasks: ConferenceTask[];
  errors: string[];
} {
  if (rows.length === 0) {
    return { tasks: [], errors: ['CSV file is empty'] };
  }

  const errors: string[] = [];
  const headerRow = rows[0].map(h => h.trim().toLowerCase());
  
  // Find index of standard columns
  const getIdx = (candidates: string[]) => {
    return headerRow.findIndex(h => candidates.includes(h.toLowerCase()));
  };

  const nameIdx = getIdx(['task name', 'task', 'name', 'item', 'title']);
  const categoryIdx = getIdx(['section/category', 'category', 'section', 'department']);
  const leadIdx = getIdx(['assigned lead', 'lead', 'assignee', 'owner', 'assigned to']);
  const statusIdx = getIdx(['status', 'state', 'progress']);
  const priorityIdx = getIdx(['priority', 'urgency', 'level']);
  const dueDateIdx = getIdx(['due date', 'deadline', 'due', 'date']);
  const budgetedCostIdx = getIdx(['budgeted cost', 'budget', 'budgeted', 'estimated cost']);
  const actualCostIdx = getIdx(['actual cost', 'actual', 'spent', 'cost']);
  const notesIdx = getIdx(['notes', 'note', 'comments', 'description', 'details']);

  if (nameIdx === -1) {
    errors.push('Required header "Task Name" could not be found.');
  }

  const parsedTasks: ConferenceTask[] = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (row.length === 0 || row.every(c => !c.trim())) continue;

    const taskName = nameIdx !== -1 && row[nameIdx] ? row[nameIdx].trim() : `Task ${i}`;
    const category = categoryIdx !== -1 && row[categoryIdx] ? row[categoryIdx].trim() : 'General Operations';
    const assignedLead = leadIdx !== -1 && row[leadIdx] ? row[leadIdx].trim() : 'Unassigned';
    
    // Normalize status
    const rawStatus = (statusIdx !== -1 && row[statusIdx] ? row[statusIdx].trim() : '').toLowerCase();
    let status: TaskStatus = 'Not Started';
    if (rawStatus.includes('comp') || rawStatus.includes('done')) status = 'Complete';
    else if (rawStatus.includes('prog') || rawStatus.includes('doing') || rawStatus.includes('active')) status = 'In Progress';
    else if (rawStatus.includes('rev') || rawStatus.includes('check')) status = 'Under Review';
    else if (rawStatus.includes('block') || rawStatus.includes('hold') || rawStatus.includes('stuck')) status = 'Blocked';
    else if (rawStatus.includes('not') || rawStatus.includes('todo')) status = 'Not Started';

    // Normalize priority
    const rawPriority = (priorityIdx !== -1 && row[priorityIdx] ? row[priorityIdx].trim() : '').toLowerCase();
    let priority: TaskPriority = 'Medium';
    if (rawPriority.includes('urg') || rawPriority.includes('crit')) priority = 'Urgent';
    else if (rawPriority.includes('high')) priority = 'High';
    else if (rawPriority.includes('low')) priority = 'Low';
    else if (rawPriority.includes('med')) priority = 'Medium';

    // Normalize Due Date
    let dueDate = dueDateIdx !== -1 && row[dueDateIdx] ? row[dueDateIdx].trim() : '';
    if (dueDate) {
      // Basic format cleanup
      const dateParsed = new Date(dueDate);
      if (!isNaN(dateParsed.getTime())) {
        dueDate = dateParsed.toISOString().split('T')[0];
      }
    }
    if (!dueDate) {
      dueDate = new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0];
    }

    // Numbers (supports ZAR, R, $, €, £)
    const cleanNum = (str: string | undefined): number | null => {
      if (!str) return null;
      const stripped = str.replace(/[$,€£R\s]|ZAR/gi, '');
      const val = parseFloat(stripped.replace(/,/g, ''));
      return isNaN(val) ? null : Math.round(val * 100) / 100;
    };

    const budgetedCost = cleanNum(budgetedCostIdx !== -1 ? row[budgetedCostIdx] : undefined) ?? 0;
    const actualCost = cleanNum(actualCostIdx !== -1 ? row[actualCostIdx] : undefined);
    const notes = notesIdx !== -1 && row[notesIdx] ? row[notesIdx].trim() : '';

    parsedTasks.push({
      id: `task-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 7)}`,
      taskName,
      category,
      assignedLead,
      status,
      priority,
      dueDate,
      budgetedCost,
      actualCost,
      notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }

  return { tasks: parsedTasks, errors };
}

/**
 * Converts tasks to exact CSV matching the example format:
 * Task Name,Section/Category,Assigned Lead,Status,Priority,Due Date,Budgeted Cost,Actual Cost,Notes
 */
export function tasksToCSV(tasks: ConferenceTask[]): string {
  const escapeCell = (val: string | number | null | undefined): string => {
    if (val === null || val === undefined) return '';
    const str = String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const lines: string[] = [];
  lines.push(CSV_HEADERS.join(','));

  for (const t of tasks) {
    const row = [
      escapeCell(t.taskName),
      escapeCell(t.category),
      escapeCell(t.assignedLead),
      escapeCell(t.status),
      escapeCell(t.priority),
      escapeCell(t.dueDate),
      escapeCell(t.budgetedCost),
      escapeCell(t.actualCost !== null ? t.actualCost : ''),
      escapeCell(t.notes)
    ];
    lines.push(row.join(','));
  }

  return lines.join('\n');
}

/**
 * Triggers a browser download of the CSV string.
 */
export function downloadCSV(csvContent: string, filename: string = 'conference_plan.csv') {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
