import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import AiButton from '../AiTechnician/Icon';
import api from '../../api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ChatItem = ({ name, text, time, date, unreadCount, image, number, chatId, isRecieved }) => {
  const navigation = useNavigation();
  return (
    <TouchableOpacity
      style={styles.chatItem}
      onPress={() => navigation.navigate('chatScreen', { name, image, number, text, time, isRecieved, chatId })}>
      <Image source={{ uri: image }} style={styles.avatar} />
      <View style={styles.chatContent}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.message}>{text}</Text>
      </View>
      <View style={styles.rightContent}>
        <Text style={styles.time}>{date ? `${time} ${date}` : time}</Text>
        {unreadCount > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadText}>{unreadCount}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const ChatList = () => {
  const [chats, setChats] = useState([]);

  useEffect(() => {
    loadChats();
  }, []);

  const loadChats = async () => {
    try {
      const userStr = await AsyncStorage.getItem('user');
      const userData = userStr ? JSON.parse(userStr) : null;

      const res = await api.get('/chats');

      const mapped = res.data.map(chat => {
        const other = chat.participants.find(p => p._id !== userData?._id) || chat.participants[0];
        const lastMsg = chat.lastMessage;

        return {
          id: chat._id,
          chatId: chat._id,
          name: `${other.firstName} ${other.lastName}`,
          image: other.profilePicture || `https://i.pravatar.cc/50?u=${other._id}`,
          number: other.phoneNumber || '',
          text: lastMsg?.content || 'No messages yet',
          time: lastMsg
            ? new Date(lastMsg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : '',
          date: lastMsg
            ? new Date(lastMsg.createdAt).toLocaleDateString([], { day: '2-digit', month: '2-digit' })
            : '',
          unreadCount: 0,
          isRecieved: lastMsg?.sender !== userData?._id,
        };
      });

      setChats(mapped);
    } catch (error) {
      console.error('Failed to load chats:', error);
    }
  };

  return (
    <View style={styles.container}>
      {chats.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="chatbubble-ellipses-outline" size={80} color="#007a3f" opacity={0.3} />
          <Text style={styles.emptyTitle}>No chats yet</Text>
          <Text style={styles.emptySubtext}>
            Your conversations will appear here once you're connected with a client or admin.
          </Text>
        </View>
      ) : (
        <ScrollView style={styles.chatList}>
          {chats.map(chat => (
            <ChatItem key={chat.id} {...chat} />
          ))}
        </ScrollView>
      )}
      <AiButton />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  chatList: {
    flex: 1,
  },
  chatItem: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
    backgroundColor: '#f0f0f0',
  },
  chatContent: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    color: '#666',
  },
  rightContent: {
    alignItems: 'flex-end',
  },
  time: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  unreadBadge: {
    backgroundColor: '#007a3f',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    marginTop: 150,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#007a3f',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default ChatList;