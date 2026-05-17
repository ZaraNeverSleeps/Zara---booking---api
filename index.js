const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ status: 'Zara Never Sleeps - Booking API is live 🚀' });
});

app.post('/availability', async (req, res) => {
  res.json({
    result: 'I can book you in Monday to Saturday between 9am and 5pm. What day and time works best for you?'
  });
});

app.post('/book', async (req, res) => {
  const { name, email, preferred_time } = req.body;
  res.json({
    result: `Perfect! I have booked you in ${name} for ${preferred_time}. A confirmation will be sent to ${email}. We look forward to seeing you!`
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Zara booking server running on port ${PORT}`));
