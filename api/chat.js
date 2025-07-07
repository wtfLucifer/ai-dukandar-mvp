const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Your Gemini API Key should be stored as an Environment Variable on Vercel
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

app.post('/api/chat', async (req, res) => {
  // Destructure the request body, now including history
  const { message, language, userId, history } = req.body;

  if (!GEMINI_API_KEY) {
    return res.status(500).json({ reply: 'Server configuration error: API key not set.' });
  }
  if (!message) {
    return res.status(400).json({ reply: 'No message provided.' });
  }

  // A more robust, contextual prompt for the AI
  const langInstruction = language === 'hinglish' ? 'Hinglish (a mix of Hindi and English)' : language;
  
  // Format the history for the prompt
  const conversationHistory = history.map(turn => `${turn.sender === 'user' ? 'User' : 'AI Dukandar'}: ${turn.text}`).join('\n');

  const promptText = `
    You are 'AI Dukandar', a friendly and helpful AI shopkeeper assisting users in India.
    Your personality is patient and clear, designed for users who may not be fully literate.
    Your goal is to understand the user's shopping list, suggest products, and confirm their order.

    Instructions:
    1.  Always respond in ${langInstruction}.
    2.  Keep your responses short, simple, and easy to understand.
    3.  When a user asks for an item, confirm the item and quantity (e.g., "1 किलो चावल, ठीक है?").
    4.  When the user confirms, acknowledge it and ask what's next (e.g., "ठीक है, 1 किलो चावल आपके आर्डर में जोड़ दिया है। और कुछ?").
    5.  Use conversational cues from the history below.

    Conversation History:
    ${conversationHistory}

    New User Message: ${message}
    AI Dukandar's Response:
  `;

  try {
    const response = await axios.post(
      // Using a recommended stable model
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`,
      {
        contents: [{
          parts: [{ text: promptText }]
        }],
        // Optional: Add safety settings if needed
        "generationConfig": {
            "temperature": 0.7,
            "topP": 1,
            "topK": 1,
            "maxOutputTokens": 256,
        }
      },
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
    
    // Safely access the response text
    const reply = response.data?.candidates?.[0]?.content?.parts?.[0]?.text.trim() || 'Sorry, I could not understand. Can you please repeat?';
    res.json({ reply });

  } catch (error) {
    console.error('Error fetching Gemini response:', error.response ? error.response.data : error.message);
    res.status(500).json({ reply: 'There was an error trying to get a response from the AI.' });
  }
});

// Export the app for Vercel's serverless environment
module.exports = app;