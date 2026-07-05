import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  ScrollView,
  Switch,
} from 'react-native';
import { signOut } from 'firebase/auth';
import { auth, firestore } from '../config/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

const ProfileScreen = ({ navigation }) => {
  const [userData, setUserData] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [notifications, setNotifications] = useState(true);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const userRef = doc(firestore, 'users', auth.currentUser?.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        setUserData(userSnap.data());
        setDisplayName(userSnap.data().displayName);
        setStatusMessage(userSnap.data().status || '');
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const updateProfile = async () => {
    try {
      const userRef = doc(firestore, 'users', auth.currentUser?.uid);
      await updateDoc(userRef, {
        displayName,
        status: statusMessage,
      });
      setUserData({ ...userData, displayName, status: statusMessage });
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated');
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', onPress: () => {} },
      {
        text: 'Logout',
        onPress: async () => {
          try {
            await signOut(auth);
          } catch (error) {
            Alert.alert('Error', error.message);
          }
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Image
          source={{
            uri: userData.profileImage || 'https://via.placeholder.com/100',
          }}
          style={styles.profileImage}
        />
        <Text style={styles.onlineStatus}>● Online</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Name</Text>
        {isEditing ? (
          <TextInput
            style={styles.input}
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="Enter your name"
          />
        ) : (
          <Text style={styles.value}>{userData.displayName}</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Email</Text>
        <Text style={styles.value}>{userData.email}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Status</Text>
        {isEditing ? (
          <TextInput
            style={[styles.input, styles.multiline]}
            value={statusMessage}
            onChangeText={setStatusMessage}
            placeholder="What's your status?"
            multiline
          />
        ) : (
          <Text style={styles.value}>{statusMessage || 'Hey there! I am using WhatsApp AI'}</Text>
        )}
      </View>

      <View style={styles.settingsSection}>
        <Text style={styles.sectionTitle}>Settings</Text>
        
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Notifications</Text>
          <Switch
            value={notifications}
            onValueChange={setNotifications}
            trackColor={{ false: '#767577', true: '#25D366' }}
            thumbColor={notifications ? '#fff' : '#f4f3f4'}
          />
        </View>

        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>AI Suggestions</Text>
          <Switch
            value={true}
            trackColor={{ false: '#767577', true: '#25D366' }}
            thumbColor="#fff"
            disabled
          />
        </View>
      </View>

      {isEditing ? (
        <View style={styles.buttonGroup}>
          <TouchableOpacity
            style={[styles.button, styles.saveBtn]}
            onPress={updateProfile}
          >
            <Text style={styles.buttonText}>Save Changes</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.cancelBtn]}
            onPress={() => setIsEditing(false)}
          >
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={[styles.button, styles.editBtn]}
          onPress={() => setIsEditing(true)}
        >
          <Text style={styles.buttonText}>Edit Profile</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={[styles.button, styles.logoutBtn]}
        onPress={handleLogout}
      >
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 30,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  onlineStatus: {
    color: '#25D366',
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  label: {
    fontSize: 12,
    color: '#999',
    fontWeight: '600',
    marginBottom: 5,
  },
  value: {
    fontSize: 16,
    color: '#000',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 16,
  },
  multiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  settingsSection: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 15,
    color: '#000',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingLabel: {
    fontSize: 14,
    color: '#000',
  },
  buttonGroup: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginVertical: 15,
    gap: 10,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 20,
    marginVertical: 10,
  },
  editBtn: {
    backgroundColor: '#25D366',
  },
  saveBtn: {
    flex: 1,
    backgroundColor: '#34C759',
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#999',
  },
  logoutBtn: {
    backgroundColor: '#FF3B30',
    marginTop: 20,
    marginBottom: 30,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ProfileScreen;
