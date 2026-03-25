const { parseScrapedShifts } = require('../services/icalParser');

async function testScraping() {
  console.log('Testing W2W Scraped Shift Parsing...');

  const mockScrapedShifts = [
    {
      id: 'w2w-x1y2z3',
      title: 'Membership - Welcome Center Desk',
      date: 'Sun Mar 29, 2026',
      time: '1:45pm - 6:15pm',
      location: 'Welcome Center Desk',
      fullText: 'Sun Mar 29, 2026 1:45pm - 6:15pm Membership | Welcome Center Desk'
    },
    {
      id: 'w2w-a1b2c3',
      title: 'Membership Staff Meeting',
      date: 'Sun Apr 12, 2026',
      time: '7am - 8:30am',
      location: 'YMCA',
      fullText: 'Sun Apr 12, 2026 7am - 8:30am Membership Staff Meeting'
    }
  ];

  try {
    const normalized = parseScrapedShifts(mockScrapedShifts);
    console.log('Normalized Shifts:', JSON.stringify(normalized, null, 2));

    if (normalized.length === 2) {
      console.log('✅ Success: Normalized 2 shifts.');
      
      const s1 = normalized[0];
      if (s1.start === '2026-03-29T13:45:00.000Z' || s1.start.includes('13:45') || s1.start.includes('18:45')) {
          // Note: exact ISO depends on local timezone of the test runner, 
          // but we can check if it's 1:45 PM (13:45).
          // 13:45 + 5 or 4 hours for EDT/CDT etc. 
          // Let's just check if it's a valid date and the hours match.
          const d1 = new Date(s1.start);
          console.log(`Shift 1 Start: ${d1.toLocaleString()}`);
          if (d1.getHours() === 13 && d1.getMinutes() === 45) {
              console.log('✅ Success: Time 1:45pm parsed correctly.');
          }
      }

      const s2 = normalized[1];
      const d2 = new Date(s2.start);
      console.log(`Shift 2 Start: ${d2.toLocaleString()}`);
      if (d2.getHours() === 7 && d2.getMinutes() === 0) {
          console.log('✅ Success: Time 7am parsed correctly.');
      }
      
    } else {
      console.log('❌ Failure: Expected 2 shifts.');
    }
  } catch (err) {
    console.error('❌ Error during test:', err);
  }
}

testScraping();
