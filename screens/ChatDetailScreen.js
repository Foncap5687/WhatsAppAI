import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  updateDoc,
  doc,
  getDoc,
} from 'firebase/firestore';
import { firestore, auth } from '../config/firebase';
import { getAIResponse, generateAISuggestions } from '../services/groqAI';

const ChatDetailScreen = ({ route, navigation }) => {
  const { chatId, participantName, participantImage, participantId } = route.params;
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isAIChat, setIsAIChat] = useState(false);
  const flatListRef = useRef(null);

  useEffect(() => {
    navigation.setOptions({
      headerTitle: participantName,
      headerRight: () => (
        <View style={styles.headerRight}>
          <Image
            source={{
              uri: participantImage || 'https://via.placeholder.com/40',
            }}
            style={styles.headerAvatar}
          />
        </View>
      ),
    });

    // Check if this is AI chat
    setIsAIChat(participantId === 'ai-bot');

    loadMessages();
  }, [chatId]);

  const loadMessages = () => {
    try {
      const q = query(
        collection(firestore, 'messages'),
        where('chatId', '==', chatId),
        orderBy('timestamp', 'asc')
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const messageList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setMessages(messageList);
        setLoading(false);
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      });

      return unsubscribe;
    } catch (error) {
      console.error('Error loading messages:', error);
      setLoading(false);
    }
  };

  const generateSuggestions = async () => {
    if (!newMessage.trim()) {
      setSuggestions([]);
      return;
    }

    try {
      const suggestionsList = await generateAISuggestions(newMessage);
      setSuggestions(suggestionsList);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Error generating suggestions:', error);
    }
  };

  const sendMessage = async (messageText = newMessage) => {
    if (!messageText.trim()) return;

    try {
      const messageData = {
        chatId,
        senderId: auth.currentUser?.uid,
        senderName: auth.currentUser?.displayName,
        text: messageText,
        timestamp: serverTimestamp(),
        type: 'text',
        reactions: [],
        isRead: false,
      };

      await addDoc(collection(firestore, 'messages'), messageData);

      // Update chat's last message
      const chatsRef = doc(firestore, 'chats', chatId);
      await updateDoc(chatsRef, {
        lastMessage: messageText,
        lastMessageTime: serverTimestamp(),
      });

      setNewMessage('');
      setSuggestions([]);
      setShowSuggestions(false);

      // If AI chat, get AI response
      if (isAIChat) {
        setAiLoading(true);
        const aiResponse = await getAIResponse(messageText);
        
        const aiMessageData = {
          chatId,
          senderId: 'ai-bot',
          senderName: 'WhatsApp AI',
          text: aiResponse,
          timestamp: serverTimestamp(),
          type: 'text',
          reactions: [],
          isRead: true,
        };

        await addDoc(collection(firestore, 'messages'), aiMessageData);
        setAiLoading(false);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to send message');
    }
  };

  const addReaction = async (messageId, emoji) => {
    try {
      const messageRef = doc(firestore, 'messages', messageId);
      const messageSnap = await getDoc(messageRef);
      const currentReactions = messageSnap.data().reactions || [];

      const existingReactionIndex = currentReactions.findIndex(
        (r) => r.userId === auth.currentUser?.uid
      );

      let updatedReactions;
      if (existingReactionIndex >= 0) {
        currentReactions[existingReactionIndex].emoji = emoji;
        updatedReactions = currentReactions;
      } else {
        updatedReactions = [
          ...currentReactions,
          { userId: auth.currentUser?.uid, emoji },
        ];
      }

      await updateDoc(messageRef, { reactions: updatedReactions });
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
  };

  const renderMessage = ({ item }) => {
    const isOwn = item.senderId === auth.currentUser?.uid;
    const isAI = item.senderId === 'ai-bot';

    return (
      <View style={[styles.messageContainer, isOwn && styles.messageOwn]}>
        <View
          style={[
            styles.messageBubble,
            isOwn ? styles.bubbleOwn : isAI ? styles.bubbleAI : styles.bubbleOther,
          ]}
        >
          {isAI && <Text style={styles.aiLabel}>🤖 AI</Text>}
          <Text style={[styles.messageText, isOwn && styles.messageTextOwn]}>
            {item.text}
          </Text>
          <Text style={[styles.timestamp, isOwn && styles.timestampOwn]}>
            {item.timestamp?.toDate?.().toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            }) || ''}
          </Text>
        </View>
        {item.reactions && item.reactions.length > 0 && (
          <View style={styles.reactions}>
            {item.reactions.map((reaction, index) => (
              <Text key={index} style={styles.reactionEmoji}>
                {reaction.emoji}
              </Text>
            ))}
          </View>
        )}
        <TouchableOpacity
          style={styles.reactionBtn}
          onPress={() => {
            Alert.alert('Add Reaction', 'Choose an emoji', [
              { text: '😀', onPress: () => addReaction(item.id, '😀') },
              { text: '😂', onPress: () => addReaction(item.id, '😂') },
              { text: '❤️', onPress: () => addReaction(item.id, '❤️') },
              { text: '😮', onPress: () => addReaction(item.id, '😮') },
              { text: '👍', onPress: () => addReaction(item.id, '👍') },
              { text: 'Cancel', onPress: () => {} },
            ]);
          }}
        >
          <Text style={styles.reactionBtnText}>+</Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#25D366" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={90}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Start your conversation</Text>
        }
      />

      {showSuggestions && suggestions.length > 0 && (
        <View style={styles.suggestionsContainer}>
          <Text style={styles.suggestionsLabel}>Quick replies:</Text>
          <View style={styles.suggestionsList}>
            {suggestions.map((suggestion, index) => (
              <TouchableOpacity
                key={index}
                style={styles.suggestionBtn}
                onPress={() => sendMessage(suggestion)}
              >
                <Text style={styles.suggestionText} numberOfLines={1}>
                  {suggestion}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder={isAIChat ? "Ask WhatsApp AI..." : "Type a message..."}
          value={newMessage}
          onChangeText={(text) => {
            setNewMessage(text);
            if (isAIChat && text.length > 3) {
              generateSuggestions();
            } else {
              setShowSuggestions(false);
            }
          }}
          placeholderTextColor="#999"
          multiline
          onBlur={() => setShowSuggestions(false)}
        />
        {aiLoading ? (
          <View style={styles.loadingBtn}>
            <ActivityIndicator color="#25D366" size="small" />
          </View>
        ) : (
          <TouchableOpacity style={styles.sendBtn} onPress={() => sendMessage()}>
            <Text style={styles.sendBtnText}>📤</Text>
          </TouchableOpacity>
        )}
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messagesList: {
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  messageContainer: {
    flexDirection: 'row',
    marginVertical: 5,
    alignItems: 'flex-end',
  },
  messageOwn: {
    justifyContent: 'flex-end',
  },
  messageBubble: {
    maxWidth: '75%',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 15,
  },
  bubbleOwn: {
    backgroundColor: '#25D366',
    borderBottomRightRadius: 0,
  },
  bubbleOther: {
    backgroundColor: '#e5e5ea',
    borderBottomLeftRadius: 0,
  },
  bubbleAI: {
    backgroundColor: '#DCF8FF',
    borderBottomLeftRadius: 0,
  },
  messageText: {
    fontSize: 16,
    color: '#000',
  },
  messageTextOwn: {
    color: '#fff',
  },
  aiLabel: {
    fontSize: 12,
    marginBottom: 3,
    fontWeight: 'bold',
  },
  timestamp: {
    fontSize: 11,
    color: '#888',
    marginTop: 3,
  },
  timestampOwn: {
    color: '#e0e0e0',
  },
  reactions: {
    flexDirection: 'row',
    marginLeft: 10,
    marginTop: 3,
  },
  reactionEmoji: {
    fontSize: 16,
    marginHorizontal: 2,
  },
  reactionBtn: {
    marginLeft: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reactionBtnText: {
    fontSize: 12,
    color: '#999',
  },
  suggestionsContainer: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  suggestionsLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 8,
    fontWeight: '600',
  },
  suggestionsList: {
    flexDirection: 'row',
    gap: 8,
  },
  suggestionBtn: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 15,
    maxWidth: '45%',
  },
  suggestionText: {
    fontSize: 12,
    color: '#000',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    maxHeight: 100,
    marginRight: 10,
  },
  sendBtn: {
    backgroundColor: '#25D366',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingBtn: {
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnText: {
    fontSize: 20,
  },
  headerRight: {
    marginRight: 15,
  },
  headerAvatar: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#999',
    marginTop: 100,
  },
});

export default ChatDetailScreen;
