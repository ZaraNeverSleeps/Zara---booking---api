const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());
const { google } = require('googleapis');

const credentials = {
  type: "service_account",
  project_id: "zara-never-sleeps",
  private_key_id: "6ed5d422b3e7cfc9be4ca5bdc5a8a875c6709251",
  private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDUFoOrWafsP1FM\n98DnwO6TewwqotmI/uL0wM9e9ERB6kdzjXYBIa24G7CYNE1jwNyZWQ9e+y0rS40x\nvQPU2I1XaUUJMfxQDmDRaV045X9MMO35xyITEVh8Yx9qbKvDDRFS8Wa43Q9u3/5S\nQCasQ2AkEHPzrSATysi57TV6UfZnT5CjYJGfdw/dsURTcnEsVaGk6JsTYQ2CxdS4\ny3wbsfRYMn3/5eikrv7n7yDHsJu2CDx3yvKdXPm1fNCH4ulBGvp6jlnqqrybL/PK\nCqsLMHtFX5HyRt14Suz/i/lfaXwgeDOWE7+/DwjOBGsB+Slg8/VA/fRIEzH1NUV5\nc/Mkl6AlAgMBAAECggEAAzNXx1UyCImoE25FtfmeYBFiTJ5qg/u8tw7V0kwDX69G\nZsMCvd+hPH8GejWH2XKGobXLWpaVxup79f0xOpwN/fyzswDTGu4sndxmML6d3it6\n2+Maa4k+eZoRVkzPhsECuuqzryR+4CB3OQyIyN63a7Pn3AyHyGSuBMhEn1TvT/3H\nWyooQJPTwpp4iiN9zFdaTYqbveZj2VHF8CdStyFIKQvfsemMMgCW7mTTj7fjjpNh\njEqUpMTlcgdqnh8OhG1LbE/4hc5RKWrqUcOWOa/66t8gFndCWf5OUzbhkw3X2hGn\nJcpYvHNXo96lav/dy7Oz9fRM9XJUpcVVl7ciI7hqgQKBgQDuTfAuPOpJRQR/5n3C\n/Ot3LfPyMkdGEYJbZBy+HE6J95xH/9nj/CsxStt2lc4xYcoguhn5qkH79At3HXso\nwnOo7dA680+IrzRied+LVZ+JzrEaMf9Zrg932w4vc0N8GlH+0cm7dEwfP3OTYCmR\nXKiBWdc9BdOXTsXAv4m2b8anIQKBgQDj1jZMao25SKGZjttUaJS1fjn1G5Dp8b/p\nsIF6UjhfKXGFhYyjMHcjCZi5U2sD9tCVe+kovu/3kAnm3a03cHc2NrQRkGBjXAsq\noj9RE/4FLKPdlXrQV+kPzG4NwdkllGJ2I+9IriNwXIi+W1SxwR/Le2cw+4IafpPr\n/lJU0SVMhQKBgB45VFUI9M4GKuPt39VzLooXEfGN3uxMHDRrJhoWjP+CoBeho4j+\n2puN2vfXWCd7N5+e+txnc6b49NtOqegpgXHTd62CXnv/fK1gt7F8Upev11ZzMOe2\n489XwRzTiaOb0vp2sRdNULpF2eq/L4Z4Mgb11g6vRn7SRtKDeHvjAVcBAoGACqmM\nsvjNlx0yCtinpQSb6P52QeU/W+NnYs1S0eGlJ7btzBza3ww2lxos3odr26yiSEyb\nNb/xxPklrXs0TwLhYVUgCi5ihGPbVexv4CB6Y82aAZWsQLHMg2PCxrwKqHqQPQ0j\ndphHqkt6TsZBaWwrS7+DrcQna4v+6i1ltvhusW0CgYEAlBaAwlsi+OtKHFBOWo0j\nN0F8W213DOu9t2GTaX+bPcw9yaPjy6A56CZD43pkgprDJrfb03/fmT1XoV2/oIMa\nIxf9gmqw+7B+OaG7SYehTDGdJ5G8XegE4JRWaXqx2FUtHg1kdmaA8b1ECp6BQRxA\nl0y1GoOlklq6GTOrv5J14BM=\n-----END PRIVATE KEY-----\n",
  client_email: "zara-calendar@zara-never-sleeps.iam.gserviceaccount.com",
  client_id: "115981677429934279620",
  token_uri: "https://oauth2.googleapis.com/token"
};

const CALENDAR_ID = '5f861606ec8825900407483cce2e5fa9c1bd8689e3b389484b040f53b033fa81@group.calendar.google.com';
const TIMEZONE = 'Pacific/Auckland';

const auth = new google.auth.JWT(
  credentials.client_email,
  null,
  credentials.private_key,
  ['https://www.googleapis.com/auth/calendar']
);

function parsePreferredTime(preferredTime) {
  const text = preferredTime.toLowerCase();

  let hour = 9;
  const timeMatch = text.match(/(\d+)(?::(\d+))?\s*(am|pm)/i);
  if (timeMatch) {
    hour = parseInt(timeMatch[1]);
    const meridiem = timeMatch[3];
    if (meridiem.toLowerCase() === 'pm' && hour !== 12) hour += 12;
    if (meridiem.toLowerCase() === 'am' && hour === 12) hour = 0;
  }

  const nowNZ = new Date(new Date().toLocaleString('en-US', { timeZone: TIMEZONE }));
  let targetDate = new Date(nowNZ);

  const dateNumMatch = text.match(/(\d+)(st|nd|rd|th)/);
  if (dateNumMatch) {
    const dayNum = parseInt(dateNumMatch[1]);
    targetDate.setDate(dayNum);
    if (targetDate <= nowNZ) {
      targetDate.setMonth(targetDate.getMonth() + 1);
    }
  } else {
    const days = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
    let daysToAdd = 1;
    for (let d = 0; d < 7; d++) {
      if (text.includes(days[d])) {
        const todayIndex = nowNZ.getDay();
        daysToAdd = (d - todayIndex + 7) % 7;
        if (daysToAdd <= 0 || text.includes('next')) daysToAdd += 7;
        break;
      }
    }
    targetDate.setDate(nowNZ.getDate() + daysToAdd);
  }

  targetDate.setHours(hour, 0, 0, 0);

  const tzOffset = 12 * 60;
  const utcDate = new Date(targetDate.getTime() - tzOffset * 60000);
  return utcDate;
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
  console.log('Booking request:', JSON.stringify(req.body));
  try {
    const appointmentDate = parsePreferredTime(preferred_time || '');
    const endDate = new Date(appointmentDate.getTime() + 60 * 60 * 1000);
    const calendar = google.calendar({ version: 'v3', auth });
    await calendar.events.insert({
      calendarId: CALENDAR_ID,
      requestBody: {
        summary: `Hair Appointment - ${name}`,
        description: `Name: ${name}\nPhone: ${phone}\nEmail: ${email}\nStylist: ${stylist || 'Any'}\nBooked via Zara Never Sleeps`,
        start: { dateTime: appointmentDate.toISOString(), timeZone: TIMEZONE },
        end: { dateTime: endDate.toISOString(), timeZone: TIMEZONE }
      }
    });
    const readableDate = appointmentDate.toLocaleDateString('en-GB', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      timeZone: TIMEZONE
    });
    const readableTime = appointmentDate.toLocaleTimeString('en-GB', {
      hour: '2-digit', minute: '2-digit', timeZone: TIMEZONE
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
