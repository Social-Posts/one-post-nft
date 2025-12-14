# Online Status Implementation

This document describes how online status tracking is implemented in the OnePost NFT application.

## Overview

Online status is tracked using **Supabase Realtime Presence**, which provides real-time updates when users come online or go offline. The implementation uses Supabase's presence channels to broadcast user activity across the application.

## Architecture

### Components

1. **ChatService.subscribeToOnlineStatus()** - Core method to subscribe to presence updates for a user
2. **ChatService.unsubscribeFromOnlineStatus()** - Cleanup method to stop tracking
3. **ChatService.isUserOnline()** - Check if a specific user is currently online
4. **useOnlineStatus Hook** - React hook for component integration

### Presence Heartbeat

- **Interval**: 30 seconds
- **Purpose**: Keep the presence channel alive and maintain connection
- **Auto-cleanup**: Heartbeat is automatically stopped when unsubscribing

## Usage

### In Chat Components

```typescript
import { useOnlineStatus } from '../hooks/useOnlineStatus';

function ChatUserCard({ userAddress }) {
  const { isOnline, isLoading } = useOnlineStatus(userAddress);

  return (
    <div>
      <span className={isOnline ? 'online' : 'offline'}>
        {isOnline ? '🟢 Online' : '🔴 Offline'}
      </span>
      {isLoading && <span>Checking status...</span>}
    </div>
  );
}
```

### Direct Service Usage

```typescript
import { ChatService } from '../services/chatService';

// Subscribe to presence updates with callback
await ChatService.subscribeToOnlineStatus('0x1234...', (isOnline) => {
  console.log(`User is ${isOnline ? 'online' : 'offline'}`);
});

// Check if a user is online (one-time check)
const isOnline = await ChatService.isUserOnline('0x1234...');

// Cleanup when done
await ChatService.unsubscribeFromOnlineStatus('0x1234...');
```

## Technical Details

### Presence Channel Name

Presence channels are named using the pattern:
```
user_presence:<user_address>
```

### Presence State

Each presence update includes:
- `user_address`: The wallet address (lowercase)
- `last_seen`: ISO timestamp of last activity
- `status`: Current status ('online', 'offline', 'away')

### Performance Considerations

- **Real-time**: Updates are instant across all connected clients
- **Scalable**: Presence channels are lightweight and scale well
- **Network**: 30-second heartbeat keeps connections alive without excessive bandwidth
- **Timeout**: If no heartbeat is received for ~60 seconds, user is marked offline

## Future Enhancements

- [ ] Implement 'away' status after 5 minutes of inactivity
- [ ] Add `last_seen` timestamp display (e.g., "Last seen 2 hours ago")
- [ ] Integrate with user profile pages to show online status badge
- [ ] Add sound notification when a chat partner comes online
