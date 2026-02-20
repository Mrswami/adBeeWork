const ical = require('node-ical');

/**
 * Fetch and parse a SocialSchedules iCal feed URL.
 * Returns an array of confirmed shift/schedule objects.
 */
async function parseSocialSchedulesFeed(icalUrl) {
  if (!icalUrl || !icalUrl.startsWith('http')) {
    throw new Error('Invalid iCal URL. Paste the calendar URL from SocialSchedules > Settings > Calendar Sync.');
  }

  let rawEvents;
  try {
    rawEvents = await ical.async.fromURL(icalUrl);
  } catch (err) {
    throw new Error(`Could not fetch iCal feed: ${err.message}`);
  }

  const now = new Date();
  const schedules = [];

  for (const key of Object.keys(rawEvents)) {
    const event = rawEvents[key];

    if (event.type !== 'VEVENT') continue;

    const start = event.start ? new Date(event.start) : null;
    const end = event.end ? new Date(event.end) : null;

    if (!start || !end) continue;

    // Only include future events (confirmed upcoming shifts)
    if (end < now) continue;

    // SocialSchedules uses STATUS:CONFIRMED for approved shifts
    const status = (event.status || '').toUpperCase();
    const isConfirmed = !status || status === 'CONFIRMED' || status === 'TENTATIVE';
    if (!isConfirmed) continue;

    schedules.push({
      id: event.uid || key,
      title: cleanTitle(event.summary || 'Work Shift'),
      description: event.description || '',
      location: event.location || '',
      start: start.toISOString(),
      end: end.toISOString(),
      status: status || 'CONFIRMED',
      rawStart: event.start,
      rawEnd: event.end,
    });
  }

  // Sort by start time ascending
  schedules.sort((a, b) => new Date(a.start) - new Date(b.start));

  return schedules;
}

function cleanTitle(title) {
  // SocialSchedules sometimes prefixes titles with location/role info
  return title.trim().replace(/\s+/g, ' ');
}

/**
 * Convert a parsed schedule into a Google Calendar event payload.
 */
function scheduleToCalendarEvent(schedule, timeZone = 'America/New_York') {
  return {
    title: schedule.title,
    description: schedule.description
      ? `${schedule.description}\n\n[Auto-synced from SocialSchedules]`
      : '[Auto-synced from SocialSchedules]',
    location: schedule.location,
    start: schedule.start,
    end: schedule.end,
    timeZone,
  };
}

module.exports = {
  parseSocialSchedulesFeed,
  scheduleToCalendarEvent,
};
