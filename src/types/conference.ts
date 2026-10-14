export type TaskStatus = 'Not Started' | 'In Progress' | 'Under Review' | 'Complete' | 'Blocked';
export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Urgent';

export interface ConferenceTask {
  id: string;
  taskName: string;
  category: string;
  assignedLead: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string; // YYYY-MM-DD
  budgetedCost: number;
  actualCost: number | null;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface ConferenceDetails {
  title: string;
  theme: string;
  startDate: string;
  endDate: string;
  venue: string;
  hall?: string; // Specific Hall / Room (e.g. 'Drakensberg Main Hall', 'Highland Pavilion')
  city: string;
  expectedAttendees: number;
  overallBudgetLimit: number;
}

export type ViewMode = 'table' | 'kanban' | 'budget' | 'timeline' | 'leads';
export type MainSection = 
  | 'conferences'
  | 'tasks' 
  | 'client' 
  | 'guests' 
  | 'accommodation' 
  | 'catering' 
  | 'staff' 
  | 'checklists' 
  | 'templates'
  | 'clearance'
  | 'profit_loss';

// Clearance & Management Staff Authentication
export type ClearanceLevel = 1 | 2 | 3 | 4 | 5;

export interface ManagementUser {
  id: string;
  name: string;
  logonCode: string; // e.g. '790922'
  role: string;
  clearanceLevel: ClearanceLevel;
  department: string;
  isMasterAdmin?: boolean;
  avatarColor?: string;
  createdAt?: string;
  lastLoginAt?: string;
  notes?: string;
}

// Complete Independent Conference Record
export interface ConferenceRecord {
  id: string;
  createdAt: string;
  updatedAt: string;
  status: 'Upcoming' | 'In Session' | 'Completed' | 'Draft';
  details: ConferenceDetails;
  client: ClientDetails;
  tasks: ConferenceTask[];
  guests: GuestDetails[];
  rooms: AccommodationRoom[];
  menuItems: MenuItemCosting[];
  staff: StaffMember[];
  archived?: boolean;
}

// Double Booking Conflict Detection
export interface BookingConflict {
  id: string;
  type: 'venue_hall' | 'accommodation_room' | 'staff_double_booked';
  severity: 'blocking' | 'warning';
  title: string;
  description: string;
  conferenceIdA: string;
  conferenceTitleA: string;
  conferenceIdB: string;
  conferenceTitleB: string;
  overlappingDates: string;
  conflictingResource: string;
}

// Staff & Crew Management Schema
export type StaffDepartment = 
  | 'Housekeeping & Cleaning'
  | 'Kitchen & Catering'
  | 'AV, Sound & Technical'
  | 'Front Desk & Guest Services'
  | 'VIP Protocol & Hospitality'
  | 'Security & Health Safety'
  | 'Operations & Logistics';

export type StaffShift = 
  | 'Morning Shift (06:00 - 15:00)'
  | 'Mid Shift (10:00 - 19:00)'
  | 'Evening Shift (14:00 - 23:00)'
  | 'Night / Overnight (22:00 - 07:00)'
  | 'All-Day Operational Lead';

export type StaffDutyStatus = 'On Duty' | 'Scheduled' | 'On Break' | 'Standby / Off';

export interface StaffMember {
  id: string;
  staffId: string;
  fullName: string;
  email: string;
  phone: string;
  department: StaffDepartment;
  role: string;
  shift: StaffShift;
  assignedArea: string;
  status: StaffDutyStatus;
  dailyRate: number; // ZAR
  emergencyContact: string;
  certificationsNotes: string;
}

// Room Accommodation & Housekeeping Checklist Schema
export type RoomType = 'Luxury Suite' | 'Garden Cottage' | 'Executive King' | 'Deluxe Twin' | 'Standard Double';
export type AllocationStatus = 'Vacant' | 'Allocated' | 'Checked-In' | 'Blocked / Maintenance';
export type HousekeepingStatus = 'Clean & Inspected' | 'In Progress' | 'Needs Cleaning' | 'Turnover / Dirty' | 'Maintenance Issue';

export interface HousekeepingChecklist {
  linenChanged: boolean;
  bathroomSanitized: boolean;
  toiletriesStocked: boolean;
  teaCoffeeReplenished: boolean;
  hvacFireplaceChecked: boolean;
  welcomePackPlaced: boolean;
  keysTested: boolean;
  minibarRestocked: boolean;
  supervisorInspection: boolean;
}

export interface AccommodationRoom {
  id: string;
  roomNumber: string;
  roomName: string;
  roomType: RoomType;
  wing: string;
  bedConfiguration: string;
  maxOccupancy: number;
  nightlyRate: number; // ZAR
  allocationStatus: AllocationStatus;
  allocatedGuestId: string | null;
  allocatedGuestName: string | null;
  allocatedGuestOrg: string | null;
  checkInDate: string;
  checkOutDate: string;
  totalNights: number;
  specialRequests: string;
  housekeepingStatus: HousekeepingStatus;
  housekeepingAttendant: string;
  inspectionSignOff: boolean;
  inspectedBy: string | null;
  checklist: HousekeepingChecklist;
  lastCleanedAt: string | null;
  notes: string;
}

export interface FilterOptions {
  search: string;
  category: string;
  lead: string;
  status: string;
  priority: string;
  costFilter: 'all' | 'over_budget' | 'under_budget' | 'unsettled';
  dateRange: 'all' | 'overdue' | 'upcoming_7d' | 'upcoming_30d';
}

// 1. Client Details Schema
export interface ClientDetails {
  clientName: string;
  organization: string;
  contactPerson: string;
  email: string;
  phone: string;
  vatNumber: string;
  billingAddress: string;
  eventName: string;
  eventDates: string;
  venueBooked: string;
  guaranteedAttendees: number;
  agreedBudgetCap: number; // ZAR
  depositPaid: number; // ZAR
  balanceDue: number; // ZAR
  paymentTerms: string;
  specialClauses: string;
  status: 'Contract Signed' | 'Drafting' | 'Deposit Pending' | 'Settled';
}

// 2. Individual Guest Details Schema
export type GuestTicketType = 'VIP' | 'Speaker' | 'Standard' | 'Sponsor' | 'Staff' | 'Media';
export type GuestRegistrationStatus = 'Confirmed' | 'Checked-In' | 'Pending' | 'Cancelled';
export type DietaryRequirement = 
  | 'Standard / None'
  | 'Halaal Certified'
  | 'Kosher Certified'
  | 'Vegetarian'
  | 'Vegan'
  | 'Gluten-Free'
  | 'Nut Allergy'
  | 'Diabetic Friendly';

export interface GuestDetails {
  id: string;
  ticketNumber: string;
  fullName: string;
  email: string;
  organization: string;
  jobTitle: string;
  ticketType: GuestTicketType;
  status: GuestRegistrationStatus;
  dietary: DietaryRequirement;
  allergiesNotes: string;
  tableAssignment: string;
  attendingGala: 'Yes' | 'No';
  ticketPrice: number; // ZAR
  notes: string;
}

// 3. Food Menu Choice & Catering Costing Breakdown Schema
export interface MenuItemCosting {
  id: string;
  mealSession: string; // e.g. Day 1 Morning Tea, Day 1 Plated Lunch, Day 2 Buffet
  courseCategory: string; // Canapés, Starters, Mains, Desserts, Beverages, Refreshments
  itemName: string;
  dietaryClassification: string; // Standard, Vegetarian, Vegan, Halaal Certified, Gluten-Free
  servingStyle: string; // Plated 3-Course, Buffet, Live Carvery Station, Cocktail Canapé
  unitCostPerHead: number; // ZAR
  expectedGuestCount: number;
  serviceSurcharge: number; // ZAR (chef/waitstaff/plating)
  totalCost: number; // ZAR = (unitCost * count) + surcharge
  vendorNotes: string;
}
