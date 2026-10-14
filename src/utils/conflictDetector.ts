import { BookingConflict, ConferenceDetails, ConferenceRecord } from '../types/conference';

/**
 * Checks if two date ranges [startA, endA] and [startB, endB] overlap.
 * Dates are expected in 'YYYY-MM-DD' format.
 */
export function areDateRangesOverlapping(
  startA: string, 
  endA: string, 
  startB: string, 
  endB: string
): boolean {
  if (!startA || !endA || !startB || !endB) return false;
  // Overlap occurs if startA <= endB and endA >= startB
  return startA <= endB && endA >= startB;
}

/**
 * Normalized name for venue / hall comparison
 */
function normalizeVenueKey(venue: string, hall?: string): string {
  const v = (venue || '').trim().toLowerCase();
  const h = (hall || '').trim().toLowerCase();
  if (h) return `${v}:::${h}`;
  return v;
}

/**
 * Proactively check if a candidate conference details would cause a venue / hall double-booking
 * against existing active conferences.
 */
export function detectVenueConflicts(
  targetConf: ConferenceDetails,
  targetConfId: string | null,
  allConferences: ConferenceRecord[]
): BookingConflict[] {
  const conflicts: BookingConflict[] = [];

  const targetVenueKey = normalizeVenueKey(targetConf.venue, targetConf.hall);
  const targetVenueDisplay = targetConf.hall 
    ? `${targetConf.hall} (${targetConf.venue})` 
    : targetConf.venue;

  for (const conf of allConferences) {
    if (conf.id === targetConfId) continue;
    if (conf.archived) continue;

    const confVenueKey = normalizeVenueKey(conf.details.venue, conf.details.hall);
    const confVenueDisplay = conf.details.hall 
      ? `${conf.details.hall} (${conf.details.venue})` 
      : conf.details.venue;

    // Check if venue and hall match
    const isSameVenue = targetVenueKey === confVenueKey || 
      (Boolean(targetConf.hall && conf.details.hall) && targetConf.hall?.trim().toLowerCase() === conf.details.hall?.trim().toLowerCase());

    if (isSameVenue) {
      if (areDateRangesOverlapping(targetConf.startDate, targetConf.endDate, conf.details.startDate, conf.details.endDate)) {
        conflicts.push({
          id: `conflict-venue-${targetConfId || 'new'}-${conf.id}`,
          type: 'venue_hall',
          severity: 'blocking',
          title: `Double-Booking Alert: Venue / Hall Overlap`,
          description: `Venue "${targetVenueDisplay}" is already reserved for "${conf.details.title}" during overlapping dates (${conf.details.startDate} to ${conf.details.endDate}).`,
          conferenceIdA: targetConfId || 'new-conf',
          conferenceTitleA: targetConf.title,
          conferenceIdB: conf.id,
          conferenceTitleB: conf.details.title,
          overlappingDates: `${targetConf.startDate} &mdash; ${targetConf.endDate} vs ${conf.details.startDate} &mdash; ${conf.details.endDate}`,
          conflictingResource: targetVenueDisplay
        });
      }
    }
  }

  return conflicts;
}

/**
 * Comprehensive cross-conference audit: scans all conferences for venue, room, and staff double bookings.
 */
