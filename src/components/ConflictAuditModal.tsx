import React from 'react';
import { 
  X, 
  ShieldCheck, 
  AlertTriangle, 
  Calendar, 
  Building2, 
  Bed, 
  Users, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  Sparkles
} from 'lucide-react';
import { BookingConflict, ConferenceRecord, ManagementUser } from '../types/conference';

interface ConflictAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  conflicts: BookingConflict[];
  conferences: ConferenceRecord[];
  currentUser: ManagementUser | null;
  onSelectConference?: (id: string) => void;
}

const RAWDOONS_HALLS = [
  { name: 'Drakensberg Main Hall', capacity: 350, type: 'Plenary & Main Stage' },
  { name: 'Highland Pavilion & Lawns', capacity: 200, type: 'Outdoor & Marquee Exhibition' },
  { name: 'Brookside Executive Suite', capacity: 60, type: 'Executive Boardroom & Medical' },
  { name: 'Mooi River Private Lounge', capacity: 45, type: 'VIP Breakout' },
  { name: 'Nottingham Road Arena', capacity: 500, type: 'Large Arena & Exhibition' }
];

export const ConflictAuditModal: React.FC<ConflictAuditModalProps> = ({
  isOpen,
  onClose,
  conflicts,
  conferences,
  currentUser,
  onSelectConference
}) => {
  if (!isOpen) return null;

  const isMasterAdmin = currentUser?.clearanceLevel === 5 || currentUser?.isMasterAdmin;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div 
        className="bg-slate-900 border border-slate-700 rounded-2xl max-w-3xl w-full text-white shadow-2xl overflow-hidden my-6"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              conflicts.length > 0 
                ? 'bg-amber-500/20 border border-amber-500/40 text-amber-400' 
                : 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400'
            }`}>
              {conflicts.length > 0 ? <AlertTriangle className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Double-Booking & Conflict Prevention Engine
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                  conflicts.length === 0 
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' 
                    : 'bg-red-500/20 text-red-300 border-red-500/30'
                }`}>
                  {conflicts.length === 0 ? 'Zero Conflicts Detected' : `${conflicts.length} Collision Alert${conflicts.length > 1 ? 's' : ''}`}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Continuous real-time verification of venues, halls, accommodation rooms, and staff rosters
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-xs">
          {/* Status banner */}
          {conflicts.length === 0 ? (
            <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-sm text-white">All Active Conferences 100% Conflict-Free</div>
                <p className="text-xs text-emerald-300/90 mt-1">
                  The automated scheduling engine has verified all {conferences.length} registered conferences. There are no venue hall collisions, no overlapping room allocations, and no double-scheduled staff members.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/40 text-red-200 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-sm text-white">Double-Booking Collision Identified</div>
                <p className="text-xs text-red-300/90 mt-1">
                  The conflict prevention system has detected overlapping reservations that require resolution.
                </p>
              </div>
            </div>
          )}

          {/* Conflict list if any */}
          {conflicts.length > 0 && (
            <div className="space-y-3">
              <div className="font-bold text-slate-200 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                Detected Collisions:
              </div>
              {conflicts.map(c => (
                <div key={c.id} className="p-4 rounded-xl bg-slate-800/80 border border-red-500/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-400" />
                      {c.title}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/30 uppercase font-mono">
                      {c.severity}
                    </span>
                  </div>
                  <p className="text-slate-300 text-xs">{c.description}</p>
                  <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-1">
                    <span><strong>Resource:</strong> {c.conflictingResource}</span>
                    <span><strong>Dates:</strong> {c.overlappingDates}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Venue & Hall Schedule Timeline */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="font-bold text-slate-200 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-indigo-400" />
                Rawdons Estate Venue & Hall Reservation Schedule:
              </div>
              <span className="text-[11px] text-slate-400">
                {conferences.length} Scheduled Conferences
              </span>
            </div>

            <div className="border border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-800 bg-slate-800/40">
              {RAWDOONS_HALLS.map(hall => {
                const bookedConfs = conferences.filter(c => 
                  c.details.hall === hall.name || (!c.details.hall && c.details.venue.includes(hall.name))
                );

                return (
                  <div key={hall.name} className="p-4 hover:bg-slate-800/60 transition">
                    <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                      <div>
                        <span className="font-bold text-white text-xs">{hall.name}</span>
                        <span className="text-[11px] text-slate-400 ml-2">
                          ({hall.type} &bull; Cap: {hall.capacity})
                        </span>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                        bookedConfs.length > 0 
                          ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' 
                          : 'bg-slate-700 text-slate-400 border-slate-600'
                      }`}>
                        {bookedConfs.length > 0 ? `${bookedConfs.length} Active Booking` : 'Available'}
                      </span>
                    </div>

                    {bookedConfs.length > 0 ? (
                      <div className="space-y-2 mt-2">
                        {bookedConfs.map(c => (
                          <div 
                            key={c.id}
                            className="p-2.5 rounded-lg bg-slate-900 border border-slate-700/80 flex items-center justify-between flex-wrap gap-2"
                          >
                            <div>
                              <div className="font-semibold text-white flex items-center gap-2">
                                {c.details.title}
                                <span className="text-[10px] text-indigo-400 bg-indigo-950 px-1.5 py-0.2 rounded">
                                  {c.client.organization || c.client.clientName}
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-400 flex items-center gap-3 mt-0.5">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3 text-slate-400" />
                                  {c.details.startDate} &mdash; {c.details.endDate}
                                </span>
                                <span>{c.details.expectedAttendees} Expected Attendees</span>
                              </div>
                            </div>
                            {onSelectConference && (
                              <button
                                onClick={() => {
                                  onSelectConference(c.id);
                                  onClose();
                                }}
                                className="px-2.5 py-1 rounded bg-indigo-600/30 hover:bg-indigo-600 text-indigo-200 hover:text-white text-[11px] font-medium transition"
                              >
                                View Conference
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-[11px] text-slate-500 italic mt-1">
                        No conferences currently scheduled for this venue. Safe to book without collision.
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Double Booking Rules & Prevention Protocol */}
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 space-y-2">
            <div className="font-bold text-white text-xs flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              Automated Guardrails (How No Double Booking is Enforced):
            </div>
            <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px]">
              <li><strong>Venue & Hall Collision:</strong> The app rejects saving dates or hall assignments if another conference occupies that hall during overlapping dates.</li>
              <li><strong>Accommodation Rooms:</strong> Guest allocations check dates against all registered guest stays across the entire estate.</li>
              <li><strong>Staff Duty Rosters:</strong> Prevents scheduling the same staff member on active duty simultaneously in separate conferences.</li>
              <li><strong>Master Admin Override:</strong> Only Mark Mikealson (Level 5 Master Admin - Code 790922) possesses the clearance to override a conflict if two simultaneous sub-sessions intentionally share a venue.</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-400">
            Real-time conflict auditor active &bull; Auto-scans on every edit
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold transition"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
