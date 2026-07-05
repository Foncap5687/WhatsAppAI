import axios from 'axios';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY;

export const getAIResponse = async (userMessage) => {
  try {
    const response = await axios.post(
      GROQ_API_URL,
      {
        model: 'mixtral-8x7b-32768',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful WhatsApp assistant. Provide concise, friendly responses. Keep responses under 200 characters when possible.',
          },
          {
            role: 'user',
            content: userMessage,
          },
        ],
        temperature: 0.7,
        max_tokens: 256,
      },
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('AI Error:', error);
    return 'Sorry, I could not process that. Please try again.';
  }
};

export const generateAISuggestions = async (userMessage) => {
  try {
    const response = await axios.post(
      GROQ_API_URL,
      {
        model: 'mixtral-8x7b-32768',
        messages: [
          {
            role: 'system',
            content: 'Generate 3 short, helpful response suggestions (max 50 chars each) as a JSON array. Example: ["Yes, sounds good!", "Thanks for letting me know", "See you soon!"]',
          },
          {
            role: 'user',
            content: `Generate 3 quick reply suggestions for: "${userMessage}"`,
          },
        ],
        temperature: 0.5,
        max_tokens: 150,
      },
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const content = response.data.choices[0].message.content;
    const jsonMatch = content.match(/\[.*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return ['Got it!', 'Thanks!', 'OK!'];
  } catch (error) {
    console.error('Suggestions Error:', error);
    return ['Got it!', 'Thanks!', 'OK!'];
  }
};
