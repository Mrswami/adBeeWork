const { parseShiftFeed } = require('../services/icalParser');

async function runTest() {
  console.log('Testing WhenToWork iCal Parsing...');

  const mockIcalData = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//WhenToWork//NONSGML WhenToWork iCal Feed//EN
BEGIN:VEVENT
UID:shift-123@w2w.com
DTSTAMP:20240324T150000Z
DTSTART:20260325T130000Z
DTEND:20260325T170000Z
SUMMARY:Assign: Front Desk - TownLake YMCA
DESCRIPTION:Shift at Front Desk
LOCATION:TownLake YMCA
STATUS:CONFIRMED
END:VEVENT
BEGIN:VEVENT
UID:shift-456@w2w.com
DTSTAMP:20240324T150000Z
DTSTART:20260326T080000Z
DTEND:20260326T120000Z
SUMMARY:Assign: Lifeguard - Springs YMCA
DESCRIPTION:Lifeguard shift
LOCATION:Springs YMCA
STATUS:TENTATIVE
END:VEVENT
END:VCALENDAR`;

  // We can't easily mock ical.async.fromURL without nock or manual mocking
  // Instead, let's just test a modified version of parseShiftFeed or mock node-ical
  
  const ical = require('node-ical');
  const originalFromURL = ical.async.fromURL;
  
  ical.async.fromURL = async () => {
    return ical.sync.parseICS(mockIcalData);
  };

  try {
    const shifts = await parseShiftFeed('https://example.com/w2w.ics');
    console.log('Parsed Shifts:', JSON.stringify(shifts, null, 2));

    if (shifts.length === 2) {
      console.log('✅ Success: Parsed 2 future shifts.');
      if (shifts[0].title === 'Front Desk - TownLake YMCA') {
        console.log('✅ Success: Cleaned "Assign:" prefix.');
      } else {
        console.log('❌ Failure: Title not cleaned correctly. Got:', shifts[0].title);
      }
    } else {
      console.log('❌ Failure: Expected 2 shifts, got:', shifts.length);
    }
  } catch (err) {
    console.error('❌ Error during test:', err);
  } finally {
    ical.async.fromURL = originalFromURL;
  }
}

runTest();
