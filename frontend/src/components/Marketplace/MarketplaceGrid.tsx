import React, { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RefreshCw, Loader2, ShoppingCart, Search, Filter } from "lucide-react";
import {
  showErrorToast,
  showSuccessToast,
  showLoadingToast,
  dismissToast,
} from "@/utils/toastUtils";
import {
  getAllPosts,
  getAllPostsForSale,
  buyPost,
  cancelSell,
  getSoldNFTs,
  getAllSoldNFTs,
} from "@/services/contract";
import PostCard from "@/components/Feed/PostCard";
import SellModal from "@/components/Modals/SellModal";
import NFTWalletInfo from "@/components/Info/NFTWalletInfo";
import SoldNFTsModal from "@/components/Marketplace/SoldNFTsModal";
import type { Post } from "@/context/AppContext";
import { useAccount, useWalletClient } from "wagmi";
import { LikesService } from "@/services/chatService";

interface MarketplaceGridProps {
  onNavigate?: (tab: string) => void;
}

const MarketplaceGrid: React.FC<MarketplaceGridProps> = ({ onNavigate }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({});
  const [likingPost, setLikingPost] = useState<string | null>(null);
  const [sellModalOpen, setSellModalOpen] = useState(false);
  const [selectedPostForSell, setSelectedPostForSell] = useState<Post | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<
    "all" | "for-sale" | "my-nfts" | "sold"
  >("all");
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

  const fetchMarketplacePosts = useCallback(async () => {
    try {
      setIsLoading(true);

      // For marketplace, we want different posts based on filter
      let fetchedPosts: Post[];
      if (filterType === "my-nfts" && address) {
        // Get all posts and filter by user
        const allPosts = await getAllPosts(0, 1000);
        fetchedPosts = allPosts.filter(
          (post) => post.currentOwner.toLowerCase() === address.toLowerCase()
        );
      } else if (filterType === "sold") {
        // Get all sold NFTs (global sold history)
        fetchedPosts = await getAllSoldNFTs();
      } else if (filterType === "for-sale") {
        // Get only posts for sale
        fetchedPosts = await getAllPostsForSale(0, 100);
        // Additional client-side filter to ensure only for-sale posts are included
        fetchedPosts = fetchedPosts.filter((post) => post.isForSale);
      } else {
        // 'all' - Get all posts (including those not for sale)
        fetchedPosts = await getAllPosts(0, 100);
      }

      // Deduplicate posts by tokenId to prevent duplicates from appearing in the UI
      const postMap = new Map<string, Post>();
      fetchedPosts.forEach((post) => {
        postMap.set(post.tokenId, post);
      });
      const uniquePosts = Array.from(postMap.values());

      setPosts(uniquePosts);
    } catch (error) {
      console.error("Failed to load marketplace posts:", error);
      showErrorToast("Failed to load marketplace", error);
    } finally {
      setIsLoading(false);
    }
  }, [filterType, address]);

  useEffect(() => {
    fetchMarketplacePosts();
  }, [fetchMarketplacePosts]);

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
        post.author
      );

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
        title: "Check out this NFT post!",
        text: post.content,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      showSuccessToast("Link copied to clipboard!");
    }
  };

  const handleSell = (post: Post) => {
    setSelectedPostForSell(post);
    setSellModalOpen(true);
  };

  const handleBuy = async (post: Post) => {
    // Open buy modal with payment method selection
    const event = new CustomEvent("openBuyModal", { detail: { post } });
    window.dispatchEvent(event);
  };

  const handleSellSuccess = (post: Post, price: string) => {
    showSuccessToast(
      `🎉 NFT #${post.tokenId} listed for sale at ${price} ETH! 💰`
    );
    // Refresh posts to update the marketplace
    fetchMarketplacePosts();
  };

  const handleCancelSell = async (post: Post) => {
    if (!walletClient) {
      showErrorToast(
        "Wallet not connected",
        "Please connect your wallet to cancel listing"
      );
      return;
    }

    let loadingToast: string | number | undefined;
    try {
      loadingToast = showLoadingToast("Canceling listing...");
      await cancelSell(walletClient, post.tokenId);
      if (loadingToast) dismissToast(loadingToast);
      showSuccessToast(`🎉 Listing canceled for NFT #${post.tokenId}!`);

      // Update the post locally immediately for better UX
      setPosts((prevPosts) =>
        prevPosts.map((p) =>
          p.tokenId === post.tokenId ? { ...p, isForSale: false, price: 0 } : p
        )
      );

      // Also refresh from server to ensure consistency
      setTimeout(() => fetchMarketplacePosts(), 1000);
    } catch (error) {
      console.error("Error canceling listing:", error);
      if (loadingToast) dismissToast(loadingToast);
      showErrorToast("Failed to cancel listing", error);
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

  // Filter posts based on search and filter criteria
  const filteredPosts = posts.filter((post) => {
    // Search filter
    const matchesSearch =
      searchTerm === "" ||
      post.tokenId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content.toLowerCase().includes(searchTerm.toLowerCase());

    // Type filter - most filtering is now done at fetch level
    const isOwner =
      address && post.author.toLowerCase() === address.toLowerCase();
    let matchesFilter = true;

    switch (filterType) {
      case "for-sale":
        // Already filtered at fetch level
        matchesFilter = true;
        break;
      case "my-nfts":
        // Already filtered at fetch level
        matchesFilter = true;
        break;
      case "sold":
        // This would need additional data from contract about sold NFTs
        matchesFilter = true; // Placeholder for now
        break;
      default:
        matchesFilter = true;
    }
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6 animate-fade-in md:mt-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            NFT Marketplace
          </h2>
          <p className="text-muted-foreground">
            Discover and trade unique post NFTs
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <Badge className="bg-primary text-primary-foreground animate-pulse-glow text-nowrap">
            {filteredPosts.length} NFTs Available
          </Badge>

          <div className="flex flex-wrap gap-2">
            <Button
              onClick={fetchMarketplacePosts}
              disabled={isLoading}
              variant="outline"
              size="sm"
              className="animate-scale-in"
            >
              <RefreshCw
                className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
              />
              <span className="hidden sm:inline">Refresh</span>
              <span className="sm:hidden">↻</span>
            </Button>

            <NFTWalletInfo />

            <SoldNFTsModal />
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by NFT ID, address, or content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full"
          />
        </div>

        <div className="w-full sm:w-auto">
          <Select
            value={filterType}
            onValueChange={(value) =>
              setFilterType(value as "all" | "for-sale" | "my-nfts" | "sold")
            }
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="NFT Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All NFTs</SelectItem>
              <SelectItem value="for-sale">For Sale</SelectItem>
              <SelectItem value="my-nfts">My NFTs</SelectItem>
              <SelectItem value="sold">Sold NFTs</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-3 text-muted-foreground">
            Loading marketplace...
          </span>
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
            <ShoppingCart className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">
            {searchTerm
              ? "No NFTs Found"
              : filterType === "for-sale"
              ? "No NFTs For Sale"
              : filterType === "my-nfts"
              ? "No NFTs Owned"
              : filterType === "sold"
              ? "No Sold NFTs"
              : "No NFTs Available"}
          </h3>
          <p className="text-muted-foreground">
            {searchTerm
              ? "Try adjusting your search terms"
              : filterType === "for-sale"
              ? "Check back later for NFTs listed for sale!"
              : filterType === "my-nfts"
              ? "You don't own any NFTs yet. Create some posts to get started!"
              : filterType === "sold"
              ? "No NFTs have been sold yet"
              : "Check back later for new NFT posts to browse and trade!"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-3">
          {filteredPosts.map((post) => {
            const isOwner =
              address &&
              post.currentOwner.toLowerCase() === address.toLowerCase();
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
                likeCount={likeCounts[post.tokenId] || 0}
                isOwner={isOwner}
                isForSale={post.isForSale || false}
                showBuyButton={!isOwner && post.isForSale}
                showSellButton={isOwner && !post.isForSale}
              />
            );
          })}
        </div>
      )}

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

export default MarketplaceGrid;
