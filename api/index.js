const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config(); // Load environment variables
const app = express();

app.use(express.json());
app.use(cors()); // Enable CORS

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  console.error('GEMINI_API_KEY is not set');
  process.exit(1);
}

app.post('/api/chat', async (req, res) => {
  const { message } = req.body;
  try {
    const response = await axios.post(
      `https://api.google.ai/gemini/v1/models/gemini-pro:generateText`, // Updated endpoint (check docs)
      {
        prompt: {
          text: `You are an AI shopkeeper for an Indian audience. Respond in Hindi to the user's shopping request: ${message}. Suggest products if relevant.`
        },
        temperature: 0.7,
        maxOutputTokens: 100,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GEMINI_API_KEY}`,
        },
      }
    );
    console.log('Gemini response:', response.data); // Debug log
    res.json({ reply: response.data?.candidates?.[0]?.output || 'कृपया अपनी जरूरत बताएं।' });
  } catch (error) {
    console.error('Error fetching Gemini response:', error.response?.data || error.message);
    res.status(500).json({ reply: 'क्षमा करें, अभी कोई जवाब नहीं मिला। बाद में पुन: प्रयास करें।' });
  }
});

module.exports = app; // For Vercel serverless function