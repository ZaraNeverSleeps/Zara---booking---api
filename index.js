const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());
const { google } = require('googleapis');

const CALENDAR_ID = '5f861606ec8825900407483cce2e5fa9c1bd8689e3b389484b040f53b033fa81@group.calendar.google.com';

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: 'zara-calendar@zara-never-sleeps.iam.gserviceaccount.com',
    private_key: '-----BEGIN PRIVATE KEY-----\nMIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQC49N7JxeDno2uU\nPjdr/gZG/YEiVinpa44V0ktNnDL8omj6BQQkqT7vbCJnqsGEHOTiFYc3aCyuVV/f\n0SqbJM6Bw1nOIe6PunPbiIkBmNM0uwkTDigcVAgvCv1NI3KLgAVqbx28Na8nRlyM\nYhDHwh7q0wbSQ9Q5715JB+9vnw6QzCGM/tHc4GfZ8LpyFJfAWjZ+QzbRqbkHhSjE\n0zan7U5bvlhXyQtq/wS+K2xZt9iOj8qfgpBsOrAw1Lo07MuWvL1Td8XfnduqkOUL\n4oQsPZBMciS3Wx+RbaIHNA5AutlAaM/E3yYDX96lE3Vk8iMuftuS678XL7rYasAe\nlllNG9ejAgMBAAECggEAV5JpYfO1FzgDGb+TkihGZJpm6BEP6xsnvSFC0k5gvclQ\nFwEFAy63Q7lZWOg6lAjyPjGfQharASgfKuPoXmjA9iO+g6EBSUAo1wsAg6cOaWsd\nUs5jI3aOIWf8oudjtrU42zodRB3O/rOL4lQUSeCZrumX0zqWY4/4fm+paJpQ1TFj\nqtMTCoOCyo4SgBshbefErr+Vhlv+9UJTSy9mQyNOq8yW+G5W3t7qf7sMnxvmsCMj\n/ErtSvFQLhm+3GQDE4QC/pxthK8n7TtLz4njbvL3dmeBo7iEAJsyRKnzgMcUddT8\nj9LSDNDIxN7GOISiGOojzLy7PJh5FwIKF3Ub3sUJ8QKBgQDZpTEfSXx/7WkuhzPh\nLVUaznAlmC4+x+Ik1QqeXgoX+fyD48iamocsMXpIYFaQDpOJe0gwaPTsuC7wH29d\nQJ2IW920FiSjhS9oEi4YwcxJ7g8+6iz2EgbgKxljU7KCP+7LeHCjr5sXGkqiMMWD\ndhfMitqpSQ0KKU/bZhMCJZ1LDwKBgQDZjPbIuOxvG/XXZ31zuT2urrd+RkpYftJh\n/do89K8sKL0awHxUZB0EiJ7Bpfvf+JpbpTw5+yIIDQBNJMMMsT5J+7cTYNtfrV10\nG6GvE3eCL91HbD2Xj5x1RGZeeYKYiHFI8vTWg5iDURqKk3BvOuaABHLl+g+zehBw\nlIyefEf6LQKBgQCuXQF1p1Huyyyw8fBGPiMoTqrZ84lZEpnCGEthhMVhYA1FPH/C\nHHqelST6RvQShRr90Z6L6goOe6BfD1AQzWtnivGbDQJdXp4UKjxz6Q7ZS7c7GDDd\nEqQfg2fbg3pHjyCoMd1LxaviXlXcimYyY7G9VKDJbpTbxy0LAEPKPIg/UQKBgQCs\n49UgMa5corjehfVyKW32zA0xgkUFTUx+6dItjTtFed7HSt/D5YgWGUkplnK0TQrG\n+GsDnSwvf72UkTmddaKOA0g8U0YkJE/XvTniPDNGuCk/4KqWL2Bk5YYBYMnD1PNK\nySKA9DYZbjQMmx3Il+OlK2PwlqkxtjkobzXNofFFxQKBgQCvu4L/SjcDHfz9X0Vk\n/8gzuopAi9iCLmXv+3acCEeFX9Ww44d4KkoSyxSG7FyJUEjTDxfp80k9laN++WXC\nqMwFstCmPaEVaLWsvvsQVNYbknsThiT5az4tSoIsNDlWCp62IfN7oj8PpGjsxbhB\njmW9ihip2YHLqwvbJ3hsGLDa/A==\n-----END PRIVATE KEY-----\n'
  },
  scopes: ['https://www.googleapis.com/auth/calendar']
});

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
        description: `Name: ${name}\nPhone: ${phone}\nEmail: ${email}\nStylist: ${stylist || 'Any'Sonnet 4.6
