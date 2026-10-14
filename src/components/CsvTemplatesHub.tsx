import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  Download, 
  Copy, 
  Check, 
  Building2, 
  Users, 
  UtensilsCrossed, 
  Bed,
  Sparkles,
  ExternalLink,
  Info
} from 'lucide-react';
import { 
  CLIENT_CSV_HEADERS, 
  clientToCSV, 
  INITIAL_CLIENT_DATA,
  GUEST_CSV_HEADERS, 
  guestsToCSV, 
  INITIAL_GUESTS_DATA,
  MENU_CSV_HEADERS, 
  menuToCSV, 
  INITIAL_MENU_COSTING,
  ACCOMMODATION_CSV_HEADERS,
  accommodationToCSV,
  INITIAL_ACCOMMODATION_ROOMS,
  STAFF_CSV_HEADERS,
  staffToCSV,
  INITIAL_STAFF_DATA
} from '../utils/csvTemplates';
import { downloadCSV } from '../utils/csv';

export const CsvTemplatesHub: React.FC = () => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeTemplate, setActiveTemplate] = useState<'client' | 'guests' | 'accommodation' | 'menu' | 'staff'>('client');

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // CSV Strings
  const clientSampleCsv = clientToCSV(INITIAL_CLIENT_DATA);
  const clientBlankCsv = CLIENT_CSV_HEADERS.join(',') + '\n';

  const guestsSampleCsv = guestsToCSV(INITIAL_GUESTS_DATA);
  const guestsBlankCsv = GUEST_CSV_HEADERS.join(',') + '\n';

  const menuSampleCsv = menuToCSV(INITIAL_MENU_COSTING);
  const menuBlankCsv = MENU_CSV_HEADERS.join(',') + '\n';

  const roomSampleCsv = accommodationToCSV(INITIAL_ACCOMMODATION_ROOMS);
  const roomBlankCsv = ACCOMMODATION_CSV_HEADERS.join(',') + '\n';

  const staffSampleCsv = staffToCSV(INITIAL_STAFF_DATA);
  const staffBlankCsv = STAFF_CSV_HEADERS.join(',') + '\n';

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      
      {/* Intro Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Rawdons Conference Standards
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                South African Rands (ZAR)
              </span>
            </div>
            <h2 className="text-xl font-bold tracking-tight">
              Conference Operations CSV Templates Hub
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Standardized, Excel & Google Sheets-ready CSV templates for Client Contract Details, Individual Guest Directories, Room Allocation & Housekeeping Checklists, and Catering Menu Costings.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                downloadCSV(clientSampleCsv, '1_conference_client_details_sample.csv');
                downloadCSV(guestsSampleCsv, '2_individual_guest_details_sample.csv');
                downloadCSV(roomSampleCsv, '3_accommodation_rooms_housekeeping_sample.csv');
                downloadCSV(menuSampleCsv, '4_food_menu_catering_costing_sample.csv');
                downloadCSV(staffSampleCsv, '5_staff_crew_roster_sample.csv');
              }}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 flex items-center gap-2 transition"
            >
              <Download className="w-4 h-4" />
              <span>Download All 5 Templates (.CSV)</span>
            </button>
          </div>
        </div>

        {/* 5 Template Selector Pills */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mt-6">
          <button
            onClick={() => setActiveTemplate('client')}
            className={`p-3 rounded-xl text-left border transition flex items-start gap-2.5 ${
              activeTemplate === 'client'
                ? 'bg-indigo-600/30 border-indigo-500 text-white shadow-sm ring-1 ring-indigo-500'
                : 'bg-slate-800/60 border-slate-700/80 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400 shrink-0">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold">1. Client</div>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Contract & ZAR cap
              </p>
            </div>
          </button>

          <button
            onClick={() => setActiveTemplate('guests')}
            className={`p-3 rounded-xl text-left border transition flex items-start gap-2.5 ${
              activeTemplate === 'guests'
                ? 'bg-indigo-600/30 border-indigo-500 text-white shadow-sm ring-1 ring-indigo-500'
                : 'bg-slate-800/60 border-slate-700/80 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <div className="p-2 rounded-lg bg-sky-500/20 text-sky-400 shrink-0">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold">2. Guests</div>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Dietary & seating
              </p>
            </div>
          </button>

          <button
            onClick={() => setActiveTemplate('accommodation')}
            className={`p-3 rounded-xl text-left border transition flex items-start gap-2.5 ${
              activeTemplate === 'accommodation'
                ? 'bg-indigo-600/30 border-indigo-500 text-white shadow-sm ring-1 ring-indigo-500'
                : 'bg-slate-800/60 border-slate-700/80 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 shrink-0">
              <Bed className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold">3. Rooms</div>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Cleaning checklist
              </p>
            </div>
          </button>

          <button
            onClick={() => setActiveTemplate('menu')}
            className={`p-3 rounded-xl text-left border transition flex items-start gap-2.5 ${
              activeTemplate === 'menu'
                ? 'bg-indigo-600/30 border-indigo-500 text-white shadow-sm ring-1 ring-indigo-500'
                : 'bg-slate-800/60 border-slate-700/80 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 shrink-0">
              <UtensilsCrossed className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold">4. Menu Cost</div>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Headcount & ZAR
              </p>
            </div>
          </button>

          <button
            onClick={() => setActiveTemplate('staff')}
            className={`p-3 rounded-xl text-left border transition flex items-start gap-2.5 ${
              activeTemplate === 'staff'
                ? 'bg-indigo-600/30 border-indigo-500 text-white shadow-sm ring-1 ring-indigo-500'
                : 'bg-slate-800/60 border-slate-700/80 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400 shrink-0">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold">5. Staff Roster</div>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Crew, shifts & rates
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* Template Detail: Client */}
      {activeTemplate === 'client' && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-700 gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Template 1: Conference Client Details (.CSV)
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                File format: <code className="bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded font-mono text-[11px]">conference_client_details.csv</code> &bull; 17 data columns
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => copyToClipboard(clientSampleCsv, 'client')}
                className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-700 transition flex items-center gap-1.5 text-slate-700 dark:text-slate-300"
              >
                {copiedKey === 'client' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'client' ? 'Copied CSV!' : 'Copy Sample CSV'}</span>
              </button>

              <button
                onClick={() => downloadCSV(clientBlankCsv, 'conference_client_details_blank_template.csv')}
                className="px-3 py-1.5 rounded-lg border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-xs font-semibold hover:bg-indigo-100 transition flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Blank CSV</span>
              </button>

              <button
                onClick={() => downloadCSV(clientSampleCsv, 'conference_client_details_sample.csv')}
                className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-xs transition flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Sample .CSV</span>
              </button>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">CSV Column Specifications</h4>
            <div className="flex flex-wrap gap-1.5">
              {CLIENT_CSV_HEADERS.map((h, i) => (
                <span key={i} className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-750 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-mono">
                  {i + 1}. {h}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">CSV Raw Preview</h4>
            <pre className="p-4 rounded-xl bg-slate-900 text-emerald-400 font-mono text-[11px] overflow-x-auto leading-relaxed border border-slate-800">
              {clientSampleCsv}
            </pre>
          </div>
        </div>
      )}

      {/* Template Detail: Guests */}
      {activeTemplate === 'guests' && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-700 gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-sky-600" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Template 2: Individual Guest Details (.CSV)
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                File format: <code className="bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded font-mono text-[11px]">individual_guest_details.csv</code> &bull; 13 columns with dietary & seating
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => copyToClipboard(guestsSampleCsv, 'guests')}
                className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-700 transition flex items-center gap-1.5 text-slate-700 dark:text-slate-300"
              >
                {copiedKey === 'guests' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'guests' ? 'Copied CSV!' : 'Copy Sample CSV'}</span>
              </button>

              <button
                onClick={() => downloadCSV(guestsBlankCsv, 'individual_guest_details_blank_template.csv')}
                className="px-3 py-1.5 rounded-lg border border-sky-200 dark:border-sky-800 bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-300 text-xs font-semibold hover:bg-sky-100 transition flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Blank CSV</span>
              </button>

              <button
                onClick={() => downloadCSV(guestsSampleCsv, 'individual_guest_details_sample.csv')}
                className="px-4 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-xs transition flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Sample .CSV</span>
              </button>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">CSV Column Specifications</h4>
            <div className="flex flex-wrap gap-1.5">
              {GUEST_CSV_HEADERS.map((h, i) => (
                <span key={i} className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-750 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-mono">
                  {i + 1}. {h}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">CSV Raw Preview</h4>
            <pre className="p-4 rounded-xl bg-slate-900 text-sky-400 font-mono text-[11px] overflow-x-auto leading-relaxed border border-slate-800 max-h-80">
              {guestsSampleCsv}
            </pre>
          </div>
        </div>
      )}

      {/* Template Detail: Accommodation & Housekeeping */}
      {activeTemplate === 'accommodation' && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-700 gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Bed className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Template 3: Accommodation Room Allocation & Housekeeping Checklist (.CSV)
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                File format: <code className="bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded font-mono text-[11px]">accommodation_rooms_housekeeping.csv</code> &bull; 17 data columns
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => copyToClipboard(roomSampleCsv, 'accommodation')}
                className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-700 transition flex items-center gap-1.5 text-slate-700 dark:text-slate-300"
              >
                {copiedKey === 'accommodation' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'accommodation' ? 'Copied CSV!' : 'Copy Sample CSV'}</span>
              </button>

              <button
                onClick={() => downloadCSV(roomBlankCsv, 'accommodation_rooms_housekeeping_blank_template.csv')}
                className="px-3 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-semibold hover:bg-emerald-100 transition flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Blank CSV</span>
              </button>

              <button
                onClick={() => downloadCSV(roomSampleCsv, 'accommodation_rooms_housekeeping_sample.csv')}
                className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs transition flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Sample .CSV</span>
              </button>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">CSV Column Specifications</h4>
            <div className="flex flex-wrap gap-1.5">
              {ACCOMMODATION_CSV_HEADERS.map((h, i) => (
                <span key={i} className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-750 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-mono">
                  {i + 1}. {h}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">CSV Raw Preview (Suites, Cottages, Rates in ZAR & Housekeeping Sign-Offs)</h4>
            <pre className="p-4 rounded-xl bg-slate-900 text-emerald-400 font-mono text-[11px] overflow-x-auto leading-relaxed border border-slate-800 max-h-80">
              {roomSampleCsv}
            </pre>
          </div>
        </div>
      )}

      {/* Template Detail: Menu Costing */}
      {activeTemplate === 'menu' && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-700 gap-3">
            <div>
              <div className="flex items-center gap-2">
                <UtensilsCrossed className="w-5 h-5 text-amber-600" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Template 4: Food Menu Choices & Catering Cost Breakdown (.CSV)
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                File format: <code className="bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded font-mono text-[11px]">food_menu_catering_costing.csv</code> &bull; 10 columns with per-head & session totals
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => copyToClipboard(menuSampleCsv, 'menu')}
                className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-700 transition flex items-center gap-1.5 text-slate-700 dark:text-slate-300"
              >
                {copiedKey === 'menu' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'menu' ? 'Copied CSV!' : 'Copy Sample CSV'}</span>
              </button>

              <button
                onClick={() => downloadCSV(menuBlankCsv, 'food_menu_catering_costing_blank_template.csv')}
                className="px-3 py-1.5 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 text-xs font-semibold hover:bg-amber-100 transition flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Blank CSV</span>
              </button>

              <button
                onClick={() => downloadCSV(menuSampleCsv, 'food_menu_catering_costing_sample.csv')}
                className="px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-xs transition flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Sample .CSV</span>
              </button>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">CSV Column Specifications</h4>
            <div className="flex flex-wrap gap-1.5">
              {MENU_CSV_HEADERS.map((h, i) => (
                <span key={i} className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-750 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-mono">
                  {i + 1}. {h}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">CSV Raw Preview</h4>
            <pre className="p-4 rounded-xl bg-slate-900 text-amber-400 font-mono text-[11px] overflow-x-auto leading-relaxed border border-slate-800 max-h-80">
              {menuSampleCsv}
            </pre>
          </div>
        </div>
      )}

      {/* Template Detail: Staff */}
      {activeTemplate === 'staff' && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-700 gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-600" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  5. Staff & Crew Members Template
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Schema for conference support teams across Housekeeping, Kitchen, Technical AV, Front Desk, Security, and Protocol.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => copyToClipboard(staffSampleCsv, 'staff')}
                className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-700 transition flex items-center gap-1.5 text-slate-700 dark:text-slate-300"
              >
                {copiedKey === 'staff' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'staff' ? 'Copied CSV!' : 'Copy Sample CSV'}</span>
              </button>

              <button
                onClick={() => downloadCSV(staffBlankCsv, 'staff_members_blank_template.csv')}
                className="px-3 py-1.5 rounded-lg border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-xs font-semibold hover:bg-purple-100 transition flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Blank CSV</span>
              </button>

              <button
                onClick={() => downloadCSV(staffSampleCsv, 'staff_members_sample.csv')}
                className="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-xs transition flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Sample .CSV</span>
              </button>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">CSV Column Specifications</h4>
            <div className="flex flex-wrap gap-1.5">
              {STAFF_CSV_HEADERS.map((h, i) => (
                <span key={i} className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-750 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-mono">
                  {i + 1}. {h}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">CSV Raw Preview</h4>
            <pre className="p-4 rounded-xl bg-slate-900 text-purple-300 font-mono text-[11px] overflow-x-auto leading-relaxed border border-slate-800 max-h-80">
              {staffSampleCsv}
            </pre>
          </div>
        </div>
      )}

    </div>
  );
};
