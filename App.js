import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, firestore } from './config/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { ActivityIndicator, View } from 'react-native';

import LoginScreen from './screens/LoginScreen';
import ChatsListScreen from './screens/ChatsListScreen';
import ChatDetailScreen from './screens/ChatDetailScreen';
import ProfileScreen from './screens/ProfileScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const ChatsStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: true,
      headerStyle: { backgroundColor: '#f9f9f9' },
      headerTintColor: '#000',
      headerTitleStyle: { fontWeight: '600' },
      headerShadowVisible: false,
    }}
  >
    <Stack.Screen
      name="Chats"
      component={ChatsListScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="ChatDetail"
      component={ChatDetailScreen}
      options={{ title: 'Chat' }}
    />
  </Stack.Navigator>
);

const ProfileStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: '#f9f9f9' },
      headerTintColor: '#000',
      headerTitleStyle: { fontWeight: '600' },
      headerShadowVisible: false,
    }}
  >
    <Stack.Screen
      name="ProfileScreen"
      component={ProfileScreen}
      options={{ title: 'Account' }}
    />
  </Stack.Navigator>
);

const App = () => {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        // Create/update user document in Firestore
        const userRef = doc(firestore, 'users', authUser.uid);
        await setDoc(
          userRef,
          {
            email: authUser.email,
            displayName: authUser.displayName,
            userId: authUser.uid,
            createdAt: new Date(),
            isOnline: true,
            lastSeen: serverTimestamp(),
          },
          { merge: true }
        );

        // Create AI chat if not exists
        const aiChatId = [authUser.uid, 'ai-bot'].sort().join('_');
        const aiChatRef = doc(firestore, 'chats', aiChatId);
        await setDoc(
          aiChatRef,
          {
            participants: [authUser.uid, 'ai-bot'],
            participantName: 'WhatsApp AI',
            participantImage: '🤖',
            participantId: 'ai-bot',
            lastMessage: 'Hi! I am WhatsApp AI. Ask me anything!',
            lastMessageTime: serverTimestamp(),
            unreadCount: 0,
          },
          { merge: true }
        );
      }
      setUser(authUser);
      setInitializing(false);
    });

    return unsubscribe;
  }, []);

  if (initializing) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#25D366" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? (
        <Tab.Navigator
          screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: '#25D366',
            tabBarInactiveTintColor: '#999',
            tabBarLabelStyle: { fontSize: 12 },
            tabBarStyle: {
              borderTopWidth: 1,
              borderTopColor: '#f0f0f0',
            },
          }}
        >
          <Tab.Screen
            name="ChatsTab"
            component={ChatsStack}
            options={{
              title: 'Chats',
              tabBarLabel: 'Chats',
              tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>💬</Text>,
            }}
          />
          <Tab.Screen
            name="ProfileTab"
            component={ProfileStack}
            options={{
              title: 'Profile',
              tabBarLabel: 'Profile',
              tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>👤</Text>,
            }}
          />
        </Tab.Navigator>
      ) : (
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="Login" component={LoginScreen} />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
};

const Text = require('react-native').Text;

export default App;
