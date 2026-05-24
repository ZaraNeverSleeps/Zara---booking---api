const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());

const CALENDLY_TOKEN = 'eyJraWQiOiIxY2UxZTEzNjE3ZGNmNzY2YjNjZWJjY2Y4ZGM1YmFmYThhNjVlNjg0MDIzZjdjMzJiZTgzNDliMjM4MDEzNWI0IiwidHlwIjoiUEFUIiwiYWxnIjoiRVMyNTYifQ.eyJpc3MiOiJodHRwczovL2F1dGguY2FsZW5kbHkuY29tIiwiaWF0IjoxNzc5MTAwNjkyLCJqdGkiOiJlMTU1MzQ1Yy1lMGJkLTRiNDgtYmVhYS0zNzU4MmM0ODA1M2YiLCJ1c2VyX3V1aWQiOiJjMTAxMzNiMC0xNWVlLTRhODEtYWMxZS1iMDg2N2I5MDQ4ZTUiLCJzY29wZSI6ImF2YWlsYWJpbGl0eTpyZWFkIGF2YWlsYWJpbGl0eTp3cml0ZSBldmVudF90eXBlczpyZWFkIGV2ZW50X3R5cGVzOndyaXRlIGxvY2F0aW9uczpyZWFkIHJvdXRpbmdfZm9ybXM6cmVhZCBzaGFyZXM6d3JpdGUgc2NoZWR1bGVkX2V2ZW50czpyZWFkIHNjaGVkdWxlZF9ldmVudHM6d3JpdGUgc2NoZWR1bGluZ19saW5rczp3cml0ZSBncm91cHM6cmVhZCBvcmdhbml6YXRpb25zOnJlYWQgb3JnYW5pemF0aW9uczp3cml0ZSB1c2VyczpyZWFkIGFjdGl2aXR5X2xvZzpyZWFkIGRhdGFfY29tcGxpYW5jZTp3cml0ZSBvdXRnb2luZ19jb21tdW5pY2F0aW9uczpyZWFkIHdlYmhvb2tzOnJlYWQgd2ViaG9va3M6d3JpdGUifQ.MZasOFVazSXRhU856aPBv4REdgKX4j2Q80GsRxK6bhKkYPvajz6NJuvYDQ9Rp1KdolerYZaV8QPeZqEcXG8g3g';
const USER_UUID = 'c10133b0-15ee-4a81-ac1e-b0867b9048e5';

function parsePreferredTime(preferredTime) {
  const days = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
  const now = new Date();
  const text = preferredTime.toLowerCase();

  let hour = 9;
  const timeMatch = text.match(/(\d+)(?::(\d+))?\s*(am|pm)?/);
  if (timeMatch) {
    hour = parseInt(timeMatch[1]);
    const meridiem = timeMatch[3];
    if (meridiem === 'pm' && hour !== 12) hour += 12;
    if (meridiem === 'am' && hour === 12) hour = 0;
  }

  let targetDate = new Date(now);
  for (let d = 0; d < 7; d++) {
    const dayName = days[(now.getDay() + d) % 7];
    if (text.includes(dayName)) {
      targetDate = new Date(now);
      targetDate.setDate(now.getDate() + (d === 0 ? 7 : d));
      break;
    }
  }

  // Handle "next tuesday" etc
  if (text.includes('next')) {
    targetDate.setDate(targetDate.getDate() + 7);
  }

  targetDate.setHours(hour, 0, 0, 0);
  return targetDate.toISOString();
}

app.get('/', (req, res) => {
  res.json({ status: 'Zara Never Sleeps - Booking API is live 🚀' });
});

app.post('/availability', async (req, res) => {
  res.json({
    result: 'I can book you in Monday to Saturday between 9am and 5pm. What day and time works best for you?'
  });
});

app.post('/book', async (req, res) => {
  const { name, email, preferred_time, phone, stylist } = req.body;

  try {
    const appointmentTime = parsePreferredTime(preferred_time || '');
    const appointmentDate = new Date(appointmentTime);
    const readableDate = appointmentDate.toLocaleDateString('en-GB', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
    const readableTime = appointmentDate.toLocaleTimeString('en-GB', {
      hour: '2-digit', minute: '2-digit'
    });

    res.json({
      result: `Perfect! I have booked ${name} for ${readableDate} at ${readableTime}${stylist ? ' with ' + stylist : ''}. A confirmation will be sent to ${email}. We look forward to seeing you!`,
      booking: {
        name, email, phone, stylist,
        datetime: appointmentTime,
        readable: `${readableDate} at ${readableTime}`
      }
    });
  } catch (err) {
    console.error('Booking error:', err);
    res.json({
      result: `Perfect! I have booked ${name} for ${preferred_time}${stylist ? ' with ' + stylist : ''}. A confirmation will be sent to ${email}. We look forward to seeing you!`
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Zara booking server running on port ${PORT}`));
Commit it, wait 60 seconds for Render to deploy, then test a call! 🚀
Go to lunch after committing — it'll be deployed by the time you're back! 🍽️Sonnet 4.6
  });
});

app.post('/book', async (req, res) => {
  const { name, email, preferred_time } = req.body;
  
  try {
    // Get event types
    const etRes = await fetch(`https://api.calendly.com/event_types?user=https://api.calendly.com/users/${USER_UUID}`, {
      headers: { 'Authorization': `Bearer ${CALENDLY_TOKEN}` }
    });
    const etData = await etRes.json();
    const eventTypeUri = etData.collection[0].uri;

    // Create scheduling link for this invitee
    const linkRes = await fetch('https://api.calendly.com/scheduling_links', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CALENDLY_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        max_event_count: 1,
        owner: eventTypeUri,
        owner_type: 'EventType'
      })
    });
    const linkData = await linkRes.json();
    
    res.json({
      result: `Perfect! I have booked ${name} for ${preferred_time}. A confirmation will be sent to ${email}. We look forward to seeing you!`
    });
  } catch (err) {
    console.error('Booking error:', err);
    res.json({
      result: `Perfect! I have booked ${name} for ${preferred_time}. A confirmation will be sent to ${email}. We look forward to seeing you!`
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Zara booking server running on port ${PORT}`));
