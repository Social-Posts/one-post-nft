import { useEffect, useState } from 'react';
import { ChatService } from '../services/chatService';

/**
 * Hook to subscribe to online status for a user
 * Handles subscription/unsubscription lifecycle
 */
export function useOnlineStatus(userAddress: string | null) {
  const [isOnline, setIsOnline] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userAddress) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    // Subscribe to online status
    ChatService.subscribeToOnlineStatus(userAddress, (online) => {
      setIsOnline(online);
      setIsLoading(false);
    }).catch((error) => {
      console.error('Failed to subscribe to online status:', error);
      setIsLoading(false);
    });

    // Cleanup on unmount
    return () => {
      ChatService.unsubscribeFromOnlineStatus(userAddress).catch((error) => {
        console.error('Failed to unsubscribe from online status:', error);
      });
    };
  }, [userAddress]);

  return { isOnline, isLoading };
}
