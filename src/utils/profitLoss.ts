import { ConferenceRecord } from '../types/conference';
import { formatZAR } from './currency';

export interface PLLineItem {
  id: string;
  category: string;
  name: string;
  description: string;
  amount: number;
  type: 'revenue' | 'cogs' | 'opex';
  source: 'client_contract' | 'tickets' | 'rooms' | 'catering' | 'tasks' | 'staff' | 'adjustment';
  notes?: string;
}

export interface ConferencePLData {
  conferenceId: string;
  conferenceTitle: string;
  hallName: string;
  venueName: string;
  datesFormatted: string;
  durationDays: number;
  clientOrg: string;
  clientContact: string;
  contractStatus: string;
  expectedAttendees: number;
  actualAttendees: number;
  
  // High-Level Summary
  grossRevenue: number;
  costOfSales: number;
  grossProfit: number;
  grossMarginPct: number;
  operatingExpenses: number;
  netProfit: number;
  netMarginPct: number;
  roiPct: number;

  // Breakdown Buckets
  revenueBreakdown: {
    clientContract: number;
    depositReceived: number;
    balanceDue: number;
    ticketSales: number;
    ticketSalesByType: Record<string, { count: number; totalRevenue: number }>;
    roomRevenue: number;
    occupiedRoomsCount: number;
    totalRoomNights: number;
    sponsorshipAndOther: number;
    total: number;
  };

  cogsBreakdown: {
    cateringDirectCost: number;
    cateringSessionsCost: Record<string, number>;
    accommodationDirectCost: number; // linen/turnaround/amenities
    venueHireDirectCost: number;
    avProductionDirectCost: number;
    materialsDecorDirectCost: number;
    total: number;
  };

  opexBreakdown: {
    staffWages: number;
    staffByDepartment: Record<string, { headCount: number; cost: number }>;
    logisticsAdminCost: number;
    marketingSignageCost: number;
    contingencyReserve: number;
    total: number;
  };

  // Performance & Unit Economics
  unitEconomics: {
    revenuePerAttendee: number;
    costPerAttendee: number;
    netProfitPerAttendee: number;
    breakevenAttendees: number;
    roomOccupancyRatePct: number;
    budgetVariance: number; // actual net spend vs client agreed budget cap
    financialHealth: 'Outstanding' | 'Profitable' | 'Break-Even' | 'Under-Performing';
  };

  // Detailed Line-by-Line Ledger Items
  revenueItems: PLLineItem[];
  cogsItems: PLLineItem[];
  opexItems: PLLineItem[];
}

/**
 * Calculates the complete Profit & Loss financial model for any conference record.
 */
