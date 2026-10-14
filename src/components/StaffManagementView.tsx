import React, { useState, useMemo } from 'react';
import { 
  Users, 
  UserCheck, 
  Clock, 
  DollarSign, 
  Search, 
  Filter, 
  Upload, 
  Download, 
  Plus, 
  Edit3, 
  Trash2, 
  ShieldCheck, 
  Phone, 
  Mail, 
  MapPin, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  RotateCcw,
  Sparkles,
  FileCode,
  Briefcase
} from 'lucide-react';
import { 
  StaffDepartment, 
  StaffDutyStatus, 
  StaffMember, 
  StaffShift 
} from '../types/conference';
import { 
  STAFF_CSV_HEADERS, 
  INITIAL_STAFF_DATA, 
  staffToCSV, 
  parseStaffCSV 
} from '../utils/csvTemplates';
import { formatZAR } from '../utils/currency';
import { downloadCSV } from '../utils/csv';

interface StaffManagementViewProps {
  staff: StaffMember[];
  onUpdateStaff: (staff: StaffMember[]) => void;
}

const DEPARTMENTS: StaffDepartment[] = [
  'Housekeeping & Cleaning',
  'Kitchen & Catering',
  'AV, Sound & Technical',
  'Front Desk & Guest Services',
  'VIP Protocol & Hospitality',
  'Security & Health Safety',
  'Operations & Logistics'
];

const SHIFTS: StaffShift[] = [
  'Morning Shift (06:00 - 15:00)',
  'Mid Shift (10:00 - 19:00)',
  'Evening Shift (14:00 - 23:00)',
  'Night / Overnight (22:00 - 07:00)',
  'All-Day Operational Lead'
];

const STATUSES: StaffDutyStatus[] = [
  'On Duty',
  'Scheduled',
  'On Break',
  'Standby / Off'
];

