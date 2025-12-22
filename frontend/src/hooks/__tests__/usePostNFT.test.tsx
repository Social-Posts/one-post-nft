import React, { useEffect, useState } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";

// Mock sonner toast
const toast = { error: vi.fn(), success: vi.fn() };
vi.mock("sonner", () => ({ toast }));

// Create mutable mocks for wagmi so tests can set different scenarios
const useAccountMock = vi.fn(() => ({ address: undefined }));
const useWalletClientMock = vi.fn(() => ({ data: undefined }));
vi.mock("wagmi", () => ({
  useAccount: () => useAccountMock(),
  useWalletClient: () => useWalletClientMock(),
}));

// Mock services so hook doesn't call real network
const storeOnIPFSMock = vi.fn().mockResolvedValue("QmFakeHash");
vi.mock("@/services/ipfs", () => ({
  storeOnIPFS: storeOnIPFSMock,
}));

const createPostMock = vi.fn().mockResolvedValue("0xabcdef123456");
vi.mock("@/services/contract", () => ({
  createPost: createPostMock,
}));

// Mock Notification service
const createPostCreatedMock = vi.fn().mockResolvedValue(undefined);
vi.mock("@/services/notificationService", () => ({
  NotificationService: {
    createPostCreatedNotification: createPostCreatedMock,
    createNFTListedNotification: vi.fn(),
  },
}));

import type { WalletClient } from 'wagmi';
import { usePostNFT } from "../usePostNFT";

function TestComponent() {
  const { mintPost } = usePostNFT();
  const [result, setResult] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    (async () => {
      const r = await mintPost("hello world");
      setResult(r);
    })();
  }, [mintPost]);

  return <div data-testid="result">{String(result)}</div>;
}

describe("usePostNFT", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // reset default wagmi behavior
    useAccountMock.mockImplementation(() => ({ address: undefined }));
    useWalletClientMock.mockImplementation(() => ({ data: undefined }));
  });

  it("shows toast error when wallet not connected and returns null", async () => {
    render(<TestComponent />);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Please connect your wallet first");
    });

    expect(screen.getByTestId("result").textContent).toBe("null");
  });

  it("mints post successfully when wallet connected and calls NotificationService", async () => {
    // Arrange: mock connected wallet and walletClient
    useAccountMock.mockImplementation(() => ({ address: '0x1111111111111111111111111111111111111111' }));
    const fakeWalletClient = { sign: vi.fn() } as unknown as WalletClient;
    useWalletClientMock.mockImplementation(() => ({ data: fakeWalletClient }));

    render(<TestComponent />);

    // Wait for mintPost to finish and check expectations
    await waitFor(() => {
      // toast.success should be called
      expect(toast.success).toHaveBeenCalledWith("Post minted successfully! 🎉 Redirecting to home...");
      // createPost should be called with wallet client and the IPFS hash
      expect(createPostMock).toHaveBeenCalledWith(fakeWalletClient, 'QmFakeHash', 0);
      // Notification should be called with address and last 6 chars of tx hash
      expect(createPostCreatedMock).toHaveBeenCalledWith('0x1111111111111111111111111111111111111111', '123456');
      // The hook returns the tx hash
      expect(screen.getByTestId('result').textContent).toBe('0xabcdef123456');
    });
  });
});
