import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, firestore } from '../config/firebase';
import { doc, setDoc } from 'firebase/firestore';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [displayName, setDisplayName] = useState('');

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        if (!displayName) {
          Alert.alert('Error', 'Please enter your name');
          setLoading(false);
          return;
        }
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await userCredential.user.updateProfile({
          displayName: displayName,
        });
        
        // Create user document in Firestore
        await setDoc(doc(firestore, 'users', userCredential.user.uid), {
          email: email,
          displayName: displayName,
          userId: userCredential.user.uid,
          profileImage: 'https://via.placeholder.com/100',
          status: 'Hey there! I am using WhatsApp AI',
          lastSeen: new Date(),
          isOnline: true,
        });
        
        Alert.alert('Success', 'Account created!');
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.logo}>💬</Text>
          <Text style={styles.title}>WhatsApp AI</Text>
          <Text style={styles.subtitle}>{isSignUp ? 'Create Your Account' : 'Welcome Back'}</Text>
        </View>

        <View style={styles.form}>
          {isSignUp && (
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              value={displayName}
              onChangeText={setDisplayName}
              placeholderTextColor="#999"
            />
          )}
          <TextInput
            style={styles.input}
            placeholder="Email Address"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor="#999"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholderTextColor="#999"
          />

          <TouchableOpacity
            style={styles.button}
            onPress={handleAuth}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Loading...' : isSignUp ? 'Sign Up' : 'Login'}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => {
          setEmail('');
          setPassword('');
          setDisplayName('');
          setIsSignUp(!isSignUp);
        }}>
          <Text style={styles.toggleText}>
            {isSignUp ? 'Already have an account? Login' : "Don't have an account? Sign Up"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    marginBottom: 40,
    alignItems: 'center',
  },
  logo: {
    fontSize: 60,
    marginBottom: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#000',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  form: {
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  button: {
    backgroundColor: '#25D366',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  toggleText: {
    textAlign: 'center',
    color: '#25D366',
    fontSize: 14,
    marginTop: 20,
  },
});

export default LoginScreen;
