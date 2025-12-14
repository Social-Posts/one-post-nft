import React, { useEffect, useState } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";

// Mock sonner toast
const toast = { error: vi.fn(), success: vi.fn() };
vi.mock("sonner", () => ({ toast }));

// Mock wagmi hooks
vi.mock("wagmi", () => ({
  useAccount: () => ({ address: undefined }),
  useWalletClient: () => ({ data: undefined }),
}));

// Mock services so hook doesn't call real network
vi.mock("@/services/ipfs", () => ({
  storeOnIPFS: vi.fn().mockResolvedValue("QmFakeHash"),
}));

vi.mock("@/services/contract", () => ({
  createPost: vi.fn().mockResolvedValue("0xTxHash"),
}));

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
  });

  it("shows toast error when wallet not connected and returns null", async () => {
    render(<TestComponent />);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Please connect your wallet first");
    });

    expect(screen.getByTestId("result").textContent).toBe("null");
  });
});
