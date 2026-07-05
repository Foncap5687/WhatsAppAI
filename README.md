# 💬 WhatsApp AI Clone

A real-time chat application with AI capabilities built with React Native, Expo, Firebase, and Groq AI.

## Features

✅ **Real-time Messaging** - Instant message delivery using Firebase  
✅ **WhatsApp-like UI** - Professional chat interface  
✅ **User Authentication** - Email/password login & signup  
✅ **One-on-One Chats** - Direct messaging  
✅ **AI Chatbot** - Chat with WhatsApp AI powered by Groq  
✅ **AI Suggestions** - Quick reply suggestions while typing  
✅ **Message Reactions** - React with emojis (😀, 😂, ❤️, etc)  
✅ **Read Receipts** - See message status  
✅ **User Profiles** - View and edit profiles  
✅ **Online Status** - Show online/offline status  
✅ **Search** - Find chats and contacts  
✅ **Dark-optimized UI** - Professional WhatsApp-style design  

## Tech Stack

- **React Native** - Cross-platform mobile development
- **Expo** - Easy deployment and testing
- **Firebase** - Backend, auth, and database
- **Groq AI** - LLM for AI chatbot and suggestions
- **React Navigation** - Tab and stack navigation
- **Firestore** - Real-time database

## Setup Instructions

### Prerequisites
- Node.js and npm
- Expo CLI (`npm install -g expo-cli`)
- Firebase account
- Groq API key (free tier available)
- Expo Go app on your phone

### Installation

1. **Clone Repository**
   ```bash
   git clone https://github.com/Foncap5687/WhatsAppAI.git
   cd WhatsAppAI
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Set Up Firebase**
   - Go to https://console.firebase.google.com
   - Create a new project
   - Enable Authentication (Email/Password)
   - Create Firestore database
   - Get your Firebase config

4. **Get Groq API Key**
   - Visit https://console.groq.com
   - Sign up and create an API key
   - Free tier is available!

5. **Configure Environment**
   ```bash
   cp .env.example .env.local
   ```
   - Edit `.env.local` with your Firebase and Groq keys

6. **Start the App**
   ```bash
   npm start --tunnel
   ```

7. **Test on Phone**
   - Install Expo Go
   - Scan the QR code
   - App loads on your phone!

## Project Structure

```
WhatsAppAI/
├── config/
│   └── firebase.js           # Firebase config
├── screens/
│   ├── LoginScreen.js        # Auth screen
│   ├── ChatsListScreen.js    # Chat list
│   ├── ChatDetailScreen.js   # Individual chat
│   └── ProfileScreen.js      # User profile
├── services/
│   └── groqAI.js            # AI integration
├── App.js                    # Main navigation
├── app.json                  # Expo config
└── package.json              # Dependencies
```

## Database Structure

### Collections

**users**
```json
{
  "email": "user@example.com",
  "displayName": "John Doe",
  "status": "Hey there!",
  "profileImage": "url",
  "isOnline": true,
  "lastSeen": "timestamp"
}
```

**chats**
```json
{
  "participants": ["uid1", "uid2"],
  "participantName": "John",
  "lastMessage": "Hello!",
  "lastMessageTime": "timestamp",
  "unreadCount": 0
}
```

**messages**
```json
{
  "chatId": "uid1_uid2",
  "senderId": "uid1",
  "senderName": "Alice",
  "text": "Hi!",
  "timestamp": "timestamp",
  "reactions": [{"userId": "uid2", "emoji": "❤️"}],
  "isRead": true
}
```

## How to Use

1. **Sign Up** - Create account with email
2. **Browse Contacts** - Tap ✎ to see available users
3. **Start Chat** - Select any user to message
4. **Chat with AI** - Find "WhatsApp AI" in your chats
5. **Get Suggestions** - AI suggests replies as you type
6. **React to Messages** - Long press message to add emoji

## AI Features

### Groq AI Integration
- **Model**: Mixtral-8x7b (fast & accurate)
- **Responses**: Helpful, concise replies
- **Suggestions**: 3 quick replies per message
- **Speed**: Real-time responses (<1 second)

### Example AI Chat
```
You: What's the weather like?
AI: I can't check real-time weather, but I recommend checking a weather app. Is there something else I can help with?

You: Tell me a joke
AI: Why don't scientists trust atoms? Because they make up everything! 😄
```

## Future Enhancements

- [ ] Voice calls
- [ ] Video calls
- [ ] Group chats
- [ ] Message encryption
- [ ] File sharing
- [ ] Location sharing
- [ ] Push notifications
- [ ] Dark mode
- [ ] Message search
- [ ] AI image generation

## Troubleshooting

### App won't connect to Expo Go
- Use tunnel mode: `npm start --tunnel`
- Make sure your phone has internet
- Check Firebase credentials in `.env.local`

### AI responses are slow
- Groq API might be rate limited
- Check your API key is valid
- Wait a few seconds and try again

### Firebase errors
- Double-check `.env.local` credentials
- Enable Firestore in Firebase console
- Check database rules allow read/write

## Free Credits

- **Firebase**: 1GB storage free
- **Groq**: 30 requests/minute free tier
- **Expo**: Free for development

## License

MIT License - Free to use and modify

## Support

Have questions? Open an issue on GitHub or check the documentation!

---

**Made with ❤️ using React Native, Firebase, and Groq AI**
