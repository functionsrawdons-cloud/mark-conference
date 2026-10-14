import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Download, 
  Upload, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  AlertCircle, 
  X, 
  CheckCircle2, 
  Clock, 
  Utensils, 
  DollarSign,
  Tag
} from 'lucide-react';
import { DietaryRequirement, GuestDetails, GuestRegistrationStatus, GuestTicketType } from '../types/conference';
import { guestsToCSV, parseGuestCSV, INITIAL_GUESTS_DATA } from '../utils/csvTemplates';
import { formatZAR } from '../utils/currency';
import { downloadCSV } from '../utils/csv';

interface GuestDirectoryViewProps {
  guests: GuestDetails[];
  onUpdateGuests: (guests: GuestDetails[]) => void;
}

export const GuestDirectoryView: React.FC<GuestDirectoryViewProps> = ({ guests, onUpdateGuests }) => {
  const [search, setSearch] = useState('');
  const [dietaryFilter, setDietaryFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [editingGuest, setEditingGuest] = useState<GuestDetails | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state
  const [formGuest, setFormGuest] = useState<Partial<GuestDetails>>({
    ticketNumber: '',
    fullName: '',
    email: '',
    organization: '',
    jobTitle: '',
    ticketType: 'Standard',
    status: 'Confirmed',
    dietary: 'Standard / None',
    allergiesNotes: '',
    tableAssignment: 'Open Seating',
    attendingGala: 'Yes',
    ticketPrice: 2800,
    notes: ''
  });

  // Filtered guests
  const filteredGuests = useMemo(() => {
    return guests.filter(g => {
      if (search) {
        const q = search.toLowerCase();
        const matchesName = g.fullName.toLowerCase().includes(q);
        const matchesOrg = g.organization.toLowerCase().includes(q);
        const matchesEmail = g.email.toLowerCase().includes(q);
        const matchesTicket = g.ticketNumber.toLowerCase().includes(q);
        const matchesTable = g.tableAssignment.toLowerCase().includes(q);
        if (!matchesName && !matchesOrg && !matchesEmail && !matchesTicket && !matchesTable) return false;
      }

      if (dietaryFilter && g.dietary !== dietaryFilter) return false;
      if (statusFilter && g.status !== statusFilter) return false;
      if (typeFilter && g.ticketType !== typeFilter) return false;

      return true;
    });
  }, [guests, search, dietaryFilter, statusFilter, typeFilter]);

  // Dietary counts for catering summary
  const dietaryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const g of guests) {
      counts[g.dietary] = (counts[g.dietary] || 0) + 1;
    }
    return counts;
  }, [guests]);

  const totalTicketRevenue = useMemo(() => {
    return guests.reduce((sum, g) => sum + (g.ticketPrice || 0), 0);
  }, [guests]);

  const checkedInCount = guests.filter(g => g.status === 'Checked-In').length;
  const confirmedCount = guests.filter(g => g.status === 'Confirmed').length;

  const handleExportCsv = () => {
    const csv = guestsToCSV(guests);
    downloadCSV(csv, '2_individual_guest_details.csv');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const parsed = parseGuestCSV(text);
      if (parsed.length > 0) {
        if (confirm(`Import ${parsed.length} guests from CSV? Click OK to replace or Cancel to append.`)) {
          onUpdateGuests(parsed);
        } else {
          onUpdateGuests([...parsed, ...guests]);
        }
      } else {
        alert('Could not find valid guest rows in the uploaded CSV.');
      }
    };
    reader.readAsText(file);
  };

  const handleSaveGuest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formGuest.fullName) return;

    if (editingGuest) {
      onUpdateGuests(guests.map(g => g.id === editingGuest.id ? { ...g, ...formGuest } as GuestDetails : g));
    } else {
      const newGuest: GuestDetails = {
        id: `guest-${Date.now()}`,
        ticketNumber: formGuest.ticketNumber || `TC-2025-${guests.length + 1}`.padStart(3, '0'),
        fullName: formGuest.fullName!,
        email: formGuest.email || '',
        organization: formGuest.organization || '',
        jobTitle: formGuest.jobTitle || '',
        ticketType: formGuest.ticketType || 'Standard',
        status: formGuest.status || 'Confirmed',
        dietary: formGuest.dietary || 'Standard / None',
        allergiesNotes: formGuest.allergiesNotes || '',
        tableAssignment: formGuest.tableAssignment || 'Open Seating',
        attendingGala: formGuest.attendingGala || 'Yes',
        ticketPrice: formGuest.ticketPrice || 0,
        notes: formGuest.notes || ''
      };
      onUpdateGuests([newGuest, ...guests]);
    }

    setIsModalOpen(false);
    setEditingGuest(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this guest?')) {
      onUpdateGuests(guests.filter(g => g.id !== id));
    }
  };

  const handleToggleCheckIn = (guest: GuestDetails) => {
    const nextStatus: GuestRegistrationStatus = guest.status === 'Checked-In' ? 'Confirmed' : 'Checked-In';
    onUpdateGuests(guests.map(g => g.id === guest.id ? { ...g, status: nextStatus } : g));
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* 1. Header & Summary KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Registered Guests</span>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{guests.length}</p>
          <div className="text-xs text-slate-500 mt-1 flex justify-between">
            <span>Confirmed: {confirmedCount}</span>
            <span className="text-emerald-600 font-semibold">Checked-In: {checkedInCount}</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Ticket Revenue (ZAR)</span>
          <p className="text-2xl font-bold text-slate-900 dark:text-white font-mono mt-1">
            {formatZAR(totalTicketRevenue)}
          </p>
          <span className="text-xs text-slate-500 mt-1 block">
            Avg: {formatZAR(guests.length > 0 ? Math.round(totalTicketRevenue / guests.length) : 0)} / ticket
          </span>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Special Dietary Requests</span>
          <p className="text-2xl font-bold text-indigo-600 mt-1">
            {guests.filter(g => g.dietary !== 'Standard / None').length}
          </p>
          <span className="text-xs text-slate-500 mt-1 block">
            Halaal: {dietaryCounts['Halaal Certified'] || 0} &bull; Kosher: {dietaryCounts['Kosher Certified'] || 0} &bull; Vegan: {dietaryCounts['Vegan'] || 0}
          </span>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Gala Dinner Attendance</span>
          <p className="text-2xl font-bold text-amber-600 mt-1">
            {guests.filter(g => g.attendingGala === 'Yes').length}
          </p>
          <span className="text-xs text-slate-500 mt-1 block">
            {guests.filter(g => g.attendingGala === 'No').length} declining / daytime only
          </span>
        </div>
      </div>

      {/* 2. Dietary Quick Filters Bar */}
      <div className="bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 rounded-xl p-3 flex items-center justify-between gap-2 flex-wrap text-xs">
        <div className="flex items-center gap-1.5 text-indigo-900 dark:text-indigo-200 font-semibold">
          <Utensils className="w-4 h-4 text-indigo-600" />
          <span>Dietary Matrix for Kitchen:</span>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {Object.entries(dietaryCounts).map(([diet, count]) => (
            <button
              key={diet}
              onClick={() => setDietaryFilter(dietaryFilter === diet ? '' : diet)}
              className={`px-2.5 py-1 rounded-lg font-semibold transition border text-[11px] ${
                dietaryFilter === diet
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-indigo-400'
              }`}
            >
              <span>{diet}: <strong>{count}</strong></span>
            </button>
          ))}
          {dietaryFilter && (
            <button
              onClick={() => setDietaryFilter('')}
              className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold ml-1"
            >
              Show All
            </button>
          )}
        </div>
      </div>

      {/* 3. Toolbar & Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs overflow-hidden">
        
        {/* Filter bar */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by guest name, organization, ticket #, table..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-8 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200"
            >
              <option value="">All Ticket Types</option>
              <option value="VIP">VIP</option>
              <option value="Speaker">Speaker</option>
              <option value="Standard">Standard</option>
              <option value="Sponsor">Sponsor</option>
              <option value="Media">Media</option>
            </select>

            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200"
            >
              <option value="">All Statuses</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Checked-In">Checked-In</option>
              <option value="Pending">Pending</option>
            </select>

            <button
              onClick={handleExportCsv}
              className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-1.5 text-slate-700 dark:text-slate-200"
            >
              <Download className="w-3.5 h-3.5 text-sky-500" />
              <span>Export CSV</span>
            </button>

            <label className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-200">
              <Upload className="w-3.5 h-3.5 text-sky-500" />
              <span>Import CSV</span>
              <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
            </label>

            <button
              onClick={() => {
                setEditingGuest(null);
                setFormGuest({
                  ticketNumber: `TC-2025-${guests.length + 101}`,
                  fullName: '',
                  email: '',
                  organization: '',
                  jobTitle: '',
                  ticketType: 'Standard',
                  status: 'Confirmed',
                  dietary: 'Standard / None',
                  allergiesNotes: '',
                  tableAssignment: 'Open Seating',
                  attendingGala: 'Yes',
                  ticketPrice: 2800,
                  notes: ''
                });
                setIsModalOpen(true);
              }}
              className="px-3.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add Guest</span>
            </button>
          </div>
        </div>

        {/* Guest Data Table */}
        <div className="overflow-x-auto min-h-[300px]">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 uppercase text-[10px] font-semibold border-b border-slate-200 dark:border-slate-700 tracking-wider">
                <th className="py-3 px-3">Ticket #</th>
                <th className="py-3 px-3">Guest Name & Role</th>
                <th className="py-3 px-3">Organization</th>
                <th className="py-3 px-3">Type</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Dietary / Allergies</th>
                <th className="py-3 px-3">Table Seating</th>
                <th className="py-3 px-3 text-center">Gala Dinner</th>
                <th className="py-3 px-3 text-right">Fee (ZAR)</th>
                <th className="py-3 px-3 text-center w-16">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700 font-medium">
              {filteredGuests.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    No guests match your criteria.
                  </td>
                </tr>
              ) : (
                filteredGuests.map(g => (
                  <tr key={g.id} className="hover:bg-slate-50 dark:hover:bg-slate-750">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-700 dark:text-slate-300">
                      {g.ticketNumber}
                    </td>

                    <td className="py-2.5 px-3">
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white block">{g.fullName}</span>
                        <span className="text-[11px] text-slate-400">{g.jobTitle || g.email}</span>
                      </div>
                    </td>

                    <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300 truncate max-w-[140px]">
                      {g.organization}
                    </td>

                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                        g.ticketType === 'VIP' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
                        g.ticketType === 'Speaker' ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300' :
                        g.ticketType === 'Sponsor' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                        'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                      }`}>
                        {g.ticketType}
                      </span>
                    </td>

                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleCheckIn(g)}
                        title="Click to toggle Checked-In"
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold transition flex items-center gap-1 ${
                          g.status === 'Checked-In'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : g.status === 'Confirmed'
                            ? 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}
                      >
                        {g.status === 'Checked-In' && <Check className="w-2.5 h-2.5" />}
                        <span>{g.status}</span>
                      </button>
                    </td>

                    <td className="py-2.5 px-3">
                      <div>
                        <span className={`text-[10px] px-2 py-0.5 rounded font-medium border ${
                          g.dietary === 'Halaal Certified' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          g.dietary === 'Kosher Certified' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                          g.dietary === 'Vegan' || g.dietary === 'Vegetarian' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                          g.dietary === 'Nut Allergy' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                          'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-700 dark:text-slate-300'
                        }`}>
                          {g.dietary}
                        </span>
                        {g.allergiesNotes && (
                          <span className="text-[10px] text-rose-600 block mt-0.5 italic">
                            {g.allergiesNotes}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300 font-medium">
                      {g.tableAssignment}
                    </td>

                    <td className="py-2.5 px-3 text-center">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        g.attendingGala === 'Yes' ? 'text-emerald-600 bg-emerald-50' : 'text-slate-400 bg-slate-100'
                      }`}>
                        {g.attendingGala}
                      </span>
                    </td>

                    <td className="py-2.5 px-3 text-right font-mono font-semibold text-slate-900 dark:text-white">
                      {formatZAR(g.ticketPrice)}
                    </td>

                    <td className="py-2.5 px-3 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => {
                            setEditingGuest(g);
                            setFormGuest(g);
                            setIsModalOpen(true);
                          }}
                          className="p-1 text-slate-400 hover:text-sky-600 transition"
                          title="Edit guest"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(g.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 transition"
                          title="Delete guest"
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
      </div>

      {/* Guest Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-sky-500" />
                <span>{editingGuest ? 'Edit Guest Details' : 'Add New Conference Guest'}</span>
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveGuest} className="space-y-4 text-xs pt-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Ticket Number</label>
                  <input
                    type="text"
                    value={formGuest.ticketNumber || ''}
                    onChange={e => setFormGuest({ ...formGuest, ticketNumber: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Full Name *</label>
                  <input
                    type="text"
                    value={formGuest.fullName || ''}
                    onChange={e => setFormGuest({ ...formGuest, fullName: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Email Address</label>
                  <input
                    type="email"
                    value={formGuest.email || ''}
                    onChange={e => setFormGuest({ ...formGuest, email: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Company / Organization</label>
                  <input
                    type="text"
                    value={formGuest.organization || ''}
                    onChange={e => setFormGuest({ ...formGuest, organization: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Job Title</label>
                  <input
                    type="text"
                    value={formGuest.jobTitle || ''}
                    onChange={e => setFormGuest({ ...formGuest, jobTitle: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Ticket Type</label>
                  <select
                    value={formGuest.ticketType}
                    onChange={e => setFormGuest({ ...formGuest, ticketType: e.target.value as GuestTicketType })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700"
                  >
                    <option value="VIP">VIP</option>
                    <option value="Speaker">Speaker</option>
                    <option value="Standard">Standard</option>
                    <option value="Sponsor">Sponsor</option>
                    <option value="Media">Media</option>
                    <option value="Staff">Staff</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Dietary Requirement</label>
                  <select
                    value={formGuest.dietary}
                    onChange={e => setFormGuest({ ...formGuest, dietary: e.target.value as DietaryRequirement })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700"
                  >
                    <option value="Standard / None">Standard / None</option>
                    <option value="Halaal Certified">Halaal Certified</option>
                    <option value="Kosher Certified">Kosher Certified</option>
                    <option value="Vegetarian">Vegetarian</option>
                    <option value="Vegan">Vegan</option>
                    <option value="Gluten-Free">Gluten-Free</option>
                    <option value="Nut Allergy">Nut Allergy</option>
                    <option value="Diabetic Friendly">Diabetic Friendly</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Registration Status</label>
                  <select
                    value={formGuest.status}
                    onChange={e => setFormGuest({ ...formGuest, status: e.target.value as GuestRegistrationStatus })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700"
                  >
                    <option value="Confirmed">Confirmed</option>
                    <option value="Checked-In">Checked-In</option>
                    <option value="Pending">Pending</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Table / Seating Room</label>
                  <input
                    type="text"
                    value={formGuest.tableAssignment || ''}
                    onChange={e => setFormGuest({ ...formGuest, tableAssignment: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Ticket Fee (ZAR / R)</label>
                  <input
                    type="number"
                    value={formGuest.ticketPrice ?? 0}
                    onChange={e => setFormGuest({ ...formGuest, ticketPrice: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Allergies / Special Medical Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Severe peanut allergy (EpiPen carrier), strictly gluten-free prep"
                  value={formGuest.allergiesNotes || ''}
                  onChange={e => setFormGuest({ ...formGuest, allergiesNotes: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Save Guest</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
