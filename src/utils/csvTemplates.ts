import { AccommodationRoom, ClientDetails, GuestDetails, MenuItemCosting, StaffMember } from '../types/conference';
import { downloadCSV, parseCSV } from './csv';

// ==========================================
// 1. CONFERENCE CLIENT DETAILS TEMPLATE
// ==========================================

export const CLIENT_CSV_HEADERS = [
  'Client Name',
  'Company/Organization',
  'Contact Person',
  'Email',
  'Phone',
  'VAT/Tax Number',
  'Billing Address',
  'Event Name',
  'Event Dates',
  'Venue Booked',
  'Guaranteed Attendees',
  'Agreed Budget Cap (ZAR)',
  'Deposit Paid (ZAR)',
  'Balance Due (ZAR)',
  'Payment Terms',
  'Contract Status',
  'Special Requests & Clauses'
] as const;

export const INITIAL_CLIENT_DATA: ClientDetails = {
  clientName: 'TechAfrica Holdings',
  organization: 'TechAfrica Group (Pty) Ltd',
  contactPerson: 'Dr. Sipho Ndlovu',
  email: 'sipho.ndlovu@techafrica.co.za',
  phone: '+27 11 982 4300',
  vatNumber: 'ZA4820194812',
  billingAddress: '14 Sandton Boulevard, Sandton, Johannesburg, 2196',
  eventName: 'Annual Innovation & Tech Conference 2025',
  eventDates: '18-20 September 2025',
  venueBooked: 'Cape Town International Convention Centre (CTICC)',
  guaranteedAttendees: 850,
  agreedBudgetCap: 450000,
  depositPaid: 200000,
  balanceDue: 250000,
  paymentTerms: '50% deposit upon contract signature, balance due 14 days prior to event kickoff.',
  specialClauses: 'Exclusive venue access from 06:00 on Day 1; high-speed fiber internet backup connection; dedicated prayer and reflection room; halaal certified kitchen isolation.',
  status: 'Contract Signed'
};

