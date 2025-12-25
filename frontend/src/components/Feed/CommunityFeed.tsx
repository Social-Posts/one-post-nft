import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, Loader2, Heart, Share2 } from "lucide-react";
import {
  showErrorToast,
  showSuccessToast,
  showLoadingToast,
  dismissToast,
} from "@/utils/toastUtils";
import { useAccount, useWalletClient } from "wagmi";
import { cancelSell, buyPost, mintMockTokens } from "@/services/contract";
import PostCard from "@/components/Feed/PostCard";
import SellModal from "@/components/Modals/SellModal";
import type { Post } from "@/context/AppContext";
import PostSample from "@/pages/PostSample";
import { LikesService } from "@/services/chatService";
import deployedContracts from "../../../contracts/deployedContracts";

interface CommunityFeedProps {
  isLoading: boolean;
  posts: Post[];
  onRefresh: () => void;
  onNavigate?: (tab: string) => void;
  hasNewPosts?: boolean;
  onCheckNewPosts?: () => void;
}

const MOCK_BASE_CONTRACT_ADDRESS = deployedContracts.base.MockBASE
  .address as `0x${string}`;

const CommunityFeed: React.FC<CommunityFeedProps> = ({
  isLoading,
  posts,
  onRefresh,
  onNavigate,
  hasNewPosts,
  onCheckNewPosts,
}) => {
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({});
  const [likingPost, setLikingPost] = useState<string | null>(null);
  const [sellModalOpen, setSellModalOpen] = useState(false);
  const [selectedPostForSell, setSelectedPostForSell] = useState<Post | null>(
    null
  );
  const { address, isConnected } = useAccount(); // For Base transactions
  const { data: walletClient } = useWalletClient();

  // Load initial like data
  useEffect(() => {
    const loadLikeData = async () => {
      if (!address || !posts.length) return;

      try {
        const likePromises = posts.map(async (post) => {
          const [isLiked, count] = await Promise.all([
            LikesService.hasUserLiked(address, "post", post.tokenId),
            LikesService.getLikeCount("post", post.tokenId),
          ]);
          return { tokenId: post.tokenId, isLiked, count };
        });

        const likeData = await Promise.all(likePromises);

        const newLikedPosts = new Set<string>();
        const newLikeCounts: { [key: string]: number } = {};

        likeData.forEach(({ tokenId, isLiked, count }) => {
          if (isLiked) newLikedPosts.add(tokenId);
          newLikeCounts[tokenId] = count;
        });

        setLikedPosts(newLikedPosts);
        setLikeCounts(newLikeCounts);
      } catch (error) {
        console.error("Error loading like data:", error);
      }
    };

    loadLikeData();
  }, [address, posts]);

  // Check for new posts periodically without auto-refreshing
  useEffect(() => {
    if (!onCheckNewPosts) return;

    // Check for new posts every 30 seconds instead of auto-refreshing
    const interval = setInterval(() => {
      if (!isLoading) {
        onCheckNewPosts();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [isLoading, onCheckNewPosts]);

  const handleLike = async (post: Post) => {
    if (!address) {
      showErrorToast(
        "Wallet not connected",
        "Please connect your wallet to like posts"
      );
      return;
    }
    if (likingPost === post.tokenId) return;

    setLikingPost(post.tokenId);
    try {
      const result = await LikesService.toggleLike(
        address,
        "post",
        post.tokenId,
        post.author // Pass post owner address for notifications
      );

      // Update local state
      const newLikedPosts = new Set(likedPosts);
      const newLikeCounts = { ...likeCounts };

      if (result.liked) {
        newLikedPosts.add(post.tokenId);
        showSuccessToast(`❤️ You liked NFT #${post.tokenId}!`);
      } else {
        newLikedPosts.delete(post.tokenId);
        showSuccessToast(`💔 Unliked NFT #${post.tokenId}`);
      }

      newLikeCounts[post.tokenId] = result.count;
      setLikedPosts(newLikedPosts);
      setLikeCounts(newLikeCounts);
    } catch (error) {
      console.error("Error toggling like:", error);
      showErrorToast("Failed to update like", error);
    } finally {
      setLikingPost(null);
    }
  };

  const handleShare = (post: Post) => {
    if (navigator.share) {
      navigator.share({
        title: "OnePostNft NFT",
        text: post.content,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      showSuccessToast("📋 Link copied to clipboard!");
    }
  };

  const handleSell = (post: Post) => {
    setSelectedPostForSell(post);
    setSellModalOpen(true);
  };

  const handleSellSuccess = (post: Post, price: string) => {
    showSuccessToast(`🎉 NFT #${post.tokenId} listed for ${price} ETH!`);
    // Refresh posts to update the feed
    onRefresh();
  };

  const handleBuy = async (post: Post) => {
    if (!address) {
      showErrorToast(
        "Wallet not connected",
        "🔐 Please connect your wallet to buy NFT"
      );
      return;
    }

    if (!walletClient) {
      showErrorToast(
        "Wallet client not ready",
        "🔗 Please connect an Ethereum wallet (MetaMask or Coinbase) to buy NFTs."
      );
      return;
    }

    let loadingToast: string | number | undefined;

    try {
      loadingToast = showLoadingToast("💳 Processing purchase...");
      await buyPost(walletClient, post.tokenId, MOCK_BASE_CONTRACT_ADDRESS);

      // Dismiss loading toast before showing success
      if (loadingToast) {
        dismissToast(loadingToast);
      }

      showSuccessToast(`🎉 Successfully bought NFT #${post.tokenId}! 🚀`);

      // Refresh posts to update the feed
      onRefresh();
    } catch (error) {
      console.error("Error buying NFT:", error);

      // Dismiss loading toast before showing error
      if (loadingToast) {
        dismissToast(loadingToast);
      }

      showErrorToast(`❌ Failed to buy NFT #${post.tokenId}`, error);
    }
  };

  const handleCancelSell = async (post: Post) => {
    if (!walletClient) {
      showErrorToast(
        "Wallet not connected",
        "🔐 Please connect your wallet to cancel listing"
      );
      return;
    }

    let loadingToast: string | number | undefined;

    try {
      loadingToast = showLoadingToast("🔄 Canceling listing...");
      // Note: cancelSell typically takes a proposal ID, but we'll use tokenId for now
      // This might need adjustment based on your contract implementation
      await cancelSell(walletClient, post.tokenId);

      // Dismiss loading toast before showing success
      if (loadingToast) {
        dismissToast(loadingToast);
      }

      showSuccessToast(`✅ Listing canceled for NFT #${post.tokenId}!`);

      // Refresh posts to update the feed
      onRefresh();
    } catch (error) {
      console.error("Error canceling listing:", error);

      // Dismiss loading toast before showing error
      if (loadingToast) {
        dismissToast(loadingToast);
      }

      showErrorToast("❌ Failed to cancel listing", error);
    }
  };

  const handleChat = (post: Post) => {
    // Navigate to chat with the post owner (current owner, not author)
    const ownerAddress = post.currentOwner;
    const ownerName = `${ownerAddress.slice(0, 6)}...${ownerAddress.slice(-4)}`;

    // Store chat info in localStorage for the chat page to pick up
    localStorage.setItem(
      "chatTarget",
      JSON.stringify({
        address: ownerAddress,
        name: ownerName,
        postId: post.tokenId,
      })
    );

    // Navigate to chat page
    if (onNavigate) {
      onNavigate("Chats");
      showSuccessToast(`Opening chat with ${ownerName}`);
    } else {
      showSuccessToast(`Chat info saved. Navigate to Chats to continue.`);
    }
  };

  const handleMintMockTokens = async () => {
    if (!walletClient) {
      showErrorToast(
        "Wallet not connected",
        "Please connect your wallet to mint tokens"
      );
      return;
    }

    let loadingToast: string | number | undefined;

    try {
      loadingToast = showLoadingToast("Minting mock tokens...");
      await mintMockTokens(walletClient, 1000 * 10 ** 18);
      if (loadingToast) {
        dismissToast(loadingToast);
      }
      showSuccessToast("Successfully minted 1000 NFT Social tokens!");
    } catch (error) {
      console.error("Error minting mock tokens:", error);
      if (loadingToast) {
        dismissToast(loadingToast);
      }
      showErrorToast("Failed to mint mock tokens", error);
    }
  };

  return (
    <div className="space-y-4 md:mt-10">
      <Card className="p-4 bg-card border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Posts</h2>
          <div className="flex items-center gap-4">
            <Button onClick={handleMintMockTokens}>Mint Mock Tokens</Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isLoading}
              className="animate-scale-in"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        {/* New Posts Notification */}
        {hasNewPosts && (
          <div className="mb-4 p-3 bg-primary/10 border border-primary/20 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-primary">
                  New posts available
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                className="text-primary border-primary hover:bg-primary hover:text-primary-foreground"
              >
                Load new posts
              </Button>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-3 text-muted-foreground">
              Loading posts from blockchain...
            </span>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <span className="text-2xl">📝</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">No Posts Yet</h3>
            <p className="text-muted-foreground mb-4">
              Be the first to create an NFT post on Base!
            </p>
            <p className="text-sm text-muted-foreground">
              Your posts will appear here once they're minted on the blockchain.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => {
              const isOwner =
                address && post.author.toLowerCase() === address.toLowerCase();
              return (
                <PostCard
                  key={post.tokenId}
                  post={post}
                  onLike={handleLike}
                  onShare={handleShare}
                  onSell={handleSell}
                  onBuy={handleBuy}
                  onCancelSell={handleCancelSell}
                  onChat={handleChat}
                  isLiking={likingPost === post.tokenId}
                  isLiked={likedPosts.has(post.tokenId)}
                  likeCount={likeCounts[post.tokenId] || 0}
                  isOwner={isOwner}
                  isForSale={post.isForSale || false}
                />
              );
            })}
          </div>
        )}
      </Card>

      {/* Sell Modal */}
      <SellModal
        isOpen={sellModalOpen}
        onClose={() => setSellModalOpen(false)}
        post={selectedPostForSell}
        onSellSuccess={handleSellSuccess}
      />
    </div>
  );
};

export default CommunityFeed;
