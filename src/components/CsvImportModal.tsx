import React, { useState } from 'react';
import { 
  Upload, 
  X, 
  FileSpreadsheet, 
  AlertCircle, 
  Check, 
  FileText, 
  ArrowRight,
  RefreshCw,
  Plus
} from 'lucide-react';
import { ConferenceTask } from '../types/conference';
import { mapCsvToTasks, parseCSV, CSV_HEADERS } from '../utils/csv';
import { formatZAR } from '../utils/currency';

interface CsvImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (tasks: ConferenceTask[], mode: 'append' | 'replace') => void;
}

const SAMPLE_CSV = `Task Name,Section/Category,Assigned Lead,Status,Priority,Due Date,Budgeted Cost,Actual Cost,Notes
Book Venue,Accommodation & Venue,Alice,Complete,High,2024-05-01,5000,5000,Confirmed
Finalize Menu,Meals & Catering,Bob,In Progress,Medium,2024-06-01,2000,,Pending dietary reqs
Order Lanyards,Stationery & Supplies,Charlie,Not Started,Low,2024-07-01,500,,Awaiting badge design`;

export const CsvImportModal: React.FC<CsvImportModalProps> = ({
  isOpen,
  onClose,
  onImport
}) => {
  const [csvRawText, setCsvRawText] = useState('');
  const [parsedPreview, setParsedPreview] = useState<ConferenceTask[] | null>(null);
  const [importMode, setImportMode] = useState<'append' | 'replace'>('append');
  const [errors, setErrors] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');

  if (!isOpen) return null;

  const handleProcessText = (text: string) => {
    setCsvRawText(text);
    if (!text.trim()) {
      setParsedPreview(null);
      setErrors([]);
      return;
    }

    try {
      const rows = parseCSV(text);
      const result = mapCsvToTasks(rows);
      setParsedPreview(result.tasks);
      setErrors(result.errors);
    } catch (err: any) {
      setErrors(['Failed to parse CSV: ' + (err.message || 'Syntax error')]);
      setParsedPreview(null);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      handleProcessText(content);
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        handleProcessText(content);
      };
      reader.readAsText(file);
    }
  };

  const handleCommitImport = () => {
    if (!parsedPreview || parsedPreview.length === 0) return;
    onImport(parsedPreview, importMode);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div 
        className="bg-white dark:bg-slate-800 rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden my-8"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div>
            <h2 className="text-base font-bold flex items-center gap-2">
              <Upload className="w-4 h-4 text-indigo-400" />
              Import Conference Tasks from CSV
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Supports CSV with standard columns: Task Name, Section/Category, Assigned Lead, Status, Priority, Due Date, Budgeted Cost, Actual Cost, Notes
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode tabs */}
        <div className="p-6 space-y-4 text-xs">
          <div className="flex border-b border-slate-200 dark:border-slate-700 pb-2 gap-4">
            <button
              onClick={() => setActiveTab('upload')}
              className={`pb-2 font-semibold text-xs transition border-b-2 ${
                activeTab === 'upload' 
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' 
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Upload CSV File
            </button>
            <button
              onClick={() => setActiveTab('paste')}
              className={`pb-2 font-semibold text-xs transition border-b-2 ${
                activeTab === 'paste' 
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' 
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Paste CSV Text
            </button>
            <button
              onClick={() => handleProcessText(SAMPLE_CSV)}
              className="ml-auto text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-semibold"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              Load Sample 3-Task CSV
            </button>
          </div>

          {activeTab === 'upload' ? (
            <div 
              onDragOver={e => e.preventDefault()}
              onDrop={handleDrop}
              className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-8 text-center bg-slate-50 dark:bg-slate-750 hover:border-indigo-500 transition cursor-pointer"
            >
              <FileSpreadsheet className="w-10 h-10 text-indigo-500 mx-auto mb-2" />
              <p className="font-semibold text-slate-700 dark:text-slate-200">
                Drag and drop your .csv file here, or browse
              </p>
              <p className="text-slate-400 text-[11px] mt-1">
                Standard comma-separated format matching your plan
              </p>
              <label className="mt-4 inline-block px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold cursor-pointer shadow-xs transition">
                <span>Select .CSV File</span>
                <input 
                  type="file" 
                  accept=".csv,text/csv" 
                  onChange={handleFileUpload} 
                  className="hidden" 
                />
              </label>
            </div>
          ) : (
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Paste CSV content directly:
              </label>
              <textarea
                rows={6}
                value={csvRawText}
                onChange={e => handleProcessText(e.target.value)}
                placeholder="Task Name,Section/Category,Assigned Lead,Status,Priority,Due Date,Budgeted Cost,Actual Cost,Notes..."
                className="w-full font-mono text-[11px] p-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          )}

          {/* Errors banner */}
          {errors.length > 0 && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 dark:bg-rose-950/40 dark:border-rose-900 text-rose-700 dark:text-rose-300">
              <div className="font-semibold flex items-center gap-1.5 mb-1">
                <AlertCircle className="w-4 h-4" />
                <span>Notice while reading CSV</span>
              </div>
              <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                {errors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Parsed Preview Table */}
          {parsedPreview && parsedPreview.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-500" />
                  Successfully detected {parsedPreview.length} tasks ready to import:
                </span>
                
                {/* Mode Selector */}
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-300">
                    <input
                      type="radio"
                      name="importMode"
                      value="append"
                      checked={importMode === 'append'}
                      onChange={() => setImportMode('append')}
                      className="text-indigo-600"
                    />
                    <span>Append to current list</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-300">
                    <input
                      type="radio"
                      name="importMode"
                      value="replace"
                      checked={importMode === 'replace'}
                      onChange={() => setImportMode('replace')}
                      className="text-indigo-600"
                    />
                    <span className="text-rose-600 dark:text-rose-400 font-medium">Replace all existing</span>
                  </label>
                </div>
              </div>

              <div className="max-h-48 overflow-y-auto border border-slate-200 dark:border-slate-700 rounded-lg overflow-x-auto">
                <table className="w-full text-left text-[11px]">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 sticky top-0">
                    <tr>
                      <th className="py-2 px-2.5">Task Name</th>
                      <th className="py-2 px-2.5">Category</th>
                      <th className="py-2 px-2.5">Lead</th>
                      <th className="py-2 px-2.5">Status</th>
                      <th className="py-2 px-2.5 text-right">Budget (ZAR)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 font-medium">
                    {parsedPreview.map((t, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-750">
                        <td className="py-1.5 px-2.5 font-semibold text-slate-900 dark:text-white truncate max-w-[160px]">
                          {t.taskName}
                        </td>
                        <td className="py-1.5 px-2.5 text-slate-600 dark:text-slate-300 truncate max-w-[120px]">
                          {t.category}
                        </td>
                        <td className="py-1.5 px-2.5 text-slate-600 dark:text-slate-300">
                          {t.assignedLead}
                        </td>
                        <td className="py-1.5 px-2.5">
                          <span className="px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-[10px]">
                            {t.status}
                          </span>
                        </td>
                        <td className="py-1.5 px-2.5 text-right font-mono font-semibold">
                          {formatZAR(t.budgetedCost)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-end gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 font-medium transition"
            >
              Cancel
            </button>
            <button
              onClick={handleCommitImport}
              disabled={!parsedPreview || parsedPreview.length === 0}
              className={`px-5 py-2 rounded-lg font-semibold flex items-center gap-1.5 shadow-md transition ${
                !parsedPreview || parsedPreview.length === 0
                  ? 'bg-slate-300 dark:bg-slate-700 text-slate-500 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>Import {parsedPreview ? parsedPreview.length : 0} Tasks</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
