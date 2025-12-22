import { useState, useEffect, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { NotificationService } from '@/services/notificationService';
import { ChatService } from '@/services/chatService';

export interface NotificationCounts {
  notifications: number;
  chats: number;
  total: number;
}

export const useNotificationCounts = () => {
  const { address } = useAccount();
  const [counts, setCounts] = useState<NotificationCounts>({
    notifications: 0,
    chats: 0,
    total: 0
  });
  const [loading, setLoading] = useState(false);

  // Load counts on mount and address change
  useEffect(() => {
    (async () => {
      if (!address) {
        setCounts({ notifications: 0, chats: 0, total: 0 });
        return;
      }

      try {
        setLoading(true);
        const [notificationCount, chatCount] = await Promise.all([
          NotificationService.getUnreadCount(address),
          ChatService.getTotalUnreadCount(address)
        ]);

        setCounts({
          notifications: notificationCount,
          chats: chatCount,
          total: notificationCount + chatCount
        });
      } catch (error) {
        console.error('Error loading notification counts:', error);
        setCounts({ notifications: 0, chats: 0, total: 0 });
      } finally {
        setLoading(false);
      }
    })();
  }, [address]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!address) return;

    // Subscribe to new notifications
    const notificationSubscription = NotificationService.subscribeToNotifications(
      address,
      async () => {
        // Reload counts when new notification arrives
        try {
          const notificationCount = await NotificationService.getUnreadCount(address);
          const chatCount = await ChatService.getTotalUnreadCount(address);
          setCounts({ notifications: notificationCount, chats: chatCount, total: notificationCount + chatCount });
        } catch (error) {
          console.error('Error reloading counts on notification:', error);
        }
      }
    );

    // Subscribe to new messages (for chat count)
    // We'll subscribe to all chats the user is part of
    const setupChatSubscriptions = async () => {
      try {
        const userChats = await ChatService.getUserChats(address);

        // Subscribe to each chat for new messages
        const chatSubscriptions = userChats.map((chat) =>
          ChatService.subscribeToMessages(chat.id, async () => {
            try {
              const notificationCount = await NotificationService.getUnreadCount(address);
              const chatCount = await ChatService.getTotalUnreadCount(address);
              setCounts({ notifications: notificationCount, chats: chatCount, total: notificationCount + chatCount });
            } catch (error) {
              console.error('Error reloading counts on message:', error);
            }
          })
        );

        return chatSubscriptions;
      } catch (error) {
        console.error('Error setting up chat subscriptions:', error);
        return [];
      }
    };

    type SubscriptionLike = { unsubscribe: () => void };
    let chatSubscriptions: SubscriptionLike[] = [];
    setupChatSubscriptions().then((subs) => {
      chatSubscriptions = subs;
    });

    return () => {
      notificationSubscription.unsubscribe();
      chatSubscriptions.forEach((sub) => sub.unsubscribe());
    };
  }, [address]);

  // Refresh counts manually
  const refreshCounts = () => {
    // loadCounts();
  };

  // Decrement notification count (when notification is read)
  const decrementNotifications = (amount = 1) => {
    setCounts(prev => ({
      ...prev,
      notifications: Math.max(0, prev.notifications - amount),
      total: Math.max(0, prev.total - amount)
    }));
  };

  // Decrement chat count (when messages are read)
  const decrementChats = (amount = 1) => {
    setCounts(prev => ({
      ...prev,
      chats: Math.max(0, prev.chats - amount),
      total: Math.max(0, prev.total - amount)
    }));
  };

  // Reset all counts
  const resetCounts = () => {
    setCounts({ notifications: 0, chats: 0, total: 0 });
  };

  return {
    counts,
    loading,
    refreshCounts,
    decrementNotifications,
    decrementChats,
    resetCounts
  };
};
