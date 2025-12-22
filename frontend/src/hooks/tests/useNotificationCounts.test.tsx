import React, { useEffect, useState } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock sonner toast
const toast = { error: vi.fn(), success: vi.fn() };
vi.mock('sonner', () => ({ toast }));

// Create mutable mocks for wagmi so tests can set different scenarios
const useAccountMock = vi.fn(() => ({ address: undefined }));
vi.mock('wagmi', () => ({
  useAccount: () => useAccountMock(),
}));

// Mocks for services
const getUnreadCountMock = vi.fn();
const subscribeToNotificationsMock = vi.fn();
vi.mock('@/services/notificationService', () => ({
  NotificationService: {
    getUnreadCount: getUnreadCountMock,
    subscribeToNotifications: subscribeToNotificationsMock,
  }
}));

const getTotalUnreadCountMock = vi.fn();
const getUserChatsMock = vi.fn();
const subscribeToMessagesMock = vi.fn();
vi.mock('@/services/chatService', () => ({
  ChatService: {
    getTotalUnreadCount: getTotalUnreadCountMock,
    getUserChats: getUserChatsMock,
    subscribeToMessages: subscribeToMessagesMock,
  }
}));

import { useNotificationCounts } from '../useNotificationCounts';

function TestComponent() {
  const { counts, loading, refreshCounts } = useNotificationCounts();
  const [refreshed, setRefreshed] = useState(false);

  useEffect(() => {
    // expose a way to call refreshCounts via state change (test-friendly)
    (async () => {
      if (!refreshed) return;
      refreshCounts();
    })();
  }, [refreshed, refreshCounts]);

  return (
    <div>
      <div data-testid="notifications">{counts.notifications}</div>
      <div data-testid="chats">{counts.chats}</div>
      <div data-testid="total">{counts.total}</div>
      <div data-testid="loading">{String(loading)}</div>
      <button data-testid="trigger-refresh" onClick={() => setRefreshed(true)}>refresh</button>
    </div>
  );
}

describe('useNotificationCounts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // default mocks
    useAccountMock.mockImplementation(() => ({ address: undefined }));
    getUnreadCountMock.mockResolvedValue(0);
    getTotalUnreadCountMock.mockResolvedValue(0);
    getUserChatsMock.mockResolvedValue([]);
    // default subscribe returns an object with unsubscribe
    subscribeToNotificationsMock.mockImplementation(() => ({ unsubscribe: vi.fn() }));
    subscribeToMessagesMock.mockImplementation(() => ({ unsubscribe: vi.fn() }));
  });

  it('returns zeros when no address connected', async () => {
    render(<TestComponent />);
    expect(screen.getByTestId('notifications').textContent).toBe('0');
    expect(screen.getByTestId('chats').textContent).toBe('0');
    expect(screen.getByTestId('total').textContent).toBe('0');
    expect(screen.getByTestId('loading').textContent).toBe('false');
  });

  it('loads counts for connected user', async () => {
    useAccountMock.mockImplementation(() => ({ address: '0xABC' }));
    getUnreadCountMock.mockResolvedValue(2);
    getTotalUnreadCountMock.mockResolvedValue(3);

    render(<TestComponent />);

    await waitFor(() => {
      expect(getUnreadCountMock).toHaveBeenCalledWith('0xABC');
      expect(getTotalUnreadCountMock).toHaveBeenCalledWith('0xABC');
      expect(screen.getByTestId('notifications').textContent).toBe('2');
      expect(screen.getByTestId('chats').textContent).toBe('3');
      expect(screen.getByTestId('total').textContent).toBe('5');
    });
  });

  it('updates counts when subscriptions fire', async () => {
    useAccountMock.mockImplementation(() => ({ address: '0xDEF' }));

    // capture callbacks passed to subscription mocks
    let notifCb: (() => void) | null = null;
    subscribeToNotificationsMock.mockImplementation((_addr: string, cb: () => void) => {
      notifCb = cb;
      return { unsubscribe: vi.fn() };
    });

    let msgSubs: Array<{ id: string }> = [{ id: 'c1' }];
    getUserChatsMock.mockResolvedValue(msgSubs as any);
    subscribeToMessagesMock.mockImplementation((_id: string, cb: () => void) => ({ unsubscribe: vi.fn(), trigger: cb } as any));

    // initial counts
    getUnreadCountMock.mockResolvedValue(1);
    getTotalUnreadCountMock.mockResolvedValue(1);

    render(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByTestId('total').textContent).toBe('2');
    });

    // change underlying counts for when subscriptions cause reload
    getUnreadCountMock.mockResolvedValue(5);
    getTotalUnreadCountMock.mockResolvedValue(6);

    // trigger subscription callback as if a new notification arrived
    if (notifCb) notifCb();

    await waitFor(() => {
      expect(screen.getByTestId('notifications').textContent).toBe('5');
      expect(screen.getByTestId('chats').textContent).toBe('6');
      expect(screen.getByTestId('total').textContent).toBe('11');
    });
  });
});
