import React, { useState } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  KeyRound, 
  UserCheck, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Lock, 
  Unlock, 
  UserPlus, 
  Sparkles,
  Edit2,
  Copy,
  Info
} from 'lucide-react';
import { ClearanceLevel, ManagementUser } from '../types/conference';
import { CLEARANCE_METADATA } from '../utils/auth';

interface ClearanceControlViewProps {
  currentUser: ManagementUser | null;
  allUsers: ManagementUser[];
  onLogin: (code: string) => boolean;
  onLogout: () => void;
  onAddUser: (user: ManagementUser) => void;
  onDeleteUser: (id: string) => void;
  onOpenLogonModal: () => void;
}

export const ClearanceControlView: React.FC<ClearanceControlViewProps> = ({
  currentUser,
  allUsers,
  onLogin,
  onLogout,
  onAddUser,
  onDeleteUser,
  onOpenLogonModal
}) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('');
  const [newDepartment, setNewDepartment] = useState('Operations & Logistics');
  const [newClearance, setNewClearance] = useState<ClearanceLevel>(2);
  const [newCode, setNewCode] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const isMasterAdmin = currentUser?.clearanceLevel === 5 || currentUser?.isMasterAdmin;

  const handleCopy = (code: string) => {
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newCode.trim()) {
      setErrorMsg('Please enter both a staff name and a 6-digit logon code.');
      return;
    }
    if (newCode.trim().length !== 6) {
      setErrorMsg('Logon code must be exactly 6 characters / digits.');
      return;
    }
    if (allUsers.some(u => u.logonCode === newCode.trim())) {
      setErrorMsg(`Code ${newCode} is already allocated to another staff member.`);
      return;
    }

    const newUser: ManagementUser = {
      id: `user-${Date.now()}`,
      name: newName.trim(),
      role: newRole.trim() || 'Operations Lead',
      department: newDepartment,
      clearanceLevel: newClearance,
      logonCode: newCode.trim(),
      createdAt: new Date().toISOString()
    };

    onAddUser(newUser);
    setSuccessMsg(`Logon code ${newUser.logonCode} issued to ${newUser.name} with Level ${newClearance} clearance.`);
    setNewName('');
    setNewRole('');
    setNewCode('');
    setErrorMsg(null);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Staff Authentication & RBAC Control
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-red-500/20 text-red-300 border border-red-500/30">
                Master Admin: Mark Mikealson (790922)
              </span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
              <ShieldCheck className="w-7 h-7 text-indigo-400" />
              Management Staff Clearance & Allocated Logon Codes
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              Each management staff member is issued a designated 6-digit logon code with tiered operational clearance. Mark Mikealson holds Level 5 Master App Admin clearance with unrestricted authority.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenLogonModal}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition"
            >
              <KeyRound className="w-4 h-4" />
              Enter Logon Code / Switch User
            </button>
          </div>
        </div>

        {/* Current User Session Strip */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between flex-wrap gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-white shadow-md">
              {currentUser?.name.charAt(0) || '?'}
            </div>
            <div>
              <div className="font-bold text-white flex items-center gap-2">
                {currentUser?.name || 'Guest / Unauthenticated'}
                {currentUser?.isMasterAdmin && (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-red-500/30 text-red-300 border border-red-500/40 font-mono">
                    👑 MASTER APP ADMIN
                  </span>
                )}
              </div>
              <div className="text-[11px] text-slate-400">
                {currentUser ? `${currentUser.role} &bull; ${currentUser.department}` : 'Browse-only mode'}
              </div>
            </div>
          </div>

          {currentUser ? (
            <div className="flex items-center gap-2">
              <span className={`text-xs px-3 py-1 rounded-full font-bold border ${CLEARANCE_METADATA[currentUser.clearanceLevel]?.badgeColor || 'bg-slate-700'}`}>
                Clearance Level {currentUser.clearanceLevel}
              </span>
              <button
                onClick={onLogout}
                className="px-3 py-1 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition text-xs flex items-center gap-1"
              >
                <Lock className="w-3.5 h-3.5" />
                Lock Session
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenLogonModal}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
            >
              Log In Now
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-red-900/30 border border-red-500/50 text-red-200 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}
      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-900/30 border border-emerald-500/50 text-emerald-200 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Staff Roster Table with Logon Codes */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-indigo-500" />
              Active Management Staff Roster & Allocated Logon Codes
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Authorized personnel codes configured for estate conference operations
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-500">
            {allUsers.length} Authorized Staff
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-700 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-6 py-3">Staff Name & Title</th>
                <th className="px-6 py-3">Department</th>
                <th className="px-6 py-3">Clearance Level</th>
                <th className="px-6 py-3">Allocated Logon Code</th>
                <th className="px-6 py-3">Status / Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 text-slate-700 dark:text-slate-300">
              {allUsers.map(user => {
                const isCurrent = currentUser?.id === user.id;
                const meta = CLEARANCE_METADATA[user.clearanceLevel];

                return (
                  <tr 
                    key={user.id} 
                    className={`hover:bg-slate-50/80 dark:hover:bg-slate-700/40 transition ${
                      user.isMasterAdmin ? 'bg-red-500/5' : ''
                    }`}
                  >
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white bg-gradient-to-tr ${user.avatarColor || 'from-indigo-500 to-sky-500'} shadow-sm`}>
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            {user.name}
                            {user.isMasterAdmin && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded font-bold bg-red-500/20 text-red-500 dark:text-red-300 border border-red-500/30">
                                👑 MASTER ADMIN
                              </span>
                            )}
                            {isCurrent && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded font-bold bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                                ACTIVE
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400">
                            {user.role}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-3.5">
                      <span className="text-slate-600 dark:text-slate-300 font-medium">
                        {user.department}
                      </span>
                    </td>

                    <td className="px-6 py-3.5">
                      <div className="flex flex-col">
                        <span className={`inline-flex items-center w-fit px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${meta?.badgeColor || 'bg-slate-700'}`}>
                          Level {user.clearanceLevel} &mdash; {meta?.name.split(' (')[0]}
                        </span>
                        <span className="text-[10px] text-slate-400 mt-1 line-clamp-1 max-w-xs">
                          {meta?.description}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-amber-300">
                          {user.logonCode}
                        </span>
                        <button
                          onClick={() => handleCopy(user.logonCode)}
                          className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-white"
                          title="Copy Logon Code"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        {copiedCode === user.logonCode && (
                          <span className="text-[10px] text-emerald-500 font-semibold">Copied!</span>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-2">
                        {isCurrent ? (
                          <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Logged In
                          </span>
                        ) : (
                          <button
                            onClick={() => onLogin(user.logonCode)}
                            className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-600 text-indigo-600 dark:text-indigo-300 hover:text-white border border-indigo-200 dark:border-indigo-800 text-[11px] font-medium transition"
                          >
                            Switch to this User
                          </button>
                        )}

                        {isMasterAdmin && !user.isMasterAdmin && (
                          <button
                            onClick={() => {
                              if (confirm(`Revoke logon code for ${user.name}?`)) {
                                onDeleteUser(user.id);
                              }
                            }}
                            className="p-1 rounded text-slate-400 hover:text-red-500"
                            title="Revoke Logon Code"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Master Admin: Issue New Management Code */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <UserPlus className="w-5 h-5 text-indigo-500" />
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Issue Allocated Management Logon Code
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Authorized by Master Admin Mark Mikealson (Level 5 Clearance)
              </p>
            </div>
          </div>

          <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                Staff Full Name *
              </label>
              <input
                type="text"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="e.g. Sipho Sithole"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Role / Designation *
                </label>
                <input
                  type="text"
                  value={newRole}
                  onChange={e => setNewRole(e.target.value)}
                  placeholder="e.g. Housekeeping Lead"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Department
                </label>
                <select
                  value={newDepartment}
                  onChange={e => setNewDepartment(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Operations & Logistics">Operations & Logistics</option>
                  <option value="Kitchen & Catering">Kitchen & Catering</option>
                  <option value="Front Desk & Guest Services">Front Desk & Guest Services</option>
                  <option value="Housekeeping & Cleaning">Housekeeping & Cleaning</option>
                  <option value="AV, Sound & Technical">AV, Sound & Technical</option>
                  <option value="Security & Health Safety">Security & Health Safety</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Clearance Level
                </label>
                <select
                  value={newClearance}
                  onChange={e => setNewClearance(Number(e.target.value) as ClearanceLevel)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
                >
                  <option value={1}>Level 1 - Floor Crew & Technical</option>
                  <option value={2}>Level 2 - Front Desk & Accommodation</option>
                  <option value={3}>Level 3 - Event & Catering Coordinator</option>
                  <option value={4}>Level 4 - Senior Operations Director</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Allocated 6-Digit Code *
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={newCode}
                  onChange={e => setNewCode(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="e.g. 618294"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={!isMasterAdmin}
              className={`w-full py-2.5 rounded-xl font-bold text-xs shadow-md transition flex items-center justify-center gap-2 ${
                isMasterAdmin 
                  ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30' 
                  : 'bg-slate-300 dark:bg-slate-700 text-slate-500 cursor-not-allowed'
              }`}
            >
              <KeyRound className="w-4 h-4" />
              Authorize & Issue Staff Logon Code
            </button>
            {!isMasterAdmin && (
              <p className="text-[10px] text-amber-500 italic text-center">
                Log on with code 790922 as Mark Mikealson to issue or revoke staff logon codes.
              </p>
            )}
          </form>
        </div>

        {/* Clearance Level Hierarchy & Permissions Matrix */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Info className="w-5 h-5 text-indigo-500" />
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Clearance Levels & Operational Authority
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Strict segregation of duties across Rawdons conference infrastructure
              </p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            {([5, 4, 3, 2, 1] as ClearanceLevel[]).map(lvl => {
              const meta = CLEARANCE_METADATA[lvl];
              return (
                <div key={lvl} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/60">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-900 dark:text-white text-xs">
                      {meta.name}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${meta.badgeColor}`}>
                      Level {lvl}
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 text-[11px] mb-2">
                    {meta.description}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {meta.permissions.map((p, i) => (
                      <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        &bull; {p}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