export function auditAllConferences(conferences: ConferenceRecord[]): BookingConflict[] {
  const conflicts: BookingConflict[] = [];
  const active = conferences.filter(c => !c.archived);

  for (let i = 0; i < active.length; i++) {
    for (let j = i + 1; j < active.length; j++) {
      const confA = active[i];
      const confB = active[j];

      // 1. Venue & Hall check
      const venueKeyA = normalizeVenueKey(confA.details.venue, confA.details.hall);
      const venueKeyB = normalizeVenueKey(confB.details.venue, confB.details.hall);
      const sameHall = Boolean(confA.details.hall && confB.details.hall && confA.details.hall.trim().toLowerCase() === confB.details.hall.trim().toLowerCase());

      if ((venueKeyA === venueKeyB || sameHall) && areDateRangesOverlapping(confA.details.startDate, confA.details.endDate, confB.details.startDate, confB.details.endDate)) {
        const venueName = confA.details.hall || confA.details.venue;
        conflicts.push({
          id: `conflict-venue-${confA.id}-${confB.id}`,
          type: 'venue_hall',
          severity: 'blocking',
          title: `Double-Booked Hall: ${venueName}`,
          description: `Both "${confA.details.title}" (${confA.details.startDate} to ${confA.details.endDate}) and "${confB.details.title}" (${confB.details.startDate} to ${confB.details.endDate}) are scheduled in ${venueName}.`,
          conferenceIdA: confA.id,
          conferenceTitleA: confA.details.title,
          conferenceIdB: confB.id,
          conferenceTitleB: confB.details.title,
          overlappingDates: `${confA.details.startDate} to ${confA.details.endDate}`,
          conflictingResource: venueName
        });
      }

      // 2. Cross-conference Accommodation Room check
      if (areDateRangesOverlapping(confA.details.startDate, confA.details.endDate, confB.details.startDate, confB.details.endDate)) {
        const allocatedRoomsA = confA.rooms.filter(r => r.allocationStatus === 'Allocated' || r.allocationStatus === 'Checked-In');
        const allocatedRoomsB = confB.rooms.filter(r => r.allocationStatus === 'Allocated' || r.allocationStatus === 'Checked-In');

        for (const roomA of allocatedRoomsA) {
          const matchRoomB = allocatedRoomsB.find(r => r.roomNumber === roomA.roomNumber);
          if (matchRoomB) {
            conflicts.push({
              id: `conflict-room-${confA.id}-${confB.id}-${roomA.roomNumber}`,
              type: 'accommodation_room',
              severity: 'blocking',
              title: `Double-Booked Room: Room ${roomA.roomNumber} (${roomA.roomName})`,
              description: `Room ${roomA.roomNumber} is allocated to "${roomA.allocatedGuestName || 'Guest'}" in ${confA.details.title} and also allocated to "${matchRoomB.allocatedGuestName || 'Guest'}" in ${confB.details.title} during overlapping dates.`,
              conferenceIdA: confA.id,
              conferenceTitleA: confA.details.title,
              conferenceIdB: confB.id,
              conferenceTitleB: confB.details.title,
              overlappingDates: `${confA.details.startDate} to ${confB.details.endDate}`,
              conflictingResource: `Room ${roomA.roomNumber} - ${roomA.roomName}`
            });
          }
        }

        // 3. Cross-conference Staff check
        const activeStaffA = confA.staff.filter(s => s.status === 'On Duty' || s.status === 'Scheduled');
        const activeStaffB = confB.staff.filter(s => s.status === 'On Duty' || s.status === 'Scheduled');

        for (const sA of activeStaffA) {
          const matchStaffB = activeStaffB.find(s => s.fullName.toLowerCase() === sA.fullName.toLowerCase() || s.staffId === sA.staffId);
          if (matchStaffB) {
            conflicts.push({
              id: `conflict-staff-${confA.id}-${confB.id}-${sA.staffId}`,
              type: 'staff_double_booked',
              severity: 'warning',
              title: `Staff Double-Booking: ${sA.fullName}`,
              description: `Staff member ${sA.fullName} is scheduled on active duty in "${confA.details.title}" and simultaneously in "${confB.details.title}".`,
              conferenceIdA: confA.id,
              conferenceTitleA: confA.details.title,
              conferenceIdB: confB.id,
              conferenceTitleB: confB.details.title,
              overlappingDates: `${confA.details.startDate} to ${confB.details.endDate}`,
              conflictingResource: `${sA.fullName} (${sA.role})`
            });
          }
        }
      }
    }
  }

  return conflicts;
}
