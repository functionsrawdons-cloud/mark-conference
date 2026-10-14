import React, { useState, useMemo } from 'react';
import { 
  Bed, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Search, 
  Download, 
  Upload, 
  Plus, 
  Edit3, 
  Trash2, 
  UserCheck, 
  ShieldCheck, 
  CheckSquare, 
  Square, 
  Calendar, 
  Home, 
  X, 
  Flame, 
  Coffee, 
  Key, 
  RotateCcw
} from 'lucide-react';
import { AccommodationRoom, GuestDetails, HousekeepingChecklist, HousekeepingStatus, RoomType } from '../types/conference';
import { accommodationToCSV, parseAccommodationCSV, INITIAL_ACCOMMODATION_ROOMS } from '../utils/csvTemplates';
import { formatZAR } from '../utils/currency';
import { downloadCSV } from '../utils/csv';

interface AccommodationViewProps {
  rooms: AccommodationRoom[];
  onUpdateRooms: (rooms: AccommodationRoom[]) => void;
  availableGuests: GuestDetails[];
}

export const AccommodationView: React.FC<AccommodationViewProps> = ({
  rooms,
  onUpdateRooms,
  availableGuests
}) => {
  const [search, setSearch] = useState('');
  const [wingFilter, setWingFilter] = useState('');
  const [housekeepingFilter, setHousekeepingFilter] = useState('');
  const [allocationFilter, setAllocationFilter] = useState('');
  
  // Housekeeping checklist modal
  const [activeChecklistRoom, setActiveChecklistRoom] = useState<AccommodationRoom | null>(null);
  
  // Room allocate / edit modal
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<AccommodationRoom | null>(null);
  const [roomFormData, setRoomFormData] = useState<Partial<AccommodationRoom>>({});

  // Wings
  const wings = useMemo(() => {
    return Array.from(new Set(rooms.map(r => r.wing)));
  }, [rooms]);

  // Filtered rooms
  const filteredRooms = useMemo(() => {
    return rooms.filter(r => {
      if (search) {
        const q = search.toLowerCase();
        const matchesNum = r.roomNumber.toLowerCase().includes(q);
        const matchesName = r.roomName.toLowerCase().includes(q);
        const matchesGuest = (r.allocatedGuestName || '').toLowerCase().includes(q);
        const matchesWing = r.wing.toLowerCase().includes(q);
        if (!matchesNum && !matchesName && !matchesGuest && !matchesWing) return false;
      }
      if (wingFilter && r.wing !== wingFilter) return false;
      if (housekeepingFilter && r.housekeepingStatus !== housekeepingFilter) return false;
      if (allocationFilter && r.allocationStatus !== allocationFilter) return false;
      return true;
    });
  }, [rooms, search, wingFilter, housekeepingFilter, allocationFilter]);

  // Metrics
  const totalRooms = rooms.length;
  const allocatedRooms = rooms.filter(r => r.allocationStatus === 'Allocated' || r.allocationStatus === 'Checked-In').length;
  const vacantRooms = rooms.filter(r => r.allocationStatus === 'Vacant').length;
  const readyRooms = rooms.filter(r => r.housekeepingStatus === 'Clean & Inspected').length;
  const cleaningPending = rooms.filter(r => r.housekeepingStatus === 'Needs Cleaning' || r.housekeepingStatus === 'In Progress' || r.housekeepingStatus === 'Turnover / Dirty').length;
  const totalAccommodationRevenue = rooms.reduce((sum, r) => sum + ((r.nightlyRate || 0) * (r.totalNights || 0)), 0);

  const occupancyPct = totalRooms > 0 ? Math.round((allocatedRooms / totalRooms) * 100) : 0;

  // Toggle checklist item
  const handleToggleChecklistItem = (room: AccommodationRoom, key: keyof HousekeepingChecklist) => {
    const updatedChecklist = {
      ...room.checklist,
      [key]: !room.checklist[key]
    };
    
    // Check if all items complete
    const allDone = Object.values(updatedChecklist).every(Boolean);
    const newStatus: HousekeepingStatus = allDone ? 'Clean & Inspected' : 'In Progress';

    const updatedRoom: AccommodationRoom = {
      ...room,
      checklist: updatedChecklist,
      housekeepingStatus: newStatus,
      inspectionSignOff: allDone,
      inspectedBy: allDone ? (room.inspectedBy || 'Supervisor Brenda') : null,
      lastCleanedAt: allDone ? new Date().toISOString() : room.lastCleanedAt
    };

    onUpdateRooms(rooms.map(r => r.id === room.id ? updatedRoom : r));
    setActiveChecklistRoom(updatedRoom);
  };

  // Mark all checklist items complete with one click
  const handleMarkAllClean = (room: AccommodationRoom) => {
    const completeChecklist: HousekeepingChecklist = {
      linenChanged: true,
      bathroomSanitized: true,
      toiletriesStocked: true,
      teaCoffeeReplenished: true,
      hvacFireplaceChecked: true,
      welcomePackPlaced: true,
      keysTested: true,
      minibarRestocked: true,
      supervisorInspection: true
    };

    const updatedRoom: AccommodationRoom = {
      ...room,
      checklist: completeChecklist,
      housekeepingStatus: 'Clean & Inspected',
      inspectionSignOff: true,
      inspectedBy: 'Head Housekeeper Brenda',
      lastCleanedAt: new Date().toISOString()
    };

    onUpdateRooms(rooms.map(r => r.id === room.id ? updatedRoom : r));
    if (activeChecklistRoom?.id === room.id) {
      setActiveChecklistRoom(updatedRoom);
    }
  };

  // CSV Export & Import
  const handleExportCsv = () => {
    const csv = accommodationToCSV(rooms);
    downloadCSV(csv, '4_accommodation_rooms_housekeeping.csv');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const parsed = parseAccommodationCSV(text);
      if (parsed.length > 0) {
        if (confirm(`Import ${parsed.length} accommodation rooms from CSV? Click OK to replace or Cancel to append.`)) {
          onUpdateRooms(parsed);
        } else {
          onUpdateRooms([...parsed, ...rooms]);
        }
      } else {
        alert('Could not find valid room rows in uploaded CSV.');
      }
    };
    reader.readAsText(file);
  };

  // Save room edit / allocation
  const handleSaveRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomFormData.roomNumber) return;

    if (editingRoom) {
      onUpdateRooms(rooms.map(r => r.id === editingRoom.id ? { ...r, ...roomFormData } as AccommodationRoom : r));
    } else {
      const newRoom: AccommodationRoom = {
        id: `room-${Date.now()}`,
        roomNumber: roomFormData.roomNumber!,
        roomName: roomFormData.roomName || 'Estate Room',
        roomType: roomFormData.roomType || 'Executive King',
        wing: roomFormData.wing || 'Main Hotel',
        bedConfiguration: roomFormData.bedConfiguration || '1 King Bed',
        maxOccupancy: roomFormData.maxOccupancy || 2,
        nightlyRate: roomFormData.nightlyRate || 1800,
        allocationStatus: roomFormData.allocatedGuestName ? 'Allocated' : 'Vacant',
        allocatedGuestId: roomFormData.allocatedGuestId || null,
        allocatedGuestName: roomFormData.allocatedGuestName || null,
        allocatedGuestOrg: roomFormData.allocatedGuestOrg || null,
        checkInDate: roomFormData.checkInDate || '',
        checkOutDate: roomFormData.checkOutDate || '',
        totalNights: roomFormData.totalNights || 2,
        specialRequests: roomFormData.specialRequests || '',
        housekeepingStatus: roomFormData.housekeepingStatus || 'Needs Cleaning',
        housekeepingAttendant: roomFormData.housekeepingAttendant || 'Nomvula Sithole',
        inspectionSignOff: false,
        inspectedBy: null,
        checklist: {
          linenChanged: false,
          bathroomSanitized: false,
          toiletriesStocked: false,
          teaCoffeeReplenished: false,
          hvacFireplaceChecked: false,
          welcomePackPlaced: false,
          keysTested: false,
          minibarRestocked: false,
          supervisorInspection: false
        },
        lastCleanedAt: null,
        notes: roomFormData.notes || ''
      };
      onUpdateRooms([newRoom, ...rooms]);
    }

    setIsRoomModalOpen(false);
    setEditingRoom(null);
  };

  const handleDeallocateGuest = (room: AccommodationRoom) => {
    if (confirm(`Remove guest allocation from ${room.roomNumber}?`)) {
      onUpdateRooms(rooms.map(r => r.id === room.id ? {
        ...r,
        allocationStatus: 'Vacant',
        allocatedGuestId: null,
        allocatedGuestName: null,
        allocatedGuestOrg: null,
        checkInDate: '',
        checkOutDate: '',
        totalNights: 0,
        specialRequests: ''
      } : r));
    }
  };

  const handleResetToSample = () => {
    if (confirm('Reset to standard Rawdons Estate accommodation inventory?')) {
      onUpdateRooms(INITIAL_ACCOMMODATION_ROOMS);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* 1. Overview KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Rooms & Occupancy */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase">
            <span>Accommodation Occupancy</span>
            <Bed className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">{occupancyPct}%</span>
            <span className="text-xs text-slate-400">({allocatedRooms}/{totalRooms} allocated)</span>
          </div>
          <div className="mt-2 w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
            <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${occupancyPct}%` }} />
          </div>
          <div className="mt-2 text-xs text-slate-500 flex justify-between">
            <span>Vacant Inventory:</span>
            <span className="font-semibold text-emerald-600">{vacantRooms} rooms ready</span>
          </div>
        </div>

        {/* Housekeeping Readiness */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase">
            <span>Housekeeping Status</span>
            <Sparkles className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-600">{readyRooms}</span>
            <span className="text-xs text-slate-400">of {totalRooms} Inspected & Ready</span>
          </div>
          <div className="mt-2 w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${totalRooms > 0 ? (readyRooms / totalRooms) * 100 : 0}%` }} />
          </div>
          <div className="mt-2 text-xs text-slate-500 flex justify-between">
            <span>Cleaning Required:</span>
            <span className="font-semibold text-amber-600">{cleaningPending} rooms in turnover</span>
          </div>
        </div>

        {/* Accommodation Revenue in ZAR */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase">
            <span>Accommodation Total (ZAR)</span>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-950 px-1.5 py-0.2 rounded">ZAR</span>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white font-mono mt-1">
            {formatZAR(totalAccommodationRevenue)}
          </p>
          <span className="text-xs text-slate-500 mt-2 block">
            Across {allocatedRooms} allocated delegate & VIP bookings
          </span>
        </div>

        {/* Estate Wings & Quality */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase">
            <span>Estate Wings / Blocks</span>
            <Home className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {wings.length} Wings
          </p>
          <div className="text-[11px] text-slate-400 mt-2 truncate">
            {wings.join(', ')}
          </div>
        </div>

      </div>

      {/* 2. Controls Toolbar & Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs overflow-hidden">
        
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search room #, room name, wing, allocated guest..."
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
              value={wingFilter}
              onChange={e => setWingFilter(e.target.value)}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200"
            >
              <option value="">All Wings / Blocks</option>
              {wings.map(w => <option key={w} value={w}>{w}</option>)}
            </select>

            <select
              value={housekeepingFilter}
              onChange={e => setHousekeepingFilter(e.target.value)}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200"
            >
              <option value="">All Housekeeping Statuses</option>
              <option value="Clean & Inspected">Clean & Inspected (Arrival Ready)</option>
              <option value="In Progress">In Progress</option>
              <option value="Needs Cleaning">Needs Cleaning / Turnover</option>
              <option value="Maintenance Issue">Maintenance Issue</option>
            </select>

            <select
              value={allocationFilter}
              onChange={e => setAllocationFilter(e.target.value)}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200"
            >
              <option value="">All Allocations</option>
              <option value="Allocated">Allocated</option>
              <option value="Vacant">Vacant</option>
              <option value="Checked-In">Checked-In</option>
              <option value="Blocked / Maintenance">Blocked</option>
            </select>

            <button
              onClick={handleExportCsv}
              className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-1.5 text-slate-700 dark:text-slate-200"
              title="Download accommodation & housekeeping spreadsheet"
            >
              <Download className="w-3.5 h-3.5 text-indigo-500" />
              <span>Export CSV</span>
            </button>

            <label className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-200">
              <Upload className="w-3.5 h-3.5 text-indigo-500" />
              <span>Import CSV</span>
              <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
            </label>

            <button
              onClick={() => {
                setEditingRoom(null);
                setRoomFormData({
                  roomNumber: `Room ${200 + rooms.length + 1}`,
                  roomName: 'Garden Deluxe',
                  roomType: 'Executive King',
                  wing: 'Garden Wing',
                  bedConfiguration: '1 King Bed',
                  maxOccupancy: 2,
                  nightlyRate: 1950,
                  allocationStatus: 'Vacant',
                  allocatedGuestName: '',
                  allocatedGuestOrg: '',
                  checkInDate: '2025-09-18',
                  checkOutDate: '2025-09-20',
                  totalNights: 2,
                  specialRequests: '',
                  housekeepingStatus: 'Needs Cleaning',
                  housekeepingAttendant: 'Nomvula Sithole',
                  notes: ''
                });
                setIsRoomModalOpen(true);
              }}
              className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add Room</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto min-h-[350px]">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 uppercase text-[10px] font-semibold border-b border-slate-200 dark:border-slate-700 tracking-wider">
                <th className="py-3 px-3">Room # & Wing</th>
                <th className="py-3 px-3">Type & Bed Setup</th>
                <th className="py-3 px-3 text-right">Nightly Rate (ZAR)</th>
                <th className="py-3 px-3">Allocation Status</th>
                <th className="py-3 px-4">Assigned Guest / Delegate</th>
                <th className="py-3 px-3">Dates & Nights</th>
                <th className="py-3 px-3">Housekeeping Cleaning Status</th>
                <th className="py-3 px-3 text-center">Preparation Checklist</th>
                <th className="py-3 px-3 text-center w-24">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700 font-medium">
              {filteredRooms.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    No accommodation rooms match your filters.
                  </td>
                </tr>
              ) : (
                filteredRooms.map(r => {
                  const checklistDoneCount = Object.values(r.checklist).filter(Boolean).length;
                  const totalChecklist = Object.keys(r.checklist).length;
                  const isReady = r.housekeepingStatus === 'Clean & Inspected';

                  return (
                    <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-750">
                      
                      {/* Room & Wing */}
                      <td className="py-3 px-3">
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white block text-sm">{r.roomNumber}</span>
                          <span className="text-[11px] text-slate-500 flex items-center gap-1">
                            <Home className="w-3 h-3 text-slate-400" />
                            {r.wing} &bull; {r.roomName}
                          </span>
                        </div>
                      </td>

                      {/* Type & Bed */}
                      <td className="py-3 px-3">
                        <div>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                            {r.roomType}
                          </span>
                          <span className="text-[11px] text-slate-400 block mt-0.5">
                            {r.bedConfiguration} (Max {r.maxOccupancy})
                          </span>
                        </div>
                      </td>

                      {/* Rate */}
                      <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                        {formatZAR(r.nightlyRate)}
                      </td>

                      {/* Allocation Status */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase ${
                          r.allocationStatus === 'Allocated' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' :
                          r.allocationStatus === 'Checked-In' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                          r.allocationStatus === 'Vacant' ? 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300' :
                          'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        }`}>
                          {r.allocationStatus}
                        </span>
                      </td>

                      {/* Guest Details */}
                      <td className="py-3 px-4">
                        {r.allocatedGuestName ? (
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white block">{r.allocatedGuestName}</span>
                            <span className="text-[11px] text-slate-400">{r.allocatedGuestOrg}</span>
                            {r.specialRequests && (
                              <span className="text-[10px] text-amber-600 block mt-0.5 italic">
                                Req: {r.specialRequests}
                              </span>
                            )}
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setEditingRoom(r);
                              setRoomFormData({ ...r, checkInDate: '2025-09-18', checkOutDate: '2025-09-20', totalNights: 2 });
                              setIsRoomModalOpen(true);
                            }}
                            className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline font-semibold flex items-center gap-1"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Allocate Guest</span>
                          </button>
                        )}
                      </td>

                      {/* Dates & Nights */}
                      <td className="py-3 px-3 whitespace-nowrap text-slate-600 dark:text-slate-300">
                        {r.checkInDate ? (
                          <div>
                            <span className="block font-medium">{r.checkInDate} &rarr; {r.checkOutDate}</span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {r.totalNights} nights ({formatZAR(r.nightlyRate * r.totalNights)})
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Unbooked</span>
                        )}
                      </td>

                      {/* Housekeeping Status */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div>
                          <span className={`text-[10px] px-2 py-0.5 rounded font-bold border flex items-center gap-1 w-max ${
                            isReady ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            r.housekeepingStatus === 'In Progress' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                            r.housekeepingStatus === 'Maintenance Issue' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                            'bg-slate-100 text-slate-700 border-slate-200'
                          }`}>
                            {isReady ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <Clock className="w-3 h-3 text-amber-600" />}
                            <span>{r.housekeepingStatus}</span>
                          </span>
                          <span className="text-[10px] text-slate-400 block mt-0.5">
                            Attendant: {r.housekeepingAttendant}
                          </span>
                        </div>
                      </td>

                      {/* Housekeeping Checklist Progress & Button */}
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <div className="flex flex-col items-center gap-1">
                          <button
                            onClick={() => setActiveChecklistRoom(r)}
                            className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 border border-indigo-200 dark:border-indigo-800 text-[11px] font-semibold flex items-center gap-1 transition"
                          >
                            <CheckSquare className="w-3.5 h-3.5 text-indigo-500" />
                            <span>Checklist ({checklistDoneCount}/{totalChecklist})</span>
                          </button>

                          {!isReady && (
                            <button
                              onClick={() => handleMarkAllClean(r)}
                              className="text-[10px] text-emerald-600 hover:underline font-bold"
                            >
                              Quick Pass All
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => {
                              setEditingRoom(r);
                              setRoomFormData({ ...r });
                              setIsRoomModalOpen(true);
                            }}
                            className="p-1 text-slate-400 hover:text-indigo-600 transition"
                            title="Edit room / allocation"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {r.allocatedGuestName && (
                            <button
                              onClick={() => handleDeallocateGuest(r)}
                              className="p-1 text-slate-400 hover:text-amber-600 transition"
                              title="Deallocate guest"
                            >
                              <UserCheck className="w-3.5 h-3.5" />
                            </button>
                          )}

                          <button
                            onClick={() => {
                              if (confirm(`Delete ${r.roomNumber}?`)) {
                                onUpdateRooms(rooms.filter(item => item.id !== r.id));
                              }
                            }}
                            className="p-1 text-slate-400 hover:text-rose-600 transition"
                            title="Delete room"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Housekeeping Preparation Checklist Modal */}
      {activeChecklistRoom && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Housekeeping Checklist: {activeChecklistRoom.roomNumber}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {activeChecklistRoom.wing} &bull; Attendant: {activeChecklistRoom.housekeepingAttendant}
                  </p>
                </div>
              </div>
              <button onClick={() => setActiveChecklistRoom(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Checklist Items */}
            <div className="py-4 space-y-2.5 text-xs">
              <div className="flex items-center justify-between pb-1">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Cleaning & Turn-down Protocol:</span>
                <button
                  type="button"
                  onClick={() => handleMarkAllClean(activeChecklistRoom)}
                  className="text-[11px] text-emerald-600 hover:underline font-bold"
                >
                  Mark All 9 Points Complete
                </button>
              </div>

              {[
                { key: 'linenChanged' as const, label: 'Fresh high-thread-count linen & pillowcases fitted' },
                { key: 'bathroomSanitized' as const, label: 'Bathroom fully disinfected & plush towels hung' },
                { key: 'toiletriesStocked' as const, label: 'Luxury hotel amenities & soaps replenished' },
                { key: 'teaCoffeeReplenished' as const, label: 'Rooibos, filter coffee, fresh milk & rusks stocked' },
                { key: 'hvacFireplaceChecked' as const, label: 'HVAC / heating inspected; fireplace prepped with dry logs' },
                { key: 'welcomePackPlaced' as const, label: 'Conference welcome badge & bottled mountain spring water placed' },
                { key: 'keysTested' as const, label: 'Electronic key card / physical brass room key verified' },
                { key: 'minibarRestocked' as const, label: 'Mini-fridge inspected, stocked and cold' },
                { key: 'supervisorInspection' as const, label: 'Executive Housekeeper inspection & arrival sign-off' }
              ].map(item => {
                const isChecked = activeChecklistRoom.checklist[item.key];
                return (
                  <div
                    key={item.key}
                    onClick={() => handleToggleChecklistItem(activeChecklistRoom, item.key)}
                    className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                      isChecked 
                        ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200' 
                        : 'bg-slate-50 dark:bg-slate-750 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-indigo-300'
                    }`}
                  >
                    <span className="font-medium pr-2">{item.label}</span>
                    <div className="shrink-0">
                      {isChecked ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <div className="w-5 h-5 rounded-md border-2 border-slate-300 dark:border-slate-600" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer with status */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-400 block text-[10px]">Supervisor Sign-off:</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {activeChecklistRoom.inspectionSignOff ? 'Approved by Brenda (Head Housekeeper)' : 'Pending final check'}
                </span>
              </div>
              <button
                onClick={() => setActiveChecklistRoom(null)}
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Room Allocation / Edit Modal */}
      {isRoomModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Bed className="w-4 h-4 text-indigo-500" />
                <span>{editingRoom ? `Edit Room ${editingRoom.roomNumber} & Allocation` : 'Add New Accommodation Room'}</span>
              </h3>
              <button onClick={() => setIsRoomModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveRoom} className="space-y-4 text-xs pt-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Room Number *</label>
                  <input
                    type="text"
                    value={roomFormData.roomNumber || ''}
                    onChange={e => setRoomFormData({ ...roomFormData, roomNumber: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Room Name / Theme</label>
                  <input
                    type="text"
                    value={roomFormData.roomName || ''}
                    placeholder="e.g. Trout Cottage, Presidential Suite"
                    onChange={e => setRoomFormData({ ...roomFormData, roomName: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Room Type</label>
                  <select
                    value={roomFormData.roomType}
                    onChange={e => setRoomFormData({ ...roomFormData, roomType: e.target.value as RoomType })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700"
                  >
                    <option value="Luxury Suite">Luxury Suite</option>
                    <option value="Garden Cottage">Garden Cottage</option>
                    <option value="Executive King">Executive King</option>
                    <option value="Deluxe Twin">Deluxe Twin</option>
                    <option value="Standard Double">Standard Double</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Wing / Estate Block</label>
                  <input
                    type="text"
                    value={roomFormData.wing || ''}
                    placeholder="e.g. Manor House, Lake Cottages, Garden Wing"
                    onChange={e => setRoomFormData({ ...roomFormData, wing: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Bed Configuration</label>
                  <input
                    type="text"
                    value={roomFormData.bedConfiguration || ''}
                    placeholder="e.g. 1 King Bed, 2 Twin Beds"
                    onChange={e => setRoomFormData({ ...roomFormData, bedConfiguration: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Nightly Rate (ZAR / R)</label>
                  <input
                    type="number"
                    value={roomFormData.nightlyRate ?? 1800}
                    onChange={e => setRoomFormData({ ...roomFormData, nightlyRate: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 font-mono"
                  />
                </div>
              </div>

              {/* Guest Allocation Section */}
              <div className="bg-slate-50 dark:bg-slate-750 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                <span className="font-bold text-slate-800 dark:text-slate-200 block text-xs">
                  Guest Allocation & Dates
                </span>

                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="block font-semibold mb-1">Quick Select from Registered Conference Guests</label>
                    <select
                      value={roomFormData.allocatedGuestId || ''}
                      onChange={e => {
                        const sel = availableGuests.find(g => g.id === e.target.value);
                        if (sel) {
                          setRoomFormData({
                            ...roomFormData,
                            allocatedGuestId: sel.id,
                            allocatedGuestName: sel.fullName,
                            allocatedGuestOrg: sel.organization,
                            allocationStatus: 'Allocated'
                          });
                        } else {
                          setRoomFormData({
                            ...roomFormData,
                            allocatedGuestId: null,
                            allocatedGuestName: '',
                            allocatedGuestOrg: '',
                            allocationStatus: 'Vacant'
                          });
                        }
                      }}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700"
                    >
                      <option value="">-- Choose guest or type manually below --</option>
                      {availableGuests.map(g => (
                        <option key={g.id} value={g.id}>
                          {g.fullName} ({g.organization} - {g.ticketType})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">Guest Name</label>
                    <input
                      type="text"
                      value={roomFormData.allocatedGuestName || ''}
                      placeholder="e.g. Dr. Sipho Ndlovu"
                      onChange={e => setRoomFormData({ ...roomFormData, allocatedGuestName: e.target.value, allocationStatus: e.target.value ? 'Allocated' : 'Vacant' })}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">Guest Organization</label>
                    <input
                      type="text"
                      value={roomFormData.allocatedGuestOrg || ''}
                      placeholder="e.g. TechAfrica Holdings"
                      onChange={e => setRoomFormData({ ...roomFormData, allocatedGuestOrg: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">Check-In Date</label>
                    <input
                      type="date"
                      value={roomFormData.checkInDate || ''}
                      onChange={e => setRoomFormData({ ...roomFormData, checkInDate: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">Check-Out Date</label>
                    <input
                      type="date"
                      value={roomFormData.checkOutDate || ''}
                      onChange={e => setRoomFormData({ ...roomFormData, checkOutDate: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">Total Nights</label>
                    <input
                      type="number"
                      min="0"
                      value={roomFormData.totalNights ?? 2}
                      onChange={e => setRoomFormData({ ...roomFormData, totalNights: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">Housekeeping Attendant</label>
                    <input
                      type="text"
                      value={roomFormData.housekeepingAttendant || 'Nomvula Sithole'}
                      onChange={e => setRoomFormData({ ...roomFormData, housekeepingAttendant: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Special Room Requests & Preferences</label>
                  <input
                    type="text"
                    placeholder="e.g. Quiet wing requested, extra feather-free pillows, ground floor"
                    value={roomFormData.specialRequests || ''}
                    onChange={e => setRoomFormData({ ...roomFormData, specialRequests: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setIsRoomModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold flex items-center gap-1.5"
                >
                  <CheckSquare className="w-4 h-4" />
                  <span>Save Room & Allocation</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
