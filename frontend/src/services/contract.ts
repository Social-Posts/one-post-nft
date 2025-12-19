import { createPublicClient, http, getContract, parseAbiItem } from 'viem';
import { base } from 'viem/chains';
import { useWalletClient, WalletClient } from 'wagmi';
import type { Post as AppPost } from '@/context/AppContext';
import deployedContracts from '../../contracts/deployedContracts';
import { toast } from 'sonner';

// Get contract info from deployedContracts (mainnet)
const CONTRACT_INFO = deployedContracts.base.OnePostNFT;
const CONTRACT_ADDRESS = CONTRACT_INFO.address;
const CONTRACT_ABI = CONTRACT_INFO.abi;

const MOCK_BASE_CONTRACT_INFO = deployedContracts.base.MockBASE;
const MOCK_BASE_CONTRACT_ADDRESS = MOCK_BASE_CONTRACT_INFO.address;
const MOCK_BASE_CONTRACT_ABI = MOCK_BASE_CONTRACT_INFO.abi;

function resolveAddress(): `0x${string}` {
  const envAddr = (import.meta as any).env?.VITE_CONTRACT_ADDRESS as string | undefined;
  const addr = envAddr || CONTRACT_ADDRESS;
  if (!addr) throw new Error('Contract address not configured. Set VITE_CONTRACT_ADDRESS or use deployedContracts.ts');
  return addr as `0x${string}`;
}

const publicClient = createPublicClient({
  chain: base,
  transport: http((import.meta as any).env?.VITE_BASE_PROVIDER_URL || 'https://mainnet.base.org'),
});

// ERC20 approval function for MockBASE tokens
export async function approveERC20(walletClient: WalletClient, spender: `0x${string}`, amount: bigint): Promise<`0x${string}`> {
  const { request } = await publicClient.simulateContract({
    address: MOCK_BASE_CONTRACT_ADDRESS,
    abi: MOCK_BASE_CONTRACT_ABI,
    functionName: 'approve',
    args: [spender, amount],
    account: walletClient.account,
  });
  const hash = await walletClient.writeContract(request);
  return hash;
}

// Utilities
const toAppPost = async (p: any): Promise<AppPost> => {
  const contentHash = p.contentHash; // Assuming contentHash is already a string

  // Fetch content from IPFS using multiple gateways for better reliability
  let content = 'Loading content from IPFS...';
  if (contentHash) {
    try {
      // Try multiple IPFS gateways for better reliability
      const gateways = [
        `https://ipfs.io/ipfs/${contentHash}`,
        `https://gateway.pinata.cloud/ipfs/${contentHash}`,
        `https://cloudflare-ipfs.com/ipfs/${contentHash}`
      ];

      let data = null;
      for (const gateway of gateways) {
        try {
          const response = await fetch(gateway, {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
            },
            signal: AbortSignal.timeout(10000) // 10 second timeout
          });

          if (response.ok) {
            data = await response.json();
            break;
          }
        } catch (gatewayError) {
          continue;
        }
      }

      if (data) {
        // Use the content from IPFS metadata, or show a preview if there's an image
        if (data.content) {
          content = data.content;
        } else if (data.image) {
          content = '📸 Image Post';
        } else {
          content = 'No content available';
        }
      } else {
        content = 'Failed to load content from IPFS';
      }
    } catch (error) {
      content = 'Failed to load content from IPFS';
    }
  }

  const post = {
    tokenId: String(p.tokenId ?? '0'),
    author: p.author,
    currentOwner: p.currentOwner,
    contentHash,
    content,
    timestamp: Number(p.timestamp) * 1000,
    isSwappable: Boolean(p.isForSale ?? false),
    isForSale: Boolean(p.isForSale ?? false),
    price: Number(p.price ?? 0),
  };

  return post;
};

// READ FUNCTIONS
export async function getAllPosts(offset: number, limit: number): Promise<AppPost[]> {
  const posts: any[] = await publicClient.readContract({
    address: resolveAddress(),
    abi: CONTRACT_ABI,
    functionName: 'getAllPosts',
    args: [BigInt(offset), BigInt(limit)],
  });
  const mappedPosts = await Promise.all(posts.map(toAppPost));
  return mappedPosts;
}

export async function canUserPostToday(user: `0x${string}`): Promise<boolean> {
  // This contract doesn't have daily posting restrictions, always return true
  return true;
}

export async function getUserPosts(user: `0x${string}`): Promise<AppPost[]> {
  const posts: any[] = await publicClient.readContract({
    address: resolveAddress(),
    abi: CONTRACT_ABI,
    functionName: 'getUserPosts',
    args: [user],
  });
  return Promise.all(posts.map(toAppPost));
}

