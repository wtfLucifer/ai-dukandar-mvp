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
  const { message, language } = req.body;
  try {
    const response = await axios.post(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
      {
        contents: [
          {
            parts: [
              {
                text: `You are an AI shopkeeper. Respond in ${language === 'hinglish' ? 'Hinglish' : language} to the user's shopping request: ${message}. Suggest products if relevant.`
              }
            ]
          }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-goog-api-key': GEMINI_API_KEY,
        },
      }
    );
    res.json({ reply: response.data?.candidates?.[0]?.content?.parts?.[0]?.text || 'Default response' });
  } catch (error) {
    console.error('Error fetching Gemini response:', error.response?.data || error.message);
    res.status(500).json({ reply: 'Error occurred' });
  }
});

module.exports = app; // For Vercel serverless function