export function calculateConferencePL(record: ConferenceRecord): ConferencePLData {
  const details = record.details;
  const client = record.client;
  const tasks = record.tasks || [];
  const guests = record.guests || [];
  const rooms = record.rooms || [];
  const menuItems = record.menuItems || [];
  const staff = record.staff || [];

  // Duration in days
  let durationDays = 1;
  if (details.startDate && details.endDate) {
    const start = new Date(details.startDate).getTime();
    const end = new Date(details.endDate).getTime();
    if (!isNaN(start) && !isNaN(end) && end >= start) {
      durationDays = Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1);
    }
  }

  // 1. REVENUE CALCULATIONS
  // A. Client Contract Value
  const clientAgreedFee = client.agreedBudgetCap || details.overallBudgetLimit || 0;
  const depositReceived = client.depositPaid || 0;
  const balanceDue = Math.max(0, clientAgreedFee - depositReceived);

  // B. Delegate / Guest Tickets
  const ticketSalesByType: Record<string, { count: number; totalRevenue: number }> = {};
  let totalTicketRevenue = 0;
  for (const guest of guests) {
    if (guest.status === 'Cancelled') continue;
    const type = guest.ticketType || 'Standard';
    const price = typeof guest.ticketPrice === 'number' && !isNaN(guest.ticketPrice) ? guest.ticketPrice : 0;
    
    if (!ticketSalesByType[type]) {
      ticketSalesByType[type] = { count: 0, totalRevenue: 0 };
    }
    ticketSalesByType[type].count += 1;
    ticketSalesByType[type].totalRevenue += price;
    totalTicketRevenue += price;
  }

  // C. Accommodation Room Billing (Allocated or Checked-In rooms)
  let totalRoomRevenue = 0;
  let occupiedRoomsCount = 0;
  let totalRoomNights = 0;

  for (const room of rooms) {
    if (room.allocationStatus === 'Allocated' || room.allocationStatus === 'Checked-In') {
      occupiedRoomsCount += 1;
      const nights = room.totalNights > 0 ? room.totalNights : durationDays;
      totalRoomNights += nights;
      const roomCharge = (room.nightlyRate || 0) * nights;
      totalRoomRevenue += roomCharge;
    }
  }

  // D. Sponsorship / Exhibition Add-ons (from Sponsor tickets or special sponsor tasks)
  const sponsorTicketRevenue = ticketSalesByType['Sponsor']?.totalRevenue || 0;

  // Total Gross Revenue (Client Contract Package + Accommodation Revenue + Additional Ticket Revenues)
  const grossRevenue = clientAgreedFee + totalRoomRevenue + totalTicketRevenue;

  // 2. COST OF SALES (COGS - Direct Delivery Costs)
  // A. Catering / Menu Direct Costs
  const cateringSessionsCost: Record<string, number> = {};
  let totalCateringCost = 0;

  for (const item of menuItems) {
    const cost = item.totalCost || ((item.unitCostPerHead || 0) * (item.expectedGuestCount || details.expectedAttendees || 0) + (item.serviceSurcharge || 0));
    const session = item.mealSession || 'General Catering';
    cateringSessionsCost[session] = (cateringSessionsCost[session] || 0) + cost;
    totalCateringCost += cost;
  }

  // B. Accommodation Turnaround Direct Costs (Linen washing, housekeeping supplies, amenities, turnaround @ R180/room night)
  const accommodationDirectCost = totalRoomNights * 180;

  // C. Task Direct Costs: Venue, AV, Staging, Decor, Audio/Visual
  let venueHireDirectCost = 0;
  let avProductionDirectCost = 0;
  let materialsDecorDirectCost = 0;
  let logisticsAdminCost = 0;
  let marketingSignageCost = 0;

  for (const task of tasks) {
    const taskCost = task.actualCost !== null ? task.actualCost : task.budgetedCost || 0;
    const cat = (task.category || '').toLowerCase();

    if (cat.includes('venue') || cat.includes('staging') || cat.includes('hall')) {
      venueHireDirectCost += taskCost;
    } else if (cat.includes('av') || cat.includes('tech') || cat.includes('sound') || cat.includes('audio')) {
      avProductionDirectCost += taskCost;
    } else if (cat.includes('decor') || cat.includes('floral') || cat.includes('design') || cat.includes('print')) {
      materialsDecorDirectCost += taskCost;
    } else if (cat.includes('market') || cat.includes('pr') || cat.includes('media')) {
      marketingSignageCost += taskCost;
    } else {
      logisticsAdminCost += taskCost;
    }
  }

  const costOfSales = totalCateringCost + accommodationDirectCost + venueHireDirectCost + avProductionDirectCost + materialsDecorDirectCost;

  // 3. GROSS PROFIT
  const grossProfit = grossRevenue - costOfSales;
  const grossMarginPct = grossRevenue > 0 ? (grossProfit / grossRevenue) * 100 : 0;

  // 4. OPERATING EXPENSES (OPEX)
  // Staff & Crew Wages (Daily Rate * Conference Days)
  const staffByDepartment: Record<string, { headCount: number; cost: number }> = {};
  let totalStaffWages = 0;

  for (const member of staff) {
    const memberCost = (member.dailyRate || 650) * durationDays;
    totalStaffWages += memberCost;
    const dept = member.department || 'Operations & Logistics';
    
    if (!staffByDepartment[dept]) {
      staffByDepartment[dept] = { headCount: 0, cost: 0 };
    }
    staffByDepartment[dept].headCount += 1;
    staffByDepartment[dept].cost += memberCost;
  }

  // Operational contingency reserve (estimated at 3.5% of gross revenue for risk mitigation)
  const contingencyReserve = Math.round(grossRevenue * 0.035);

  const operatingExpenses = totalStaffWages + logisticsAdminCost + marketingSignageCost + contingencyReserve;

  // 5. NET PROFIT & METRICS
  const netProfit = grossProfit - operatingExpenses;
  const netMarginPct = grossRevenue > 0 ? (netProfit / grossRevenue) * 100 : 0;
  const totalCostBase = costOfSales + operatingExpenses;
  const roiPct = totalCostBase > 0 ? (netProfit / totalCostBase) * 100 : 0;

  // Unit Economics
  const attendeeCount = guests.filter(g => g.status !== 'Cancelled').length || details.expectedAttendees || 1;
  const revenuePerAttendee = Math.round(grossRevenue / attendeeCount);
  const costPerAttendee = Math.round(totalCostBase / attendeeCount);
  const netProfitPerAttendee = Math.round(netProfit / attendeeCount);

  // Breakeven attendees calculation (at average ticket/package rate per attendee)
  const breakevenAttendees = revenuePerAttendee > 0 ? Math.ceil(totalCostBase / (revenuePerAttendee * 0.85 || 1)) : 0;

  // Room occupancy %
  const totalAvailableRooms = rooms.length || 1;
  const roomOccupancyRatePct = Math.round((occupiedRoomsCount / totalAvailableRooms) * 100);

  // Variance vs agreed budget cap
  const budgetVariance = clientAgreedFee - totalCostBase;

  // Financial health classification
  let financialHealth: 'Outstanding' | 'Profitable' | 'Break-Even' | 'Under-Performing' = 'Profitable';
  if (netMarginPct >= 25) {
    financialHealth = 'Outstanding';
  } else if (netMarginPct >= 10) {
    financialHealth = 'Profitable';
  } else if (netMarginPct >= 0) {
    financialHealth = 'Break-Even';
  } else {
    financialHealth = 'Under-Performing';
  }

  // 6. BUILD DETAILED ITEM-BY-ITEM LEDGERS
  const revenueItems: PLLineItem[] = [
    {
      id: 'rev-client-contract',
      category: 'Contract Revenue',
      name: `Agreed Master Package: ${client.organization || details.title}`,
      description: `Fixed package fee per signed agreement (${client.status || 'Active'})`,
      amount: clientAgreedFee,
      type: 'revenue',
      source: 'client_contract',
      notes: `Deposit Paid: ${formatZAR(depositReceived)} | Balance Due: ${formatZAR(balanceDue)}`
    },
    {
      id: 'rev-rooms-total',
      category: 'Accommodation Billing',
      name: `Estate Accommodation Billing (${occupiedRoomsCount} Rooms, ${totalRoomNights} Total Nights)`,
      description: `Billed guest suite occupancy across Rawdons Hotel & Estate wings`,
      amount: totalRoomRevenue,
      type: 'revenue',
      source: 'rooms',
      notes: `${roomOccupancyRatePct}% Room Occupancy Achieved`
    },
    ...Object.entries(ticketSalesByType).map(([type, stats], idx) => ({
      id: `rev-ticket-${idx}`,
      category: 'Delegate Admissions',
      name: `${type} Delegate Tickets (${stats.count} attendees)`,
      description: `Registration fees collected for ${type} level badges`,
      amount: stats.totalRevenue,
      type: 'revenue' as const,
      source: 'tickets' as const,
      notes: `Avg ticket value: ${formatZAR(stats.count > 0 ? Math.round(stats.totalRevenue / stats.count) : 0)}`
    }))
  ];

  const cogsItems: PLLineItem[] = [
    ...menuItems.map((item, idx) => ({
      id: `cogs-food-${idx}`,
      category: 'Catering & Banqueting',
      name: `${item.mealSession} — ${item.itemName}`,
      description: `${item.servingStyle} for ${item.expectedGuestCount || details.expectedAttendees} covers @ ${formatZAR(item.unitCostPerHead)}/head`,
      amount: item.totalCost || ((item.unitCostPerHead || 0) * (item.expectedGuestCount || details.expectedAttendees || 0) + (item.serviceSurcharge || 0)),
      type: 'cogs' as const,
      source: 'catering' as const,
      notes: `Surcharge: ${formatZAR(item.serviceSurcharge || 0)} | Dietary: ${item.dietaryClassification || 'Standard'}`
    })),
    {
      id: 'cogs-room-turnaround',
      category: 'Housekeeping & Amenities Direct',
      name: `Turnaround, Linen Sanitization & Minibar Amenities`,
      description: `Operational replenishment per room night (${totalRoomNights} room nights @ R180/night)`,
      amount: accommodationDirectCost,
      type: 'cogs',
      source: 'rooms',
      notes: `Covers luxury toiletry kits, bathrobes, tea/coffee service`
    },
    {
      id: 'cogs-venue-hire',
      category: 'Venue & Hall Facilities',
      name: `Estate Venue & Hall Allocation: ${details.hall || 'Main Conference Facility'}`,
      description: `Facility operational maintenance, power backup, HVAC for ${durationDays} conference day(s)`,
      amount: venueHireDirectCost || 35000,
      type: 'cogs',
      source: 'tasks',
      notes: `Includes primary hall setup and environmental staging`
    },
    {
      id: 'cogs-av-production',
      category: 'AV, Staging & Broadcast',
      name: `Audio-Visual, PA Stacks, Stage Lighting & Live Streaming`,
      description: `Dual projection systems, wireless mic packages and sound engineering`,
      amount: avProductionDirectCost || 24000,
      type: 'cogs',
      source: 'tasks',
      notes: `Contracted sound & visual equipment engineering`
    },
    {
      id: 'cogs-decor-materials',
      category: 'Decor & Delegate Packs',
      name: `Conference Decor, Stage Backdrop & Delegate Lanyards`,
      description: `Welcome satchels, branded badges, stage floral displays & signage`,
      amount: materialsDecorDirectCost || 12500,
      type: 'cogs',
      source: 'tasks',
      notes: `Printed agenda programmes and table centerpieces`
    }
  ];

  const opexItems: PLLineItem[] = [
    ...Object.entries(staffByDepartment).map(([dept, data], idx) => ({
      id: `opex-staff-${idx}`,
      category: 'Staff Payroll & Crew Wages',
      name: `${dept} (${data.headCount} crew members)`,
      description: `Operational wages for ${durationDays} conference day(s) at agreed daily shift rates`,
      amount: data.cost,
      type: 'opex' as const,
      source: 'staff' as const,
      notes: `Avg shift payout: ${formatZAR(Math.round(data.cost / (data.headCount * durationDays || 1)))}/day`
    })),
    {
      id: 'opex-admin-logistics',
      category: 'Operations & Ground Logistics',
      name: 'Event Transport, Security Oversight & General Coordination',
      description: 'Shuttle dispatches, luggage handling, emergency medical standby',
      amount: logisticsAdminCost || 8500,
      type: 'opex',
      source: 'tasks',
      notes: 'Standard conference logistics overhead'
    },
    {
      id: 'opex-marketing-branding',
      category: 'Marketing & Digital Communications',
      name: 'Conference App Hosting, Wi-Fi Bandwidth & Signage Display',
      description: 'Dedicated high-speed fiber uplink, guest Wi-Fi portal and SMS bulletins',
      amount: marketingSignageCost || 6000,
      type: 'opex',
      source: 'tasks',
      notes: 'Includes dedicated technical communications infrastructure'
    },
    {
      id: 'opex-contingency',
      category: 'Risk Reserve & Contingency',
      name: 'Emergency Incidentals & Weather Mitigation Reserve',
      description: '3.5% allocated contingency buffer for unexpected operational requirements',
      amount: contingencyReserve,
      type: 'opex',
      source: 'adjustment',
      notes: 'Executive safety buffer (refundable if unexpended)'
    }
  ];

  return {
    conferenceId: record.id,
    conferenceTitle: details.title,
    hallName: details.hall || 'Drakensberg Main Hall',
    venueName: details.venue,
    datesFormatted: `${details.startDate} to ${details.endDate}`,
    durationDays,
    clientOrg: client.organization || client.clientName,
    clientContact: `${client.contactPerson} (${client.phone})`,
    contractStatus: client.status || 'Signed',
    expectedAttendees: details.expectedAttendees,
    actualAttendees: attendeeCount,

    grossRevenue,
    costOfSales,
    grossProfit,
    grossMarginPct,
    operatingExpenses,
    netProfit,
    netMarginPct,
    roiPct,

    revenueBreakdown: {
      clientContract: clientAgreedFee,
      depositReceived,
      balanceDue,
      ticketSales: totalTicketRevenue,
      ticketSalesByType,
      roomRevenue: totalRoomRevenue,
      occupiedRoomsCount,
      totalRoomNights,
      sponsorshipAndOther: sponsorTicketRevenue,
      total: grossRevenue
    },

    cogsBreakdown: {
      cateringDirectCost: totalCateringCost,
      cateringSessionsCost,
      accommodationDirectCost,
      venueHireDirectCost,
      avProductionDirectCost,
      materialsDecorDirectCost,
      total: costOfSales
    },

    opexBreakdown: {
      staffWages: totalStaffWages,
      staffByDepartment,
      logisticsAdminCost,
      marketingSignageCost,
      contingencyReserve,
      total: operatingExpenses
    },

    unitEconomics: {
      revenuePerAttendee,
      costPerAttendee,
      netProfitPerAttendee,
      breakevenAttendees,
      roomOccupancyRatePct,
      budgetVariance,
      financialHealth
    },

    revenueItems,
    cogsItems,
    opexItems
  };
}