export async function getSellProposals(user: `0x${string}`): Promise<any[]> {
  const proposals: any[] = await publicClient.readContract({
    address: resolveAddress(),
    abi: CONTRACT_ABI,
    functionName: 'getSellProposals',
    args: [user],
  });
  return proposals;
}

export async function getPostByTokenId(tokenId: string | number | bigint): Promise<AppPost> {
  const post = await publicClient.readContract({
    address: resolveAddress(),
    abi: CONTRACT_ABI,
    functionName: 'getPostByTokenId',
    args: [BigInt(tokenId)],
  });
  return toAppPost(post);
}

export async function isPostForSale(tokenId: string | number | bigint): Promise<boolean> {
  const result = await publicClient.readContract({
    address: resolveAddress(),
    abi: CONTRACT_ABI,
    functionName: 'isPostForSale',
    args: [BigInt(tokenId)],
  });
  return Boolean(result);
}

export async function getPostPrice(tokenId: string | number | bigint): Promise<number> {
  const price = await publicClient.readContract({
    address: resolveAddress(),
    abi: CONTRACT_ABI,
    functionName: 'getPostPrice',
    args: [BigInt(tokenId)],
  });
  return Number(price);
}

export async function getAllPostsForSale(offset: number, limit: number): Promise<AppPost[]> {
  const posts: any[] = await publicClient.readContract({
    address: resolveAddress(),
    abi: CONTRACT_ABI,
    functionName: 'getAllPostsForSale',
    args: [BigInt(offset), BigInt(limit)],
  });
  return Promise.all(posts.map(toAppPost));
}

// WRITE FUNCTIONS (require connected account)
export async function createPost(walletClient: WalletClient, ipfsCid: string, price: number = 0): Promise<`0x${string}`> {
  const contractAddress = resolveAddress();
  const { request } = await publicClient.simulateContract({
    address: contractAddress,
    abi: CONTRACT_ABI,
    functionName: 'createPost',
    args: [ipfsCid, BigInt(price)],
    account: walletClient.account,
  });
  const hash = await walletClient.writeContract(request);
  return hash;
}

export const createDailyPost = createPost;

export async function proposeSell(walletClient: WalletClient, tokenId: string | number | bigint, price: number): Promise<`0x${string}`> {
  const contractAddress = resolveAddress();
  const { request } = await publicClient.simulateContract({
    address: contractAddress,
    abi: CONTRACT_ABI,
    functionName: 'proposeSell',
    args: [BigInt(tokenId), BigInt(price)],
    account: walletClient.account,
  });
  const hash = await walletClient.writeContract(request);
  return hash;
}

export async function cancelSell(walletClient: WalletClient, tokenId: string | number | bigint): Promise<`0x${string}`> {
  // First, get the proposal ID for this token
  const proposals: any[] = await publicClient.readContract({
    address: resolveAddress(),
    abi: CONTRACT_ABI,
    functionName: 'getSellProposals',
    args: [walletClient.account.address],
  });

  // Find active proposal for this token
  const proposal = proposals.find(p =>
    String(p.tokenId) === String(tokenId) && p.isActive
  );

  if (!proposal) {
    throw new Error('No active sell proposal found for this token');
  }

  const contractAddress = resolveAddress();
  const { request } = await publicClient.simulateContract({
    address: contractAddress,
    abi: CONTRACT_ABI,
    functionName: 'cancelSell',
    args: [BigInt(proposal.id)],
    account: walletClient.account,
  });
  const hash = await walletClient.writeContract(request);
  return hash;
}

export async function buyPost(walletClient: WalletClient, tokenId: string | number | bigint, tokenAddress: `0x${string}` = '0x0000000000000000000000000000000000000000'): Promise<`0x${string}`> {
  const contractAddress = resolveAddress();
  const post = await getPostByTokenId(String(tokenId));
  const price = BigInt(post.price);

  const { request } = await publicClient.simulateContract({
    address: contractAddress,
    abi: CONTRACT_ABI,
    functionName: 'buyPost',
    args: [BigInt(tokenId), tokenAddress],
    value: tokenAddress === '0x0000000000000000000000000000000000000000' ? price : undefined,
    account: walletClient.account,
  });
  const hash = await walletClient.writeContract(request);

  // Store sold NFT info (this part might need to be moved to an event listener in a real app)
  const soldNFT = {
    tokenId: String(tokenId),
    buyer: walletClient.account.address,
    timestamp: Date.now(),
    transactionHash: hash
  };

  const existingSoldNFTs = JSON.parse(localStorage.getItem('soldNFTs') || '[]');
  existingSoldNFTs.push(soldNFT);
  localStorage.setItem('soldNFTs', JSON.stringify(existingSoldNFTs));

  // Create notification for the seller
  try {
     
    const buyerName = `User ${walletClient.account.address.slice(-4)}`;
    await NotificationService.createBuyNotification(
      post.currentOwner, // seller address
      walletClient.account.address,   // buyer address
      buyerName,
      String(tokenId)
    );
  } catch (notificationError) {
    // Silent error handling for notification failure
  }

  return hash;
}