export function clientToCSV(client: ClientDetails): string {
  const escapeCell = (val: string | number | undefined | null) => {
    if (val === null || val === undefined) return '';
    const str = String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const header = CLIENT_CSV_HEADERS.join(',');
  const row = [
    escapeCell(client.clientName),
    escapeCell(client.organization),
    escapeCell(client.contactPerson),
    escapeCell(client.email),
    escapeCell(client.phone),
    escapeCell(client.vatNumber),
    escapeCell(client.billingAddress),
    escapeCell(client.eventName),
    escapeCell(client.eventDates),
    escapeCell(client.venueBooked),
    escapeCell(client.guaranteedAttendees),
    escapeCell(client.agreedBudgetCap),
    escapeCell(client.depositPaid),
    escapeCell(client.balanceDue),
    escapeCell(client.paymentTerms),
    escapeCell(client.status),
    escapeCell(client.specialClauses)
  ].join(',');

  return `${header}\n${row}`;
}

export function parseClientCSV(csvText: string): ClientDetails | null {
  const rows = parseCSV(csvText);
  if (rows.length < 2) return null;
  const r = rows[1];
  
  const cleanNum = (str: string | undefined): number => {
    if (!str) return 0;
    const clean = str.replace(/[$,€£R\s]|ZAR/gi, '').replace(/,/g, '');
    const val = parseFloat(clean);
    return isNaN(val) ? 0 : val;
  };

  return {
    clientName: r[0] || 'Conference Client',
    organization: r[1] || '',
    contactPerson: r[2] || '',
    email: r[3] || '',
    phone: r[4] || '',
    vatNumber: r[5] || '',
    billingAddress: r[6] || '',
    eventName: r[7] || '',
    eventDates: r[8] || '',
    venueBooked: r[9] || '',
    guaranteedAttendees: cleanNum(r[10]) || 850,
    agreedBudgetCap: cleanNum(r[11]) || 0,
    depositPaid: cleanNum(r[12]) || 0,
    balanceDue: cleanNum(r[13]) || 0,
    paymentTerms: r[14] || '',
    status: (r[15] as any) || 'Contract Signed',
    specialClauses: r[16] || ''
  };
}


// ==========================================
// 2. INDIVIDUAL GUEST DETAILS TEMPLATE
// ==========================================

export const GUEST_CSV_HEADERS = [
  'Ticket No',
  'Full Name',
  'Email',
  'Organization',
  'Job Title',
  'Ticket Type',
  'Registration Status',
  'Dietary Requirement',
  'Allergies & Medical Notes',
  'Table / Seating Assignment',
  'Attending Gala Dinner',
  'Ticket Price (ZAR)',
  'Notes'
] as const;

export const INITIAL_GUESTS_DATA: GuestDetails[] = [
  {
    id: 'guest-1',
    ticketNumber: 'TC-2025-001',
    fullName: 'Dr. Sipho Ndlovu',
    email: 'sipho.ndlovu@techafrica.co.za',
    organization: 'TechAfrica Holdings',
    jobTitle: 'Chief Executive Officer',
    ticketType: 'VIP',
    status: 'Confirmed',
    dietary: 'Standard / None',
    allergiesNotes: 'None',
    tableAssignment: 'Table 1 - Head Table',
    attendingGala: 'Yes',
    ticketPrice: 4500,
    notes: 'Keynote address Day 1 morning opening'
  },
  {
    id: 'guest-2',
    ticketNumber: 'TC-2025-002',
    fullName: 'Prof. Amina Petersen',
    email: 'amina.p@uct.ac.za',
    organization: 'University of Cape Town',
    jobTitle: 'Senior AI Researcher',
    ticketType: 'Speaker',
    status: 'Confirmed',
    dietary: 'Halaal Certified',
    allergiesNotes: 'Strictly halaal certified prep',
    tableAssignment: 'Table 3 - Speakers',
    attendingGala: 'Yes',
    ticketPrice: 0,
    notes: 'Panel moderator on Machine Learning Governance'
  },
  {
    id: 'guest-3',
    ticketNumber: 'TC-2025-003',
    fullName: 'Johan van der Merwe',
    email: 'johan.vdm@investsa.com',
    organization: 'InvestSA Capital',
    jobTitle: 'Managing Partner',
    ticketType: 'VIP',
    status: 'Confirmed',
    dietary: 'Kosher Certified',
    allergiesNotes: 'Double-wrapped sealed kosher dinner plate',
    tableAssignment: 'Table 2 - Sponsors VIP',
    attendingGala: 'Yes',
    ticketPrice: 4500,
    notes: 'Sponsor delegate delivering Day 2 opening toast'
  },
  {
    id: 'guest-4',
    ticketNumber: 'TC-2025-004',
    fullName: 'Lerato Khumalo',
    email: 'lerato.k@fininnovate.co.za',
    organization: 'FinInnovate Lab',
    jobTitle: 'Product Lead',
    ticketType: 'Standard',
    status: 'Checked-In',
    dietary: 'Vegetarian',
    allergiesNotes: 'No shellfish / seafood',
    tableAssignment: 'Table 8 - Innovations Hub',
    attendingGala: 'Yes',
    ticketPrice: 2800,
    notes: 'Early bird registration delegate'
  },
  {
    id: 'guest-5',
    ticketNumber: 'TC-2025-005',
    fullName: 'Michael Naidoo',
    email: 'michael.n@cloudworks.co.za',
    organization: 'Cloudworks Africa',
    jobTitle: 'DevOps Architect',
    ticketType: 'Standard',
    status: 'Pending',
    dietary: 'Gluten-Free',
    allergiesNotes: 'Coeliac disease - strict cross-contamination caution',
    tableAssignment: 'Table 12 - Engineering',
    attendingGala: 'No',
    ticketPrice: 2800,
    notes: 'Corporate group booking invoice pending'
  },
  {
    id: 'guest-6',
    ticketNumber: 'TC-2025-006',
    fullName: 'Zanele Dlamini',
    email: 'zanele@youthintech.org',
    organization: 'Youth in Tech Foundation',
    jobTitle: 'Program Director',
    ticketType: 'Media',
    status: 'Confirmed',
    dietary: 'Vegan',
    allergiesNotes: '100% plant-based meal requirement',
    tableAssignment: 'Media Deck 1',
    attendingGala: 'No',
    ticketPrice: 0,
    notes: 'Accredited tech press correspondent'
  },
  {
    id: 'guest-7',
    ticketNumber: 'TC-2025-007',
    fullName: 'Tariq Jacobs',
    email: 'tariq.j@cyberprotect.co.za',
    organization: 'CyberProtect SA',
    jobTitle: 'Chief Information Security Officer',
    ticketType: 'Sponsor',
    status: 'Confirmed',
    dietary: 'Halaal Certified',
    allergiesNotes: 'Mild nut sensitivity',
    tableAssignment: 'Table 2 - Sponsors VIP',
    attendingGala: 'Yes',
    ticketPrice: 3500,
    notes: 'Cybersecurity workshop host'
  },
  {
    id: 'guest-8',
    ticketNumber: 'TC-2025-008',
    fullName: 'Chloe Evans',
    email: 'chloe.e@greentech.org.za',
    organization: 'GreenTech Africa',
    jobTitle: 'Sustainability Director',
    ticketType: 'Standard',
    status: 'Confirmed',
    dietary: 'Nut Allergy',
    allergiesNotes: 'Severe airborne and ingestion peanut allergy (EpiPen carrier)',
    tableAssignment: 'Table 9 - Clean Energy',
    attendingGala: 'Yes',
    ticketPrice: 2800,
    notes: 'Advise catering staff of severe allergy table location'
  }
];

export function guestsToCSV(guests: GuestDetails[]): string {
  const escapeCell = (val: string | number | undefined | null) => {
    if (val === null || val === undefined) return '';
    const str = String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const lines = [GUEST_CSV_HEADERS.join(',')];

  for (const g of guests) {
    const row = [
      escapeCell(g.ticketNumber),
      escapeCell(g.fullName),
      escapeCell(g.email),
      escapeCell(g.organization),
      escapeCell(g.jobTitle),
      escapeCell(g.ticketType),
      escapeCell(g.status),
      escapeCell(g.dietary),
      escapeCell(g.allergiesNotes),
      escapeCell(g.tableAssignment),
      escapeCell(g.attendingGala),
      escapeCell(g.ticketPrice),
      escapeCell(g.notes)
    ].join(',');
    lines.push(row);
  }

  return lines.join('\n');
}

export function parseGuestCSV(csvText: string): GuestDetails[] {
  const rows = parseCSV(csvText);
  if (rows.length < 2) return [];

  const guests: GuestDetails[] = [];
  const cleanNum = (str: string | undefined): number => {
    if (!str) return 0;
    const clean = str.replace(/[$,€£R\s]|ZAR/gi, '').replace(/,/g, '');
    const val = parseFloat(clean);
    return isNaN(val) ? 0 : val;
  };

  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    if (r.length < 2 || !r[1]?.trim()) continue;

    guests.push({
      id: `guest-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 4)}`,
      ticketNumber: r[0] || `TC-${1000 + i}`,
      fullName: r[1] || 'Guest',
      email: r[2] || '',
      organization: r[3] || '',
      jobTitle: r[4] || '',
      ticketType: (r[5] as any) || 'Standard',
      status: (r[6] as any) || 'Confirmed',
      dietary: (r[7] as any) || 'Standard / None',
      allergiesNotes: r[8] || '',
      tableAssignment: r[9] || 'Open Seating',
      attendingGala: (r[10] as any) === 'No' ? 'No' : 'Yes',
      ticketPrice: cleanNum(r[11]),
      notes: r[12] || ''
    });
  }

  return guests;
}


// =========================================================================
// 3. FOOD MENU CHOICES & CATERING COST BREAKDOWN TEMPLATE
// =========================================================================

export const MENU_CSV_HEADERS = [
  'Meal Session',
  'Course / Category',
  'Dish Item Name & Description',
  'Dietary Classification',
  'Serving Style',
  'Unit Cost per Head (ZAR)',
  'Expected Guest Count',
  'Service & Staffing Surcharge (ZAR)',
  'Total Cost (ZAR)',
  'Vendor / Chef Notes'
] as const;

export const INITIAL_MENU_COSTING: MenuItemCosting[] = [
  {
    id: 'menu-1',
    mealSession: 'Day 1 - Morning Arrival Tea',
    courseCategory: 'Refreshments',
    itemName: 'Artisan Filter Coffee, Rooibos & Earl Grey Teas with Mini Cape Koeksisters and Savoury Spinach Pastries',
    dietaryClassification: 'Standard',
    servingStyle: 'Live Station',
    unitCostPerHead: 65,
    expectedGuestCount: 850,
    serviceSurcharge: 2500,
    totalCost: 57750,
    vendorNotes: 'Continuous hot tea and fresh brewed coffee top-ups between 07:30 and 10:00'
  },
  {
    id: 'menu-2',
    mealSession: 'Day 1 - Mid-Morning Break',
    courseCategory: 'Refreshments',
    itemName: 'Chilled Fresh Squeezed Citrus Juices & Fresh Fruit Skewers with Honey-Lime Drizzle',
    dietaryClassification: 'Vegan',
    servingStyle: 'Buffet',
    unitCostPerHead: 45,
    expectedGuestCount: 850,
    serviceSurcharge: 1500,
    totalCost: 39750,
    vendorNotes: '100% dairy-free, nut-free, and gluten-free fresh fruit skewers'
  },
  {
    id: 'menu-3',
    mealSession: 'Day 1 - Plated Executive Lunch',
    courseCategory: 'Starters',
    itemName: 'Heirloom Tomato & Smoked Buffalo Mozzarella with Wild Rocket and Aged Balsamic Reduction',
    dietaryClassification: 'Vegetarian',
    servingStyle: 'Plated 3-Course',
    unitCostPerHead: 85,
    expectedGuestCount: 850,
    serviceSurcharge: 3000,
    totalCost: 75250,
    vendorNotes: 'Alternative avocado tartare plated for strict vegan guests'
  },
  {
    id: 'menu-4',
    mealSession: 'Day 1 - Plated Executive Lunch',
    courseCategory: 'Mains',
    itemName: 'Pan-Seared Karoo Lamb Cutlet with Roasted Garlic Mash, Baby Carrots & Rosemary Jus',
    dietaryClassification: 'Halaal Certified',
    servingStyle: 'Plated 3-Course',
    unitCostPerHead: 220,
    expectedGuestCount: 650,
    serviceSurcharge: 5500,
    totalCost: 148500,
    vendorNotes: 'Certified halaal lamb cuts sealed and verified by Muslim Judicial Council / NIHT'
  },
  {
    id: 'menu-5',
    mealSession: 'Day 1 - Plated Executive Lunch',
    courseCategory: 'Mains',
    itemName: 'Pan-Fried Cape Kingklip with Lemon-Caper Butter Sauce, Wilted Baby Greens & Baby Potatoes',
    dietaryClassification: 'Gluten-Free',
    servingStyle: 'Plated 3-Course',
    unitCostPerHead: 210,
    expectedGuestCount: 120,
    serviceSurcharge: 1500,
    totalCost: 26700,
    vendorNotes: 'SASSI green-listed sustainable local seafood'
  },
  {
    id: 'menu-6',
    mealSession: 'Day 1 - Plated Executive Lunch',
    courseCategory: 'Mains',
    itemName: 'Wild Forest Mushroom & Truffle Oil Risotto with Crispy Sage Leaves and Shaved Vegan Parmesan',
    dietaryClassification: 'Vegan',
    servingStyle: 'Plated 3-Course',
    unitCostPerHead: 160,
    expectedGuestCount: 80,
    serviceSurcharge: 1000,
    totalCost: 13800,
    vendorNotes: 'Cooked in vegetable broth with olive oil base, strictly no dairy'
  },
  {
    id: 'menu-7',
    mealSession: 'Day 1 - Plated Executive Lunch',
    courseCategory: 'Desserts',
    itemName: 'Traditional Warm Malva Pudding with Amarula Crème Anglaise & Vanilla Bean Gelato',
    dietaryClassification: 'Standard',
    servingStyle: 'Plated 3-Course',
    unitCostPerHead: 75,
    expectedGuestCount: 850,
    serviceSurcharge: 2500,
    totalCost: 66250,
    vendorNotes: 'Non-alcoholic vanilla bean custard alternative provided on request'
  },
  {
    id: 'menu-8',
    mealSession: 'Day 1 - Networking Cocktail',
    courseCategory: 'Canapés',
    itemName: 'Smoked Salmon Blinis with Dill Cream, Spiced Bobotie Spring Rolls with Chutney, & Wild Mushroom Arancini',
    dietaryClassification: 'Standard',
    servingStyle: 'Cocktail Canapé',
    unitCostPerHead: 120,
    expectedGuestCount: 600,
    serviceSurcharge: 4000,
    totalCost: 76000,
    vendorNotes: 'Circulated by 10 roaming waitstaff in main atrium; cocktail napkins and trays provided'
  },
  {
    id: 'menu-9',
    mealSession: 'Day 2 - Gala Dinner Banquet',
    courseCategory: 'Starters',
    itemName: 'Cured Franschhoek Salmon Trout with Pickled Mustard Seeds, Fennel & Horseradish Cream',
    dietaryClassification: 'Gluten-Free',
    servingStyle: 'Plated Banquet',
    unitCostPerHead: 110,
    expectedGuestCount: 850,
    serviceSurcharge: 4500,
    totalCost: 98000,
    vendorNotes: 'Accompanied by freshly baked gluten-free seed dinner rolls'
  },
  {
    id: 'menu-10',
    mealSession: 'Day 2 - Gala Dinner Banquet',
    courseCategory: 'Mains',
    itemName: 'Slow-Braised Prime Beef Short Rib with Truffle Polenta and Glazed Heritage Root Vegetables',
    dietaryClassification: 'Halaal Certified',
    servingStyle: 'Plated Banquet',
    unitCostPerHead: 260,
    expectedGuestCount: 750,
    serviceSurcharge: 6500,
    totalCost: 201500,
    vendorNotes: 'Rich reduction jus, 12-hour slow braise; halaal certified preparation'
  },
  {
    id: 'menu-11',
    mealSession: 'Day 2 - Gala Dinner Banquet',
    courseCategory: 'Mains',
    itemName: 'Roasted Butternut Squash & Quinoa Parcel with Dried Cranberries, Pecan Nuts & Roasted Red Pepper Coulis',
    dietaryClassification: 'Vegan',
    servingStyle: 'Plated Banquet',
    unitCostPerHead: 175,
    expectedGuestCount: 100,
    serviceSurcharge: 1200,
    totalCost: 18700,
    vendorNotes: '100% allergen-free station for strict dietary safety'
  },
  {
    id: 'menu-12',
    mealSession: 'Day 2 - Gala Dinner Banquet',
    courseCategory: 'Desserts',
    itemName: 'Trio of Mini Belgian Chocolate Mousse, Passionfruit Tartlet & Handcrafted Rooibos Macaron',
    dietaryClassification: 'Standard',
    servingStyle: 'Plated Banquet',
    unitCostPerHead: 95,
    expectedGuestCount: 850,
    serviceSurcharge: 3500,
    totalCost: 84250,
    vendorNotes: 'Includes conference logo branded chocolate discs atop mousse'
  }
];

export function menuToCSV(items: MenuItemCosting[]): string {
  const escapeCell = (val: string | number | undefined | null) => {
    if (val === null || val === undefined) return '';
    const str = String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const lines = [MENU_CSV_HEADERS.join(',')];

  for (const m of items) {
    const row = [
      escapeCell(m.mealSession),
      escapeCell(m.courseCategory),
      escapeCell(m.itemName),
      escapeCell(m.dietaryClassification),
      escapeCell(m.servingStyle),
      escapeCell(m.unitCostPerHead),
      escapeCell(m.expectedGuestCount),
      escapeCell(m.serviceSurcharge),
      escapeCell(m.totalCost),
      escapeCell(m.vendorNotes)
    ].join(',');
    lines.push(row);
  }

  return lines.join('\n');
}

export function parseMenuCSV(csvText: string): MenuItemCosting[] {
  const rows = parseCSV(csvText);
  if (rows.length < 2) return [];

  const items: MenuItemCosting[] = [];
  const cleanNum = (str: string | undefined): number => {
    if (!str) return 0;
    const clean = str.replace(/[$,€£R\s]|ZAR/gi, '').replace(/,/g, '');
    const val = parseFloat(clean);
    return isNaN(val) ? 0 : val;
  };

  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    if (r.length < 2 || !r[2]?.trim()) continue;

    const unitCost = cleanNum(r[5]);
    const count = cleanNum(r[6]);
    const surcharge = cleanNum(r[7]);
    const rawTotal = cleanNum(r[8]);
    const computedTotal = rawTotal > 0 ? rawTotal : (unitCost * count) + surcharge;

    items.push({
      id: `menu-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 4)}`,
      mealSession: r[0] || 'Lunch',
      courseCategory: r[1] || 'Mains',
      itemName: r[2] || 'Menu Item',
      dietaryClassification: r[3] || 'Standard',
      servingStyle: r[4] || 'Buffet',
      unitCostPerHead: unitCost,
      expectedGuestCount: count,
      serviceSurcharge: surcharge,
      totalCost: computedTotal,
      vendorNotes: r[9] || ''
    });
  }

  return items;
}

// =========================================================================
// 4. ACCOMMODATION ROOM ALLOCATION & HOUSEKEEPING CHECKLIST TEMPLATE
// =========================================================================

export const ACCOMMODATION_CSV_HEADERS = [
  'Room Number',
  'Room Name',
  'Room Type',
  'Wing / Block',
  'Bed Configuration',
  'Nightly Rate (ZAR)',
  'Allocation Status',
  'Allocated Guest',
  'Guest Organization',
  'Check-In Date',
  'Check-Out Date',
  'Total Nights',
  'Total Room Cost (ZAR)',
  'Housekeeping Status',
  'Assigned Attendant',
  'Inspection Sign-Off',
  'Special Requests & Notes'
] as const;

export const INITIAL_ACCOMMODATION_ROOMS: AccommodationRoom[] = [
  {
    id: 'room-101',
    roomNumber: 'Suite 101',
    roomName: 'Presidential Estate Suite',
    roomType: 'Luxury Suite',
    wing: 'Manor House',
    bedConfiguration: '1 Extra-Length King Bed',
    maxOccupancy: 2,
    nightlyRate: 3800,
    allocationStatus: 'Allocated',
    allocatedGuestId: 'guest-1',
    allocatedGuestName: 'Dr. Sipho Ndlovu',
    allocatedGuestOrg: 'TechAfrica Holdings',
    checkInDate: '2025-09-17',
    checkOutDate: '2025-09-20',
    totalNights: 3,
    specialRequests: 'VIP welcoming fruit basket, feather-free pillows, late check-out on Day 3',
    housekeepingStatus: 'Clean & Inspected',
    housekeepingAttendant: 'Nomvula Sithole',
    inspectionSignOff: true,
    inspectedBy: 'Head Housekeeper Brenda',
    checklist: {
      linenChanged: true,
      bathroomSanitized: true,
      toiletriesStocked: true,
      teaCoffeeReplenished: true,
      hvacFireplaceChecked: true,
      welcomePackPlaced: true,
      keysTested: true,
      minibarRestocked: true,
      supervisorInspection: true
    },
    lastCleanedAt: '2025-09-17T09:30:00Z',
    notes: 'Keynote VIP - fireplace prepped with wood logs'
  },
  {
    id: 'room-102',
    roomNumber: 'Suite 102',
    roomName: 'Governor Executive Suite',
    roomType: 'Luxury Suite',
    wing: 'Manor House',
    bedConfiguration: '1 King Bed',
    maxOccupancy: 2,
    nightlyRate: 3200,
    allocationStatus: 'Allocated',
    allocatedGuestId: 'guest-3',
    allocatedGuestName: 'Johan van der Merwe',
    allocatedGuestOrg: 'InvestSA Capital',
    checkInDate: '2025-09-17',
    checkOutDate: '2025-09-20',
    totalNights: 3,
    specialRequests: 'Quiet wing requested, sparkling mineral water replenished daily',
    housekeepingStatus: 'Clean & Inspected',
    housekeepingAttendant: 'Nomvula Sithole',
    inspectionSignOff: true,
    inspectedBy: 'Head Housekeeper Brenda',
    checklist: {
      linenChanged: true,
      bathroomSanitized: true,
      toiletriesStocked: true,
      teaCoffeeReplenished: true,
      hvacFireplaceChecked: true,
      welcomePackPlaced: true,
      keysTested: true,
      minibarRestocked: true,
      supervisorInspection: true
    },
    lastCleanedAt: '2025-09-17T10:15:00Z',
    notes: 'Sponsor VIP - executive desk setup confirmed'
  },
  {
    id: 'room-cot-1',
    roomNumber: 'Cottage 1',
    roomName: 'Midlands Trout Cottage',
    roomType: 'Garden Cottage',
    wing: 'Lake Cottages',
    bedConfiguration: '1 King Bed + Fireplace Lounge',
    maxOccupancy: 2,
    nightlyRate: 2600,
    allocationStatus: 'Allocated',
    allocatedGuestId: 'guest-2',
    allocatedGuestName: 'Prof. Amina Petersen',
    allocatedGuestOrg: 'University of Cape Town',
    checkInDate: '2025-09-17',
    checkOutDate: '2025-09-20',
    totalNights: 3,
    specialRequests: 'Extra desk lamp for lecture notes preparation, herbal tea selection',
    housekeepingStatus: 'In Progress',
    housekeepingAttendant: 'Thabo Mokoena',
    inspectionSignOff: false,
    inspectedBy: null,
    checklist: {
      linenChanged: true,
      bathroomSanitized: true,
      toiletriesStocked: true,
      teaCoffeeReplenished: true,
      hvacFireplaceChecked: true,
      welcomePackPlaced: false,
      keysTested: false,
      minibarRestocked: false,
      supervisorInspection: false
    },
    lastCleanedAt: null,
    notes: 'Speaker accommodation - lakeside cottage'
  },
  {
    id: 'room-cot-2',
    roomNumber: 'Cottage 2',
    roomName: 'Oak Tree Garden Cottage',
    roomType: 'Garden Cottage',
    wing: 'Lake Cottages',
    bedConfiguration: '1 Queen Bed',
    maxOccupancy: 2,
    nightlyRate: 2400,
    allocationStatus: 'Allocated',
    allocatedGuestId: 'guest-7',
    allocatedGuestName: 'Tariq Jacobs',
    allocatedGuestOrg: 'CyberProtect SA',
    checkInDate: '2025-09-18',
    checkOutDate: '2025-09-20',
    totalNights: 2,
    specialRequests: 'Early check-in around 11:00 am if possible',
    housekeepingStatus: 'Needs Cleaning',
    housekeepingAttendant: 'Thabo Mokoena',
    inspectionSignOff: false,
    inspectedBy: null,
    checklist: {
      linenChanged: false,
      bathroomSanitized: false,
      toiletriesStocked: false,
      teaCoffeeReplenished: false,
      hvacFireplaceChecked: false,
      welcomePackPlaced: false,
      keysTested: false,
      minibarRestocked: false,
      supervisorInspection: false
    },
    lastCleanedAt: null,
    notes: 'Scheduled for turnover before 12:00'
  },
  {
    id: 'room-201',
    roomNumber: 'Room 201',
    roomName: 'Garden Wing Deluxe 201',
    roomType: 'Executive King',
    wing: 'Garden Wing',
    bedConfiguration: '1 King Bed',
    maxOccupancy: 2,
    nightlyRate: 2100,
    allocationStatus: 'Allocated',
    allocatedGuestId: 'guest-4',
    allocatedGuestName: 'Lerato Khumalo',
    allocatedGuestOrg: 'FinInnovate Lab',
    checkInDate: '2025-09-18',
    checkOutDate: '2025-09-20',
    totalNights: 2,
    specialRequests: 'Near elevator or ground floor preferred',
    housekeepingStatus: 'Clean & Inspected',
    housekeepingAttendant: 'Zanele Khanyile',
    inspectionSignOff: true,
    inspectedBy: 'Head Housekeeper Brenda',
    checklist: {
      linenChanged: true,
      bathroomSanitized: true,
      toiletriesStocked: true,
      teaCoffeeReplenished: true,
      hvacFireplaceChecked: true,
      welcomePackPlaced: true,
      keysTested: true,
      minibarRestocked: true,
      supervisorInspection: true
    },
    lastCleanedAt: '2025-09-17T11:00:00Z',
    notes: 'Checked and ready for arrival'
  },
  {
    id: 'room-202',
    roomNumber: 'Room 202',
    roomName: 'Garden Wing Twin 202',
    roomType: 'Deluxe Twin',
    wing: 'Garden Wing',
    bedConfiguration: '2 Three-Quarter Beds',
    maxOccupancy: 2,
    nightlyRate: 1950,
    allocationStatus: 'Allocated',
    allocatedGuestId: 'guest-5',
    allocatedGuestName: 'Michael Naidoo',
    allocatedGuestOrg: 'Cloudworks Africa',
    checkInDate: '2025-09-18',
    checkOutDate: '2025-09-20',
    totalNights: 2,
    specialRequests: 'Twin beds confirmed for engineering delegates',
    housekeepingStatus: 'In Progress',
    housekeepingAttendant: 'Zanele Khanyile',
    inspectionSignOff: false,
    inspectedBy: null,
    checklist: {
      linenChanged: true,
      bathroomSanitized: true,
      toiletriesStocked: false,
      teaCoffeeReplenished: false,
      hvacFireplaceChecked: true,
      welcomePackPlaced: false,
      keysTested: false,
      minibarRestocked: false,
      supervisorInspection: false
    },
    lastCleanedAt: null,
    notes: 'Twin linen fitted'
  },
  {
    id: 'room-203',
    roomNumber: 'Room 203',
    roomName: 'Garden Wing Standard 203',
    roomType: 'Standard Double',
    wing: 'Garden Wing',
    bedConfiguration: '1 Double Bed',
    maxOccupancy: 2,
    nightlyRate: 1650,
    allocationStatus: 'Allocated',
    allocatedGuestId: 'guest-8',
    allocatedGuestName: 'Chloe Evans',
    allocatedGuestOrg: 'GreenTech Africa',
    checkInDate: '2025-09-18',
    checkOutDate: '2025-09-20',
    totalNights: 2,
    specialRequests: 'Hypoallergenic laundry wash used due to severe allergies',
    housekeepingStatus: 'Clean & Inspected',
    housekeepingAttendant: 'Zanele Khanyile',
    inspectionSignOff: true,
    inspectedBy: 'Head Housekeeper Brenda',
    checklist: {
      linenChanged: true,
      bathroomSanitized: true,
      toiletriesStocked: true,
      teaCoffeeReplenished: true,
      hvacFireplaceChecked: true,
      welcomePackPlaced: true,
      keysTested: true,
      minibarRestocked: true,
      supervisorInspection: true
    },
    lastCleanedAt: '2025-09-17T12:00:00Z',
    notes: 'Strict hypoallergenic cleaning protocol certified'
  },
  {
    id: 'room-204',
    roomNumber: 'Room 204',
    roomName: 'Garden Wing Standard 204',
    roomType: 'Standard Double',
    wing: 'Garden Wing',
    bedConfiguration: '1 Double Bed',
    maxOccupancy: 2,
    nightlyRate: 1650,
    allocationStatus: 'Vacant',
    allocatedGuestId: null,
    allocatedGuestName: null,
    allocatedGuestOrg: null,
    checkInDate: '',
    checkOutDate: '',
    totalNights: 0,
    specialRequests: '',
    housekeepingStatus: 'Clean & Inspected',
    housekeepingAttendant: 'Nomvula Sithole',
    inspectionSignOff: true,
    inspectedBy: 'Head Housekeeper Brenda',
    checklist: {
      linenChanged: true,
      bathroomSanitized: true,
      toiletriesStocked: true,
      teaCoffeeReplenished: true,
      hvacFireplaceChecked: true,
      welcomePackPlaced: true,
      keysTested: true,
      minibarRestocked: true,
      supervisorInspection: true
    },
    lastCleanedAt: '2025-09-17T14:00:00Z',
    notes: 'Vacant inventory available for walk-in or late speaker booking'
  },
  {
    id: 'room-301',
    roomNumber: 'Room 301',
    roomName: 'Main Estate Room 301',
    roomType: 'Standard Double',
    wing: 'Main Hotel',
    bedConfiguration: '1 Queen Bed',
    maxOccupancy: 2,
    nightlyRate: 1750,
    allocationStatus: 'Blocked / Maintenance',
    allocatedGuestId: null,
    allocatedGuestName: null,
    allocatedGuestOrg: null,
    checkInDate: '',
    checkOutDate: '',
    totalNights: 0,
    specialRequests: '',
    housekeepingStatus: 'Maintenance Issue',
    housekeepingAttendant: 'Maintenance Team Sipho',
    inspectionSignOff: false,
    inspectedBy: null,
    checklist: {
      linenChanged: false,
      bathroomSanitized: false,
      toiletriesStocked: false,
      teaCoffeeReplenished: false,
      hvacFireplaceChecked: false,
      welcomePackPlaced: false,
      keysTested: false,
      minibarRestocked: false,
      supervisorInspection: false
    },
    lastCleanedAt: null,
    notes: 'Bathroom mixer tap replacement underway; out of conference inventory'
  }
];

export function accommodationToCSV(rooms: AccommodationRoom[]): string {
  const escapeCell = (val: string | number | boolean | undefined | null) => {
    if (val === null || val === undefined) return '';
    const str = String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const lines = [ACCOMMODATION_CSV_HEADERS.join(',')];

  for (const r of rooms) {
    const totalCost = (r.nightlyRate || 0) * (r.totalNights || 0);
    const row = [
      escapeCell(r.roomNumber),
      escapeCell(r.roomName),
      escapeCell(r.roomType),
      escapeCell(r.wing),
      escapeCell(r.bedConfiguration),
      escapeCell(r.nightlyRate),
      escapeCell(r.allocationStatus),
      escapeCell(r.allocatedGuestName),
      escapeCell(r.allocatedGuestOrg),
      escapeCell(r.checkInDate),
      escapeCell(r.checkOutDate),
      escapeCell(r.totalNights),
      escapeCell(totalCost),
      escapeCell(r.housekeepingStatus),
      escapeCell(r.housekeepingAttendant),
      escapeCell(r.inspectionSignOff ? 'Yes' : 'No'),
      escapeCell(r.specialRequests || r.notes)
    ].join(',');
    lines.push(row);
  }

  return lines.join('\n');
}

export function parseAccommodationCSV(csvText: string): AccommodationRoom[] {
  const rows = parseCSV(csvText);
  if (rows.length < 2) return [];

  const cleanNum = (str: string | undefined): number => {
    if (!str) return 0;
    const clean = str.replace(/[$,€£R\s]|ZAR/gi, '').replace(/,/g, '');
    const val = parseFloat(clean);
    return isNaN(val) ? 0 : val;
  };

  const rooms: AccommodationRoom[] = [];

  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    if (r.length < 2 || !r[0]?.trim()) continue;

    const rate = cleanNum(r[5]);
    const nights = cleanNum(r[11]);
    const isInspected = (r[15] || '').toLowerCase().includes('yes') || (r[15] || '').toLowerCase().includes('true');
    const guestName = r[7]?.trim() || null;

    rooms.push({
      id: `room-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 4)}`,
      roomNumber: r[0]?.trim() || `Room ${100 + i}`,
      roomName: r[1]?.trim() || 'Estate Room',
      roomType: (r[2] as any) || 'Executive King',
      wing: r[3]?.trim() || 'Main Hotel',
      bedConfiguration: r[4]?.trim() || '1 King Bed',
      maxOccupancy: 2,
      nightlyRate: rate || 1800,
      allocationStatus: (r[6] as any) || (guestName ? 'Allocated' : 'Vacant'),
      allocatedGuestId: null,
      allocatedGuestName: guestName,
      allocatedGuestOrg: r[8]?.trim() || null,
      checkInDate: r[9]?.trim() || '',
      checkOutDate: r[10]?.trim() || '',
      totalNights: nights || (guestName ? 2 : 0),
      specialRequests: r[16]?.trim() || '',
      housekeepingStatus: (r[13] as any) || (isInspected ? 'Clean & Inspected' : 'Needs Cleaning'),
      housekeepingAttendant: r[14]?.trim() || 'Nomvula Sithole',
      inspectionSignOff: isInspected,
      inspectedBy: isInspected ? 'Head Housekeeper' : null,
      checklist: {
        linenChanged: isInspected,
        bathroomSanitized: isInspected,
        toiletriesStocked: isInspected,
        teaCoffeeReplenished: isInspected,
        hvacFireplaceChecked: isInspected,
        welcomePackPlaced: isInspected,
        keysTested: isInspected,
        minibarRestocked: isInspected,
        supervisorInspection: isInspected
      },
      lastCleanedAt: isInspected ? new Date().toISOString() : null,
      notes: r[16]?.trim() || ''
    });
  }

  return rooms;
}

// ==========================================
// 5. STAFF & CREW MEMBERS TEMPLATE
// ==========================================

export const STAFF_CSV_HEADERS = [
  'Staff ID',
  'Full Name',
  'Email',
  'Phone',
  'Department',
  'Role / Designation',
  'Shift',
  'Assigned Area / Station',
  'Duty Status',
  'Daily Rate (ZAR)',
  'Emergency Contact',
  'Certifications & Notes'
] as const;

export const INITIAL_STAFF_DATA: StaffMember[] = [
  {
    id: 'staff-1',
    staffId: 'STF-001',
    fullName: 'Brenda Mkhize',
    email: 'brenda.mkhize@rawdons.co.za',
    phone: '+27 82 455 8901',
    department: 'Housekeeping & Cleaning',
    role: 'Head Housekeeper & Floor Supervisor',
    shift: 'Morning Shift (06:00 - 15:00)',
    assignedArea: 'All Accommodation Wings',
    status: 'On Duty',
    dailyRate: 1450,
    emergencyContact: 'Vusi Mkhize (+27 82 999 1234)',
    certificationsNotes: 'Hospitality Management Diploma, Advanced Hygiene & Chemical Safety Certified'
  },
  {
    id: 'staff-2',
    staffId: 'STF-002',
    fullName: 'Nomvula Sithole',
    email: 'nomvula.sithole@rawdons.co.za',
    phone: '+27 73 881 2043',
    department: 'Housekeeping & Cleaning',
    role: 'Senior Room Attendant',
    shift: 'Morning Shift (06:00 - 15:00)',
    assignedArea: 'Garden Wing (Rooms 201 - 204)',
    status: 'On Duty',
    dailyRate: 850,
    emergencyContact: 'Themba Sithole (+27 73 400 9988)',
    certificationsNotes: '5-Star Estate Room Turnaround Standards'
  },
  {
    id: 'staff-3',
    staffId: 'STF-003',
    fullName: 'Zanele Khanyile',
    email: 'zanele.k@rawdons.co.za',
    phone: '+27 84 512 7709',
    department: 'Housekeeping & Cleaning',
    role: 'Luxury Suite Specialist',
    shift: 'Morning Shift (06:00 - 15:00)',
    assignedArea: 'Luxury Suites & Cottages (101 - 103)',
    status: 'On Duty',
    dailyRate: 900,
    emergencyContact: 'Dudu Khanyile (+27 84 111 5566)',
    certificationsNotes: 'VIP Turndown Protocol, Hypoallergenic Wash Protocol'
  },
  {
    id: 'staff-4',
    staffId: 'STF-004',
    fullName: 'Chef Francois Du Plessis',
    email: 'francois.chef@rawdons.co.za',
    phone: '+27 83 234 9011',
    department: 'Kitchen & Catering',
    role: 'Executive Head Chef',
    shift: 'Morning Shift (06:00 - 15:00)',
    assignedArea: 'Main Banquet Kitchen',
    status: 'On Duty',
    dailyRate: 2500,
    emergencyContact: 'Marike Du Plessis (+27 83 990 4433)',
    certificationsNotes: 'Certified Executive Chef, HACCP Food Safety Lead, South African Chefs Association'
  },
  {
    id: 'staff-5',
    staffId: 'STF-005',
    fullName: 'Sipho Dlamini',
    email: 'sipho.dlamini@rawdons.co.za',
    phone: '+27 72 654 3210',
    department: 'Kitchen & Catering',
    role: 'Sous Chef & Dietary Specialist',
    shift: 'Mid Shift (10:00 - 19:00)',
    assignedArea: 'Halaal Certified & Allergen Prep Station',
    status: 'Scheduled',
    dailyRate: 1600,
    emergencyContact: 'Bongi Dlamini (+27 72 333 8811)',
    certificationsNotes: 'Certified Halaal Compliance Supervisor, Allergen Cross-Contamination Specialist'
  },
  {
    id: 'staff-6',
    staffId: 'STF-006',
    fullName: 'Marcus Thorne',
    email: 'marcus.t@techsouthafrica.co.za',
    phone: '+27 82 789 0123',
    department: 'AV, Sound & Technical',
    role: 'Lead AV & Technical Engineer',
    shift: 'All-Day Operational Lead',
    assignedArea: 'Auditorium Stage & Master Control',
    status: 'On Duty',
    dailyRate: 2200,
    emergencyContact: 'Sarah Thorne (+27 82 888 7766)',
    certificationsNotes: 'CTS Certified Technical Specialist, Dante Audio Level 2, Laser Projection Lead'
  },
  {
    id: 'staff-7',
    staffId: 'STF-007',
    fullName: 'Thabo Moloi',
    email: 'thabo.moloi@techsouthafrica.co.za',
    phone: '+27 71 902 4411',
    department: 'AV, Sound & Technical',
    role: 'Sound & Lighting Technician',
    shift: 'Evening Shift (14:00 - 23:00)',
    assignedArea: 'Main Stage & Breakout Rooms 1-3',
    status: 'Scheduled',
    dailyRate: 1350,
    emergencyContact: 'Kagiso Moloi (+27 71 222 3344)',
    certificationsNotes: 'Wireless RF Mic Frequency Coordinator, DMX Stage Lighting Operator'
  },
  {
    id: 'staff-8',
    staffId: 'STF-008',
    fullName: 'Elena Rostova',
    email: 'elena.rostova@convene-events.co.za',
    phone: '+27 83 998 8776',
    department: 'VIP Protocol & Hospitality',
    role: 'Protocol & VIP Coordinator',
    shift: 'All-Day Operational Lead',
    assignedArea: 'VIP Green Room & Executive Lounge',
    status: 'On Duty',
    dailyRate: 2100,
    emergencyContact: 'Dmitri Rostov (+27 83 777 6655)',
    certificationsNotes: 'International Protocol & Diplomatic Etiquette, Multilingual (English, French, Russian)'
  },
  {
    id: 'staff-9',
    staffId: 'STF-009',
    fullName: 'Kabelo Mokoena',
    email: 'kabelo.m@securesa.co.za',
    phone: '+27 82 110 3344',
    department: 'Security & Health Safety',
    role: 'Health & Safety Lead / Paramedic',
    shift: 'All-Day Operational Lead',
    assignedArea: 'Entire Venue, Emergency Exits & Power Backup',
    status: 'On Duty',
    dailyRate: 1500,
    emergencyContact: 'Refilwe Mokoena (+27 82 333 4455)',
    certificationsNotes: 'First Aid Level 3 Certified, Fire Marshal, Emergency Evacuation Officer'
  },
  {
    id: 'staff-10',
    staffId: 'STF-010',
    fullName: 'Anathi Ndaba',
    email: 'anathi.ndaba@convene-events.co.za',
    phone: '+27 76 543 2198',
    department: 'Front Desk & Guest Services',
    role: 'Registration & Welcome Desk Lead',
    shift: 'Morning Shift (06:00 - 15:00)',
    assignedArea: 'Main Foyer Registration Counter',
    status: 'On Duty',
    dailyRate: 1100,
    emergencyContact: 'Lindiwe Ndaba (+27 76 999 0011)',
    certificationsNotes: 'Delegate Badge Printing Systems, Concierge & Airport Transfer Coordination'
  }
];

export function staffToCSV(staff: StaffMember[]): string {
  const escapeCell = (val: string | number | undefined | null) => {
    if (val === null || val === undefined) return '';
    const str = String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const lines = [STAFF_CSV_HEADERS.join(',')];

  for (const s of staff) {
    const row = [
      escapeCell(s.staffId),
      escapeCell(s.fullName),
      escapeCell(s.email),
      escapeCell(s.phone),
      escapeCell(s.department),
      escapeCell(s.role),
      escapeCell(s.shift),
      escapeCell(s.assignedArea),
      escapeCell(s.status),
      escapeCell(s.dailyRate),
      escapeCell(s.emergencyContact),
      escapeCell(s.certificationsNotes)
    ].join(',');
    lines.push(row);
  }

  return lines.join('\n');
}

export function parseStaffCSV(csvText: string): StaffMember[] {
  const rows = parseCSV(csvText);
  if (rows.length < 2) return [];

  const cleanNum = (str: string | undefined): number => {
    if (!str) return 0;
    const clean = str.replace(/[$,€£R\s]|ZAR/gi, '').replace(/,/g, '');
    const val = parseFloat(clean);
    return isNaN(val) ? 0 : val;
  };

  const staffList: StaffMember[] = [];

  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    if (r.length < 2 || !r[1]?.trim()) continue;

    const rate = cleanNum(r[9]);
    const staffId = r[0]?.trim() || `STF-${String(100 + i).padStart(3, '0')}`;
    const fullName = r[1]?.trim() || 'Staff Member';

    staffList.push({
      id: `staff-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 4)}`,
      staffId,
      fullName,
      email: r[2]?.trim() || '',
      phone: r[3]?.trim() || '',
      department: (r[4]?.trim() as any) || 'Operations & Logistics',
      role: r[5]?.trim() || 'Operational Support',
      shift: (r[6]?.trim() as any) || 'Morning Shift (06:00 - 15:00)',
      assignedArea: r[7]?.trim() || 'Main Venue',
      status: (r[8]?.trim() as any) || 'Scheduled',
      dailyRate: rate || 950,
      emergencyContact: r[10]?.trim() || '',
      certificationsNotes: r[11]?.trim() || ''
    });
  }

  return staffList;
}
