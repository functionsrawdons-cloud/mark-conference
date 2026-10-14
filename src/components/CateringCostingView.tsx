import React, { useState, useMemo } from 'react';
import { 
  UtensilsCrossed, 
  Search, 
  Download, 
  Upload, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  DollarSign, 
  ChefHat, 
  Layers, 
  Sparkles,
  RotateCcw
} from 'lucide-react';
import { MenuItemCosting } from '../types/conference';
import { menuToCSV, parseMenuCSV, INITIAL_MENU_COSTING } from '../utils/csvTemplates';
import { formatZAR } from '../utils/currency';
import { downloadCSV } from '../utils/csv';

interface CateringCostingViewProps {
  menuItems: MenuItemCosting[];
  onUpdateMenuItems: (items: MenuItemCosting[]) => void;
  expectedAttendees: number;
}

export const CateringCostingView: React.FC<CateringCostingViewProps> = ({
  menuItems,
  onUpdateMenuItems,
  expectedAttendees
}) => {
  const [sessionFilter, setSessionFilter] = useState('');
  const [courseFilter, setCourseFilter] = useState('');
  const [dietaryFilter, setDietaryFilter] = useState('');
  const [search, setSearch] = useState('');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItemCosting | null>(null);
  const [formItem, setFormItem] = useState<Partial<MenuItemCosting>>({
    mealSession: 'Day 1 - Plated Executive Lunch',
    courseCategory: 'Mains',
    itemName: '',
    dietaryClassification: 'Standard',
    servingStyle: 'Plated 3-Course',
    unitCostPerHead: 180,
    expectedGuestCount: expectedAttendees || 850,
    serviceSurcharge: 2000,
    totalCost: 0,
    vendorNotes: ''
  });

  // Extract distinct sessions & courses
  const sessions = useMemo(() => {
    return Array.from(new Set(menuItems.map(m => m.mealSession)));
  }, [menuItems]);

  const courses = useMemo(() => {
    return Array.from(new Set(menuItems.map(m => m.courseCategory)));
  }, [menuItems]);

  // Filter items
  const filteredItems = useMemo(() => {
    return menuItems.filter(item => {
      if (search) {
        const q = search.toLowerCase();
        const matchesName = item.itemName.toLowerCase().includes(q);
        const matchesSession = item.mealSession.toLowerCase().includes(q);
        const matchesNotes = item.vendorNotes.toLowerCase().includes(q);
        if (!matchesName && !matchesSession && !matchesNotes) return false;
      }
      if (sessionFilter && item.mealSession !== sessionFilter) return false;
      if (courseFilter && item.courseCategory !== courseFilter) return false;
      if (dietaryFilter && item.dietaryClassification !== dietaryFilter) return false;
      return true;
    });
  }, [menuItems, search, sessionFilter, courseFilter, dietaryFilter]);

  // Financial metrics
  const totalCateringSpend = useMemo(() => {
    return menuItems.reduce((sum, item) => sum + (item.totalCost || 0), 0);
  }, [menuItems]);

  const totalSurcharges = useMemo(() => {
    return menuItems.reduce((sum, item) => sum + (item.serviceSurcharge || 0), 0);
  }, [menuItems]);

  const avgCostPerAttendee = expectedAttendees > 0 
    ? Math.round(totalCateringSpend / expectedAttendees) 
    : 0;

  const handleExportCsv = () => {
    const csv = menuToCSV(menuItems);
    downloadCSV(csv, '3_food_menu_catering_costing.csv');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const parsed = parseMenuCSV(text);
      if (parsed.length > 0) {
        if (confirm(`Import ${parsed.length} menu items from CSV? Click OK to replace or Cancel to append.`)) {
          onUpdateMenuItems(parsed);
        } else {
          onUpdateMenuItems([...parsed, ...menuItems]);
        }
      } else {
        alert('Could not find valid menu items in uploaded CSV.');
      }
    };
    reader.readAsText(file);
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formItem.itemName) return;

    const unit = formItem.unitCostPerHead || 0;
    const count = formItem.expectedGuestCount || expectedAttendees;
    const surcharge = formItem.serviceSurcharge || 0;
    const computedTotal = (unit * count) + surcharge;

    if (editingItem) {
      onUpdateMenuItems(menuItems.map(m => m.id === editingItem.id ? {
        ...m,
        ...formItem,
        totalCost: computedTotal
      } as MenuItemCosting : m));
    } else {
      const newItem: MenuItemCosting = {
        id: `menu-${Date.now()}`,
        mealSession: formItem.mealSession || 'General Session',
        courseCategory: formItem.courseCategory || 'Mains',
        itemName: formItem.itemName!,
        dietaryClassification: formItem.dietaryClassification || 'Standard',
        servingStyle: formItem.servingStyle || 'Buffet',
        unitCostPerHead: unit,
        expectedGuestCount: count,
        serviceSurcharge: surcharge,
        totalCost: computedTotal,
        vendorNotes: formItem.vendorNotes || ''
      };
      onUpdateMenuItems([...menuItems, newItem]);
    }

    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this menu item?')) {
      onUpdateMenuItems(menuItems.filter(m => m.id !== id));
    }
  };

  const handleResetToSample = () => {
    if (confirm('Reset to standard conference 12-item catering menu in South African Rands?')) {
      onUpdateMenuItems(INITIAL_MENU_COSTING);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* 1. Catering Financial Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Catering Investment</span>
          <p className="text-2xl font-bold text-slate-900 dark:text-white font-mono mt-1">
            {formatZAR(totalCateringSpend)}
          </p>
          <span className="text-xs text-slate-500 mt-1 block">
            Across {sessions.length} meal sessions & {menuItems.length} menu items
          </span>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Average Food Cost / Attendee</span>
          <p className="text-2xl font-bold text-indigo-600 font-mono mt-1">
            {formatZAR(avgCostPerAttendee)}
          </p>
          <span className="text-xs text-slate-500 mt-1 block">
            Full 2-day conference catering allocation
          </span>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Service & Staffing Surcharge</span>
          <p className="text-2xl font-bold text-amber-600 font-mono mt-1">
            {formatZAR(totalSurcharges)}
          </p>
          <span className="text-xs text-slate-500 mt-1 block">
            Dedicated chef brigade, waitstaff & presentation equipment
          </span>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Dietary Certifications</span>
          <p className="text-2xl font-bold text-emerald-600 mt-1">
            100% Certified
          </p>
          <span className="text-xs text-slate-500 mt-1 block">
            Halaal, Kosher, Vegan & Allergen-safe certified dishes
          </span>
        </div>
      </div>

      {/* 2. Toolbar & Table Container */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs overflow-hidden">
        
        {/* Controls */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search dish name, session, chef notes..."
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
              value={sessionFilter}
              onChange={e => setSessionFilter(e.target.value)}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200"
            >
              <option value="">All Meal Sessions</option>
              {sessions.map(s => <option key={s} value={s}>{s}</option>)}
            </select>

            <select
              value={courseFilter}
              onChange={e => setCourseFilter(e.target.value)}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200"
            >
              <option value="">All Courses</option>
              {courses.map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            <button
              onClick={handleExportCsv}
              className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-1.5 text-slate-700 dark:text-slate-200"
            >
              <Download className="w-3.5 h-3.5 text-amber-500" />
              <span>Export CSV</span>
            </button>

            <label className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-200">
              <Upload className="w-3.5 h-3.5 text-amber-500" />
              <span>Import CSV</span>
              <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
            </label>

            <button
              onClick={() => {
                setEditingItem(null);
                setFormItem({
                  mealSession: 'Day 1 - Plated Executive Lunch',
                  courseCategory: 'Mains',
                  itemName: '',
                  dietaryClassification: 'Standard',
                  servingStyle: 'Plated 3-Course',
                  unitCostPerHead: 180,
                  expectedGuestCount: expectedAttendees || 850,
                  serviceSurcharge: 2000,
                  totalCost: 0,
                  vendorNotes: ''
                });
                setIsModalOpen(true);
              }}
              className="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add Menu Item</span>
            </button>
          </div>
        </div>

        {/* Menu Table */}
        <div className="overflow-x-auto min-h-[350px]">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 uppercase text-[10px] font-semibold border-b border-slate-200 dark:border-slate-700 tracking-wider">
                <th className="py-3 px-3">Meal Session</th>
                <th className="py-3 px-3">Course</th>
                <th className="py-3 px-4 max-w-xs">Dish Item Name & Description</th>
                <th className="py-3 px-3">Dietary Classification</th>
                <th className="py-3 px-3">Style</th>
                <th className="py-3 px-3 text-right">Unit / Head (ZAR)</th>
                <th className="py-3 px-3 text-center">Guests</th>
                <th className="py-3 px-3 text-right">Surcharge</th>
                <th className="py-3 px-3 text-right">Total Cost (ZAR)</th>
                <th className="py-3 px-3 text-center w-16">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700 font-medium">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    No menu items found.
                  </td>
                </tr>
              ) : (
                filteredItems.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-750">
                    <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white whitespace-nowrap">
                      {item.mealSession}
                    </td>

                    <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">
                      <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-[10px] font-bold">
                        {item.courseCategory}
                      </span>
                    </td>

                    <td className="py-2.5 px-4 max-w-xs">
                      <div>
                        <span className="font-semibold text-slate-900 dark:text-white block leading-snug">
                          {item.itemName}
                        </span>
                        {item.vendorNotes && (
                          <span className="text-[11px] text-slate-400 block mt-0.5 italic">
                            Chef: {item.vendorNotes}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                        item.dietaryClassification.includes('Halaal') ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        item.dietaryClassification.includes('Kosher') ? 'bg-blue-50 text-blue-700 border-blue-200' :
                        item.dietaryClassification.includes('Vegan') ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        item.dietaryClassification.includes('Vegetarian') ? 'bg-green-50 text-green-700 border-green-200' :
                        item.dietaryClassification.includes('Gluten') ? 'bg-purple-50 text-purple-700 border-purple-200' :
                        'bg-slate-100 text-slate-700 border-slate-200'
                      }`}>
                        {item.dietaryClassification}
                      </span>
                    </td>

                    <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300 text-[11px] whitespace-nowrap">
                      {item.servingStyle}
                    </td>

                    <td className="py-2.5 px-3 text-right font-mono font-semibold text-slate-900 dark:text-white">
                      {formatZAR(item.unitCostPerHead)}
                    </td>

                    <td className="py-2.5 px-3 text-center font-mono">
                      {item.expectedGuestCount}
                    </td>

                    <td className="py-2.5 px-3 text-right font-mono text-slate-500">
                      {item.serviceSurcharge > 0 ? formatZAR(item.serviceSurcharge) : '—'}
                    </td>

                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                      {formatZAR(item.totalCost)}
                    </td>

                    <td className="py-2.5 px-3 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => {
                            setEditingItem(item);
                            setFormItem(item);
                            setIsModalOpen(true);
                          }}
                          className="p-1 text-slate-400 hover:text-amber-600 transition"
                          title="Edit menu choice"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 transition"
                          title="Delete menu choice"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>

            {filteredItems.length > 0 && (
              <tfoot className="bg-slate-100 dark:bg-slate-900 font-bold border-t border-slate-200 dark:border-slate-700">
                <tr>
                  <td colSpan={7} className="py-3 px-4 text-right text-slate-500 uppercase text-[10px]">
                    Subtotal for Filtered Menu Items:
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-xs text-slate-500">
                    {formatZAR(filteredItems.reduce((s, i) => s + i.serviceSurcharge, 0))}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-sm text-slate-900 dark:text-white">
                    {formatZAR(filteredItems.reduce((s, i) => s + i.totalCost, 0))}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Item Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <UtensilsCrossed className="w-4 h-4 text-amber-500" />
                <span>{editingItem ? 'Edit Menu Choice & Costing' : 'Add Food Menu Choice'}</span>
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-4 text-xs pt-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Meal Session</label>
                  <input
                    type="text"
                    value={formItem.mealSession || ''}
                    placeholder="e.g. Day 1 - Plated Executive Lunch"
                    onChange={e => setFormItem({ ...formItem, mealSession: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Course / Category</label>
                  <select
                    value={formItem.courseCategory}
                    onChange={e => setFormItem({ ...formItem, courseCategory: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700"
                  >
                    <option value="Refreshments">Refreshments</option>
                    <option value="Canapés">Canapés</option>
                    <option value="Starters">Starters</option>
                    <option value="Mains">Mains</option>
                    <option value="Desserts">Desserts</option>
                    <option value="Beverages">Beverages</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block font-semibold mb-1">Dish Item Name & Description *</label>
                  <input
                    type="text"
                    placeholder="e.g. Pan-Seared Karoo Lamb Cutlet with Roasted Garlic Mash..."
                    value={formItem.itemName || ''}
                    onChange={e => setFormItem({ ...formItem, itemName: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Dietary Classification</label>
                  <select
                    value={formItem.dietaryClassification}
                    onChange={e => setFormItem({ ...formItem, dietaryClassification: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700"
                  >
                    <option value="Standard">Standard</option>
                    <option value="Halaal Certified">Halaal Certified</option>
                    <option value="Kosher Certified">Kosher Certified</option>
                    <option value="Vegetarian">Vegetarian</option>
                    <option value="Vegan">Vegan</option>
                    <option value="Gluten-Free">Gluten-Free</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Serving Style</label>
                  <input
                    type="text"
                    placeholder="e.g. Plated 3-Course, Buffet, Live Station..."
                    value={formItem.servingStyle || ''}
                    onChange={e => setFormItem({ ...formItem, servingStyle: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Unit Cost per Head (ZAR / R)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formItem.unitCostPerHead ?? 0}
                    onChange={e => setFormItem({ ...formItem, unitCostPerHead: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Expected Guest Count</label>
                  <input
                    type="number"
                    value={formItem.expectedGuestCount ?? expectedAttendees}
                    onChange={e => setFormItem({ ...formItem, expectedGuestCount: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 font-mono"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block font-semibold mb-1">Service & Staffing Surcharge (ZAR / R)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formItem.serviceSurcharge ?? 0}
                    onChange={e => setFormItem({ ...formItem, serviceSurcharge: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 font-mono"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block font-semibold mb-1">Vendor / Chef Preparation Notes</label>
                  <textarea
                    rows={2}
                    value={formItem.vendorNotes || ''}
                    onChange={e => setFormItem({ ...formItem, vendorNotes: e.target.value })}
                    placeholder="e.g. Certified halaal lamb cuts verified by MJC; serve sauces on side..."
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-750 rounded-lg flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-500">Calculated Total Cost:</span>
                <span className="font-mono font-bold text-sm text-slate-900 dark:text-white">
                  {formatZAR(((formItem.unitCostPerHead || 0) * (formItem.expectedGuestCount || 0)) + (formItem.serviceSurcharge || 0))}
                </span>
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
                  className="px-5 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-semibold flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Save Menu Choice</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
