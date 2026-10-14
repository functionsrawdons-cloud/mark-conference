import { ConferenceDetails, ConferenceTask } from '../types/conference';

export const INITIAL_CONFERENCE_DETAILS: ConferenceDetails = {
  title: 'Annual Innovation & Tech Conference 2025',
  theme: 'Shaping the Next Frontier of African & Global Tech',
  startDate: '2025-09-18',
  endDate: '2025-09-20',
  venue: 'Cape Town International Convention Centre (CTICC)',
  city: 'Cape Town, South Africa',
  expectedAttendees: 850,
  overallBudgetLimit: 150000
};

// Exact seed data from user prompt + comprehensive conference operational tasks
export const INITIAL_TASKS: ConferenceTask[] = [
  // User's provided 3 tasks:
  {
    id: 'task-1-book-venue',
    taskName: 'Book Venue',
    category: 'Accommodation & Venue',
    assignedLead: 'Alice',
    status: 'Complete',
    priority: 'High',
    dueDate: '2024-05-01',
    budgetedCost: 5000,
    actualCost: 5000,
    notes: 'Confirmed deposit with venue management. Contract signed.',
    createdAt: '2024-04-01T10:00:00Z',
    updatedAt: '2024-05-01T14:30:00Z'
  },
  {
    id: 'task-2-finalize-menu',
    taskName: 'Finalize Menu',
    category: 'Meals & Catering',
    assignedLead: 'Bob',
    status: 'In Progress',
    priority: 'Medium',
    dueDate: '2024-06-01',
    budgetedCost: 2000,
    actualCost: null,
    notes: 'Pending dietary reqs from early bird attendee surveys.',
    createdAt: '2024-04-10T11:00:00Z',
    updatedAt: '2024-05-12T16:00:00Z'
  },
  {
    id: 'task-3-order-lanyards',
    taskName: 'Order Lanyards',
    category: 'Stationery & Supplies',
    assignedLead: 'Charlie',
    status: 'Not Started',
    priority: 'Low',
    dueDate: '2024-07-01',
    budgetedCost: 500,
    actualCost: null,
    notes: 'Awaiting badge design approval before sending to printer.',
    createdAt: '2024-04-15T09:00:00Z',
    updatedAt: '2024-04-15T09:00:00Z'
  },
  // Additional realistic conference operations tasks:
  {
    id: 'task-4-keynote-contracts',
    taskName: 'Confirm Keynote Speakers & Travel',
    category: 'Speakers & Program',
    assignedLead: 'Alice',
    status: 'Complete',
    priority: 'Urgent',
    dueDate: '2024-05-15',
    budgetedCost: 6500,
    actualCost: 6200,
    notes: 'All 3 headliners signed. Flight itineraries booked under budget.',
    createdAt: '2024-04-05T08:30:00Z',
    updatedAt: '2024-05-16T12:00:00Z'
  },
  {
    id: 'task-5-av-production',
    taskName: 'AV & Live Streaming Equipment Contract',
    category: 'Audio & Visual / Tech',
    assignedLead: 'Elena',
    status: 'In Progress',
    priority: 'High',
    dueDate: '2024-06-15',
    budgetedCost: 4500,
    actualCost: 4800,
    notes: 'Added secondary overflow room camera feed (+$300 variance).',
    createdAt: '2024-04-20T14:00:00Z',
    updatedAt: '2024-05-20T10:00:00Z'
  },
  {
    id: 'task-6-sponsorship-deck',
    taskName: 'Distribute Tier 1 Sponsorship Packages',
    category: 'Sponsorship & Partners',
    assignedLead: 'Marcus',
    status: 'Complete',
    priority: 'High',
    dueDate: '2024-05-10',
    budgetedCost: 800,
    actualCost: 650,
    notes: 'Secured 4 Platinum and 8 Gold sponsors. Revenue targets exceeded.',
    createdAt: '2024-04-02T10:00:00Z',
    updatedAt: '2024-05-11T17:00:00Z'
  },
  {
    id: 'task-7-attendee-app',
    taskName: 'Deploy Mobile Conference App & Schedule',
    category: 'Audio & Visual / Tech',
    assignedLead: 'Elena',
    status: 'Under Review',
    priority: 'Medium',
    dueDate: '2024-06-20',
    budgetedCost: 1800,
    actualCost: 1500,
    notes: 'Beta build tested by volunteer leads. Ready for App Store submission.',
    createdAt: '2024-05-01T10:00:00Z',
    updatedAt: '2024-05-25T11:00:00Z'
  },
  {
    id: 'task-8-volunteer-training',
    taskName: 'Recruit and Brief 35 Volunteer Ushers',
    category: 'Volunteers & Staffing',
    assignedLead: 'Charlie',
    status: 'In Progress',
    priority: 'Medium',
    dueDate: '2024-07-10',
    budgetedCost: 1200,
    actualCost: null,
    notes: 'T-shirts and meal vouchers budgeted. Zoom orientation scheduled for July 5.',
    createdAt: '2024-05-10T13:00:00Z',
    updatedAt: '2024-05-28T15:00:00Z'
  },
  {
    id: 'task-9-signage-banners',
    taskName: 'Print Directional Signage & Sponsor Backdrops',
    category: 'Stationery & Supplies',
    assignedLead: 'Bob',
    status: 'Blocked',
    priority: 'High',
    dueDate: '2024-06-25',
    budgetedCost: 2200,
    actualCost: null,
    notes: 'Awaiting final high-res vector logos from 2 secondary sponsors.',
    createdAt: '2024-05-15T09:00:00Z',
    updatedAt: '2024-05-29T14:00:00Z'
  },
  {
    id: 'task-10-swag-bags',
    taskName: 'Eco-Friendly Attendee Swag Bags Assembly',
    category: 'Stationery & Supplies',
    assignedLead: 'Charlie',
    status: 'Not Started',
    priority: 'Low',
    dueDate: '2024-07-15',
    budgetedCost: 3500,
    actualCost: null,
    notes: 'Contains bamboo notebooks, custom insulated tumblers, stickers.',
    createdAt: '2024-05-18T10:00:00Z',
    updatedAt: '2024-05-18T10:00:00Z'
  },
  {
    id: 'task-11-hotel-block',
    taskName: 'Reserve Speaker & VIP Hotel Room Block',
    category: 'Accommodation & Venue',
    assignedLead: 'Alice',
    status: 'Complete',
    priority: 'High',
    dueDate: '2024-05-25',
    budgetedCost: 4000,
    actualCost: 3950,
    notes: '25 rooms locked at Marriott Grand with complimentary lounge access.',
    createdAt: '2024-04-25T11:00:00Z',
    updatedAt: '2024-05-26T10:00:00Z'
  },
  {
    id: 'task-12-social-mixer',
    taskName: 'Book Opening Evening Rooftop Mixer',
    category: 'Meals & Catering',
    assignedLead: 'Bob',
    status: 'In Progress',
    priority: 'Medium',
    dueDate: '2024-06-18',
    budgetedCost: 3000,
    actualCost: null,
    notes: 'Negotiating beverage minimum and acoustic jazz duo.',
    createdAt: '2024-05-02T15:00:00Z',
    updatedAt: '2024-05-27T16:00:00Z'
  }
];

