import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  Alert,
} from 'react-native';
import {
  Text,
  Surface,
  TextInput,
  IconButton,
  useTheme,
  Avatar,
  Divider,
} from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store/store';
import { fetchMessages, sendMessage, markAsRead } from '../../store/slices/chatSlice';
import { NavigationProp, useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { MainStackParamList } from '../../navigation/MainNavigator';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import FastImage from 'react-native-fast-image';

type ChatScreenNavigationProp = NavigationProp<MainStackParamList, 'Chat'>;
type ChatScreenRouteProp = RouteProp<MainStackParamList, 'Chat'>;

const ChatScreen: React.FC = () => {
  const [messageText, setMessageText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const theme = useTheme();
  const navigation = useNavigation<ChatScreenNavigationProp>();
  const route = useRoute<ChatScreenRouteProp>();
  const dispatch = useDispatch<AppDispatch>();
  
  const { conversationId, participantName } = route.params;
  const { messages, currentConversation, isLoading } = useSelector((state: RootState) => state.chat);
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (conversationId) {
      loadMessages();
      markConversationAsRead();
    }
  }, [conversationId]);

  const loadMessages = async () => {
    try {
      await dispatch(fetchMessages(conversationId)).unwrap();
    } catch (error) {
      console.error('Error loading messages:', error);
      Alert.alert('Error', 'Failed to load messages');
    }
  };

  const markConversationAsRead = async () => {
    try {
      await dispatch(markAsRead(conversationId)).unwrap();
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !user) return;

    setIsSending(true);
    try {
      await dispatch(sendMessage({
        text: messageText.trim(),
        receiverId: getReceiverId(),
        conversationId,
      })).unwrap();
      
      setMessageText('');
      // Scroll to bottom after sending
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      Alert.alert('Error', 'Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  const getReceiverId = (): string => {
    if (!currentConversation) return '';
    return currentConversation.participants.find(id => id !== user?.id) || '';
  };

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    }
  };

  const renderMessage = ({ item: message }: { item: any }) => {
    const isOwnMessage = message.senderId === user?.id;
    const showAvatar = !isOwnMessage;

    return (
      <View style={[
        styles.messageContainer,
        isOwnMessage ? styles.ownMessage : styles.otherMessage
      ]}>
        {showAvatar && (
          <Avatar.Text
            size={32}
            label={participantName.charAt(0).toUpperCase()}
            style={styles.messageAvatar}
          />
        )}
        
        <View style={[
          styles.messageBubble,
          isOwnMessage ? styles.ownBubble : styles.otherBubble
        ]}>
          <Text style={[
            styles.messageText,
            isOwnMessage ? styles.ownMessageText : styles.otherMessageText
          ]}>
            {message.text}
          </Text>
          
          <View style={[
            styles.messageMeta,
            isOwnMessage ? styles.ownMessageMeta : styles.otherMessageMeta
          ]}>
            <Text style={[
              styles.messageTime,
              isOwnMessage ? styles.ownMessageTime : styles.otherMessageTime
            ]}>
              {formatMessageTime(message.timestamp)}
            </Text>
            
            {isOwnMessage && (
              <Icon
                name={message.isRead ? 'check-all' : 'check'}
                size={16}
                color={message.isRead ? theme.colors.primary : theme.colors.textSecondary}
                style={styles.readIndicator}
              />
            )}
          </View>
        </View>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyStateContainer}>
      <Icon name="chat-outline" size={64} color={theme.colors.textSecondary} />
      <Text variant="titleMedium" style={styles.emptyStateTitle}>
        Start the conversation
      </Text>
      <Text variant="bodyMedium" style={styles.emptyStateSubtitle}>
        Send a message to {participantName} to begin chatting
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <Surface style={styles.header} elevation={2}>
        <View style={styles.headerContent}>
          <IconButton
            icon="arrow-left"
            size={24}
            onPress={() => navigation.goBack()}
          />
          <View style={styles.headerInfo}>
            <Text variant="titleMedium" style={styles.headerTitle}>
              {participantName}
            </Text>
            <Text variant="bodySmall" style={styles.headerSubtitle}>
              {messages.length} message{messages.length !== 1 ? 's' : ''}
            </Text>
          </View>
          <IconButton
            icon="dots-vertical"
            size={24}
            onPress={() => Alert.alert('Coming Soon', 'More options will be available soon')}
          />
        </View>
      </Surface>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
      />

      {/* Message Input */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inputContainer}
      >
        <Surface style={styles.inputSurface} elevation={2}>
          <TextInput
            mode="outlined"
            placeholder="Type a message..."
            value={messageText}
            onChangeText={setMessageText}
            multiline
            maxLength={500}
            style={styles.textInput}
            outlineStyle={styles.inputOutline}
            right={
              <TextInput.Icon
                icon="send"
                onPress={handleSendMessage}
                disabled={!messageText.trim() || isSending}
                color={messageText.trim() ? theme.colors.primary : theme.colors.textSecondary}
              />
            }
          />
        </Surface>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: 'white',
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  headerInfo: {
    flex: 1,
    marginLeft: 8,
  },
  headerTitle: {
    fontWeight: '600',
  },
  headerSubtitle: {
    color: '#666',
    fontSize: 12,
  },
  messagesList: {
    flexGrow: 1,
    padding: 16,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-end',
  },
  ownMessage: {
    justifyContent: 'flex-end',
  },
  otherMessage: {
    justifyContent: 'flex-start',
  },
  messageAvatar: {
    marginRight: 8,
    marginBottom: 4,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 18,
  },
  ownBubble: {
    backgroundColor: '#2196F3',
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    backgroundColor: '#E0E0E0',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  ownMessageText: {
    color: 'white',
  },
  otherMessageText: {
    color: '#333',
  },
  messageMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  ownMessageMeta: {
    justifyContent: 'flex-end',
  },
  otherMessageMeta: {
    justifyContent: 'flex-start',
  },
  messageTime: {
    fontSize: 12,
    marginRight: 4,
  },
  ownMessageTime: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  otherMessageTime: {
    color: '#666',
  },
  readIndicator: {
    marginLeft: 4,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 64,
  },
  emptyStateTitle: {
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    textAlign: 'center',
    color: '#666',
  },
  inputContainer: {
    backgroundColor: 'white',
  },
  inputSurface: {
    margin: 16,
    borderRadius: 24,
  },
  textInput: {
    backgroundColor: 'transparent',
  },
  inputOutline: {
    borderRadius: 24,
  },
});

export default ChatScreen;
