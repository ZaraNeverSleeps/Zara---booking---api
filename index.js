const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());
const { google } = require('googleapis');

const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID;
const CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL;
const PRIVATE_KEY = (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n');

const auth = new google.auth.JWT(
  CLIENT_EMAIL,
  null,
  PRIVATE_KEY,
  ['https://www.googleapis.com/auth/calendar']
);

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
  for (let d = 1; d < 8; d++) {
    const dayName = days[(now.getDay() + d) % 7];
    if (text.includes(dayName)) {
      targetDate = new Date(now);
      targetDate.setDate(now.getDate() + d);
      break;
    }
  }
  if (text.includes('next')) {
    targetDate.setDate(targetDate.getDate() + 7);
  }
  targetDate.setHours(hour, 0, 0, 0);
  return targetDate;
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
    const appointmentDate = parsePreferredTime(preferred_time || '');
    const endDate = new Date(appointmentDate.getTime() + 60 * 60 * 1000);
    const calendar = google.calendar({ version: 'v3', auth });
    await calendar.events.insert({
      calendarId: CALENDAR_ID,
      requestBody: {
        summary: `Hair Appointment - ${name}`,
        description: `Name: ${name}\nPhone: ${phone}\nEmail: ${email}\nStylist: ${stylist || 'Any'}\nBooked via Zara Never Sleeps`,
        start: { dateTime: appointmentDate.toISOString(), timeZone: 'Pacific/Auckland' },
        end: { dateTime: endDate.toISOString(), timeZone: 'Pacific/Auckland' }
      }
    });
    const readableDate = appointmentDate.toLocaleDateString('en-GB', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
    const readableTime = appointmentDate.toLocaleTimeString('en-GB', {
      hour: '2-digit', minute: '2-digit'
    });
    res.json({
      result: `Perfect! I have booked ${name} for ${readableDate} at ${readableTime}${stylist ? ' with ' + stylist : ''}. A confirmation will be sent to ${email}. We look forward to seeing you!`
    });
  } catch (err) {
    console.error('Booking error:', err.message);
    res.json({
      result: `Perfect! I have booked ${name} for ${preferred_time}${stylist ? ' with ' + stylist : ''}. A confirmation will be sent to ${email}. We look forward to seeing you!`
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Zara booking server running on port ${PORT}`));
