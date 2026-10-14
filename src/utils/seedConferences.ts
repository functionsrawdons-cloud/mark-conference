import { ConferenceRecord } from '../types/conference';
import { INITIAL_CONFERENCE_DETAILS, INITIAL_TASKS } from './initialData';
import { 
  INITIAL_ACCOMMODATION_ROOMS, 
  INITIAL_CLIENT_DATA, 
  INITIAL_GUESTS_DATA, 
  INITIAL_MENU_COSTING, 
  INITIAL_STAFF_DATA 
} from './csvTemplates';

export const SEED_CONFERENCES: ConferenceRecord[] = [
  {
    id: 'conf-tech-2025',
    createdAt: '2025-01-10T08:00:00Z',
    updatedAt: '2025-05-15T14:30:00Z',
    status: 'Upcoming',
    details: {
      ...INITIAL_CONFERENCE_DETAILS,
      hall: 'Drakensberg Main Hall',
      venue: 'Rawdons Estate & Conference Centre',
      city: 'Nottingham Road, KwaZulu-Natal'
    },
    client: {
      ...INITIAL_CLIENT_DATA,
      organization: 'Venture Capital & Tech Africa Ltd',
      venueBooked: 'Rawdons Estate - Drakensberg Main Hall'
    },
    tasks: INITIAL_TASKS,
    guests: INITIAL_GUESTS_DATA,
    rooms: INITIAL_ACCOMMODATION_ROOMS,
    menuItems: INITIAL_MENU_COSTING,
    staff: INITIAL_STAFF_DATA
  },
  {
    id: 'conf-agri-2026',
    createdAt: '2026-02-01T09:00:00Z',
    updatedAt: '2026-06-20T11:00:00Z',
    status: 'Upcoming',
    details: {
      title: 'KZN Agri-Tech Innovations Symposium 2026',
      theme: 'Precision Agriculture, Irrigation Tech & Sustainable Farming',
      startDate: '2026-10-22',
      endDate: '2026-10-24',
      venue: 'Rawdons Estate & Conference Centre',
      hall: 'Highland Pavilion & Lawns',
      city: 'Nottingham Road, KwaZulu-Natal',
      expectedAttendees: 140,
      overallBudgetLimit: 195000
    },
    client: {
      clientName: 'AgriFuture Africa Alliance',
      organization: 'Southern African Farmers Cooperative',
      contactPerson: 'Dr. Thabo Mthembu',
      email: 't.mthembu@agrifuture.co.za',
      phone: '+27 82 445 9012',
      vatNumber: 'ZA4889123049',
      billingAddress: '44 Midlands Way, Pietermaritzburg, 3201',
      eventName: 'KZN Agri-Tech Innovations Symposium 2026',
      eventDates: '22 - 24 Oct 2026',
      venueBooked: 'Rawdons Estate - Highland Pavilion & Lawns',
      guaranteedAttendees: 140,
      agreedBudgetCap: 195000,
      depositPaid: 80000,
      balanceDue: 115000,
      paymentTerms: '50% on signature, remainder 14 days before event',
      specialClauses: 'Outdoor tractor & drone demonstration zone setup on North Lawn.',
      status: 'Contract Signed'
    },
    tasks: [
      {
        id: 'task-agri-1',
        taskName: 'Drone Flight Demo Airspace Clearance',
        category: 'AV, Sound & Technical',
        assignedLead: 'David Ndlovu',
        status: 'In Progress',
        priority: 'High',
        dueDate: '2026-09-15',
        budgetedCost: 8500,
        actualCost: null,
        notes: 'Coordinating with local municipal aviation authority for demonstration corridor.',
        createdAt: '2026-02-15T10:00:00Z',
        updatedAt: '2026-03-01T14:00:00Z'
      },
      {
        id: 'task-agri-2',
        taskName: 'Outdoor Marquee & Audio Relay Setup',
        category: 'Accommodation & Venue',
        assignedLead: 'Elena Rostova',
        status: 'Not Started',
        priority: 'High',
        dueDate: '2026-10-18',
        budgetedCost: 28000,
        actualCost: null,
        notes: 'Highland Pavilion weather-sealed extension marquees and outdoor sound towers.',
        createdAt: '2026-02-20T11:00:00Z',
        updatedAt: '2026-02-20T11:00:00Z'
      },
      {
        id: 'task-agri-3',
        taskName: 'Farm-to-Table Gala Dinner Menu Tasting',
        category: 'Meals & Catering',
        assignedLead: 'Marcus Venter',
        status: 'Complete',
        priority: 'Medium',
        dueDate: '2026-08-10',
        budgetedCost: 15000,
        actualCost: 14200,
        notes: 'Midlands trout, local beef carpaccio, and estate craft beer pairing finalized.',
        createdAt: '2026-03-01T09:00:00Z',
        updatedAt: '2026-08-10T16:00:00Z'
      }
    ],
    guests: [
      {
        id: 'gst-agri-1',
        ticketNumber: 'AGR-001-VIP',
        fullName: 'Prof. Willem van der Merwe',
        email: 'willem.vdm@sun.ac.za',
        organization: 'Stellenbosch AgriScience Institute',
        jobTitle: 'Keynote Speaker & Soil Scientist',
        ticketType: 'Speaker',
        status: 'Confirmed',
        dietary: 'Standard / None',
        allergiesNotes: 'None',
        tableAssignment: 'Table 1 - VIP Keynote',
        attendingGala: 'Yes',
        ticketPrice: 0,
        notes: 'Keynote opener on precision soil analytics.'
      },
      {
        id: 'gst-agri-2',
        ticketNumber: 'AGR-002-DEL',
        fullName: 'Nandi Khumalo',
        email: 'nandi@kznfarming.org.za',
        organization: 'KZN Agro-Processing Forum',
        jobTitle: 'Managing Director',
        ticketType: 'Standard',
        status: 'Confirmed',
        dietary: 'Halaal Certified',
        allergiesNotes: 'Strict Halaal preparation',
        tableAssignment: 'Table 3',
        attendingGala: 'Yes',
        ticketPrice: 2800,
        notes: 'Panelist for Session 3.'
      }
    ],
    rooms: INITIAL_ACCOMMODATION_ROOMS.map((r, idx) => ({
      ...r,
      allocatedGuestName: idx === 0 ? 'Prof. Willem van der Merwe' : null,
      allocatedGuestOrg: idx === 0 ? 'Stellenbosch AgriScience Institute' : null,
      allocationStatus: idx === 0 ? 'Allocated' : 'Vacant',
      checkInDate: '2026-10-21',
      checkOutDate: '2026-10-25'
    })),
    menuItems: INITIAL_MENU_COSTING.map(m => ({
      ...m,
      expectedGuestCount: 140,
      totalCost: (m.unitCostPerHead * 140) + m.serviceSurcharge
    })),
    staff: INITIAL_STAFF_DATA
  },
  {
    id: 'conf-med-2026',
    createdAt: '2026-03-01T10:00:00Z',
    updatedAt: '2026-07-10T15:00:00Z',
    status: 'Draft',
    details: {
      title: 'Midlands Medical & Healthcare Forum 2026',
      theme: 'Rural Medicine, Emergency Protocol & Clinical Governance',
      startDate: '2026-11-12',
      endDate: '2026-11-14',
      venue: 'Rawdons Estate & Conference Centre',
      hall: 'Brookside Executive Suite',
      city: 'Nottingham Road, KwaZulu-Natal',
      expectedAttendees: 85,
      overallBudgetLimit: 140000
    },
    client: {
      clientName: 'Southern Medical Specialists Council',
      organization: 'SMSC Healthcare Foundation',
      contactPerson: 'Dr. Anban Pillay',
      email: 'pillay.a@smsc-med.co.za',
      phone: '+27 83 710 8821',
      vatNumber: 'ZA4112998340',
      billingAddress: '12 Medical Square, Musgrave, Durban, 4001',
      eventName: 'Midlands Medical & Healthcare Forum 2026',
      eventDates: '12 - 14 Nov 2026',
      venueBooked: 'Rawdons Estate - Brookside Executive Suite',
      guaranteedAttendees: 85,
      agreedBudgetCap: 140000,
      depositPaid: 45000,
      balanceDue: 95000,
      paymentTerms: 'Deposit settled, balance 30 days prior',
      specialClauses: 'Dedicated quiet lounge with power backup for clinical simulation rigs.',
      status: 'Deposit Pending'
    },
    tasks: [
      {
        id: 'task-med-1',
        taskName: 'Clinical Simulation Monitors Calibration',
        category: 'AV, Sound & Technical',
        assignedLead: 'David Ndlovu',
        status: 'Not Started',
        priority: 'High',
        dueDate: '2026-11-05',
        budgetedCost: 6500,
        actualCost: null,
        notes: 'HDMI daisy chain and ultra-high-res medical feed verification.',
        createdAt: '2026-03-10T09:00:00Z',
        updatedAt: '2026-03-10T09:00:00Z'
      },
      {
        id: 'task-med-2',
        taskName: 'Catering Low-Sodium & Gluten-Free Verification',
        category: 'Meals & Catering',
        assignedLead: 'Marcus Venter',
        status: 'In Progress',
        priority: 'Medium',
        dueDate: '2026-10-30',
        budgetedCost: 3500,
        actualCost: null,
        notes: 'Specific dietary cards for medical attendees.',
        createdAt: '2026-03-12T11:00:00Z',
        updatedAt: '2026-03-12T11:00:00Z'
      }
    ],
    guests: [
      {
        id: 'gst-med-1',
        ticketNumber: 'MED-101-VIP',
        fullName: 'Dr. Fatima Bhamjee',
        email: 'fatima@bhamjeemedical.co.za',
        organization: 'KZN Health Department',
        jobTitle: 'Head of Trauma Response',
        ticketType: 'VIP',
        status: 'Confirmed',
        dietary: 'Halaal Certified',
        allergiesNotes: 'Shellfish allergy',
        tableAssignment: 'Table 2',
        attendingGala: 'Yes',
        ticketPrice: 3200,
        notes: 'Opening panel on emergency preparedness.'
      }
    ],
    rooms: INITIAL_ACCOMMODATION_ROOMS.map(r => ({
      ...r,
      allocationStatus: 'Vacant',
      allocatedGuestName: null,
      allocatedGuestOrg: null
    })),
    menuItems: INITIAL_MENU_COSTING.map(m => ({
      ...m,
      expectedGuestCount: 85,
      totalCost: (m.unitCostPerHead * 85) + m.serviceSurcharge
    })),
    staff: INITIAL_STAFF_DATA
  }
];

export const STORAGE_KEY_CONFERENCES = 'convene_all_conferences_v3';
export const STORAGE_KEY_ACTIVE_CONF_ID = 'convene_active_conference_id_v3';

export function getStoredConferences(): ConferenceRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CONFERENCES);
    if (raw) {
      const parsed: ConferenceRecord[] = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load conferences catalog from storage', e);
  }
  return SEED_CONFERENCES;
}

export function saveStoredConferences(conferences: ConferenceRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_CONFERENCES, JSON.stringify(conferences));
  } catch (e) {
    console.error('Failed to save conferences catalog', e);
  }
}

export function getStoredActiveConferenceId(conferences: ConferenceRecord[]): string {
  try {
    const savedId = localStorage.getItem(STORAGE_KEY_ACTIVE_CONF_ID);
    if (savedId && conferences.some(c => c.id === savedId)) {
      return savedId;
    }
  } catch (e) {
    console.error('Failed to load active conference ID', e);
  }
  return conferences[0]?.id || 'conf-tech-2025';
}

export function saveStoredActiveConferenceId(id: string): void {
  try {
    localStorage.setItem(STORAGE_KEY_ACTIVE_CONF_ID, id);
  } catch (e) {
    console.error('Failed to save active conference ID', e);
  }
}
