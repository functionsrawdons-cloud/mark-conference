import React, { useState } from 'react';
import { 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Users, 
  FileText, 
  CheckCircle2, 
  Download, 
  Upload, 
  Edit3, 
  Save, 
  RotateCcw,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { ClientDetails } from '../types/conference';
import { clientToCSV, parseClientCSV, INITIAL_CLIENT_DATA } from '../utils/csvTemplates';
import { formatZAR } from '../utils/currency';
import { downloadCSV } from '../utils/csv';

interface ClientDetailsViewProps {
  client: ClientDetails;
  onUpdateClient: (updated: ClientDetails) => void;
}

export const ClientDetailsView: React.FC<ClientDetailsViewProps> = ({ client, onUpdateClient }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<ClientDetails>({ ...client });
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateClient(formData);
    setIsEditing(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleExportCsv = () => {
    const csv = clientToCSV(client);
    downloadCSV(csv, '1_conference_client_details.csv');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const parsed = parseClientCSV(text);
      if (parsed) {
        onUpdateClient(parsed);
        setFormData(parsed);
        alert('Client details imported successfully from CSV!');
      } else {
        alert('Could not parse client details CSV.');
      }
    };
    reader.readAsText(file);
  };

  const handleResetToSample = () => {
    if (confirm('Reset client details to default sample contract?')) {
      onUpdateClient(INITIAL_CLIENT_DATA);
      setFormData(INITIAL_CLIENT_DATA);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Top Banner & Actions */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  {client.organization || client.clientName}
                </h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  {client.status}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Primary Conference Client &bull; Contact: {client.contactPerson} ({client.email})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleExportCsv}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 transition"
              title="Download client contract as CSV"
            >
              <Download className="w-3.5 h-3.5 text-indigo-500" />
              <span>Export CSV</span>
            </button>

            <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 cursor-pointer transition">
              <Upload className="w-3.5 h-3.5 text-indigo-500" />
              <span>Import CSV</span>
              <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
            </label>

            <button
              onClick={() => {
                setFormData({ ...client });
                setIsEditing(!isEditing);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition shadow-xs"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{isEditing ? 'Cancel Edit' : 'Edit Details'}</span>
            </button>
          </div>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Client details updated and saved successfully!</span>
        </div>
      )}

      {/* Main View / Edit Form */}
      {isEditing ? (
        <form onSubmit={handleSave} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-5 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-700">
            Edit Client Contract & Billing Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Client Name / Brand</label>
              <input
                type="text"
                value={formData.clientName}
                onChange={e => setFormData({ ...formData, clientName: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Company / Organization Legal Name</label>
              <input
                type="text"
                value={formData.organization}
                onChange={e => setFormData({ ...formData, organization: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Contact Person Lead</label>
              <input
                type="text"
                value={formData.contactPerson}
                onChange={e => setFormData({ ...formData, contactPerson: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Contact Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
              <input
                type="text"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">VAT / Tax Identification No.</label>
              <input
                type="text"
                value={formData.vatNumber}
                onChange={e => setFormData({ ...formData, vatNumber: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-mono"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Billing Street Address</label>
              <input
                type="text"
                value={formData.billingAddress}
                onChange={e => setFormData({ ...formData, billingAddress: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Guaranteed Attendees</label>
              <input
                type="number"
                value={formData.guaranteedAttendees}
                onChange={e => setFormData({ ...formData, guaranteedAttendees: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Contract Status</label>
              <select
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              >
                <option value="Contract Signed">Contract Signed</option>
                <option value="Drafting">Drafting</option>
                <option value="Deposit Pending">Deposit Pending</option>
                <option value="Settled">Settled</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Agreed Budget Cap (ZAR / R)</label>
              <input
                type="number"
                value={formData.agreedBudgetCap}
                onChange={e => setFormData({ ...formData, agreedBudgetCap: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Deposit Paid (ZAR / R)</label>
              <input
                type="number"
                value={formData.depositPaid}
                onChange={e => {
                  const dep = parseFloat(e.target.value) || 0;
                  setFormData({ ...formData, depositPaid: dep, balanceDue: Math.max(0, formData.agreedBudgetCap - dep) });
                }}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-mono"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Payment Terms</label>
              <input
                type="text"
                value={formData.paymentTerms}
                onChange={e => setFormData({ ...formData, paymentTerms: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Special Requests & Contract Clauses</label>
              <textarea
                rows={3}
                value={formData.specialClauses}
                onChange={e => setFormData({ ...formData, specialClauses: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white resize-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs"
            >
              <Save className="w-4 h-4" />
              <span>Save Contract Changes</span>
            </button>
          </div>
        </form>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Financial Agreement Summary */}
          <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Agreed Contract Budget</span>
              <p className="text-xl font-bold text-slate-900 dark:text-white mt-1 font-mono">
                {formatZAR(client.agreedBudgetCap)}
              </p>
              <span className="text-[11px] text-slate-500 mt-1 block">Full event allowance in ZAR</span>
            </div>

            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Deposit Paid to Date</span>
              <p className="text-xl font-bold text-emerald-600 font-mono mt-1">
                {formatZAR(client.depositPaid)}
              </p>
              <span className="text-[11px] text-emerald-600/80 mt-1 block">
                {client.agreedBudgetCap > 0 ? Math.round((client.depositPaid / client.agreedBudgetCap) * 100) : 0}% secured in advance
              </span>
            </div>

            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Outstanding Balance Due</span>
              <p className="text-xl font-bold text-amber-600 font-mono mt-1">
                {formatZAR(client.balanceDue)}
              </p>
              <span className="text-[11px] text-slate-500 mt-1 block">Due 14 days before kickoff</span>
            </div>
          </div>

          {/* Details Card */}
          <div className="md:col-span-2 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-4 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white pb-2 border-b border-slate-100 dark:border-slate-700 flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-500" />
              Event Contract Scope & Logistics
            </h3>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block mb-0.5">Event Name</span>
                <p className="font-semibold text-slate-900 dark:text-white">{client.eventName}</p>
              </div>

              <div>
                <span className="text-slate-400 block mb-0.5">Event Dates</span>
                <p className="font-semibold text-slate-900 dark:text-white">{client.eventDates}</p>
              </div>

              <div>
                <span className="text-slate-400 block mb-0.5">Venue Booked</span>
                <p className="font-semibold text-slate-900 dark:text-white">{client.venueBooked}</p>
              </div>

              <div>
                <span className="text-slate-400 block mb-0.5">Guaranteed Attendees</span>
                <p className="font-semibold text-slate-900 dark:text-white font-mono">{client.guaranteedAttendees} guests</p>
              </div>

              <div className="col-span-2">
                <span className="text-slate-400 block mb-0.5">Payment Terms</span>
                <p className="font-medium text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-750 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700">
                  {client.paymentTerms}
                </p>
              </div>

              <div className="col-span-2">
                <span className="text-slate-400 block mb-0.5">Special Requests & Contract Clauses</span>
                <p className="text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-750 p-3 rounded-lg border border-slate-200 dark:border-slate-700 leading-relaxed italic">
                  "{client.specialClauses}"
                </p>
              </div>
            </div>
          </div>

          {/* Contact & Legal Card */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-4 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white pb-2 border-b border-slate-100 dark:border-slate-700 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              Client Contact & Billing
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Primary Contact</span>
                <p className="font-semibold text-slate-900 dark:text-white">{client.contactPerson}</p>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">Email Address</span>
                <a href={`mailto:${client.email}`} className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline">
                  {client.email}
                </a>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">Direct Phone</span>
                <p className="font-semibold text-slate-900 dark:text-white">{client.phone}</p>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">Tax / VAT Number</span>
                <p className="font-mono text-slate-700 dark:text-slate-300">{client.vatNumber}</p>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">Billing Address</span>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  {client.billingAddress}
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-700">
              <button
                onClick={handleResetToSample}
                className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset to Sample Client Data</span>
              </button>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
