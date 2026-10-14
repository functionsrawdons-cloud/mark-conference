import React, { useState } from 'react';
import { X, Settings, Calendar, MapPin, Users, DollarSign, Check, Building2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { ConferenceDetails, ConferenceRecord, ManagementUser } from '../types/conference';
import { detectVenueConflicts } from '../utils/conflictDetector';

interface ConferenceSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  conference: ConferenceDetails;
  onSave: (details: ConferenceDetails) => void;
  currentConferenceId?: string;
  allConferences?: ConferenceRecord[];
  currentUser?: ManagementUser | null;
}

const VENUE_HALLS = [
  'Drakensberg Main Hall',
  'Highland Pavilion & Lawns',
  'Brookside Executive Suite',
  'Mooi River Private Lounge',
  'Nottingham Road Arena'
];

export const ConferenceSettingsModal: React.FC<ConferenceSettingsModalProps> = ({
  isOpen,
  onClose,
  conference,
  onSave,
  currentConferenceId,
  allConferences = [],
  currentUser
}) => {
  const [formData, setFormData] = useState<ConferenceDetails>({ 
    ...conference,
    hall: conference.hall || VENUE_HALLS[0]
  });

  const [conflictError, setConflictError] = useState<string | null>(null);
  const [adminOverride, setAdminOverride] = useState(false);

  const isMasterAdmin = currentUser?.clearanceLevel === 5 || currentUser?.isMasterAdmin;

  if (!isOpen) return null;

  const validateConflict = (updated: ConferenceDetails) => {
    if (!allConferences.length) return null;
    const conflicts = detectVenueConflicts(updated, currentConferenceId || null, allConferences);
    if (conflicts.length > 0) {
      return conflicts[0].description;
    }
    return null;
  };

  const handleFieldChange = (field: keyof ConferenceDetails, value: any) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);

    if (field === 'startDate' || field === 'endDate' || field === 'hall' || field === 'venue') {
      const err = validateConflict(updated);
      setConflictError(err);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const err = validateConflict(formData);
    if (err && !adminOverride) {
      setConflictError(err);
      return;
    }

    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div 
        className="bg-white dark:bg-slate-800 rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden my-8"
        onClick={e => e.stopPropagation()}
      >
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div>
            <h2 className="text-base font-bold flex items-center gap-2">
              <Settings className="w-4 h-4 text-indigo-400" />
              Conference Details & Budget Cap
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Customize event metadata, dates, venue, and global financial limits
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Conflict Alert Banner */}
          {conflictError && (
            <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-500/50 text-red-200 space-y-2">
              <div className="font-bold text-xs flex items-center gap-2 text-red-300">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                DOUBLE BOOKING DETECTED: Venue / Hall Collision
              </div>
              <p className="text-[11px] leading-relaxed">{conflictError}</p>

              {isMasterAdmin ? (
                <label className="flex items-center gap-2 pt-2 border-t border-red-800/50 text-[11px] text-amber-300 font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={adminOverride}
                    onChange={e => setAdminOverride(e.target.checked)}
                    className="rounded border-red-400 text-red-600 focus:ring-red-500"
                  />
                  <span>Master Admin Override (Authorized by Mark Mikealson - Clearance 5)</span>
                </label>
              ) : (
                <p className="text-[10px] text-red-300/80 italic">
                  Cannot save due to double-booking. Pick alternative dates or an available hall.
                </p>
              )}
            </div>
          )}

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Conference Name / Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={e => handleFieldChange('title', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Theme / Subtitle
            </label>
            <input
              type="text"
              value={formData.theme}
              onChange={e => handleFieldChange('theme', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={e => handleFieldChange('startDate', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                required
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={e => handleFieldChange('endDate', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Venue Hall / Room
              </label>
              <select
                value={formData.hall || VENUE_HALLS[0]}
                onChange={e => handleFieldChange('hall', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 outline-none font-semibold text-indigo-600 dark:text-indigo-400"
              >
                {VENUE_HALLS.map(h => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                City / Location
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={e => handleFieldChange('city', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Expected Attendees
              </label>
              <input
                type="number"
                min="1"
                value={formData.expectedAttendees}
                onChange={e => handleFieldChange('expectedAttendees', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                required
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Overall Budget Cap (ZAR)
              </label>
              <input
                type="number"
                min="0"
                step="1000"
                value={formData.overallBudgetLimit}
                onChange={e => handleFieldChange('overallBudgetLimit', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                required
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={Boolean(conflictError && !adminOverride)}
              className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-1.5 transition ${
                conflictError && !adminOverride
                  ? 'bg-slate-400 text-white cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/30'
              }`}
            >
              <Check className="w-4 h-4" />
              Save Conference Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