export const StaffManagementView: React.FC<StaffManagementViewProps> = ({
  staff,
  onUpdateStaff
}) => {
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [shiftFilter, setShiftFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [formData, setFormData] = useState<Partial<StaffMember>>({});

  // CSV Import Modal state
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [rawCsvInput, setRawCsvInput] = useState('');
  const [importMode, setImportMode] = useState<'append' | 'replace'>('append');
  const [parsedPreview, setParsedPreview] = useState<StaffMember[]>([]);

  // Filtered staff
  const filteredStaff = useMemo(() => {
    return staff.filter(s => {
      if (search) {
        const q = search.toLowerCase();
        const matchesName = s.fullName.toLowerCase().includes(q);
        const matchesId = s.staffId.toLowerCase().includes(q);
        const matchesRole = s.role.toLowerCase().includes(q);
        const matchesArea = s.assignedArea.toLowerCase().includes(q);
        const matchesDept = s.department.toLowerCase().includes(q);
        if (!matchesName && !matchesId && !matchesRole && !matchesArea && !matchesDept) return false;
      }
      if (departmentFilter !== 'all' && s.department !== departmentFilter) return false;
      if (shiftFilter !== 'all' && s.shift !== shiftFilter) return false;
      if (statusFilter !== 'all' && s.status !== statusFilter) return false;
      return true;
    });
  }, [staff, search, departmentFilter, shiftFilter, statusFilter]);

  // Metrics
  const totalStaff = staff.length;
  const onDutyCount = staff.filter(s => s.status === 'On Duty').length;
  const scheduledCount = staff.filter(s => s.status === 'Scheduled').length;
  const onBreakCount = staff.filter(s => s.status === 'On Break').length;
  const totalDailyPayroll = staff.reduce((sum, s) => sum + (s.dailyRate || 0), 0);

  // Department color map
  const getDeptColor = (dept: StaffDepartment) => {
    switch (dept) {
      case 'Housekeeping & Cleaning':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      case 'Kitchen & Catering':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'AV, Sound & Technical':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'VIP Protocol & Hospitality':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'Security & Health Safety':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800';
      case 'Front Desk & Guest Services':
        return 'bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300 border-sky-200 dark:border-sky-800';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  // Status badge styling
  const getStatusColor = (status: StaffDutyStatus) => {
    switch (status) {
      case 'On Duty':
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700';
      case 'Scheduled':
        return 'bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 border-sky-300 dark:border-sky-700';
      case 'On Break':
        return 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300 dark:border-amber-700';
      default:
        return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-300 dark:border-slate-700';
    }
  };

  // Inline Status Change
  const handleUpdateStatus = (id: string, newStatus: StaffDutyStatus) => {
    onUpdateStaff(staff.map(s => s.id === id ? { ...s, status: newStatus } : s));
  };

  // Open Edit modal
  const handleOpenEdit = (s: StaffMember) => {
    setEditingStaff(s);
    setFormData({ ...s });
    setIsEditModalOpen(true);
  };

  // Open Create modal
  const handleOpenCreate = () => {
    setEditingStaff(null);
    setFormData({
      staffId: `STF-${String(staff.length + 1).padStart(3, '0')}`,
      fullName: '',
      email: '',
      phone: '+27 ',
      department: 'Housekeeping & Cleaning',
      role: 'Staff Member',
      shift: 'Morning Shift (06:00 - 15:00)',
      assignedArea: 'Main Venue',
      status: 'On Duty',
      dailyRate: 950,
      emergencyContact: '',
      certificationsNotes: ''
    });
    setIsEditModalOpen(true);
  };

  // Save Staff member
  const handleSaveStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName?.trim()) return;

    if (editingStaff) {
      onUpdateStaff(staff.map(s => s.id === editingStaff.id ? { ...s, ...formData } as StaffMember : s));
    } else {
      const newStaff: StaffMember = {
        id: `staff-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        staffId: formData.staffId || `STF-${String(staff.length + 1).padStart(3, '0')}`,
        fullName: formData.fullName.trim(),
        email: formData.email?.trim() || '',
        phone: formData.phone?.trim() || '',
        department: (formData.department as StaffDepartment) || 'Operations & Logistics',
        role: formData.role?.trim() || 'Operational Staff',
        shift: (formData.shift as StaffShift) || 'Morning Shift (06:00 - 15:00)',
        assignedArea: formData.assignedArea?.trim() || 'Main Venue',
        status: (formData.status as StaffDutyStatus) || 'Scheduled',
        dailyRate: Number(formData.dailyRate) || 950,
        emergencyContact: formData.emergencyContact?.trim() || '',
        certificationsNotes: formData.certificationsNotes?.trim() || ''
      };
      onUpdateStaff([newStaff, ...staff]);
    }

    setIsEditModalOpen(false);
    setEditingStaff(null);
  };

  // Delete Staff member
  const handleDeleteStaff = (id: string) => {
    if (confirm('Are you sure you want to remove this staff member from the roster?')) {
      onUpdateStaff(staff.filter(s => s.id !== id));
    }
  };

  // CSV Export
  const handleExportCSV = () => {
    const csv = staffToCSV(staff);
    downloadCSV(csv, 'convene_conference_staff_roster.csv');
  };

  // Download Blank CSV Template
  const handleDownloadBlankTemplate = () => {
    const blank = STAFF_CSV_HEADERS.join(',') + '\n';
    downloadCSV(blank, 'staff_members_blank_template.csv');
  };

  // Download Sample CSV Template
  const handleDownloadSampleTemplate = () => {
    const sample = staffToCSV(INITIAL_STAFF_DATA);
    downloadCSV(sample, 'staff_members_sample_template.csv');
  };

  // Reset to default sample roster
  const handleResetToSample = () => {
    if (confirm('Reset staff roster back to standard conference operational team (10 staff members)?')) {
      onUpdateStaff(INITIAL_STAFF_DATA);
    }
  };

  // Handle CSV file selection for upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setRawCsvInput(text);
      const parsed = parseStaffCSV(text);
      setParsedPreview(parsed);
    };
    reader.readAsText(file);
  };

  // Handle raw text input change
  const handleRawTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setRawCsvInput(text);
    if (text.trim()) {
      const parsed = parseStaffCSV(text);
      setParsedPreview(parsed);
    } else {
      setParsedPreview([]);
    }
  };

  // Execute CSV Import
  const handleExecuteImport = () => {
    if (parsedPreview.length === 0) {
      alert('No valid staff member records detected in the provided CSV.');
      return;
    }

    if (importMode === 'replace') {
      onUpdateStaff(parsedPreview);
    } else {
      onUpdateStaff([...parsedPreview, ...staff]);
    }

    setIsImportModalOpen(false);
    setRawCsvInput('');
    setParsedPreview([]);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* 1. Header Banner & Quick Metrics */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Staff & Crew Operations
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>{onDutyCount} Active On Duty</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                South African Rands (ZAR)
              </span>
            </div>

            <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
              <Users className="w-6 h-6 text-indigo-400" />
              Conference Staff Roster & Operational Crew
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Manage on-site team members, shift allocations, daily compensation in ZAR, assigned venue stations, and import/upload bulk staff rosters via standardized CSV templates.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <button
              onClick={handleOpenCreate}
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30 flex items-center gap-1.5 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Add Staff Member</span>
            </button>

            <button
              onClick={() => setIsImportModalOpen(true)}
              className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center gap-1.5 transition"
            >
              <Upload className="w-4 h-4 text-indigo-400" />
              <span>Upload CSV</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center gap-1.5 transition"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Export Roster</span>
            </button>

            <button
              onClick={handleResetToSample}
              className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition"
              title="Reset to 10 sample staff members"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 4 KPI Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
          <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/80">
            <div className="text-[11px] text-slate-400 font-semibold uppercase">Total Crew Roster</div>
            <div className="text-2xl font-bold text-white mt-0.5">{totalStaff} Staff</div>
            <div className="text-[10px] text-slate-400 mt-1">Across 7 departments</div>
          </div>

          <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/80">
            <div className="text-[11px] text-emerald-400 font-semibold uppercase flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>On Duty Now</span>
            </div>
            <div className="text-2xl font-bold text-emerald-400 mt-0.5">{onDutyCount}</div>
            <div className="text-[10px] text-slate-400 mt-1">{scheduledCount} scheduled next</div>
          </div>

          <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/80">
            <div className="text-[11px] text-amber-400 font-semibold uppercase">On Break / Standby</div>
            <div className="text-2xl font-bold text-amber-400 mt-0.5">{onBreakCount + (totalStaff - onDutyCount - scheduledCount)}</div>
            <div className="text-[10px] text-slate-400 mt-1">Ready for backup call</div>
          </div>

          <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/80">
            <div className="text-[11px] text-indigo-300 font-semibold uppercase">Daily Crew Payroll</div>
            <div className="text-2xl font-bold text-indigo-200 mt-0.5">{formatZAR(totalDailyPayroll)}</div>
            <div className="text-[10px] text-slate-400 mt-1">Daily conference rate</div>
          </div>
        </div>
      </div>

      {/* 2. Search & Department Filters */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, staff ID, role, or station..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Department */}
          <select
            value={departmentFilter}
            onChange={e => setDepartmentFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs rounded-lg px-2.5 py-1.5"
          >
            <option value="all">All Departments ({staff.length})</option>
            {DEPARTMENTS.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          {/* Shift */}
          <select
            value={shiftFilter}
            onChange={e => setShiftFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs rounded-lg px-2.5 py-1.5"
          >
            <option value="all">All Shifts</option>
            {SHIFTS.map(s => (
              <option key={s} value={s}>{s.split(' ')[0]} Shift</option>
            ))}
          </select>

          {/* Status */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs rounded-lg px-2.5 py-1.5"
          >
            <option value="all">All Statuses</option>
            {STATUSES.map(st => (
              <option key={st} value={st}>{st}</option>
            ))}
          </select>

          {/* Download CSV Templates quick shortcuts */}
          <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200 dark:border-slate-700">
            <button
              onClick={handleDownloadSampleTemplate}
              className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              title="Download sample CSV populated with 10 staff"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Sample CSV</span>
            </button>
            <span className="text-slate-300 dark:text-slate-700">&bull;</span>
            <button
              onClick={handleDownloadBlankTemplate}
              className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 hover:underline flex items-center gap-1"
              title="Download blank CSV template with header row"
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>Blank Template</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Staff Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-3">Staff ID & Name</th>
                <th className="py-3 px-3">Department</th>
                <th className="py-3 px-3">Role & Station</th>
                <th className="py-3 px-3">Shift</th>
                <th className="py-3 px-3">Duty Status</th>
                <th className="py-3 px-3 text-right">Daily Rate</th>
                <th className="py-3 px-3">Emergency Contact</th>
                <th className="py-3 px-3 text-center w-24">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredStaff.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <Users className="w-8 h-8 mx-auto text-slate-300 mb-2 opacity-50" />
                    <p className="font-semibold">No staff members found matching your filters</p>
                    <p className="text-[11px] text-slate-400 mt-1">Try resetting search filters or upload staff from CSV</p>
                  </td>
                </tr>
              ) : (
                filteredStaff.map(s => (
                  <tr key={s.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
                    
                    {/* Staff Name & ID */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold text-xs shrink-0 border border-indigo-200 dark:border-indigo-800">
                          {s.fullName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                            <span>{s.fullName}</span>
                            <span className="font-mono text-[10px] text-slate-400 bg-slate-100 dark:bg-slate-800 px-1 py-0.2 rounded">
                              {s.staffId}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                            {s.phone && (
                              <span className="flex items-center gap-1">
                                <Phone className="w-3 h-3 text-slate-400" />
                                {s.phone}
                              </span>
                            )}
                            {s.email && (
                              <span className="flex items-center gap-1 hidden sm:flex">
                                <Mail className="w-3 h-3 text-slate-400" />
                                {s.email}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Department */}
                    <td className="py-3 px-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${getDeptColor(s.department)}`}>
                        {s.department}
                      </span>
                    </td>

                    {/* Role & Station */}
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">{s.role}</div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{s.assignedArea}</span>
                      </div>
                    </td>

                    {/* Shift */}
                    <td className="py-3 px-3">
                      <div className="text-slate-700 dark:text-slate-300 font-medium">
                        {s.shift}
                      </div>
                    </td>

                    {/* Live Duty Status Select */}
                    <td className="py-3 px-3">
                      <select
                        value={s.status}
                        onChange={e => handleUpdateStatus(s.id, e.target.value as StaffDutyStatus)}
                        className={`text-xs font-bold rounded-lg px-2 py-1 border transition cursor-pointer ${getStatusColor(s.status)}`}
                      >
                        {STATUSES.map(st => (
                          <option key={st} value={st}>{st}</option>
                        ))}
                      </select>
                    </td>

                    {/* Daily Rate */}
                    <td className="py-3 px-3 text-right font-bold text-slate-900 dark:text-slate-100">
                      {formatZAR(s.dailyRate)}
                      <span className="block text-[10px] font-normal text-slate-400">/day</span>
                    </td>

                    {/* Emergency Contact */}
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-300">
                      <div className="text-xs">{s.emergencyContact || '&mdash;'}</div>
                      {s.certificationsNotes && (
                        <div className="text-[10px] text-slate-400 truncate max-w-xs" title={s.certificationsNotes}>
                          {s.certificationsNotes}
                        </div>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleOpenEdit(s)}
                          className="p-1 rounded text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                          title="Edit staff details"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteStaff(s.id)}
                          className="p-1 rounded text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                          title="Remove from roster"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Summary */}
        <div className="bg-slate-50 dark:bg-slate-800/50 p-3 px-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <div>
            Showing <strong>{filteredStaff.length}</strong> of <strong>{staff.length}</strong> staff members
          </div>
          <div>
            Active Roster Daily Total: <strong className="text-slate-900 dark:text-white">{formatZAR(filteredStaff.reduce((sum, s) => sum + (s.dailyRate || 0), 0))}</strong>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 4. MODAL: CREATE / EDIT STAFF MEMBER */}
      {/* ======================================================== */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600" />
                <span>{editingStaff ? 'Edit Staff Member' : 'Add New Staff Member'}</span>
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStaff} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Staff ID
                  </label>
                  <input
                    type="text"
                    value={formData.staffId || ''}
                    onChange={e => setFormData({ ...formData, staffId: e.target.value })}
                    placeholder="STF-011"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Duty Status
                  </label>
                  <select
                    value={formData.status || 'On Duty'}
                    onChange={e => setFormData({ ...formData, status: e.target.value as StaffDutyStatus })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs font-semibold"
                  >
                    {STATUSES.map(st => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.fullName || ''}
                  onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="e.g. Nomvula Sithole"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Mobile Phone *
                  </label>
                  <input
                    type="text"
                    value={formData.phone || ''}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+27 82 000 0000"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email || ''}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    placeholder="staff@conference.co.za"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Department
                  </label>
                  <select
                    value={formData.department || 'Housekeeping & Cleaning'}
                    onChange={e => setFormData({ ...formData, department: e.target.value as StaffDepartment })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs"
                  >
                    {DEPARTMENTS.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Role / Designation
                  </label>
                  <input
                    type="text"
                    value={formData.role || ''}
                    onChange={e => setFormData({ ...formData, role: e.target.value })}
                    placeholder="e.g. Senior Room Attendant"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs font-medium"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Shift Timetable
                  </label>
                  <select
                    value={formData.shift || 'Morning Shift (06:00 - 15:00)'}
                    onChange={e => setFormData({ ...formData, shift: e.target.value as StaffShift })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs"
                  >
                    {SHIFTS.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Daily Rate (ZAR / R)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">R</span>
                    <input
                      type="number"
                      value={formData.dailyRate || 0}
                      onChange={e => setFormData({ ...formData, dailyRate: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg pl-7 pr-3 py-1.5 text-xs font-bold"
                      min={0}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Assigned Area / Station
                </label>
                <input
                  type="text"
                  value={formData.assignedArea || ''}
                  onChange={e => setFormData({ ...formData, assignedArea: e.target.value })}
                  placeholder="e.g. Garden Wing (Rooms 201-204) & Foyer"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Emergency Contact (Name & Phone)
                </label>
                <input
                  type="text"
                  value={formData.emergencyContact || ''}
                  onChange={e => setFormData({ ...formData, emergencyContact: e.target.value })}
                  placeholder="e.g. Sindi Sithole (+27 82 123 4567)"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Certifications, Badges & Medical Notes
                </label>
                <input
                  type="text"
                  value={formData.certificationsNotes || ''}
                  onChange={e => setFormData({ ...formData, certificationsNotes: e.target.value })}
                  placeholder="e.g. First Aid Level 2, Food Safety Certified, Working at Heights"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30 transition"
                >
                  {editingStaff ? 'Update Staff Member' : 'Save Staff Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 5. MODAL: CSV IMPORT & UPLOAD FUNCTION WITH TEMPLATE */}
      {/* ======================================================== */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl my-8">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Upload className="w-5 h-5 text-indigo-600" />
                  <span>Upload Staff Members from CSV</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Import roster files from Excel, Google Sheets, or custom CSV exports.
                </p>
              </div>
              <button
                onClick={() => {
                  setIsImportModalOpen(false);
                  setRawCsvInput('');
                  setParsedPreview([]);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Template Download Prompt */}
            <div className="bg-indigo-50 dark:bg-indigo-950/40 p-3.5 rounded-xl border border-indigo-200 dark:border-indigo-800/60 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="text-xs text-indigo-900 dark:text-indigo-200">
                <span className="font-bold">Need the official format?</span> Download the blank template or sample CSV before uploading:
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleDownloadBlankTemplate}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-white dark:bg-indigo-900/60 hover:bg-indigo-100 border border-indigo-300 dark:border-indigo-700 flex items-center gap-1 transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Blank Template</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadSampleTemplate}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-xs flex items-center gap-1 transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Sample CSV (10 Staff)</span>
                </button>
              </div>
            </div>

            {/* File Drag & Drop or Input */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  1. Select .CSV File
                </label>
                <input
                  type="file"
                  accept=".csv,text/csv"
                  onChange={handleFileChange}
                  className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  2. Or Paste Raw CSV Text
                </label>
                <textarea
                  rows={4}
                  value={rawCsvInput}
                  onChange={handleRawTextChange}
                  placeholder={`Staff ID,Full Name,Email,Phone,Department,Role / Designation,Shift,Assigned Area / Station,Duty Status,Daily Rate (ZAR),Emergency Contact,Certifications & Notes\nSTF-001,Brenda Mkhize,brenda@rawdons.co.za,+27824558901,Housekeeping & Cleaning,Head Housekeeper,Morning Shift (06:00 - 15:00),All Accommodation Wings,On Duty,1450,Vusi Mkhize,Hospitality Diploma`}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-xs font-mono text-slate-800 dark:text-slate-200 placeholder-slate-400"
                />
              </div>

              {/* Import Mode: Append or Replace */}
              <div className="flex items-center gap-4 text-xs font-semibold text-slate-700 dark:text-slate-300">
                <span>Import Mode:</span>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="staffImportMode"
                    value="append"
                    checked={importMode === 'append'}
                    onChange={() => setImportMode('append')}
                    className="text-indigo-600"
                  />
                  <span>Append to existing roster</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer text-amber-600 dark:text-amber-400">
                  <input
                    type="radio"
                    name="staffImportMode"
                    value="replace"
                    checked={importMode === 'replace'}
                    onChange={() => setImportMode('replace')}
                    className="text-amber-600"
                  />
                  <span>Replace entire roster</span>
                </label>
              </div>

              {/* Parsed Preview Table */}
              {parsedPreview.length > 0 && (
                <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                  <div className="bg-slate-100 dark:bg-slate-800 p-2.5 px-3 flex items-center justify-between text-xs font-bold text-slate-800 dark:text-white">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span>Ready to Import {parsedPreview.length} Staff Records</span>
                    </span>
                    <span className="text-slate-500 font-normal">
                      Total Daily Payroll: {formatZAR(parsedPreview.reduce((sum, s) => sum + s.dailyRate, 0))}
                    </span>
                  </div>

                  <div className="max-h-48 overflow-y-auto">
                    <table className="w-full text-left text-[11px]">
                      <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 sticky top-0">
                        <tr>
                          <th className="p-2">ID</th>
                          <th className="p-2">Name</th>
                          <th className="p-2">Department</th>
                          <th className="p-2">Role</th>
                          <th className="p-2">Shift</th>
                          <th className="p-2 text-right">Rate</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {parsedPreview.slice(0, 10).map((p, idx) => (
                          <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                            <td className="p-2 font-mono text-slate-400">{p.staffId}</td>
                            <td className="p-2 font-bold text-slate-900 dark:text-white">{p.fullName}</td>
                            <td className="p-2 text-slate-600 dark:text-slate-300">{p.department}</td>
                            <td className="p-2 text-slate-600 dark:text-slate-300">{p.role}</td>
                            <td className="p-2 text-slate-500">{p.shift.split(' ')[0]}</td>
                            <td className="p-2 text-right font-bold text-slate-900 dark:text-white">{formatZAR(p.dailyRate)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {parsedPreview.length > 10 && (
                    <div className="p-1.5 text-center text-[10px] text-slate-400 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800">
                      + {parsedPreview.length - 10} more staff records...
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsImportModalOpen(false);
                    setRawCsvInput('');
                    setParsedPreview([]);
                  }}
                  className="px-3.5 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleExecuteImport}
                  disabled={parsedPreview.length === 0}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-indigo-600/30 transition flex items-center gap-1.5"
                >
                  <Upload className="w-4 h-4" />
                  <span>Import {parsedPreview.length} Staff Members</span>
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};
