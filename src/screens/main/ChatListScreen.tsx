import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import {
  Text,
  Surface,
  Avatar,
  useTheme,
  Divider,
  Badge,
  Searchbar,
} from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store/store';
import { fetchConversations } from '../../store/slices/chatSlice';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { MainStackParamList } from '../../navigation/MainNavigator';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import FastImage from 'react-native-fast-image';

type ChatListScreenNavigationProp = NavigationProp<MainStackParamList, 'MainTabs'>;

const ChatListScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [filteredConversations, setFilteredConversations] = useState<any[]>([]);

  const theme = useTheme();
  const navigation = useNavigation<ChatListScreenNavigationProp>();
  const dispatch = useDispatch<AppDispatch>();
  
  const { conversations, isLoading } = useSelector((state: RootState) => state.chat);
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = conversations.filter(conv => {
        const participantName = getParticipantName(conv);
        return participantName.toLowerCase().includes(searchQuery.toLowerCase());
      });
      setFilteredConversations(filtered);
    } else {
      setFilteredConversations(conversations);
    }
  }, [searchQuery, conversations]);

  const loadConversations = async () => {
    try {
      await dispatch(fetchConversations()).unwrap();
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadConversations();
    setRefreshing(false);
  };

  const getParticipantName = (conversation: any) => {
    // Find the other participant (not the current user)
    const otherParticipant = conversation.participants.find(
      (participantId: string) => participantId !== user?.id
    );
    // For now, return a placeholder. In a real app, you'd fetch user details
    return `User ${otherParticipant?.slice(-4) || 'Unknown'}`;
  };

  const getParticipantAvatar = (conversation: any) => {
    // Return a placeholder avatar. In a real app, you'd fetch user avatar
    return null;
  };

  const formatLastMessageTime = (timestamp: string) => {
    const now = new Date();
    const messageTime = new Date(timestamp);
    const diffInHours = (now.getTime() - messageTime.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 168) { // 7 days
      return `${Math.floor(diffInHours / 24)}d ago`;
    } else {
      return messageTime.toLocaleDateString();
    }
  };

  const handleConversationPress = (conversation: any) => {
    const participantName = getParticipantName(conversation);
    navigation.navigate('Chat', {
      conversationId: conversation.id,
      participantName,
    });
  };

  const renderConversationItem = ({ item: conversation }: { item: any }) => {
    const participantName = getParticipantName(conversation);
    const lastMessage = conversation.lastMessage;
    const unreadCount = conversation.unreadCount;

    return (
      <TouchableOpacity
        style={styles.conversationItem}
        onPress={() => handleConversationPress(conversation)}
      >
        <View style={styles.avatarContainer}>
          {getParticipantAvatar(conversation) ? (
            <FastImage
              source={{ uri: getParticipantAvatar(conversation) }}
              style={styles.avatar}
            />
          ) : (
            <Avatar.Text
              size={50}
              label={participantName.charAt(0).toUpperCase()}
              style={styles.avatar}
            />
          )}
          {unreadCount > 0 && (
            <Badge
              size={20}
              style={[styles.unreadBadge, { backgroundColor: theme.colors.primary }]}
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </View>

        <View style={styles.conversationContent}>
          <View style={styles.conversationHeader}>
            <Text variant="titleMedium" style={styles.participantName}>
              {participantName}
            </Text>
            <Text variant="bodySmall" style={styles.lastMessageTime}>
              {lastMessage ? formatLastMessageTime(lastMessage.timestamp) : ''}
            </Text>
          </View>

          <View style={styles.lastMessageContainer}>
            {lastMessage ? (
              <Text
                variant="bodyMedium"
                numberOfLines={1}
                style={[
                  styles.lastMessageText,
                  unreadCount > 0 && { fontWeight: '600' }
                ]}
              >
                {lastMessage.text}
              </Text>
            ) : (
              <Text variant="bodyMedium" style={styles.noMessagesText}>
                No messages yet
              </Text>
            )}
          </View>

          {conversation.productId && (
            <View style={styles.productInfo}>
              <Icon name="tag" size={16} color={theme.colors.textSecondary} />
              <Text variant="bodySmall" style={styles.productText}>
                Product discussion
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyStateContainer}>
      <Icon name="chat-outline" size={64} color={theme.colors.textSecondary} />
      <Text variant="titleMedium" style={styles.emptyStateTitle}>
        No conversations yet
      </Text>
      <Text variant="bodyMedium" style={styles.emptyStateSubtitle}>
        Start chatting with sellers or buyers about products
      </Text>
    </View>
  );

  if (isLoading && conversations.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <Surface style={styles.header} elevation={1}>
        <Text variant="headlineSmall" style={styles.headerTitle}>
          Messages
        </Text>
        <Text variant="bodyMedium" style={styles.headerSubtitle}>
          {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
        </Text>
      </Surface>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search conversations..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          iconColor={theme.colors.primary}
        />
      </View>

      {/* Conversations List */}
      <FlatList
        data={filteredConversations}
        renderItem={renderConversationItem}
        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={() => <Divider />}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.conversationsList}
        ListEmptyComponent={renderEmptyState}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: 'white',
    paddingVertical: 20,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  headerTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    color: '#666',
  },
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  searchBar: {
    backgroundColor: 'white',
  },
  conversationsList: {
    flexGrow: 1,
  },
  conversationItem: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: 'white',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    borderRadius: 25,
  },
  unreadBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
  },
  conversationContent: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  participantName: {
    fontWeight: '600',
  },
  lastMessageTime: {
    color: '#666',
    fontSize: 12,
  },
  lastMessageContainer: {
    marginBottom: 4,
  },
  lastMessageText: {
    color: '#333',
  },
  noMessagesText: {
    color: '#999',
    fontStyle: 'italic',
  },
  productInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  productText: {
    marginLeft: 4,
    color: '#666',
    fontSize: 12,
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
});

export default ChatListScreen;
