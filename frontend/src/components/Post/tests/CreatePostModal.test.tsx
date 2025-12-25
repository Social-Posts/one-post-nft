import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import CreatePostModal from "../CreatePostModal";

// Mock sonner toast
vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

import { toast } from "sonner";

// Mock lucide-react (to avoid icon rendering issues in tests)
vi.mock("lucide-react", () => ({
  Smile: () => <div data-testid="smile-icon" />,
  Send: () => <div data-testid="send-icon" />,
  Camera: () => <div data-testid="camera-icon" />,
  Image: () => <div data-testid="image-icon" />,
  SparklesIcon: () => <div data-testid="sparkles-icon" />,
  Wallet: () => <div data-testid="wallet-icon" />,
}));

// Mock hooks
const useAppContextMock = vi.fn();
vi.mock("@/context/AppContext", () => ({
  useAppContext: () => useAppContextMock(),
}));

const useCameraMock = vi.fn();
vi.mock("@/hooks/useCamera", () => ({
  useCamera: () => useCameraMock(),
}));

const usePostNFTMock = vi.fn();
vi.mock("@/hooks/usePostNFT", () => ({
  usePostNFT: () => usePostNFTMock(),
}));

const useAccountMock = vi.fn();
vi.mock("wagmi", () => ({
  useAccount: () => useAccountMock(),
}));

// Mock UI components from shadcn (simplified)
vi.mock("@/components/ui/dialog", () => ({
  Dialog: ({ children, open }: any) => (open ? <div>{children}</div> : null),
  DialogContent: ({ children }: any) => <div>{children}</div>,
  DialogHeader: ({ children }: any) => <div>{children}</div>,
  DialogTitle: ({ children }: any) => <div>{children}</div>,
  DialogDescription: ({ children }: any) => <div>{children}</div>,
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick, disabled, className }: any) => (
    <button onClick={onClick} disabled={disabled} className={className}>
      {children}
    </button>
  ),
}));

vi.mock("@/components/ui/textarea", () => ({
  Textarea: React.forwardRef(
    ({ value, onChange, placeholder, className, maxLength }: any, ref: any) => (
      <textarea
        ref={ref}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={className}
        maxLength={maxLength}
      />
    )
  ),
}));

vi.mock("@/components/ui/badge", () => ({
  Badge: ({ children, variant, className }: any) => (
    <span className={className} data-variant={variant}>
      {children}
    </span>
  ),
}));

vi.mock("@/components/ui/tabs", () => ({
  Tabs: ({ children, value }: any) => <div>{children}</div>,
  TabsList: ({ children }: any) => <div>{children}</div>,
  TabsTrigger: ({ children, value, disabled }: any) => (
    <button disabled={disabled}>{children}</button>
  ),
  TabsContent: ({ children, value }: any) => <div>{children}</div>,
}));

vi.mock("@/components/ui/card", () => ({
  Card: ({ children }: any) => <div>{children}</div>,
}));

describe("CreatePostModal Validation", () => {
  const onClose = vi.fn();
  const onPostSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    useAppContextMock.mockReturnValue({
      createPost: vi.fn(),
      state: { isLoading: false },
    });

    useCameraMock.mockReturnValue({
      videoRef: { current: null },
      isActive: false,
      startCamera: vi.fn(),
      stopCamera: vi.fn(),
      capturePhoto: vi.fn(),
      isSupported: true,
    });

    usePostNFTMock.mockReturnValue({
      mintPost: vi.fn(),
      isLoading: false,
    });

    useAccountMock.mockReturnValue({
      address: "0x123",
    });
  });

  it("shows error when submitting empty content", async () => {
    render(<CreatePostModal isOpen={true} onClose={onClose} />);

    const submitButton = screen.getByText("Post & Mint NFT");
    fireEvent.click(submitButton);

    expect(toast.error).toHaveBeenCalledWith(
      "Please add some content or an image to your post"
    );
    expect(
      screen.getByText("Please add some content or an image to your post")
    ).toBeDefined();
  });

  it("shows error when content is too short (less than 3 chars)", async () => {
    render(<CreatePostModal isOpen={true} onClose={onClose} />);

    const textarea = screen.getByPlaceholderText(/What's on your mind today/i);
    fireEvent.change(textarea, { target: { value: "hi" } });

    const submitButton = screen.getByText("Post & Mint NFT");
    fireEvent.click(submitButton);

    expect(toast.error).toHaveBeenCalledWith(
      "Content must be at least 3 characters long"
    );
    expect(
      screen.getByText("Content must be at least 3 characters long")
    ).toBeDefined();
  });

  it("clears error when user starts typing", async () => {
    render(<CreatePostModal isOpen={true} onClose={onClose} />);

    const submitButton = screen.getByText("Post & Mint NFT");
    fireEvent.click(submitButton);

    expect(
      screen.getByText("Please add some content or an image to your post")
    ).toBeDefined();

    const textarea = screen.getByPlaceholderText(/What's on your mind today/i);
    fireEvent.change(textarea, { target: { value: "Valid content" } });

    expect(
      screen.queryByText("Please add some content or an image to your post")
    ).toBeNull();
  });

  it("shows character limit warning when approaching limit", async () => {
    render(<CreatePostModal isOpen={true} onClose={onClose} />);

    const textarea = screen.getByPlaceholderText(/What's on your mind today/i);
    const longContent = "a".repeat(270);
    fireEvent.change(textarea, { target: { value: longContent } });

    const charBadge = screen.getByText(/10 chars/i);
    expect(charBadge.className).toContain("text-orange-500");
  });

  it("shows limit reached message at 280 characters", async () => {
    render(<CreatePostModal isOpen={true} onClose={onClose} />);

    const textarea = screen.getByPlaceholderText(/What's on your mind today/i);
    const limitContent = "a".repeat(280);
    fireEvent.change(textarea, { target: { value: limitContent } });

    expect(screen.getByText(/0 chars \(Limit reached\)/i)).toBeDefined();
  });
});
