import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  KeyRound, 
  UserCheck, 
  AlertCircle, 
  Sparkles, 
  CheckCircle2, 
  Lock, 
  Unlock,
  Users,
  Plus,
  Trash2,
  ShieldAlert
} from 'lucide-react';
import { ClearanceLevel, ManagementUser } from '../types/conference';
import { CLEARANCE_METADATA } from '../utils/auth';

interface LogonModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: ManagementUser | null;
  onLogin: (code: string) => boolean;
  onLogout: () => void;
  allUsers: ManagementUser[];
  onAddUser?: (user: ManagementUser) => void;
  onDeleteUser?: (id: string) => void;
}

export const LogonModal: React.FC<LogonModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLogin,
  onLogout,
  allUsers,
  onAddUser,
  onDeleteUser
}) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'login' | 'manage'>('login');

  // Form state for creating new management logon code (Master Admin only)
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('');
  const [newDepartment, setNewDepartment] = useState('Operations & Logistics');
  const [newClearance, setNewClearance] = useState<ClearanceLevel>(2);
  const [newCode, setNewCode] = useState('');

  if (!isOpen) return null;

  const handleKeypadPress = (digit: string) => {
    if (code.length < 6) {
      setCode(prev => prev + digit);
      setError(null);
    }
  };

  const handleBackspace = () => {
    setCode(prev => prev.slice(0, -1));
    setError(null);
  };

  const handleClear = () => {
    setCode('');
    setError(null);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!code.trim()) {
      setError('Please enter your allocated logon code.');
      return;
    }

    const success = onLogin(code.trim());
    if (success) {
      setSuccessMsg(`Logon successful! Authorized access granted.`);
      setTimeout(() => {
        setSuccessMsg(null);
        setCode('');
        onClose();
      }, 700);
    } else {
      setError('Invalid logon code. Please verify your code or contact Master Admin Mark Mikealson (790922).');
    }
  };

  const handleQuickLogin = (userCode: string) => {
    setCode(userCode);
    const success = onLogin(userCode);
    if (success) {
      setSuccessMsg(`Switched to user successfully.`);
      setTimeout(() => {
        setSuccessMsg(null);
        setCode('');
        onClose();
      }, 600);
    }
  };

  const handleCreateNewUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onAddUser) return;
    if (!newName.trim() || !newCode.trim()) {
      setError('Name and unique 6-digit logon code are required.');
      return;
    }
    if (allUsers.some(u => u.logonCode === newCode.trim())) {
      setError('This logon code is already allocated to another staff member.');
      return;
    }

    const newUser: ManagementUser = {
      id: `user-${Date.now()}`,
      name: newName.trim(),
      role: newRole.trim() || 'Operations Supervisor',
      department: newDepartment,
      clearanceLevel: newClearance,
      logonCode: newCode.trim(),
      avatarColor: 'from-blue-500 to-indigo-600',
      createdAt: new Date().toISOString()
    };

    onAddUser(newUser);
    setSuccessMsg(`Created logon code for ${newUser.name} (Clearance Level ${newClearance})`);
    setNewName('');
    setNewRole('');
    setNewCode('');
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const isMasterAdmin = currentUser?.clearanceLevel === 5 || currentUser?.isMasterAdmin;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div 
        className="bg-slate-900 border border-slate-700 rounded-2xl max-w-xl w-full text-white shadow-2xl overflow-hidden my-6"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Management Staff Security & Logon
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono">
                  Clearance Access
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Enter your allocated 6-digit logon code to access operational controls
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

        {/* Current Active Session Bar */}
        <div className="bg-slate-800/80 px-5 py-3 border-b border-slate-700/80 flex items-center justify-between flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-400">Active Operator:</span>
            {currentUser ? (
              <span className="font-semibold text-white flex items-center gap-1.5">
                {currentUser.name}
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${CLEARANCE_METADATA[currentUser.clearanceLevel]?.badgeColor || 'bg-slate-700'}`}>
                  Level {currentUser.clearanceLevel} Clearance
                </span>
              </span>
            ) : (
              <span className="text-amber-400 font-medium">No Operator Logged In (Guest View)</span>
            )}
          </div>
          {currentUser && (
            <button
              onClick={() => {
                onLogout();
                setSuccessMsg('Logged out successfully.');
                setTimeout(() => setSuccessMsg(null), 1500);
              }}
              className="text-[11px] text-slate-400 hover:text-red-400 flex items-center gap-1 transition"
            >
              <Lock className="w-3.5 h-3.5" />
              Lock Session / Log Out
            </button>
          )}
        </div>

        {/* Tabs for Master Admin */}
        <div className="flex border-b border-slate-800 bg-slate-900/50 text-xs">
          <button
            onClick={() => setActiveTab('login')}
            className={`flex-1 py-2.5 text-center font-medium border-b-2 transition ${
              activeTab === 'login' 
                ? 'border-indigo-500 text-indigo-300 bg-indigo-500/10' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Enter Logon Code
          </button>
          <button
            onClick={() => setActiveTab('manage')}
            className={`flex-1 py-2.5 text-center font-medium border-b-2 transition flex items-center justify-center gap-1.5 ${
              activeTab === 'manage' 
                ? 'border-indigo-500 text-indigo-300 bg-indigo-500/10' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
            Staff Directory & Codes ({allUsers.length})
          </button>
        </div>

        <div className="p-5">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-900/30 border border-red-500/50 text-red-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 rounded-lg bg-emerald-900/30 border border-emerald-500/50 text-emerald-200 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {activeTab === 'login' ? (
            <div>
              {/* Master Admin One-Click Quick Badge */}
              <div className="mb-4 p-3.5 rounded-xl bg-gradient-to-r from-red-950/60 to-slate-900 border border-red-500/40">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400 font-bold">
                      👑
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        Mark Mikealson
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-red-500/30 text-red-300 border border-red-500/40 font-mono">
                          MASTER ADMIN (Level 5)
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Logon Code: <span className="font-mono font-bold text-amber-300">790922</span> &bull; All highest clearance
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleQuickLogin('790922')}
                    className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-medium text-xs shadow-md transition flex items-center gap-1"
                  >
                    <Unlock className="w-3.5 h-3.5" />
                    Log In as Mark
                  </button>
                </div>
              </div>

              {/* Logon Code Form & Keypad */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Enter Allocated Management Code:
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      maxLength={6}
                      value={code}
                      onChange={e => {
                        setCode(e.target.value);
                        setError(null);
                      }}
                      placeholder="••••••"
                      className="w-full text-center text-2xl font-mono tracking-[0.5em] py-3 px-4 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                      autoFocus
                    />
                    {code.length > 0 && (
                      <button
                        type="button"
                        onClick={handleClear}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-700"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>

                {/* Visual PIN Keypad for touch / fast entry */}
                <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto pt-1">
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(digit => (
                    <button
                      key={digit}
                      type="button"
                      onClick={() => handleKeypadPress(digit)}
                      className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-base transition border border-slate-700/60 active:scale-95"
                    >
                      {digit}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={handleClear}
                    className="py-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-400 text-xs font-medium transition border border-slate-700/40"
                  >
                    Clear
                  </button>
                  <button
                    type="button"
                    onClick={() => handleKeypadPress('0')}
                    className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-base transition border border-slate-700/60 active:scale-95"
                  >
                    0
                  </button>
                  <button
                    type="button"
                    onClick={handleBackspace}
                    className="py-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-400 text-xs font-medium transition border border-slate-700/40"
                  >
                    ⌫
                  </button>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    Verify Code & Authorize Access
                  </button>
                </div>
              </form>

              {/* Quick switch roster list */}
              <div className="mt-5 pt-4 border-t border-slate-800">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Quick Switch Management Roster:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {allUsers.map(user => (
                    <button
                      key={user.id}
                      onClick={() => handleQuickLogin(user.logonCode)}
                      className={`text-left p-2.5 rounded-lg border transition flex items-center justify-between text-xs ${
                        currentUser?.id === user.id 
                          ? 'bg-indigo-900/40 border-indigo-500/60 text-white' 
                          : 'bg-slate-800/60 hover:bg-slate-800 border-slate-700/60 text-slate-300'
                      }`}
                    >
                      <div>
                        <div className="font-semibold text-white flex items-center gap-1.5">
                          {user.name}
                          {user.isMasterAdmin && <span>👑</span>}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {user.role} &bull; L{user.clearanceLevel}
                        </div>
                      </div>
                      <span className="font-mono text-[11px] text-indigo-300 font-bold bg-indigo-950 px-2 py-0.5 rounded border border-indigo-800">
                        {user.logonCode}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Management Roster and Code Allocation */
            <div className="space-y-4">
              <div className="text-xs text-slate-300 bg-slate-800/60 p-3 rounded-xl border border-slate-700">
                <div className="font-semibold text-white mb-1 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-indigo-400" />
                  Management Staff Allocated Logons & Clearance Matrix
                </div>
                Staff in management must log on with an allocated code matching their designated operational authority.
              </div>

              {/* Staff table */}
              <div className="divide-y divide-slate-800 border border-slate-800 rounded-xl overflow-hidden bg-slate-800/40">
                {allUsers.map(u => (
                  <div key={u.id} className="p-3 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white bg-gradient-to-tr ${u.avatarColor || 'from-indigo-500 to-sky-500'}`}>
                        {u.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-white flex items-center gap-1.5">
                          {u.name}
                          {u.isMasterAdmin && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-red-500/20 text-red-300 border border-red-500/40">
                              App Admin
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {u.role} &bull; {u.department}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${CLEARANCE_METADATA[u.clearanceLevel]?.badgeColor || 'bg-slate-700'}`}>
                        Level {u.clearanceLevel}
                      </span>
                      <span className="font-mono text-xs font-bold text-amber-300 bg-slate-900 px-2 py-1 rounded border border-slate-700">
                        {u.logonCode}
                      </span>
                      {isMasterAdmin && !u.isMasterAdmin && onDeleteUser && (
                        <button
                          onClick={() => onDeleteUser(u.id)}
                          className="p-1 rounded text-slate-500 hover:text-red-400 hover:bg-slate-800"
                          title="Revoke Logon Code"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Create new code section (Master Admin or Level 4) */}
              {isMasterAdmin ? (
                <div className="p-4 rounded-xl bg-slate-800 border border-slate-700">
                  <div className="font-semibold text-xs text-white mb-2 flex items-center gap-1.5">
                    <Plus className="w-3.5 h-3.5 text-indigo-400" />
                    Allocate New Staff Logon Code
                  </div>
                  <form onSubmit={handleCreateNewUser} className="space-y-3 text-xs">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1">Staff Full Name</label>
                        <input
                          type="text"
                          value={newName}
                          onChange={e => setNewName(e.target.value)}
                          placeholder="e.g. Sindi Ndlovu"
                          className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs outline-none"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1">Operational Role</label>
                        <input
                          type="text"
                          value={newRole}
                          onChange={e => setNewRole(e.target.value)}
                          placeholder="e.g. VIP Concierge Lead"
                          className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs outline-none"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1">Clearance Level</label>
                        <select
                          value={newClearance}
                          onChange={e => setNewClearance(Number(e.target.value) as ClearanceLevel)}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs outline-none"
                        >
                          <option value={1}>Level 1 - Floor Crew & Technical</option>
                          <option value={2}>Level 2 - Front Desk & Rooms</option>
                          <option value={3}>Level 3 - Catering & Event Lead</option>
                          <option value={4}>Level 4 - Operations Director</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1">Allocated 6-Digit Code</label>
                        <input
                          type="text"
                          maxLength={6}
                          value={newCode}
                          onChange={e => setNewCode(e.target.value)}
                          placeholder="e.g. 554129"
                          className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono text-xs outline-none"
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition"
                    >
                      Authorize & Issue Logon Code
                    </button>
                  </form>
                </div>
              ) : (
                <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700 text-xs text-slate-400 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Only Master Admin Mark Mikealson (790922) can create or revoke management logon codes.</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
