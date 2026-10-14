import { ClearanceLevel, ManagementUser } from '../types/conference';

export const STORAGE_KEY_AUTH_USERS = 'convene_management_users_v3';
export const STORAGE_KEY_CURRENT_USER = 'convene_current_user_v3';

export const CLEARANCE_METADATA: Record<ClearanceLevel, {
  name: string;
  badgeColor: string;
  description: string;
  permissions: string[];
}> = {
  5: {
    name: 'Master App Admin (Level 5)',
    badgeColor: 'bg-red-500/20 text-red-300 border-red-500/40',
    description: 'All highest clearance & master app control. Sole authority to delete conferences, override double bookings, and manage management logon codes.',
    permissions: [
      'Full App Administration',
      'Create & Delete Conferences',
      'Override Double Booking Restrictions',
      'Create / Revoke Staff Logon Codes & Clearances',
      'Full ZAR Financial & Contract Authority',
      'Full Database Backup / Restore'
    ]
  },
  4: {
    name: 'Senior Operations Director (Level 4)',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    description: 'Executive management authority. Can create and manage conferences, set budgets, sign client contracts, and assign staff rosters.',
    permissions: [
      'Create New Conferences & Edit Schedules',
      'Client Contract & Financial Cap Editing',
      'Full Staff Roster & Duty Scheduling',
      'Accommodation & Catering Master Controls',
      'Export System Reports'
    ]
  },
  3: {
    name: 'Event & Catering Coordinator (Level 3)',
    badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
    description: 'Event operations coordinator. Authority over guest registrations, VIP protocol, dietary requirements, and catering costings.',
    permissions: [
      'Catering & Menu Costing Management',
      'Guest Directory & Dietary Compliance',
      'Operational Task Management',
      'Read-Only on Master Client Contracts'
    ]
  },
  2: {
    name: 'Front Desk & Rooms Supervisor (Level 2)',
    badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
    description: 'Estate hospitality supervisor. Authority over room allocations, guest check-ins, key issuance, and housekeeping inspections.',
    permissions: [
      'Accommodation Room Allocations',
      'Guest Check-In & Arrival Processing',
      'Housekeeping Checklist Sign-Offs',
      'Guest Directory Lookups'
    ]
  },
  1: {
    name: 'Floor Crew & Technical Lead (Level 1)',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    description: 'On-site technical and floor operations. Real-time run sheet tracking, AV status updates, and checklist verification.',
    permissions: [
      'Update Task Execution Status',
      'Printable Run Sheets & Checklists',
      'View Scheduled Timelines',
      'Read-Only on Financial Data'
    ]
  }
};

export const DEFAULT_MANAGEMENT_USERS: ManagementUser[] = [
  {
    id: 'user-mark-mikealson',
    name: 'Mark Mikealson',
    logonCode: '790922',
    role: 'Master App Admin & Managing Director',
    clearanceLevel: 5,
    department: 'Executive Leadership',
    isMasterAdmin: true,
    avatarColor: 'from-amber-500 to-red-600',
    notes: 'Master administrator with all highest clearance across all modules and conference records.'
  },
  {
    id: 'user-elena-rostova',
    name: 'Elena Rostova',
    logonCode: '481023',
    role: 'Senior Operations Director',
    clearanceLevel: 4,
    department: 'Operations & Logistics',
    avatarColor: 'from-purple-500 to-indigo-600',
    notes: 'Senior conference planning lead and client contract signatory.'
  },
  {
    id: 'user-marcus-venter',
    name: 'Marcus Venter',
    logonCode: '320914',
    role: 'Head of Catering & Food Operations',
    clearanceLevel: 3,
    department: 'Kitchen & Catering',
    avatarColor: 'from-indigo-500 to-sky-600',
    notes: 'Executive chef and menu costing specialist.'
  },
  {
    id: 'user-sarah-jenkins',
    name: 'Sarah Jenkins',
    logonCode: '219845',
    role: 'Front Desk & Accommodation Supervisor',
    clearanceLevel: 2,
    department: 'Front Desk & Guest Services',
    avatarColor: 'from-sky-500 to-teal-600',
    notes: 'Estate accommodation and VIP room concierge.'
  },
  {
    id: 'user-david-ndlovu',
    name: 'David Ndlovu',
    logonCode: '104582',
    role: 'Floor AV & Technical Supervisor',
    clearanceLevel: 1,
    department: 'AV, Sound & Technical',
    avatarColor: 'from-emerald-500 to-teal-600',
    notes: 'Lead audio visual technician and stage coordinator.'
  }
];

export function getStoredManagementUsers(): ManagementUser[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_AUTH_USERS);
    if (raw) {
      const parsed: ManagementUser[] = JSON.parse(raw);
      // Ensure Mark Mikealson exists with 790922 and level 5
      const hasMark = parsed.some(u => u.logonCode === '790922' || u.name.toLowerCase().includes('mark mikealson'));
      if (!hasMark) {
        parsed.unshift(DEFAULT_MANAGEMENT_USERS[0]);
      } else {
        // Enforce Mark's credentials never get downgraded accidentally
        parsed.forEach(u => {
          if (u.name.toLowerCase().includes('mark mikealson') || u.logonCode === '790922') {
            u.logonCode = '790922';
            u.clearanceLevel = 5;
            u.isMasterAdmin = true;
          }
        });
      }
      return parsed;
    }
  } catch (e) {
    console.error('Failed to load management users from storage', e);
  }
  return DEFAULT_MANAGEMENT_USERS;
}

export function saveStoredManagementUsers(users: ManagementUser[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_AUTH_USERS, JSON.stringify(users));
  } catch (e) {
    console.error('Failed to persist management users', e);
  }
}

export function getStoredCurrentUser(): ManagementUser {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CURRENT_USER);
    if (raw) {
      const user: ManagementUser = JSON.parse(raw);
      // If user was Mark Mikealson, ensure 790922 & Level 5
      if (user.logonCode === '790922' || user.name.toLowerCase().includes('mark mikealson')) {
        user.clearanceLevel = 5;
        user.isMasterAdmin = true;
      }
      return user;
    }
  } catch (e) {
    console.error('Failed to load current user', e);
  }
  // Default to Mark Mikealson as Master Admin for instant authorized preview
  return DEFAULT_MANAGEMENT_USERS[0];
}

export function saveStoredCurrentUser(user: ManagementUser | null): void {
  try {
    if (user) {
      localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY_CURRENT_USER);
    }
  } catch (e) {
    console.error('Failed to persist current user', e);
  }
}

// Authentication by Logon Code
export function authenticateWithCode(code: string, users: ManagementUser[]): ManagementUser | null {
  const cleanCode = code.trim();
  const match = users.find(u => u.logonCode === cleanCode);
  return match || null;
}