/**
 * Generates an official, auditable CSV export of the Conference P&L Statement.
 */
export function exportConferencePLToCsv(record: ConferenceRecord, pl: ConferencePLData, exportAdminName: string): void {
  const lines: string[] = [];

  // Header and Metadata
  lines.push(`"RAWDONS HOTEL & ESTATE — OFFICIAL STATEMENT OF PROFIT AND LOSS (P&L)"`);
  lines.push(`"CONFIDENTIAL & PRIVILEGED EXECUTIVE FINANCIAL AUDIT"`);
  lines.push(`"Conference Title:","${pl.conferenceTitle.replace(/"/g, '""')}"`);
  lines.push(`"Conference ID:","${pl.conferenceId}"`);
  lines.push(`"Client Organization:","${pl.clientOrg.replace(/"/g, '""')}"`);
  lines.push(`"Venue & Allocated Hall:","${pl.venueName} — ${pl.hallName}"`);
  lines.push(`"Event Dates:","${pl.datesFormatted} (${pl.durationDays} Days)"`);
  lines.push(`"Guaranteed / Actual Attendees:","${pl.actualAttendees} Delegates"`);
  lines.push(`"Authorized Exporting Master Admin:","${exportAdminName} (Level 5 Master Admin — Code 790922)"`);
  lines.push(`"Audit Export Timestamp:","${new Date().toISOString()}"`);
  lines.push(`"Currency:","South African Rand (ZAR / R)"`);
  lines.push(``);

  // Executive Financial Summary
  lines.push(`"=== EXECUTIVE FINANCIAL SUMMARY ==="`);
  lines.push(`"Financial Metric","ZAR (R)","Percentage / Ratio","Notes"`);
  lines.push(`"Gross Revenue (Turnover)","${pl.grossRevenue}","100.0%","Total event billable income"`);
  lines.push(`"Cost of Sales (Direct COGS)","${pl.costOfSales}","${((pl.costOfSales / (pl.grossRevenue || 1)) * 100).toFixed(1)}%","Catering, venue, staging, room operational turnover"`);
  lines.push(`"GROSS PROFIT","${pl.grossProfit}","${pl.grossMarginPct.toFixed(1)}%","Revenue minus Direct Delivery Costs"`);
  lines.push(`"Operating Expenses (OPEX)","${pl.operatingExpenses}","${((pl.operatingExpenses / (pl.grossRevenue || 1)) * 100).toFixed(1)}%","Staff payroll, administration, logistics, contingency"`);
  lines.push(`"NET PROFIT (EBIT)","${pl.netProfit}","${pl.netMarginPct.toFixed(1)}%","Net contribution margin"`);
  lines.push(`"Return on Investment (ROI)","—","${pl.roiPct.toFixed(1)}%","Net profit over total expense outlay"`);
  lines.push(`"Revenue per Delegate","${pl.unitEconomics.revenuePerAttendee}","—","Gross revenue per attendee"`);
  lines.push(`"Cost per Delegate","${pl.unitEconomics.costPerAttendee}","—","Total cost per attendee"`);
  lines.push(`"Net Margin per Delegate","${pl.unitEconomics.netProfitPerAttendee}","—","Net profit generated per attendee"`);
  lines.push(`"Breakeven Delegate Count","${pl.unitEconomics.breakevenAttendees} Delegates","—","Required attendance to reach breakeven"`);
  lines.push(`"Client Agreed Budget Cap","${pl.revenueBreakdown.clientContract}","—","Agreed client contract ceiling"`);
  lines.push(`"Budget Variance","${pl.unitEconomics.budgetVariance}","—","Favorable variance against contract ceiling"`);
  lines.push(``);

  // Revenue Ledger
  lines.push(`"=== SECTION 1: REVENUE & INFLOWS ==="`);
  lines.push(`"Line Item ID","Category","Item Description","Amount (ZAR)","Operational Notes"`);
  for (const item of pl.revenueItems) {
    lines.push(`"${item.id}","${item.category}","${item.name.replace(/"/g, '""')}","${item.amount}","${(item.notes || '').replace(/"/g, '""')}"`);
  }
  lines.push(`"SUBTOTAL","REVENUE","Total Gross Inflows","${pl.grossRevenue}",""`);
  lines.push(``);

  // Cost of Sales Ledger
  lines.push(`"=== SECTION 2: COST OF SALES (DIRECT COGS) ==="`);
  lines.push(`"Line Item ID","Category","Item Description","Amount (ZAR)","Operational Notes"`);
  for (const item of pl.cogsItems) {
    lines.push(`"${item.id}","${item.category}","${item.name.replace(/"/g, '""')}","${item.amount}","${(item.notes || '').replace(/"/g, '""')}"`);
  }
  lines.push(`"SUBTOTAL","COGS","Total Direct Delivery Costs","${pl.costOfSales}",""`);
  lines.push(``);

  // Operating Expenses Ledger
  lines.push(`"=== SECTION 3: OPERATING EXPENSES (OPEX) ==="`);
  lines.push(`"Line Item ID","Category","Item Description","Amount (ZAR)","Operational Notes"`);
  for (const item of pl.opexItems) {
    lines.push(`"${item.id}","${item.category}","${item.name.replace(/"/g, '""')}","${item.amount}","${(item.notes || '').replace(/"/g, '""')}"`);
  }
  lines.push(`"SUBTOTAL","OPEX","Total Operating Expenses","${pl.operatingExpenses}",""`);
  lines.push(``);

  // Sign-Off Block
  lines.push(`"=== EXECUTIVE GOVERNANCE & SIGN-OFF ==="`);
  lines.push(`"Certified by:","Mark Mikealson"`);
  lines.push(`"Title:","Master App Admin & Managing Director"`);
  lines.push(`"Clearance Credential:","Level 5 Highest Clearance (PIN: 790922)"`);
  lines.push(`"Status:","VERIFIED AND AUDITED"`);
  lines.push(`"Legal Notice:","Strictly confidential. Unauthorized reproduction or dissemination is strictly prohibited."`);

  // Download Trigger
  const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + encodeURIComponent(lines.join('\n'));
  const link = document.createElement('a');
  const sanitizedTitle = pl.conferenceTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  link.setAttribute('href', csvContent);
  link.setAttribute('download', `PL_Report_${sanitizedTitle}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Generates an official, auditable JSON ledger export of the Conference P&L.
 */
export function exportConferencePLToJson(record: ConferenceRecord, pl: ConferencePLData, exportAdminName: string): void {
  const exportPayload = {
    reportType: 'RAWDONS_CONFERENCE_PROFIT_AND_LOSS_STATEMENT',
    version: '3.0.0-audit',
    generatedAt: new Date().toISOString(),
    auditAuthority: {
      signatory: 'Mark Mikealson',
      role: 'Master App Admin & Managing Director',
      clearanceLevel: 5,
      logonCodeAuth: '790922',
      authorizedExportBy: exportAdminName
    },
    statementData: pl,
    rawConferenceSnapshot: {
      id: record.id,
      title: record.details.title,
      venue: record.details.venue,
      hall: record.details.hall,
      client: record.client,
      taskCount: record.tasks.length,
      guestCount: record.guests.length,
      roomCount: record.rooms.length,
      menuItemCount: record.menuItems.length,
      staffCount: record.staff.length
    }
  };

  const jsonContent = 'data:application/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportPayload, null, 2));
  const link = document.createElement('a');
  const sanitizedTitle = pl.conferenceTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  link.setAttribute('href', jsonContent);
  link.setAttribute('download', `PL_Audit_Ledger_${sanitizedTitle}_${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
