import React, { useState, useEffect } from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  Text,
  StyleSheet,
  Image,
  TextInput,
  Alert,
  RefreshControl,
} from 'react-native';
import { collection, query, where, orderBy, onSnapshot, getDocs } from 'firebase/firestore';
import { firestore, auth } from '../config/firebase';

const ChatsListScreen = ({ navigation }) => {
  const [chats, setChats] = useState([]);
  const [filteredChats, setFilteredChats] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [users, setUsers] = useState([]);
  const [showUserList, setShowUserList] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadChats();
    loadUsers();
  }, []);

  const loadChats = () => {
    try {
      const q = query(
        collection(firestore, 'chats'),
        where('participants', 'array-contains', auth.currentUser?.uid),
        orderBy('lastMessageTime', 'desc')
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const chatList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setChats(chatList);
        setFilteredChats(chatList);
        setRefreshing(false);
      });

      return unsubscribe;
    } catch (error) {
      console.error('Error loading chats:', error);
      setRefreshing(false);
    }
  };

  const loadUsers = async () => {
    try {
      const usersSnapshot = await getDocs(collection(firestore, 'users'));
      const usersList = usersSnapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter((user) => user.id !== auth.currentUser?.uid);
      setUsers(usersList);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const handleSearch = (text) => {
    setSearchText(text);
    if (text === '') {
      setFilteredChats(chats);
    } else {
      const filtered = chats.filter((chat) =>
        chat.participantName?.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredChats(filtered);
    }
  };

  const startChat = async (user) => {
    try {
      const participants = [auth.currentUser?.uid, user.id].sort();
      const chatId = participants.join('_');

      navigation.navigate('ChatDetail', {
        chatId,
        participantName: user.displayName,
        participantImage: user.profileImage,
        participantId: user.id,
      });

      setShowUserList(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to start chat');
    }
  };

  const renderChatItem = ({ item }) => (
    <TouchableOpacity
      style={styles.chatItem}
      onPress={() =>
        navigation.navigate('ChatDetail', {
          chatId: item.id,
          participantName: item.participantName,
          participantImage: item.participantImage,
          participantId: item.participantId,
        })
      }
    >
      <Image
        source={{
          uri: item.participantImage || 'https://via.placeholder.com/50',
        }}
        style={styles.avatar}
      />
      <View style={styles.chatInfo}>
        <Text style={styles.chatName}>{item.participantName}</Text>
        <Text style={styles.lastMessage} numberOfLines={1}>
          {item.lastMessage}
        </Text>
      </View>
      <View style={styles.timeSection}>
        <Text style={styles.time}>
          {item.lastMessageTime?.toDate?.().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }) || ''}
        </Text>
        {item.unreadCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{item.unreadCount}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderUserItem = ({ item }) => (
    <TouchableOpacity
      style={styles.userItem}
      onPress={() => startChat(item)}
    >
      <Image
        source={{
          uri: item.profileImage || 'https://via.placeholder.com/50',
        }}
        style={styles.avatar}
      />
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.displayName}</Text>
        <Text style={styles.userStatus} numberOfLines={1}>{item.status}</Text>
      </View>
      <Text style={styles.startChatBtn}>→</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Chats</Text>
        <TouchableOpacity
          style={styles.newChatBtn}
          onPress={() => setShowUserList(!showUserList)}
        >
          <Text style={styles.newChatBtnText}>✎</Text>
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.searchInput}
        placeholder="Search or start new chat..."
        value={searchText}
        onChangeText={handleSearch}
        placeholderTextColor="#999"
      />

      {showUserList ? (
        <FlatList
          data={users}
          renderItem={renderUserItem}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No users available</Text>
          }
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadUsers} />}
        />
      ) : (
        <FlatList
          data={filteredChats}
          renderItem={renderChatItem}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No chats yet. Start a new conversation!</Text>
          }
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadChats} />}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#f9f9f9',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  newChatBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#25D366',
    justifyContent: 'center',
    alignItems: 'center',
  },
  newChatBtnText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  searchInput: {
    marginHorizontal: 15,
    marginVertical: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    fontSize: 14,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  chatInfo: {
    flex: 1,
  },
  chatName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
  },
  lastMessage: {
    fontSize: 13,
    color: '#666',
  },
  timeSection: {
    alignItems: 'flex-end',
    marginLeft: 10,
  },
  time: {
    fontSize: 12,
    color: '#999',
    marginBottom: 5,
  },
  badge: {
    backgroundColor: '#25D366',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  userInfo: {
    flex: 1,
    marginLeft: 15,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
  },
  userStatus: {
    fontSize: 13,
    color: '#999',
  },
  startChatBtn: {
    fontSize: 20,
    color: '#25D366',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
    color: '#999',
  },
});

export default ChatsListScreen;