export const DEFAULT_CATEGORIES = [
  'Accommodation & Venue',
  'Meals & Catering',
  'Stationery & Supplies',
  'Speakers & Program',
  'Audio & Visual / Tech',
  'Sponsorship & Partners',
  'Volunteers & Staffing',
  'Marketing & Promotion',
  'Registration & Badging',
  'General Operations'
];

export const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string; accent: string }> = {
  'Accommodation & Venue': { bg: 'bg-emerald-50 dark:bg-emerald-950/40', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-200 dark:border-emerald-800', accent: '#059669' },
  'Meals & Catering': { bg: 'bg-amber-50 dark:bg-amber-950/40', text: 'text-amber-700 dark:text-amber-300', border: 'border-amber-200 dark:border-amber-800', accent: '#d97706' },
  'Stationery & Supplies': { bg: 'bg-sky-50 dark:bg-sky-950/40', text: 'text-sky-700 dark:text-sky-300', border: 'border-sky-200 dark:border-sky-800', accent: '#0284c7' },
  'Speakers & Program': { bg: 'bg-indigo-50 dark:bg-indigo-950/40', text: 'text-indigo-700 dark:text-indigo-300', border: 'border-indigo-200 dark:border-indigo-800', accent: '#4f46e5' },
  'Audio & Visual / Tech': { bg: 'bg-purple-50 dark:bg-purple-950/40', text: 'text-purple-700 dark:text-purple-300', border: 'border-purple-200 dark:border-purple-800', accent: '#9333ea' },
  'Sponsorship & Partners': { bg: 'bg-rose-50 dark:bg-rose-950/40', text: 'text-rose-700 dark:text-rose-300', border: 'border-rose-200 dark:border-rose-800', accent: '#e11d48' },
  'Volunteers & Staffing': { bg: 'bg-teal-50 dark:bg-teal-950/40', text: 'text-teal-700 dark:text-teal-300', border: 'border-teal-200 dark:border-teal-800', accent: '#0d9488' },
  'Marketing & Promotion': { bg: 'bg-pink-50 dark:bg-pink-950/40', text: 'text-pink-700 dark:text-pink-300', border: 'border-pink-200 dark:border-pink-800', accent: '#db2777' },
  'Registration & Badging': { bg: 'bg-cyan-50 dark:bg-cyan-950/40', text: 'text-cyan-700 dark:text-cyan-300', border: 'border-cyan-200 dark:border-cyan-800', accent: '#0891b2' },
  'General Operations': { bg: 'bg-slate-50 dark:bg-slate-800/40', text: 'text-slate-700 dark:text-slate-300', border: 'border-slate-200 dark:border-slate-700', accent: '#475569' }
};

export const LEAD_AVATARS: Record<string, { color: string; initials: string }> = {
  Alice: { color: 'bg-blue-600 text-white', initials: 'AL' },
  Bob: { color: 'bg-emerald-600 text-white', initials: 'BO' },
  Charlie: { color: 'bg-amber-600 text-white', initials: 'CH' },
  Elena: { color: 'bg-purple-600 text-white', initials: 'EL' },
  Marcus: { color: 'bg-rose-600 text-white', initials: 'MA' }
};

export function getLeadInfo(lead: string) {
  if (LEAD_AVATARS[lead]) return LEAD_AVATARS[lead];
  const initials = lead
    .split(' ')
    .map(p => p[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || 'UN';
  return { color: 'bg-indigo-600 text-white', initials };
}
