import { useAccount, useWalletClient } from "wagmi";
import { useCallback, useState } from "react";
import { showErrorToast, showSuccessToast } from "@/utils/toastUtils";
import {
  createPost,
  proposeSell,
  cancelSell,
  buyPost,
  getAllPosts,
  getUserPosts,
  getPostByTokenId,
  canUserPostToday,
  isPostForSale,
  getSellProposals,
  getAllPostsForSale,
  getPostPrice,
} from "@/services/contract";
import { storeOnIPFS, PostMetadata } from "@/services/ipfs";
import type { Post } from "@/context/AppContext";
import { NotificationService } from "@/services/notificationService";

export interface PostNFTState {
  isLoading: boolean;
  error?: string;
}

export const usePostNFT = () => {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const [state, setState] = useState<PostNFTState>({ isLoading: false });

  const setLoading = (isLoading: boolean) => {
    setState((prev) => ({ ...prev, isLoading }));
  };

  const setError = (error?: string) => {
    setState((prev) => ({ ...prev, error }));
  };

  // Mint a new post as NFT
  const mintPost = useCallback(
    async (
      content: string,
      imageDataUrl?: string,
      onSuccess?: () => void
    ): Promise<string | null> => {
      if (!address) {
        showErrorToast(
          "Wallet not connected",
          "Please connect your wallet first"
        );
        return null;
      }

      if (!walletClient) {
        showErrorToast(
          "Wallet client not ready",
          "Please try again in a moment."
        );
        return null;
      }

      try {
        setLoading(true);
        setError(undefined);

        // Prepare metadata for IPFS
        const metadata: PostMetadata = {
          content: content || (imageDataUrl ? "" : "Post content"), // Allow empty content if there's an image
          timestamp: Date.now(),
          author: address,
          version: "1.0",
          image: imageDataUrl, // Include image data if provided
        };

        // Store on IPFS
        const ipfsHash = await storeOnIPFS(metadata);

        // Mint NFT with IPFS hash (price = 0 for regular posts)
        const txHash = await createPost(walletClient, ipfsHash, 0);

        showSuccessToast(
          "Post minted successfully! 🎉",
          "Redirecting to home..."
        );

        // Create notification for successful post creation
        try {
          // Extract token ID from transaction hash or use a placeholder
          const tokenId = txHash.slice(-6); // Use last 6 chars as token ID placeholder
          await NotificationService.createPostCreatedNotification(
            address,
            tokenId
          );
        } catch (notificationError) {
          console.error("Error creating post notification:", notificationError);
        }

        // Call success callback to redirect to home
        if (onSuccess) {
          setTimeout(() => {
            onSuccess();
          }, 1500); // Small delay to show success message
        }

        return txHash;
      } catch (err: unknown) {
        console.error("Error in mintPost:", err);
        const errorMessage = (err as Error)?.message || "Failed to mint post";
        setError(errorMessage);
        showErrorToast("Failed to mint post", err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [address, walletClient]
  );

  // Propose a sell
  const proposePostSell = useCallback(
    async (tokenId: string, price: number): Promise<string | null> => {
      if (!address) {
        showErrorToast(
          "Wallet not connected",
          "Please connect your wallet first"
        );
        return null;
      }

      if (price <= 0) {
        showErrorToast("Invalid price", "Price must be greater than 0");
        return null;
      }

      try {
        setLoading(true);
        setError(undefined);

        if (!walletClient) {
          showErrorToast(
            "Wallet client not ready",
            "Please try again in a moment."
          );
          return null;
        }

        const txHash = await proposeSell(walletClient, tokenId, price);
        showSuccessToast("Sell proposal submitted! 💰");

        // Create notification for NFT listing
        try {
          await NotificationService.createNFTListedNotification(
            address,
            String(tokenId),
            String(price)
          );
        } catch (notificationError) {
          console.error(
            "Error creating listing notification:",
            notificationError
          );
        }

        return txHash;
      } catch (err: unknown) {
        const errorMessage =
          (err as Error)?.message || "Failed to propose sell";
        setError(errorMessage);
        showErrorToast("Failed to propose sell", err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [address, walletClient]
  );

  // Buy a post directly
  const buyPostDirect = useCallback(
    async (tokenId: string): Promise<string | null> => {
      if (!address) {
        showErrorToast(
          "Wallet not connected",
          "Please connect your wallet first"
        );
        return null;
      }

      try {
        setLoading(true);
        setError(undefined);

        if (!walletClient) {
          showErrorToast(
            "Wallet client not ready",
            "Please try again in a moment."
          );
          return null;
        }

        const txHash = await buyPost(walletClient, tokenId);
        return txHash;
      } catch (err: unknown) {
        const errorMessage = (err as Error)?.message || "Failed to buy post";
        setError(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [address, walletClient]
  );

  // Cancel a sell proposal
  const cancelSellProposalFunc = useCallback(
    async (proposalId: string): Promise<string | null> => {
      if (!address) {
        showErrorToast(
          "Wallet not connected",
          "Please connect your wallet first"
        );
        return null;
      }

      try {
        setLoading(true);
        setError(undefined);

        if (!walletClient) {
          showErrorToast(
            "Wallet client not ready",
            "Please try again in a moment."
          );
          return null;
        }

        const txHash = await cancelSell(walletClient, proposalId);
        showSuccessToast("Sell proposal cancelled");
        return txHash;
      } catch (err: unknown) {
        const errorMessage =
          (err as Error)?.message || "Failed to cancel sell proposal";
        setError(errorMessage);
        showErrorToast("Failed to cancel sell proposal", err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [address, walletClient]
  );

  // Fetch posts
  const fetchAllPosts = useCallback(
    async (offset: number = 0, limit: number = 20): Promise<Post[]> => {
      try {
        return await getAllPosts(offset, limit);
      } catch (err: unknown) {
        const errorMessage = (err as Error)?.message || "Failed to fetch posts";
        setError(errorMessage);
        toast.error(errorMessage);
        return [];
      }
    },
    []
  );

  const fetchUserPosts = useCallback(
    async (userAddress: string): Promise<Post[]> => {
      try {
        return await getUserPosts(userAddress as `0x${string}`);
      } catch (err: unknown) {
        const errorMessage =
          (err as Error)?.message || "Failed to fetch user posts";
        setError(errorMessage);
        toast.error(errorMessage);
        return [];
      }
    },
    []
  );

  const fetchPost = useCallback(
    async (tokenId: string): Promise<Post | null> => {
      try {
        return await getPostByTokenId(tokenId);
      } catch (err: unknown) {
        const errorMessage = (err as Error)?.message || "Failed to fetch post";
        setError(errorMessage);
        toast.error(errorMessage);
        return null;
      }
    },
    []
  );

  // Check functions
  const checkCanPostToday = useCallback(
    async (userAddress?: string): Promise<boolean> => {
      const addressToCheck = userAddress || address;
      if (!addressToCheck) return false;

      try {
        return await canUserPostToday(addressToCheck as `0x${string}`);
      } catch (err: unknown) {
        console.error("Failed to check if user can post today:", err);
        return false;
      }
    },
    [address]
  );

  const checkIsPostSwappable = useCallback(
    async (tokenId: string): Promise<boolean> => {
      try {
        return await isPostForSale(tokenId);
      } catch (err: unknown) {
        console.error("Failed to check if post is for sale:", err);
        return false;
      }
    },
    []
  );

  const fetchSwapProposals = useCallback(
    async (
      userAddress?: string
    ): Promise<
      Array<{
        id: string;
        tokenId: string;
        seller: `0x${string}`;
        isActive: boolean;
        price: number | string;
      }>
    > => {
      const addressToCheck = userAddress || address;
      if (!addressToCheck) return [];

      try {
        return (await getSellProposals(
          addressToCheck as `0x${string}`
        )) as Array<{
          id: string;
          tokenId: string;
          seller: `0x${string}`;
          isActive: boolean;
          price: number | string;
        }>;
      } catch (err: unknown) {
        const errorMessage =
          (err as Error)?.message || "Failed to fetch sell proposals";
        setError(errorMessage);
        toast.error(errorMessage);
        return [];
      }
    },
    [address]
  );

  return {
    ...state,
    mintPost,
    proposePostSell,
    buyPost: buyPostDirect,
    cancelSellProposal: cancelSellProposalFunc,
    fetchAllPosts,
    fetchUserPosts,
    fetchPost,
    checkCanPostToday,
    checkIsPostForSale: checkIsPostSwappable,
    fetchSellProposals: fetchSwapProposals,
    getAllPostsForSale,
    getPostPrice,
    isPostForSale,
  };
};