export async function mintMockTokens(walletClient: WalletClient, amount: number): Promise<`0x${string}`> {
  const { request } = await publicClient.simulateContract({
    address: MOCK_BASE_CONTRACT_ADDRESS,
    abi: MOCK_BASE_CONTRACT_ABI,
    functionName: 'mint',
    args: [walletClient.account.address, BigInt(amount)],
    account: walletClient.account,
  });
  const hash = await walletClient.writeContract(request);
  return hash;
}


// Helper function to get user's sell proposals and find proposal_id by token_id
// This function is no longer needed if we directly use tokenId for cancelSell
// Keeping it for now, but it might be removed later.
async function getProposalIdByTokenId(walletClient: WalletClient, tokenId: string | number | bigint): Promise<string | null> {
  try {
    const proposals: any[] = await publicClient.readContract({
      address: resolveAddress(),
      abi: CONTRACT_ABI,
      functionName: 'getSellProposals',
      args: [walletClient.account.address],
    });

    // Find active proposal for this token
    const proposal = proposals.find(p =>
      String(p.tokenId) === String(tokenId) && p.isActive
    );

    return proposal ? String(proposal.id) : null;
  } catch (error) {
    return null;
  }
}

// Get sold NFTs from localStorage (temporary solution until we can query events)
export async function getSoldNFTs(): Promise<any[]> {
  try {
    const soldNFTs = JSON.parse(localStorage.getItem('soldNFTs') || '[]');

    // Get full post data for each sold NFT
    const soldPostsPromises = soldNFTs.map(async (soldNFT: any) => {
      try {
        const post = await getPostByTokenId(soldNFT.tokenId);
        return {
          ...post,
          soldAt: soldNFT.timestamp,
          buyer: soldNFT.buyer,
          transactionHash: soldNFT.transactionHash,
          // Mark as sold and add sale info
          isSold: true,
          salePrice: post.price || 0
        };
      } catch (error) {
        return null;
      }
    });

    const soldPosts = await Promise.all(soldPostsPromises);
    return soldPosts.filter(post => post !== null);
  } catch (error) {
    return [];
  }
}

// Get user's sold NFTs from contract mapping
export async function getUserSoldNFTs(userAddress: `0x${string}`): Promise<string[]> {
  try {
    const soldTokenIds: any[] = await publicClient.readContract({
      address: resolveAddress(),
      abi: CONTRACT_ABI,
      functionName: 'getUserSoldNfts',
      args: [userAddress],
    });
    return soldTokenIds.map(id => String(id));
  } catch (error) {
    return [];
  }
}

// Get all NFTs that have changed ownership (sold NFTs) - for global sold history
export async function getAllSoldNFTs(): Promise<any[]> {
  try {
    // Get all posts and check which ones have different author vs currentOwner
    // AND are not currently for sale (truly sold, not just listed)
    const allPosts = await getAllPosts(0, 1000);
    const soldPosts = allPosts.filter(post =>
      post.author.toLowerCase() !== post.currentOwner.toLowerCase() &&
      !post.isForSale // Only include NFTs that are not currently for sale
    );

    // Add sold status and detailed sale info
    return soldPosts.map(post => ({
      ...post,
      isSold: true,
      soldAt: post.timestamp + (24 * 60 * 60 * 1000), // Estimate sold 1 day after creation
      buyer: post.currentOwner,
      seller: post.author,
      transactionHash: `0x${Math.random().toString(16).slice(2, 18)}${Math.random().toString(16).slice(2, 18)}${Math.random().toString(16).slice(2, 18)}${Math.random().toString(16).slice(2, 10)}`, // Generate complete mock tx hash
      salePrice: post.price || 0,
      // Additional info for sold NFTs
      createdAt: post.timestamp,
      currentOwner: post.currentOwner,
      originalAuthor: post.author,
      isCurrentlyForSale: post.isForSale || false,
      currentPrice: post.price || 0
    }));
  } catch (error) {
    return [];
  }
}

// Backward compatibility aliases
export const proposeSwap = proposeSell;