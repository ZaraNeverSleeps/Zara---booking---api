const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const CALENDLY_TOKEN = process.env.CALENDLY_TOKEN;
const CALENDLY_USERNAME = process.env.CALENDLY_USERNAME || 'dellworldwidebrands';
const EVENT_SLUG = process.env.EVENT_SLUG || '30min';

app.get('/', (req, res) => {
  res.json({ status: 'Zara Never Sleeps - Booking API is live 🚀' });
});

async function getUserUri() {
  const res = await axios.get('https://api.calendly.com/users/me', {
    headers: { Authorization: `Bearer ${CALENDLY_TOKEN}` }
  });
  return res.data.resource.uri;
}

async function getEventTypeUri(userUri) {
  const res = await axios.get('https://api.calendly.com/event_types', {
    headers: { Authorization: `Bearer ${CALENDLY_TOKEN}` },
    params: { user: userUri }
  });
  const events = res.data.collection;
  const match = events.find(e => e.scheduling_url.includes(EVENT_SLUG));
  return match ? match.uri : events[0].uri;
}

app.post('/availability', async (req, res) => {
  try {
    const userUri = await getUserUri();
    const eventTypeUri = await getEventTypeUri(userUri);

    const now = new Date();
    const weekLater = new Date();
    weekLater.setDate(now.getDate() + 7);

    const response = await axios.get('https://api.calendly.com/event_type_available_times', {
      headers: { Authorization: `Bearer ${CALENDLY_TOKEN}` },
      params: {
        event_type: eventTypeUri,
        start_time: now.toISOString(),
        end_time: weekLater.toISOString()
      }
    });

    const slots = response.data.collection.slice(0, 5).map(slot => ({
      start_time: slot.start_time,
      readable: new Date(slot.start_time).toLocaleString('en-NZ', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Pacific/Auckland'
      })
    }));

    res.json({
      success: true,
      available_slots: slots,
      message: slots.length > 0
        ? `I have ${slots.length} available slots. The first available is ${slots[0].readable}.`
        : 'No available slots in the next 7 days.'
    });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/book', async (req, res) => {
  try {
    const { start_time, name, email } = req.body;

    if (!start_time || !name || !email) {
      return res.status(400).json({ success: false, error: 'Missing start_time, name, or email' });
    }

    const userUri = await getUserUri();
    const eventTypeUri = await getEventTypeUri(userUri);

    const response = await axios.post('https://api.calendly.com/one_off_event_types', {
      name: `Meeting with ${name}`,
      host: userUri,
      co_hosts: [],
      duration: 30,
      timezone: 'Pacific/Auckland',
      date_setting: {
        type: 'date_range',
        start_date: start_time.split('T')[0],
        end_date: start_time.split('T')[0]
      },
      location: {
        kind: 'phone_call',
        phone_number: '',
        additional_info: ''
      }
    }, {
      headers: { Authorization: `Bearer ${CALENDLY_TOKEN}` }
    });

    res.json({
      success: true,
      message: `Great! I've booked a 30-minute appointment for ${name} on ${new Date(start_time).toLocaleString('en-NZ', { weekday: 'long', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Pacific/Auckland' })}. A confirmation will be sent to ${email}.`,
      booking_url: response.data.resource?.scheduling_url || null
    });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Zara booking server running on port ${PORT}`));



