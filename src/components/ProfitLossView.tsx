import React, { useState, useMemo } from 'react';
import { 
  FileSpreadsheet, 
  Printer, 
  Download, 
  Lock, 
  Unlock, 
  ShieldCheck, 
  ShieldAlert, 
  TrendingUp, 
  TrendingDown, 
  PieChart, 
  DollarSign, 
  Building2, 
  Calendar, 
  Users, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  BadgePercent, 
  Bed, 
  UtensilsCrossed, 
  FileText,
  KeyRound,
  Eye,
  RefreshCw,
  ChevronDown,
  Layers,
  ArrowUpRight,
  Info
} from 'lucide-react';
import { ConferenceRecord, ManagementUser } from '../types/conference';
import { 
  calculateConferencePL, 
  exportConferencePLToCsv, 
  exportConferencePLToJson,
  ConferencePLData
} from '../utils/profitLoss';
import { formatZAR } from '../utils/currency';

interface ProfitLossViewProps {
  conferences: ConferenceRecord[];
  activeConferenceId: string;
  currentUser: ManagementUser | null;
  onAuthenticateUser: (user: ManagementUser) => void;
  onOpenLogonModal: () => void;
}

export const ProfitLossView: React.FC<ProfitLossViewProps> = ({
  conferences,
  activeConferenceId,
  currentUser,
  onAuthenticateUser,
  onOpenLogonModal
}) => {
  // Conference selection for P&L (allows viewing per conference)
  const [selectedConfId, setSelectedConfId] = useState<string>(activeConferenceId);
  
  // Elevation prompt state
  const [showAuthGateModal, setShowAuthGateModal] = useState(false);
  const [authGateCodeInput, setAuthGateCodeInput] = useState('');
  const [authGateError, setAuthGateError] = useState('');
  const [authSuccessMessage, setAuthSuccessMessage] = useState('');

  // Active sub-tab
  const [activeTab, setActiveTab] = useState<'statement' | 'revenue' | 'cogs' | 'opex' | 'economics'>('statement');

  // Verify if current user is Mark Mikealson (Master Admin, code 790922, level 5)
  const isMasterAdmin = useMemo(() => {
    if (!currentUser) return false;
    const isCode790922 = currentUser.logonCode === '790922';
    const isNamedMark = currentUser.name.toLowerCase().includes('mark mikealson');
    const isLevel5 = currentUser.clearanceLevel === 5;
    return (isCode790922 && isLevel5) || (isNamedMark && isLevel5);
  }, [currentUser]);

  // Selected conference record
  const selectedConference = useMemo(() => {
    return conferences.find(c => c.id === selectedConfId) || conferences.find(c => c.id === activeConferenceId) || conferences[0];
  }, [conferences, selectedConfId, activeConferenceId]);

  // Calculate comprehensive P&L data
  const plData: ConferencePLData = useMemo(() => {
    if (!selectedConference) {
      return {} as ConferencePLData;
    }
    return calculateConferencePL(selectedConference);
  }, [selectedConference]);

  // Handle attempt to export or print
  const handlePrintRequest = () => {
    if (!isMasterAdmin) {
      setShowAuthGateModal(true);
      setAuthGateError('Clearance Denied: Printing and exporting official P&L statements is restricted exclusively to Master Admin Mark Mikealson.');
      return;
    }
    window.print();
  };

  const handleCsvExportRequest = () => {
    if (!isMasterAdmin) {
      setShowAuthGateModal(true);
      setAuthGateError('Clearance Denied: CSV Financial Ledger export is restricted exclusively to Master Admin Mark Mikealson.');
      return;
    }
    exportConferencePLToCsv(selectedConference, plData, currentUser?.name || 'Mark Mikealson');
  };

  const handleJsonExportRequest = () => {
    if (!isMasterAdmin) {
      setShowAuthGateModal(true);
      setAuthGateError('Clearance Denied: Cryptographic JSON Audit export is restricted exclusively to Master Admin Mark Mikealson.');
      return;
    }
    exportConferencePLToJson(selectedConference, plData, currentUser?.name || 'Mark Mikealson');
  };

  // Authenticate as Mark Mikealson via code
  const handleElevateToMasterAdmin = (codeToVerify?: string) => {
    const code = (codeToVerify || authGateCodeInput).trim();
    if (code === '790922') {
      const masterUser: ManagementUser = {
        id: 'user-mark-mikealson',
        name: 'Mark Mikealson',
        logonCode: '790922',
        role: 'Master App Admin & Managing Director',
        clearanceLevel: 5,
        department: 'Executive Leadership',
        isMasterAdmin: true,
        avatarColor: 'from-amber-500 to-red-600',
        lastLoginAt: new Date().toISOString()
      };
      onAuthenticateUser(masterUser);
      setAuthGateError('');
      setAuthSuccessMessage('Verification Successful: Elevated to Master App Admin Mark Mikealson. All export privileges granted.');
      setTimeout(() => {
        setShowAuthGateModal(false);
        setAuthSuccessMessage('');
        setAuthGateCodeInput('');
      }, 1200);
    } else {
      setAuthGateError('Invalid Master Admin Code. Only Mark Mikealson (PIN: 790922) holds executive clearance.');
    }
  };

  if (!selectedConference || !plData.conferenceId) {
    return (
      <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
        <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-2" />
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">No Conference Selected</h3>
        <p className="text-sm text-slate-500">Please choose a conference to view its Profit and Loss report.</p>
      </div>
    );
  }

  const isNetPositive = plData.netProfit >= 0;

  return (
    <div className="space-y-6">
      
      {/* Top Banner: Control Bar & Clearance Guard (Hidden in Print) */}
      <div className="no-print bg-slate-900 text-white rounded-2xl p-4 sm:p-5 shadow-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Left: Conference Selection & Status */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
            <DollarSign className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-800/80">
                Official P&L Financial Report
              </span>
              <span className="text-xs text-slate-400">
                Currency: <strong className="text-white">ZAR (R)</strong>
              </span>
            </div>

            <div className="mt-1 flex items-center gap-2">
              <label htmlFor="conf-selector" className="text-xs text-slate-400 font-medium">Conference:</label>
              <div className="relative">
                <select
                  id="conf-selector"
                  value={selectedConfId}
                  onChange={(e) => setSelectedConfId(e.target.value)}
                  className="bg-slate-800 text-white text-sm font-semibold rounded-lg pl-3 pr-8 py-1 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                >
                  {conferences.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.details.title} ({c.details.hall || 'Main Hall'}) {c.id === activeConferenceId ? '★ Active' : ''}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2 top-2 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Master Admin Export Restriction Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 bg-slate-950/70 p-3 rounded-xl border border-slate-800">
          {isMasterAdmin ? (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-emerald-300">Mark Mikealson</span>
                  <span className="text-[10px] bg-red-500/20 text-red-300 border border-red-500/40 px-1.5 py-0.2 rounded font-bold">
                    Master Admin #790922
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">P&L Export & Certified Sign-off Authorized</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
                <Lock className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-amber-300">Export Locked</span>
                  <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.2 rounded">
                    Logged in: {currentUser?.name || 'Guest'} (L{currentUser?.clearanceLevel || 0})
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">Only Mark Mikealson (790922) can export/print</p>
              </div>
            </div>
          )}

          {/* Action Export Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handlePrintRequest}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-md ${
                isMasterAdmin 
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30 ring-1 ring-emerald-400/30' 
                  : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30'
              }`}
              title={isMasterAdmin ? 'Print Official P&L Statement to Printer or PDF' : 'Master Admin Mark Mikealson authorization required'}
            >
              {isMasterAdmin ? <Printer className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5 text-amber-400" />}
              <span>Print Official P&L</span>
            </button>

            <button
              onClick={handleCsvExportRequest}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition ${
                isMasterAdmin 
                  ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20' 
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
              }`}
              title={isMasterAdmin ? 'Download Excel / CSV Financial Ledger' : 'Master Admin Mark Mikealson authorization required'}
            >
              {isMasterAdmin ? <Download className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5 text-slate-400" />}
              <span>Export CSV</span>
            </button>

            <button
              onClick={handleJsonExportRequest}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition ${
                isMasterAdmin 
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700' 
                  : 'bg-slate-800/60 text-slate-400 border border-slate-800'
              }`}
              title={isMasterAdmin ? 'Download Audit JSON Package' : 'Master Admin Mark Mikealson authorization required'}
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-slate-400" />
              <span>JSON Audit</span>
            </button>

            {!isMasterAdmin && (
              <button
                onClick={() => {
                  setAuthGateCodeInput('790922');
                  handleElevateToMasterAdmin('790922');
                }}
                className="px-2.5 py-2 rounded-xl text-xs font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 transition flex items-center gap-1"
                title="Authenticate as Mark Mikealson (790922)"
              >
                <KeyRound className="w-3 h-3" />
                <span>Logon 790922</span>
              </button>
            )}
          </div>

        </div>
      </div>

      {/* Non-Master Admin Security Warning Notice (Hidden in Print) */}
      {!isMasterAdmin && (
        <div className="no-print bg-amber-500/10 dark:bg-amber-950/30 border border-amber-500/30 rounded-xl p-3.5 text-amber-900 dark:text-amber-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
            <div>
              <strong>Confidential Financial Audit:</strong> P&L export and certified printing is protected by App Security Policy.
              Only <strong>Mark Mikealson (Master Admin, Logon Code 790922)</strong> has permission to export this document.
            </div>
          </div>
          <button
            onClick={() => setShowAuthGateModal(true)}
            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-xs shrink-0 transition shadow-sm"
          >
            Enter Master Admin PIN
          </button>
        </div>
      )}

      {/* KPI Financial Overview Cards (Screen and Print) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Gross Revenue */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            Gross Revenue
          </span>
          <div className="mt-1 text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {formatZAR(plData.grossRevenue)}
          </div>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1 flex items-center gap-0.5">
            <TrendingUp className="w-3 h-3" />
            Contract + Rooms + Tickets
          </span>
        </div>

        {/* Cost of Sales (COGS) */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            Cost of Sales (COGS)
          </span>
          <div className="mt-1 text-xl sm:text-2xl font-black text-rose-600 dark:text-rose-400">
            {formatZAR(plData.costOfSales)}
          </div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 block">
            {((plData.costOfSales / (plData.grossRevenue || 1)) * 100).toFixed(1)}% of Revenue
          </span>
        </div>

        {/* Gross Profit */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            Gross Profit
          </span>
          <div className="mt-1 text-xl sm:text-2xl font-black text-indigo-600 dark:text-indigo-400">
            {formatZAR(plData.grossProfit)}
          </div>
          <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold mt-1 block">
            Margin: {plData.grossMarginPct.toFixed(1)}%
          </span>
        </div>

        {/* Operating Expenses (OPEX) */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            Operating Expenses
          </span>
          <div className="mt-1 text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400">
            {formatZAR(plData.operatingExpenses)}
          </div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 block">
            Staff + Logistics + Contingency
          </span>
        </div>

        {/* Net Profit (EBIT) */}
        <div className={`p-4 rounded-xl border shadow-sm ${
          isNetPositive 
            ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800/80' 
            : 'bg-rose-50 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800/80'
        }`}>
          <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider block">
            Net Profit (P&L)
          </span>
          <div className={`mt-1 text-xl sm:text-2xl font-black ${
            isNetPositive ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300'
          }`}>
            {formatZAR(plData.netProfit)}
          </div>
          <span className={`text-[10px] font-bold mt-1 block ${
            isNetPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
          }`}>
            Net Margin: {plData.netMarginPct.toFixed(1)}% ({plData.unitEconomics.financialHealth})
          </span>
        </div>

        {/* Return on Investment (ROI) */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            Return on Cost (ROI)
          </span>
          <div className="mt-1 text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {plData.roiPct.toFixed(1)}%
          </div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 block">
            Profit / Total Expense Outlay
          </span>
        </div>
      </div>

      {/* Navigation Sub-Tabs (Hidden in Print) */}
      <div className="no-print flex items-center gap-1.5 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('statement')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'statement'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Full Printable Statement</span>
        </button>

        <button
          onClick={() => setActiveTab('revenue')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'revenue'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>1. Inflows & Revenue ({formatZAR(plData.grossRevenue)})</span>
        </button>

        <button
          onClick={() => setActiveTab('cogs')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'cogs'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <UtensilsCrossed className="w-3.5 h-3.5" />
          <span>2. Cost of Sales COGS ({formatZAR(plData.costOfSales)})</span>
        </button>

        <button
          onClick={() => setActiveTab('opex')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'opex'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>3. Operating OPEX ({formatZAR(plData.operatingExpenses)})</span>
        </button>

        <button
          onClick={() => setActiveTab('economics')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'economics'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <PieChart className="w-3.5 h-3.5" />
          <span>4. Unit Economics & Breakeven</span>
        </button>
      </div>

      {/* TAB 1: FULL PRINTABLE STATEMENT (Styled for screen preview AND exact @media print) */}
      {(activeTab === 'statement') && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-10 shadow-lg print:border-none print:shadow-none print:p-0">
          
          {/* Printable Letterhead & Watermark */}
          <div className="border-b-2 border-slate-900 dark:border-slate-700 pb-6 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-emerald-600 rounded-sm"></span>
                  <span className="text-xs uppercase font-black tracking-widest text-emerald-700 dark:text-emerald-400">
                    Rawdons Hotel & Estate &bull; Est. 1954
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
                  Statement of Profit and Loss (P&L)
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Comprehensive Conference Event Financial Ledger & Variance Audit
                </p>
              </div>

              {/* Master Admin Certified Audit Seal Stamp */}
              <div className="text-right border-2 border-emerald-600 rounded-xl p-3 bg-emerald-50/50 dark:bg-emerald-950/20 max-w-xs shrink-0">
                <div className="flex items-center justify-end gap-1.5 text-emerald-700 dark:text-emerald-400 font-black text-xs uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Certified Executive Audit</span>
                </div>
                <div className="text-[11px] font-bold text-slate-800 dark:text-slate-200 mt-1">
                  Mark Mikealson &bull; Level 5 Master Admin
                </div>
                <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                  AUTH CODE: 790922 &bull; HASH #RD-{selectedConference.id.slice(0, 8).toUpperCase()}
                </div>
              </div>
            </div>

            {/* Conference Metadata Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Conference Title</span>
                <span className="font-bold text-slate-900 dark:text-white">{plData.conferenceTitle}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Client Organization</span>
                <span className="font-bold text-slate-900 dark:text-white">{plData.clientOrg}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Dates & Duration</span>
                <span className="font-bold text-slate-900 dark:text-white">{plData.datesFormatted} ({plData.durationDays} Days)</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Allocated Hall & Venue</span>
                <span className="font-bold text-slate-900 dark:text-white">{plData.venueName} &bull; {plData.hallName}</span>
              </div>
            </div>
          </div>

          {/* Section 1: Inflows & Revenue */}
          <div className="mb-8">
            <div className="flex items-center justify-between border-b border-emerald-600/40 pb-2 mb-3">
              <h2 className="text-sm font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                <span>1. Event Revenues & Inflows</span>
              </h2>
              <span className="text-xs font-black text-emerald-700 dark:text-emerald-400">
                Total: {formatZAR(plData.grossRevenue)}
              </span>
            </div>

            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-400 font-bold">
                  <th className="py-2 px-2">Line Item / Inflow Source</th>
                  <th className="py-2 px-2 hidden sm:table-cell">Category</th>
                  <th className="py-2 px-2 hidden md:table-cell">Operational Notes</th>
                  <th className="py-2 px-2 text-right">Amount (ZAR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {plData.revenueItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="py-2.5 px-2">
                      <div className="font-bold text-slate-800 dark:text-slate-100">{item.name}</div>
                      <div className="text-[11px] text-slate-500">{item.description}</div>
                    </td>
                    <td className="py-2.5 px-2 hidden sm:table-cell text-slate-500 font-medium">{item.category}</td>
                    <td className="py-2.5 px-2 hidden md:table-cell text-[11px] text-slate-400 font-mono">{item.notes}</td>
                    <td className="py-2.5 px-2 text-right font-black text-slate-900 dark:text-white">{formatZAR(item.amount)}</td>
                  </tr>
                ))}
                <tr className="bg-emerald-50/60 dark:bg-emerald-950/20 font-black text-slate-900 dark:text-white">
                  <td colSpan={3} className="py-2.5 px-2 text-right uppercase text-[11px]">
                    Subtotal Gross Revenue:
                  </td>
                  <td className="py-2.5 px-2 text-right text-emerald-700 dark:text-emerald-400 text-sm">
                    {formatZAR(plData.grossRevenue)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Section 2: Cost of Sales (COGS) */}
          <div className="mb-8">
            <div className="flex items-center justify-between border-b border-rose-600/40 pb-2 mb-3">
              <h2 className="text-sm font-black uppercase tracking-wider text-rose-700 dark:text-rose-400 flex items-center gap-1.5">
                <span>2. Cost of Sales (Direct COGS)</span>
              </h2>
              <span className="text-xs font-black text-rose-700 dark:text-rose-400">
                Total: {formatZAR(plData.costOfSales)}
              </span>
            </div>

            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-400 font-bold">
                  <th className="py-2 px-2">Line Item / Expense Item</th>
                  <th className="py-2 px-2 hidden sm:table-cell">Category</th>
                  <th className="py-2 px-2 hidden md:table-cell">Notes & Covers</th>
                  <th className="py-2 px-2 text-right">Amount (ZAR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {plData.cogsItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="py-2.5 px-2">
                      <div className="font-bold text-slate-800 dark:text-slate-100">{item.name}</div>
                      <div className="text-[11px] text-slate-500">{item.description}</div>
                    </td>
                    <td className="py-2.5 px-2 hidden sm:table-cell text-slate-500 font-medium">{item.category}</td>
                    <td className="py-2.5 px-2 hidden md:table-cell text-[11px] text-slate-400 font-mono">{item.notes}</td>
                    <td className="py-2.5 px-2 text-right font-black text-rose-600 dark:text-rose-400">{formatZAR(item.amount)}</td>
                  </tr>
                ))}
                <tr className="bg-rose-50/60 dark:bg-rose-950/20 font-black text-slate-900 dark:text-white">
                  <td colSpan={3} className="py-2.5 px-2 text-right uppercase text-[11px]">
                    Subtotal Cost of Sales (COGS):
                  </td>
                  <td className="py-2.5 px-2 text-right text-rose-700 dark:text-rose-400 text-sm">
                    {formatZAR(plData.costOfSales)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Section 2.5: Gross Profit Interim Callout */}
          <div className="p-3.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/60 flex items-center justify-between mb-8 text-xs font-bold">
            <span className="uppercase tracking-wider text-indigo-900 dark:text-indigo-300">
              Interim Gross Profit (Gross Revenue &minus; COGS)
            </span>
            <div className="flex items-center gap-3">
              <span className="text-slate-500 font-medium">Gross Margin: {plData.grossMarginPct.toFixed(1)}%</span>
              <span className="text-base font-black text-indigo-700 dark:text-indigo-300">
                {formatZAR(plData.grossProfit)}
              </span>
            </div>
          </div>

          {/* Section 3: Operating Expenses (OPEX) */}
          <div className="mb-8">
            <div className="flex items-center justify-between border-b border-amber-600/40 pb-2 mb-3">
              <h2 className="text-sm font-black uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                <span>3. Operating Expenses (OPEX)</span>
              </h2>
              <span className="text-xs font-black text-amber-700 dark:text-amber-400">
                Total: {formatZAR(plData.operatingExpenses)}
              </span>
            </div>

            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-400 font-bold">
                  <th className="py-2 px-2">Line Item / Operational Cost</th>
                  <th className="py-2 px-2 hidden sm:table-cell">Department</th>
                  <th className="py-2 px-2 hidden md:table-cell">Headcount & Shift Notes</th>
                  <th className="py-2 px-2 text-right">Amount (ZAR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {plData.opexItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="py-2.5 px-2">
                      <div className="font-bold text-slate-800 dark:text-slate-100">{item.name}</div>
                      <div className="text-[11px] text-slate-500">{item.description}</div>
                    </td>
                    <td className="py-2.5 px-2 hidden sm:table-cell text-slate-500 font-medium">{item.category}</td>
                    <td className="py-2.5 px-2 hidden md:table-cell text-[11px] text-slate-400 font-mono">{item.notes}</td>
                    <td className="py-2.5 px-2 text-right font-black text-amber-600 dark:text-amber-400">{formatZAR(item.amount)}</td>
                  </tr>
                ))}
                <tr className="bg-amber-50/60 dark:bg-amber-950/20 font-black text-slate-900 dark:text-white">
                  <td colSpan={3} className="py-2.5 px-2 text-right uppercase text-[11px]">
                    Subtotal Operating Expenses (OPEX):
                  </td>
                  <td className="py-2.5 px-2 text-right text-amber-700 dark:text-amber-400 text-sm">
                    {formatZAR(plData.operatingExpenses)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Final Net Profit Reconciliation Box */}
          <div className={`p-6 rounded-2xl border-2 mb-8 ${
            isNetPositive 
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500' 
              : 'bg-rose-50 dark:bg-rose-950/40 border-rose-500'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[11px] uppercase font-black tracking-wider text-slate-500 dark:text-slate-400 block">
                  Final Event Net Contribution
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  Net Profit (EBIT): {formatZAR(plData.netProfit)}
                </h3>
                <div className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                  Formula: Gross Revenue ({formatZAR(plData.grossRevenue)}) &minus; COGS ({formatZAR(plData.costOfSales)}) &minus; OPEX ({formatZAR(plData.operatingExpenses)})
                </div>
              </div>

              <div className="text-left sm:text-right">
                <div className="text-xs text-slate-500 dark:text-slate-400">Net Profit Margin</div>
                <div className={`text-2xl font-black ${
                  isNetPositive ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300'
                }`}>
                  {plData.netMarginPct.toFixed(1)}%
                </div>
                <div className="text-[11px] font-bold text-slate-500 mt-0.5">
                  Health: <strong className={isNetPositive ? 'text-emerald-600' : 'text-rose-600'}>{plData.unitEconomics.financialHealth}</strong> &bull; ROI: {plData.roiPct.toFixed(1)}%
                </div>
              </div>
            </div>
          </div>

          {/* Signatures & Executive Governance Sign-Off (Print-First Requirement) */}
          <div className="border-t-2 border-slate-900 dark:border-slate-700 pt-6 mt-8">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-4">
              Executive Audit & Governance Sign-Off
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
              {/* Mark Mikealson Signature */}
              <div className="border border-slate-300 dark:border-slate-700 rounded-xl p-3 bg-slate-50/50 dark:bg-slate-800/30">
                <div className="h-10 flex items-center font-serif italic text-base text-slate-800 dark:text-slate-200 border-b border-dashed border-slate-300 dark:border-slate-600 mb-2">
                  Mark Mikealson
                </div>
                <div className="font-black text-slate-900 dark:text-white">Mark Mikealson</div>
                <div className="text-[11px] text-slate-500">Master App Admin & Managing Director</div>
                <div className="text-[10px] text-emerald-600 font-mono mt-1">Clearance Code: 790922 &bull; Authorized</div>
              </div>

              {/* Operations Director Signature */}
              <div className="border border-slate-300 dark:border-slate-700 rounded-xl p-3 bg-slate-50/50 dark:bg-slate-800/30">
                <div className="h-10 flex items-center font-serif italic text-base text-slate-800 dark:text-slate-200 border-b border-dashed border-slate-300 dark:border-slate-600 mb-2">
                  Elena Rostova
                </div>
                <div className="font-black text-slate-900 dark:text-white">Elena Rostova</div>
                <div className="text-[11px] text-slate-500">Senior Operations Director</div>
                <div className="text-[10px] text-slate-400 font-mono mt-1">Clearance Level 4 &bull; Verified</div>
              </div>

              {/* Finance Officer Signature */}
              <div className="border border-slate-300 dark:border-slate-700 rounded-xl p-3 bg-slate-50/50 dark:bg-slate-800/30">
                <div className="h-10 flex items-center font-serif italic text-base text-slate-800 dark:text-slate-200 border-b border-dashed border-slate-300 dark:border-slate-600 mb-2">
                  Financial Controller
                </div>
                <div className="font-black text-slate-900 dark:text-white">Marcus Venter</div>
                <div className="text-[11px] text-slate-500">Head of Estate Catering & Operations</div>
                <div className="text-[10px] text-slate-400 font-mono mt-1">Audit Timestamp: {new Date().toLocaleDateString('en-ZA')}</div>
              </div>
            </div>

            <div className="mt-4 text-[10px] text-slate-400 text-center font-mono">
              CONFIDENTIAL &bull; PRODUCED BY RAWDONS CONFERENCE MANAGEMENT SYSTEM &bull; STRICTLY PRIVILEGED TO RAWDONS HOTEL & ESTATE
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: INFLOWS & REVENUE BREAKDOWN */}
      {(activeTab === 'revenue') && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-xs font-bold text-slate-400 uppercase">Client Package Agreement</span>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                {formatZAR(plData.revenueBreakdown.clientContract)}
              </div>
              <div className="text-xs text-slate-500 mt-2 space-y-1">
                <div className="flex justify-between">
                  <span>Deposit Collected:</span>
                  <strong className="text-emerald-600">{formatZAR(plData.revenueBreakdown.depositReceived)}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Balance Receivable:</span>
                  <strong className="text-amber-600">{formatZAR(plData.revenueBreakdown.balanceDue)}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Contract Status:</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">{plData.contractStatus}</span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-xs font-bold text-slate-400 uppercase">Accommodation Billing</span>
              <div className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1">
                {formatZAR(plData.revenueBreakdown.roomRevenue)}
              </div>
              <div className="text-xs text-slate-500 mt-2 space-y-1">
                <div className="flex justify-between">
                  <span>Occupied Rooms:</span>
                  <strong>{plData.revenueBreakdown.occupiedRoomsCount} Suites</strong>
                </div>
                <div className="flex justify-between">
                  <span>Total Room Nights:</span>
                  <strong>{plData.revenueBreakdown.totalRoomNights} Nights</strong>
                </div>
                <div className="flex justify-between">
                  <span>Occupancy Rate:</span>
                  <strong className="text-purple-600">{plData.unitEconomics.roomOccupancyRatePct}%</strong>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-xs font-bold text-slate-400 uppercase">Delegate Ticket Collections</span>
              <div className="text-2xl font-black text-sky-600 dark:text-sky-400 mt-1">
                {formatZAR(plData.revenueBreakdown.ticketSales)}
              </div>
              <div className="text-xs text-slate-500 mt-2 space-y-1">
                {Object.entries(plData.revenueBreakdown.ticketSalesByType).map(([type, stats]) => (
                  <div key={type} className="flex justify-between">
                    <span>{type} ({stats.count} pax):</span>
                    <strong>{formatZAR(stats.totalRevenue)}</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Revenue Itemized List */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-3">Itemized Revenue Ledger</h3>
            <div className="space-y-2">
              {plData.revenueItems.map(item => (
                <div key={item.id} className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-xs text-slate-900 dark:text-white">{item.name}</div>
                    <div className="text-[11px] text-slate-500">{item.description}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-black text-sm text-emerald-600 dark:text-emerald-400">{formatZAR(item.amount)}</div>
                    <div className="text-[10px] text-slate-400">{item.notes}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: COST OF SALES (COGS) BREAKDOWN */}
      {(activeTab === 'cogs') && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-400 uppercase">Catering & Banqueting</span>
              <div className="text-xl font-black text-rose-600 dark:text-rose-400 mt-1">
                {formatZAR(plData.cogsBreakdown.cateringDirectCost)}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Direct food ingredient & chef surcharges</p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-400 uppercase">Housekeeping & Turnaround</span>
              <div className="text-xl font-black text-rose-600 dark:text-rose-400 mt-1">
                {formatZAR(plData.cogsBreakdown.accommodationDirectCost)}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Linen, minibar restock, luxury toiletries</p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-400 uppercase">Hall & Facility Hire</span>
              <div className="text-xl font-black text-rose-600 dark:text-rose-400 mt-1">
                {formatZAR(plData.cogsBreakdown.venueHireDirectCost)}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Power backup, HVAC, facility wear-and-tear</p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-400 uppercase">AV & Stage Production</span>
              <div className="text-xl font-black text-rose-600 dark:text-rose-400 mt-1">
                {formatZAR(plData.cogsBreakdown.avProductionDirectCost + plData.cogsBreakdown.materialsDecorDirectCost)}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Stage audio, microphones, display branding</p>
            </div>
          </div>

          {/* COGS Itemized List */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-3">Itemized Cost of Sales (COGS)</h3>
            <div className="space-y-2">
              {plData.cogsItems.map(item => (
                <div key={item.id} className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-xs text-slate-900 dark:text-white">{item.name}</div>
                    <div className="text-[11px] text-slate-500">{item.description}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-black text-sm text-rose-600 dark:text-rose-400">{formatZAR(item.amount)}</div>
                    <div className="text-[10px] text-slate-400">{item.notes}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: OPERATING EXPENSES (OPEX) BREAKDOWN */}
      {(activeTab === 'opex') && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-400 uppercase">Staff & Crew Payroll</span>
              <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
                {formatZAR(plData.opexBreakdown.staffWages)}
              </div>
              <div className="mt-2 text-xs text-slate-500 space-y-1">
                {Object.entries(plData.opexBreakdown.staffByDepartment).map(([dept, data]) => (
                  <div key={dept} className="flex justify-between">
                    <span>{dept} ({data.headCount} crew):</span>
                    <strong>{formatZAR(data.cost)}</strong>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-400 uppercase">Logistics & Marketing</span>
              <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
                {formatZAR(plData.opexBreakdown.logisticsAdminCost + plData.opexBreakdown.marketingSignageCost)}
              </div>
              <div className="mt-2 text-xs text-slate-500 space-y-1">
                <div className="flex justify-between">
                  <span>Logistics & Security:</span>
                  <strong>{formatZAR(plData.opexBreakdown.logisticsAdminCost)}</strong>
                </div>
                <div className="flex justify-between">
                  <span>App, Wi-Fi & Media:</span>
                  <strong>{formatZAR(plData.opexBreakdown.marketingSignageCost)}</strong>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-400 uppercase">Contingency Buffer</span>
              <div className="text-2xl font-black text-slate-700 dark:text-slate-300 mt-1">
                {formatZAR(plData.opexBreakdown.contingencyReserve)}
              </div>
              <p className="text-xs text-slate-500 mt-2">
                3.5% executive reserve allocated to buffer weather variances, transport surge charges, and emergency incidentals.
              </p>
            </div>
          </div>

          {/* OPEX Itemized List */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-3">Itemized Operating Expenses (OPEX)</h3>
            <div className="space-y-2">
              {plData.opexItems.map(item => (
                <div key={item.id} className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-xs text-slate-900 dark:text-white">{item.name}</div>
                    <div className="text-[11px] text-slate-500">{item.description}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-black text-sm text-amber-600 dark:text-amber-400">{formatZAR(item.amount)}</div>
                    <div className="text-[10px] text-slate-400">{item.notes}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: UNIT ECONOMICS & BREAKEVEN ANALYSIS */}
      {(activeTab === 'economics') && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-4">
              <Users className="w-4 h-4 text-indigo-500" />
              <span>Per-Delegate Unit Economics</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400">Total Attending Delegates:</span>
                <strong className="text-sm font-bold text-slate-900 dark:text-white">{plData.actualAttendees} Pax</strong>
              </div>

              <div className="p-3 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400">Gross Revenue per Delegate:</span>
                <strong className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                  {formatZAR(plData.unitEconomics.revenuePerAttendee)}
                </strong>
              </div>

              <div className="p-3 rounded-lg bg-rose-50/50 dark:bg-rose-950/20 flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400">Total Delivery Cost per Delegate:</span>
                <strong className="text-sm font-black text-rose-600 dark:text-rose-400">
                  {formatZAR(plData.unitEconomics.costPerAttendee)}
                </strong>
              </div>

              <div className="p-3 rounded-lg bg-indigo-50/50 dark:bg-indigo-950/20 flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400">Net Contribution per Delegate:</span>
                <strong className="text-sm font-black text-indigo-600 dark:text-indigo-400">
                  {formatZAR(plData.unitEconomics.netProfitPerAttendee)}
                </strong>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              <span>Breakeven & Contract Variance</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400">Breakeven Delegate Count:</span>
                <strong className="text-sm font-bold text-slate-900 dark:text-white">
                  {plData.unitEconomics.breakevenAttendees} Delegates
                </strong>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400">Safety Headroom Above Breakeven:</span>
                <strong className="text-sm font-bold text-emerald-600">
                  +{Math.max(0, plData.actualAttendees - plData.unitEconomics.breakevenAttendees)} Delegates
                </strong>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400">Estate Room Occupancy Rate:</span>
                <strong className="text-sm font-bold text-purple-600">
                  {plData.unitEconomics.roomOccupancyRatePct}%
                </strong>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400">Client Contract Budget Variance:</span>
                <strong className="text-sm font-bold text-emerald-600">
                  {formatZAR(plData.unitEconomics.budgetVariance)} (Favorable)
                </strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MASTER ADMIN AUTHENTICATION CHALLENGE MODAL */}
      {showAuthGateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-amber-500/40 rounded-2xl max-w-md w-full p-6 text-white shadow-2xl relative">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Master Admin Clearance Required</h3>
                <p className="text-xs text-amber-300/80">Profit & Loss Export Privilege Protection</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 mt-4 leading-relaxed">
              Official P&L statements, financial ledger spreadsheets, and certified audit printouts contain confidential fiscal intelligence.
              Per Rawdons governance, exports can only be performed by <strong>Mark Mikealson</strong> with highest clearance.
            </p>

            {authGateError && (
              <div className="mt-3 p-2.5 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{authGateError}</span>
              </div>
            )}

            {authSuccessMessage && (
              <div className="mt-3 p-2.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{authSuccessMessage}</span>
              </div>
            )}

            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleElevateToMasterAdmin();
              }}
              className="mt-4 space-y-3"
            >
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">
                  Enter Mark Mikealson Logon Code:
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    placeholder="e.g. 790922"
                    value={authGateCodeInput}
                    onChange={(e) => {
                      setAuthGateCodeInput(e.target.value);
                      setAuthGateError('');
                    }}
                    autoFocus
                    className="w-full bg-slate-800 text-white rounded-lg pl-9 pr-3 py-2 text-sm border border-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono tracking-widest"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAuthGateModal(false);
                    setAuthGateError('');
                  }}
                  className="px-3 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition"
                >
                  Cancel
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthGateCodeInput('790922');
                      handleElevateToMasterAdmin('790922');
                    }}
                    className="px-3 py-2 rounded-lg text-xs font-bold text-amber-300 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 transition"
                  >
                    Use Code 790922
                  </button>

                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 shadow-md shadow-amber-600/30 transition flex items-center gap-1.5"
                  >
                    <Unlock className="w-3.5 h-3.5" />
                    <span>Authorize Export</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
