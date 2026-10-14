import React, { useState } from 'react';
import { 
  Printer, 
  CheckSquare, 
  Square, 
  RotateCcw, 
  Sparkles, 
  Bed, 
  UtensilsCrossed, 
  Radio, 
  Star, 
  AlertCircle, 
  Plus, 
  Calendar, 
  Clock, 
  User, 
  Building2, 
  CheckCircle2, 
  SlidersHorizontal,
  FileText,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { 
  AccommodationRoom, 
  ClientDetails, 
  ConferenceDetails, 
  GuestDetails, 
  MenuItemCosting 
} from '../types/conference';

interface PrintableChecklistsViewProps {
  conference: ConferenceDetails;
  client: ClientDetails;
  guests: GuestDetails[];
  rooms: AccommodationRoom[];
  menuItems: MenuItemCosting[];
}

type DepartmentKey = 'all' | 'housekeeping' | 'kitchen' | 'equipment' | 'special_requests';

interface CustomCheckItem {
  id: string;
  department: DepartmentKey;
  text: string;
  isCompleted: boolean;
}

export const PrintableChecklistsView: React.FC<PrintableChecklistsViewProps> = ({
  conference,
  client,
  guests,
  rooms,
  menuItems
}) => {
  const [activeDepartment, setActiveDepartment] = useState<DepartmentKey>('all');
  const [interactiveCompleted, setInteractiveCompleted] = useState<Record<string, boolean>>({});
  const [customItems, setCustomItems] = useState<CustomCheckItem[]>([]);
  const [newCustomText, setNewCustomText] = useState('');
  const [newCustomDept, setNewCustomDept] = useState<DepartmentKey>('housekeeping');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedMealSession, setSelectedMealSession] = useState<string>('all');
  const [selectedWing, setSelectedWing] = useState<string>('all');

  // Print current view
  const handlePrint = () => {
    window.print();
  };

  // Toggle item completion
  const toggleItem = (id: string) => {
    setInteractiveCompleted(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const isChecked = (id: string, defaultVal: boolean = false) => {
    if (interactiveCompleted[id] !== undefined) {
      return interactiveCompleted[id];
    }
    return defaultVal;
  };

  // Reset interactive checkmarks
  const handleResetChecks = () => {
    if (confirm('Reset all interactive check marks back to default?')) {
      setInteractiveCompleted({});
    }
  };

  // Add custom item
  const handleAddCustomItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomText.trim()) return;
    const newItem: CustomCheckItem = {
      id: `custom-${Date.now()}`,
      department: newCustomDept,
      text: newCustomText.trim(),
      isCompleted: false
    };
    setCustomItems(prev => [...prev, newItem]);
    setNewCustomText('');
    setShowAddModal(false);
  };

  // Extract distinct meal sessions
  const mealSessions = Array.from(new Set(menuItems.map(m => m.mealSession)));
  const wings = Array.from(new Set(rooms.map(r => r.wing)));

  // Dietary metrics for food prep
  const dietaryCounts = guests.reduce((acc, g) => {
    const diet = g.dietary || 'Standard / None';
    acc[diet] = (acc[diet] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const guestsWithAllergies = guests.filter(g => g.allergiesNotes && g.allergiesNotes.trim() !== '' && g.allergiesNotes !== 'None' && g.allergiesNotes !== 'N/A');
  const vipGuests = guests.filter(g => g.ticketType === 'VIP' || g.ticketType === 'Speaker');

  // Filtered rooms
  const displayRooms = rooms.filter(r => selectedWing === 'all' || r.wing === selectedWing);

  // Filtered menu items
  const displayMenu = menuItems.filter(m => selectedMealSession === 'all' || m.mealSession === selectedMealSession);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      
      {/* On-Screen Action Bar (Hidden when printing) */}
      <div className="no-print bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                Department Operations
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                Official Checklists
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Printer className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Printable Departmental Checklists
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Official audit and handoff check sheets for Housekeeping, Kitchen & Catering, AV/Technical, and VIP Protocol. Formatted for high-contrast A4 paper printing with supervisor sign-off blocks.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-3.5 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4 text-indigo-600" />
              <span>Add Custom Task</span>
            </button>

            <button
              onClick={handleResetChecks}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 transition"
              title="Reset checkmarks"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={handlePrint}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30 flex items-center gap-2 transition"
            >
              <Printer className="w-4 h-4" />
              <span>Print {activeDepartment === 'all' ? 'All Checklists' : 'Department Sheet'}</span>
            </button>
          </div>
        </div>

        {/* Department Switcher Tabs */}
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 overflow-x-auto">
          <button
            onClick={() => setActiveDepartment('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
              activeDepartment === 'all'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>All Departments (Master Packet)</span>
          </button>

          <button
            onClick={() => setActiveDepartment('housekeeping')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
              activeDepartment === 'housekeeping'
                ? 'bg-purple-600 text-white'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Bed className="w-3.5 h-3.5" />
            <span>1. Room Cleaning & Housekeeping</span>
          </button>

          <button
            onClick={() => setActiveDepartment('kitchen')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
              activeDepartment === 'kitchen'
                ? 'bg-amber-600 text-white'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <UtensilsCrossed className="w-3.5 h-3.5" />
            <span>2. Food Prep & Kitchen</span>
          </button>

          <button
            onClick={() => setActiveDepartment('equipment')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
              activeDepartment === 'equipment'
                ? 'bg-blue-600 text-white'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>3. Equipment, AV & Staging</span>
          </button>

          <button
            onClick={() => setActiveDepartment('special_requests')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
              activeDepartment === 'special_requests'
                ? 'bg-emerald-600 text-white'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Star className="w-3.5 h-3.5" />
            <span>4. Special Requests & VIP</span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 1. ROOM CLEANING & HOUSEKEEPING CHECKLIST SHEET */}
      {/* ======================================================== */}
      {(activeDepartment === 'all' || activeDepartment === 'housekeeping') && (
        <section className="bg-white text-slate-900 border border-slate-300 p-6 sm:p-8 rounded-xl shadow-xs print-avoid-break print:p-0 print:border-none print:shadow-none print-page-break">
          
          {/* Official Document Header */}
          <div className="border-b-2 border-slate-900 pb-4 mb-5 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <div className="text-xs uppercase tracking-widest font-bold text-purple-700">
                Departmental Operational Checklist &bull; Form HK-101
              </div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
                HOUSEKEEPING & ROOM CLEANING PREPARATION
              </h1>
              <div className="text-xs text-slate-600 mt-1 flex flex-wrap gap-x-4">
                <span><strong>Event:</strong> {conference.title}</span>
                <span><strong>Venue:</strong> {conference.venue}</span>
                <span><strong>Dates:</strong> {conference.startDate} &mdash; {conference.endDate}</span>
              </div>
            </div>

            <div className="text-right text-xs text-slate-700 shrink-0">
              <div><strong>Shift / Date:</strong> ________________________</div>
              <div className="mt-1"><strong>Head Housekeeper:</strong> Brenda M.</div>
              <div className="mt-1"><strong>Total Rooms Active:</strong> {rooms.length}</div>
            </div>
          </div>

          {/* Quick Filter (no-print) */}
          <div className="no-print mb-4 flex items-center justify-between gap-2 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            <div className="flex items-center gap-2">
              <span className="font-semibold">Filter Wing:</span>
              <select
                value={selectedWing}
                onChange={e => setSelectedWing(e.target.value)}
                className="bg-white border border-slate-300 rounded px-2 py-1 text-xs"
              >
                <option value="all">All Wings ({rooms.length} rooms)</option>
                {wings.map(w => (
                  <option key={w} value={w}>{w}</option>
                ))}
              </select>
            </div>
            <span className="text-[11px] text-slate-500">Tip: Click boxes to check off interactively before printing</span>
          </div>

          {/* Core Standard Operating Procedure (SOP) Items */}
          <div className="mb-5 bg-purple-50/60 print:bg-slate-50 p-3.5 rounded-lg border border-purple-200 print:border-slate-300">
            <h3 className="text-xs font-bold uppercase tracking-wider text-purple-900 print:text-slate-900 mb-2">
              Standard 9-Point Room Turnaround Inspection Criteria
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs">
              {[
                { id: 'hk-sop-1', label: '1. Fresh linen fitted & pillows fluffed' },
                { id: 'hk-sop-2', label: '2. Bathroom descaled & sanitized' },
                { id: 'hk-sop-3', label: '3. Luxury toiletries & towels restocked' },
                { id: 'hk-sop-4', label: '4. Tea, coffee, rooibos & kettle refilled' },
                { id: 'hk-sop-5', label: '5. Fireplace/HVAC tested & clean flue' },
                { id: 'hk-sop-6', label: '6. Conference welcome note placed' },
                { id: 'hk-sop-7', label: '7. Keycards tested on electronic lock' },
                { id: 'hk-sop-8', label: '8. Minibar inventory checked & chilled' },
                { id: 'hk-sop-9', label: '9. Final supervisor white-glove inspection' },
              ].map(item => (
                <label 
                  key={item.id}
                  onClick={() => toggleItem(item.id)}
                  className="flex items-center gap-2 cursor-pointer select-none text-slate-800"
                >
                  {isChecked(item.id, true) ? (
                    <CheckSquare className="w-4 h-4 text-purple-700 print:text-slate-900 shrink-0" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-400 print:text-slate-700 shrink-0" />
                  )}
                  <span>{item.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Master Room Table */}
          <table className="print-table w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-800 font-bold border-y-2 border-slate-900">
                <th className="py-2 px-2 w-16">Room #</th>
                <th className="py-2 px-2">Type & Wing</th>
                <th className="py-2 px-2">Assigned Guest</th>
                <th className="py-2 px-2">Attendant</th>
                <th className="py-2 px-2 text-center">Linen</th>
                <th className="py-2 px-2 text-center">Sanitize</th>
                <th className="py-2 px-2 text-center">Amenities</th>
                <th className="py-2 px-2 text-center">Tea/HVAC</th>
                <th className="py-2 px-2 text-center">Welcome</th>
                <th className="py-2 px-2">Special Notes</th>
                <th className="py-2 px-2 text-center w-20">Supervisor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-300">
              {displayRooms.map(r => {
                const isClean = r.housekeepingStatus === 'Clean & Inspected';
                return (
                  <tr key={r.id} className="hover:bg-slate-50">
                    <td className="py-2 px-2 font-bold text-slate-900">{r.roomNumber}</td>
                    <td className="py-2 px-2">
                      <div className="font-semibold text-slate-800">{r.roomName}</div>
                      <div className="text-[10px] text-slate-500">{r.wing} &bull; {r.bedConfiguration}</div>
                    </td>
                    <td className="py-2 px-2">
                      {r.allocatedGuestName ? (
                        <div>
                          <span className="font-bold text-indigo-900 print:text-slate-900">{r.allocatedGuestName}</span>
                          <span className="block text-[10px] text-slate-500">{r.allocatedGuestOrg}</span>
                        </div>
                      ) : (
                        <span className="italic text-slate-400">Vacant / Available</span>
                      )}
                    </td>
                    <td className="py-2 px-2">{r.housekeepingAttendant || 'Attendant'}</td>
                    <td className="py-2 px-2 text-center">
                      <input 
                        type="checkbox" 
                        defaultChecked={r.checklist.linenChanged} 
                        className="w-3.5 h-3.5 rounded text-purple-600 print:text-black cursor-pointer"
                      />
                    </td>
                    <td className="py-2 px-2 text-center">
                      <input 
                        type="checkbox" 
                        defaultChecked={r.checklist.bathroomSanitized} 
                        className="w-3.5 h-3.5 rounded text-purple-600 print:text-black cursor-pointer"
                      />
                    </td>
                    <td className="py-2 px-2 text-center">
                      <input 
                        type="checkbox" 
                        defaultChecked={r.checklist.toiletriesStocked} 
                        className="w-3.5 h-3.5 rounded text-purple-600 print:text-black cursor-pointer"
                      />
                    </td>
                    <td className="py-2 px-2 text-center">
                      <input 
                        type="checkbox" 
                        defaultChecked={r.checklist.hvacFireplaceChecked && r.checklist.teaCoffeeReplenished} 
                        className="w-3.5 h-3.5 rounded text-purple-600 print:text-black cursor-pointer"
                      />
                    </td>
                    <td className="py-2 px-2 text-center">
                      <input 
                        type="checkbox" 
                        defaultChecked={r.checklist.welcomePackPlaced} 
                        className="w-3.5 h-3.5 rounded text-purple-600 print:text-black cursor-pointer"
                      />
                    </td>
                    <td className="py-2 px-2 text-[11px] text-slate-600">
                      {r.specialRequests || r.notes || '&mdash;'}
                    </td>
                    <td className="py-2 px-2 text-center">
                      <div className="w-16 h-5 border-b border-slate-400 mx-auto text-[10px] text-slate-500 pt-0.5">
                        {isClean ? '✓ Pass' : ''}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Custom Added Tasks for Housekeeping */}
          {customItems.filter(i => i.department === 'housekeeping').length > 0 && (
            <div className="mt-4 pt-3 border-t border-slate-300">
              <h4 className="text-xs font-bold uppercase text-slate-700 mb-1">Additional Housekeeping Action Items:</h4>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {customItems.filter(i => i.department === 'housekeeping').map(item => (
                  <li key={item.id} className="flex items-center gap-2">
                    <Square className="w-3.5 h-3.5 text-slate-600" />
                    <span>{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Housekeeping Sign-off Footer */}
          <div className="mt-6 pt-4 border-t-2 border-slate-900 grid grid-cols-3 gap-6 text-xs text-slate-800">
            <div>
              <div className="font-bold">Housekeeping Attendant:</div>
              <div className="mt-6 border-b border-slate-400"></div>
              <div className="text-[10px] text-slate-500 mt-1">Signature & Date</div>
            </div>
            <div>
              <div className="font-bold">Floor Supervisor:</div>
              <div className="mt-6 border-b border-slate-400"></div>
              <div className="text-[10px] text-slate-500 mt-1">Signature & Time Inspected</div>
            </div>
            <div>
              <div className="font-bold">Front Desk Key Handover:</div>
              <div className="mt-6 border-b border-slate-400"></div>
              <div className="text-[10px] text-slate-500 mt-1">Reception Release Initial</div>
            </div>
          </div>
        </section>
      )}

      {/* ======================================================== */}
      {/* 2. FOOD PREPARATION & KITCHEN CATERING CHECKLIST */}
      {/* ======================================================== */}
      {(activeDepartment === 'all' || activeDepartment === 'kitchen') && (
        <section className="bg-white text-slate-900 border border-slate-300 p-6 sm:p-8 rounded-xl shadow-xs print-avoid-break print:p-0 print:border-none print:shadow-none print-page-break">
          
          {/* Header */}
          <div className="border-b-2 border-slate-900 pb-4 mb-5 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <div className="text-xs uppercase tracking-widest font-bold text-amber-700">
                Departmental Operational Checklist &bull; Form FB-202
              </div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
                KITCHEN & FOOD PREPARATION CATERING CHECKLIST
              </h1>
              <div className="text-xs text-slate-600 mt-1 flex flex-wrap gap-x-4">
                <span><strong>Event:</strong> {conference.title}</span>
                <span><strong>Guaranteed Attendees:</strong> {client.guaranteedAttendees || conference.expectedAttendees}</span>
                <span><strong>Venue Kitchen:</strong> {conference.venue} Main Banquet Kitchen</span>
              </div>
            </div>

            <div className="text-right text-xs text-slate-700 shrink-0">
              <div><strong>Service Date:</strong> ________________________</div>
              <div className="mt-1"><strong>Executive Chef:</strong> Chef Francois / Head Caterer</div>
              <div className="mt-1"><strong>Banquet Manager:</strong> David K.</div>
            </div>
          </div>

          {/* Meal Session Filter (no-print) */}
          <div className="no-print mb-4 flex items-center justify-between gap-2 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            <div className="flex items-center gap-2">
              <span className="font-semibold">Filter Meal Session:</span>
              <select
                value={selectedMealSession}
                onChange={e => setSelectedMealSession(e.target.value)}
                className="bg-white border border-slate-300 rounded px-2 py-1 text-xs"
              >
                <option value="all">All Meal Sessions ({menuItems.length} items)</option>
                {mealSessions.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <span className="text-[11px] text-slate-500">Official Kitchen & HACCP Compliance Sheet</span>
          </div>

          {/* CRITICAL DIETARY MATRIX - HIGHEST RISK FOR HOTEL & CATERING */}
          <div className="mb-5 bg-amber-50/70 print:bg-slate-50 p-4 rounded-xl border border-amber-300 print:border-slate-300">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-amber-950 print:text-slate-900 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-amber-600 print:text-slate-900" />
                Critical Dietary Requirements & Allergen Headcount Matrix
              </h3>
              <span className="text-[11px] font-bold text-amber-900 print:text-slate-700">
                Total Delegates: {guests.length} Registered
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="bg-white p-2 rounded border border-amber-200 print:border-slate-300">
                <div className="text-[10px] text-slate-500 uppercase font-semibold">Halaal Certified</div>
                <div className="text-lg font-black text-slate-900">{dietaryCounts['Halaal Certified'] || 0} plates</div>
              </div>

              <div className="bg-white p-2 rounded border border-amber-200 print:border-slate-300">
                <div className="text-[10px] text-slate-500 uppercase font-semibold">Vegetarian / Vegan</div>
                <div className="text-lg font-black text-slate-900">
                  {(dietaryCounts['Vegetarian'] || 0) + (dietaryCounts['Vegan'] || 0)} plates
                </div>
              </div>

              <div className="bg-white p-2 rounded border border-amber-200 print:border-slate-300">
                <div className="text-[10px] text-slate-500 uppercase font-semibold">Kosher Certified</div>
                <div className="text-lg font-black text-slate-900">{dietaryCounts['Kosher Certified'] || 0} plates</div>
              </div>

              <div className="bg-white p-2 rounded border border-amber-200 print:border-slate-300">
                <div className="text-[10px] text-slate-500 uppercase font-semibold">Gluten-Free / Diabetic</div>
                <div className="text-lg font-black text-slate-900">
                  {(dietaryCounts['Gluten-Free'] || 0) + (dietaryCounts['Diabetic Friendly'] || 0)} plates
                </div>
              </div>
            </div>

            {/* Specific Delegate Allergen Notices */}
            {guestsWithAllergies.length > 0 && (
              <div className="mt-3 pt-2.5 border-t border-amber-200 print:border-slate-300">
                <div className="text-[11px] font-bold text-red-900 print:text-slate-900 uppercase tracking-wider mb-1.5">
                  High-Risk Medical & Allergen Delegate Roster (Must Be Tagged on Plating Line):
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {guestsWithAllergies.map(g => (
                    <div key={g.id} className="bg-white p-2 rounded border border-red-200 print:border-slate-300 flex items-start gap-2">
                      <Square className="w-3.5 h-3.5 text-red-500 print:text-black shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold text-slate-900">
                          {g.fullName} &bull; Table {g.tableAssignment || 'TBD'}
                        </div>
                        <div className="text-[11px] text-red-700 print:text-slate-700 font-semibold">
                          Allergy: {g.allergiesNotes} ({g.dietary})
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Kitchen HACCP & Service Prep Checklist */}
          <div className="mb-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-2 border-b border-slate-300 pb-1">
              Food Safety & Service Timeline SOPs:
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {[
                { id: 'k-1', label: 'Separate Halaal preparation station sanitized with dedicated cutting boards & knives' },
                { id: 'k-2', label: 'Walk-in fridge temperatures verified (< 4°C recorded on temperature log)' },
                { id: 'k-3', label: 'Hot holding warming cabinets preheated to > 65°C prior to service' },
                { id: 'k-4', label: 'Canapés & cold starters plated 15 minutes prior to guest entry' },
                { id: 'k-5', label: 'Dietary plates covered with cloches and marked with table & delegate name' },
                { id: 'k-6', label: 'Waitstaff briefing completed regarding VIP tables & allergen delivery' },
                { id: 'k-7', label: 'Beverage stations, iced lemon water carafes, coffee urns filled & active' },
                { id: 'k-8', label: 'Back-of-house clean-down, compost sorting & dishwashing station primed' }
              ].map(item => (
                <label 
                  key={item.id}
                  onClick={() => toggleItem(item.id)}
                  className="flex items-start gap-2 cursor-pointer select-none text-slate-800 p-1.5 hover:bg-slate-50 rounded"
                >
                  {isChecked(item.id, true) ? (
                    <CheckSquare className="w-4 h-4 text-amber-700 print:text-slate-900 shrink-0 mt-0.5" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-400 print:text-slate-700 shrink-0 mt-0.5" />
                  )}
                  <span>{item.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Menu Items Table */}
          <table className="print-table w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-800 font-bold border-y-2 border-slate-900">
                <th className="py-2 px-2 w-28">Meal Session</th>
                <th className="py-2 px-2 w-20">Course</th>
                <th className="py-2 px-2">Menu Item Name</th>
                <th className="py-2 px-2">Dietary Category</th>
                <th className="py-2 px-2">Service Style</th>
                <th className="py-2 px-2 text-right">Headcount</th>
                <th className="py-2 px-2 text-center w-20">Plating Checked</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-300">
              {displayMenu.map(m => (
                <tr key={m.id} className="hover:bg-slate-50">
                  <td className="py-2 px-2 font-bold text-slate-800">{m.mealSession}</td>
                  <td className="py-2 px-2 font-semibold text-slate-600">{m.courseCategory}</td>
                  <td className="py-2 px-2">
                    <span className="font-bold text-slate-900">{m.itemName}</span>
                    {m.vendorNotes && <span className="block text-[10px] text-slate-500 italic">{m.vendorNotes}</span>}
                  </td>
                  <td className="py-2 px-2">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 border border-slate-300">
                      {m.dietaryClassification}
                    </span>
                  </td>
                  <td className="py-2 px-2 text-slate-600">{m.servingStyle}</td>
                  <td className="py-2 px-2 text-right font-bold text-slate-900">{m.expectedGuestCount}</td>
                  <td className="py-2 px-2 text-center">
                    <input type="checkbox" className="w-4 h-4 rounded text-amber-600 print:text-black cursor-pointer" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Sign-off Footer */}
          <div className="mt-6 pt-4 border-t-2 border-slate-900 grid grid-cols-3 gap-6 text-xs text-slate-800">
            <div>
              <div className="font-bold">Executive Chef / Head Cook:</div>
              <div className="mt-6 border-b border-slate-400"></div>
              <div className="text-[10px] text-slate-500 mt-1">Signature & Temperature Log Verified</div>
            </div>
            <div>
              <div className="font-bold">Banquet / Floor Manager:</div>
              <div className="mt-6 border-b border-slate-400"></div>
              <div className="text-[10px] text-slate-500 mt-1">Signature & Service Time Commenced</div>
            </div>
            <div>
              <div className="font-bold">Client / Event Lead Tasting Sign-off:</div>
              <div className="mt-6 border-b border-slate-400"></div>
              <div className="text-[10px] text-slate-500 mt-1">Presentation & Quality Approved</div>
            </div>
          </div>
        </section>
      )}

      {/* ======================================================== */}
      {/* 3. EQUIPMENT, AV & TECHNICAL SERVICES CHECKLIST */}
      {/* ======================================================== */}
      {(activeDepartment === 'all' || activeDepartment === 'equipment') && (
        <section className="bg-white text-slate-900 border border-slate-300 p-6 sm:p-8 rounded-xl shadow-xs print-avoid-break print:p-0 print:border-none print:shadow-none print-page-break">
          
          {/* Header */}
          <div className="border-b-2 border-slate-900 pb-4 mb-5 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <div className="text-xs uppercase tracking-widest font-bold text-blue-700">
                Departmental Operational Checklist &bull; Form AV-303
              </div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
                AV, STAGING & TECHNICAL EQUIPMENT CHECKLIST
              </h1>
              <div className="text-xs text-slate-600 mt-1 flex flex-wrap gap-x-4">
                <span><strong>Event:</strong> {conference.title}</span>
                <span><strong>Main Stage / Hall:</strong> {conference.venue} Main Auditorium</span>
                <span><strong>Expected Sessions:</strong> Keynotes, Panels, Breakouts</span>
              </div>
            </div>

            <div className="text-right text-xs text-slate-700 shrink-0">
              <div><strong>Tech Call Time:</strong> 06:30 AM</div>
              <div className="mt-1"><strong>Lead AV Engineer:</strong> Marcus Thorne</div>
              <div className="mt-1"><strong>Sound & Lighting:</strong> Staging Team South Africa</div>
            </div>
          </div>

          {/* Core Technical Systems Grid */}
          <div className="space-y-4 mb-5">
            
            {/* System 1: Projection & Display */}
            <div className="border border-slate-300 rounded-lg p-3.5 bg-slate-50/50">
              <h4 className="text-xs font-black uppercase text-blue-900 print:text-slate-900 mb-2 flex items-center justify-between">
                <span>1. Projection, Video & Presentation Systems</span>
                <span className="text-[10px] font-semibold text-slate-500">Test prior to 07:45 AM</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {[
                  { id: 'av-1', label: 'Main laser projector focused, 16:9 widescreen calibrated, backup lamp verified' },
                  { id: 'av-2', label: 'Master presentation laptop connected via HDMI switch with secondary backup laptop synced' },
                  { id: 'av-3', label: 'Wireless slide clicker tested across full stage with brand new AAA batteries fitted' },
                  { id: 'av-4', label: 'Keynote speakers confidence monitor (downstage timer & speaker notes view) online' },
                  { id: 'av-5', label: 'Digital speaker countdown timer programmed with session limits' }
                ].map(item => (
                  <label key={item.id} onClick={() => toggleItem(item.id)} className="flex items-start gap-2 cursor-pointer select-none">
                    {isChecked(item.id, true) ? <CheckSquare className="w-4 h-4 text-blue-700 print:text-slate-900 shrink-0 mt-0.5" /> : <Square className="w-4 h-4 text-slate-400 print:text-slate-700 shrink-0 mt-0.5" />}
                    <span>{item.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* System 2: Audio & Microphones */}
            <div className="border border-slate-300 rounded-lg p-3.5 bg-slate-50/50">
              <h4 className="text-xs font-black uppercase text-blue-900 print:text-slate-900 mb-2 flex items-center justify-between">
                <span>2. Audio Engineering, Microphones & Acoustic Coverage</span>
                <span className="text-[10px] font-semibold text-slate-500">Full Hall Sound Check</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {[
                  { id: 'av-6', label: 'Wireless lapel / lavalier mics (x2) frequencies set (no RF interference or dropouts)' },
                  { id: 'av-7', label: 'Handheld wireless roving audience mics (x4) tested with fresh rechargeable batteries' },
                  { id: 'av-8', label: 'Podium gooseneck condenser microphone gain & windscreen tested' },
                  { id: 'av-9', label: 'Line-array PA speakers & subwoofers balanced (no feedback loops at high gain)' },
                  { id: 'av-10', label: 'Stage foldback monitors active for speakers and panel discussion clarity' }
                ].map(item => (
                  <label key={item.id} onClick={() => toggleItem(item.id)} className="flex items-start gap-2 cursor-pointer select-none">
                    {isChecked(item.id, true) ? <CheckSquare className="w-4 h-4 text-blue-700 print:text-slate-900 shrink-0 mt-0.5" /> : <Square className="w-4 h-4 text-slate-400 print:text-slate-700 shrink-0 mt-0.5" />}
                    <span>{item.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* System 3: Power, Backup & Connectivity */}
            <div className="border border-slate-300 rounded-lg p-3.5 bg-slate-50/50">
              <h4 className="text-xs font-black uppercase text-blue-900 print:text-slate-900 mb-2 flex items-center justify-between">
                <span>3. Power Security, Wi-Fi & Safety Infrastructure</span>
                <span className="text-[10px] font-semibold text-slate-500">Zero Downtime Requirement</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {[
                  { id: 'av-11', label: 'Venue diesel generator tested under simulated load; fuel tank 100% full' },
                  { id: 'av-12', label: 'Online UPS batteries connected to sound mixer & master projector (15m buffer)' },
                  { id: 'av-13', label: 'Dedicated presenter Wi-Fi SSID isolated from general attendee Wi-Fi network' },
                  { id: 'av-14', label: 'High-speed speed test verified (> 100 Mbps download / 50 Mbps upload with LTE failover)' },
                  { id: 'av-15', label: 'All stage cables, power leads & XLR lines taped down with black/yellow gaffer tape' }
                ].map(item => (
                  <label key={item.id} onClick={() => toggleItem(item.id)} className="flex items-start gap-2 cursor-pointer select-none">
                    {isChecked(item.id, true) ? <CheckSquare className="w-4 h-4 text-blue-700 print:text-slate-900 shrink-0 mt-0.5" /> : <Square className="w-4 h-4 text-slate-400 print:text-slate-700 shrink-0 mt-0.5" />}
                    <span>{item.label}</span>
                  </label>
                ))}
              </div>
            </div>

          </div>

          {/* Technical Sign-off Footer */}
          <div className="mt-6 pt-4 border-t-2 border-slate-900 grid grid-cols-3 gap-6 text-xs text-slate-800">
            <div>
              <div className="font-bold">Lead AV / Sound Engineer:</div>
              <div className="mt-6 border-b border-slate-400"></div>
              <div className="text-[10px] text-slate-500 mt-1">Signature & Soundcheck Time</div>
            </div>
            <div>
              <div className="font-bold">Stage & Lighting Director:</div>
              <div className="mt-6 border-b border-slate-400"></div>
              <div className="text-[10px] text-slate-500 mt-1">Signature & Cue Line Clear</div>
            </div>
            <div>
              <div className="font-bold">Conference Operations Director:</div>
              <div className="mt-6 border-b border-slate-400"></div>
              <div className="text-[10px] text-slate-500 mt-1">Final Stage Handover Approved</div>
            </div>
          </div>
        </section>
      )}

      {/* ======================================================== */}
      {/* 4. SPECIAL REQUESTS & VIP PROTOCOL CHECKLIST */}
      {/* ======================================================== */}
      {(activeDepartment === 'all' || activeDepartment === 'special_requests') && (
        <section className="bg-white text-slate-900 border border-slate-300 p-6 sm:p-8 rounded-xl shadow-xs print-avoid-break print:p-0 print:border-none print:shadow-none print-page-break">
          
          {/* Header */}
          <div className="border-b-2 border-slate-900 pb-4 mb-5 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <div className="text-xs uppercase tracking-widest font-bold text-emerald-700">
                Departmental Operational Checklist &bull; Form PR-404
              </div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
                SPECIAL REQUESTS, VIP PROTOCOL & CLIENT CLAUSES
              </h1>
              <div className="text-xs text-slate-600 mt-1 flex flex-wrap gap-x-4">
                <span><strong>Client:</strong> {client.clientName || 'TechAfrica Holdings'}</span>
                <span><strong>Client Lead:</strong> {client.contactPerson} ({client.phone})</span>
                <span><strong>Contract Status:</strong> {client.status}</span>
              </div>
            </div>

            <div className="text-right text-xs text-slate-700 shrink-0">
              <div><strong>Protocol Lead:</strong> Elena R.</div>
              <div className="mt-1"><strong>VIP Count:</strong> {vipGuests.length} Dignitaries</div>
              <div className="mt-1"><strong>Event Date:</strong> {conference.startDate}</div>
            </div>
          </div>

          {/* Client Specific Contractual Clauses */}
          <div className="mb-5 bg-emerald-50/70 print:bg-slate-50 p-4 rounded-xl border border-emerald-300 print:border-slate-300">
            <h3 className="text-xs font-black uppercase tracking-wider text-emerald-950 print:text-slate-900 mb-2 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 print:text-slate-900" />
              Client Contractual Agreements & Binding Clauses
            </h3>
            
            <p className="text-xs text-slate-700 italic mb-3 bg-white p-2.5 rounded border border-emerald-200 print:border-slate-300">
              &ldquo;{client.specialClauses || 'Exclusive venue access from 06:00 on Day 1; high-speed fiber internet backup connection; dedicated prayer and reflection room; halaal certified kitchen isolation.'}&rdquo;
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {[
                { id: 'spec-1', label: 'Venue doors unlocked at 06:00 AM sharp for vendor and client production load-in' },
                { id: 'spec-2', label: 'Dedicated quiet prayer & reflection room unlocked, carpeted with directional signage' },
                { id: 'spec-3', label: 'Direct high-speed backup fiber circuit verified with IT facility manager' },
                { id: 'spec-4', label: 'Halaal kitchen certificate displayed and sealed prep space inspected' },
                { id: 'spec-5', label: 'Client VIP suite / green room prepared with fresh fruit, espresso & private restroom' },
                { id: 'spec-6', label: 'Wheelchair access ramp & accessibility elevators verified unobstructed' }
              ].map(item => (
                <label key={item.id} onClick={() => toggleItem(item.id)} className="flex items-start gap-2 cursor-pointer select-none">
                  {isChecked(item.id, true) ? <CheckSquare className="w-4 h-4 text-emerald-700 print:text-slate-900 shrink-0 mt-0.5" /> : <Square className="w-4 h-4 text-slate-400 print:text-slate-700 shrink-0 mt-0.5" />}
                  <span>{item.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* VIP Dignitaries & Protocol Roster */}
          <div className="mb-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-2 border-b border-slate-300 pb-1">
              VIP Delegates, Keynotes & Special Accommodations Roster:
            </h3>
            <table className="print-table w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-800 font-bold border-y-2 border-slate-900">
                  <th className="py-2 px-2">Ticket / ID</th>
                  <th className="py-2 px-2">VIP Full Name</th>
                  <th className="py-2 px-2">Organization & Title</th>
                  <th className="py-2 px-2">Special Needs / Requests</th>
                  <th className="py-2 px-2">Table Seating</th>
                  <th className="py-2 px-2 text-center w-24">Arrival Checked</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300">
                {vipGuests.map(g => (
                  <tr key={g.id} className="hover:bg-slate-50">
                    <td className="py-2 px-2 font-mono text-slate-600">{g.ticketNumber}</td>
                    <td className="py-2 px-2">
                      <span className="font-bold text-slate-900">{g.fullName}</span>
                      <span className="ml-1 px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                        {g.ticketType}
                      </span>
                    </td>
                    <td className="py-2 px-2 text-slate-700">{g.jobTitle}, {g.organization}</td>
                    <td className="py-2 px-2 text-slate-600">
                      {g.dietary !== 'Standard / None' ? `Diet: ${g.dietary}. ` : ''}
                      {g.allergiesNotes || g.notes || 'VIP Front Row Seating'}
                    </td>
                    <td className="py-2 px-2 font-bold text-slate-900">Table {g.tableAssignment || 'VIP 1'}</td>
                    <td className="py-2 px-2 text-center">
                      <input type="checkbox" className="w-4 h-4 rounded text-emerald-600 print:text-black cursor-pointer" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Protocol Sign-off Footer */}
          <div className="mt-6 pt-4 border-t-2 border-slate-900 grid grid-cols-3 gap-6 text-xs text-slate-800">
            <div>
              <div className="font-bold">Protocol & VIP Coordinator:</div>
              <div className="mt-6 border-b border-slate-400"></div>
              <div className="text-[10px] text-slate-500 mt-1">Signature & Dignitary Arrival Time</div>
            </div>
            <div>
              <div className="font-bold">Client Liaison Representative:</div>
              <div className="mt-6 border-b border-slate-400"></div>
              <div className="text-[10px] text-slate-500 mt-1">TechAfrica Client Sign-off</div>
            </div>
            <div>
              <div className="font-bold">Venue General Manager:</div>
              <div className="mt-6 border-b border-slate-400"></div>
              <div className="text-[10px] text-slate-500 mt-1">Executive Facility Sign-off</div>
            </div>
          </div>
        </section>
      )}

      {/* ======================================================== */}
      {/* MODAL: ADD CUSTOM TASK TO DEPARTMENT CHECKLIST */}
      {/* ======================================================== */}
      {showAddModal && (
        <div className="no-print fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3">
              Add Custom Operational Item
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Add a specialized check item that will appear on the printed checklist for the selected department.
            </p>

            <form onSubmit={handleAddCustomItem} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Department
                </label>
                <select
                  value={newCustomDept}
                  onChange={e => setNewCustomDept(e.target.value as DepartmentKey)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs"
                >
                  <option value="housekeeping">1. Room Cleaning & Housekeeping</option>
                  <option value="kitchen">2. Food Prep & Kitchen Catering</option>
                  <option value="equipment">3. Equipment, AV & Technical Services</option>
                  <option value="special_requests">4. Special Requests & VIP Protocol</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Checklist Item Description
                </label>
                <textarea
                  rows={3}
                  value={newCustomText}
                  onChange={e => setNewCustomText(e.target.value)}
                  placeholder="e.g. Ensure extra vegan canapés for speaker VIP lounge..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500"
                >
                  Add Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
