// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title OnePostNFT V2
 * @notice Social media NFT platform with marketplace and creator royalties
 * @dev Major improvements over V1:
 * - Inherits from OpenZeppelin ERC721 instead of manual implementation
 * - Added ReentrancyGuard for secure payments
 * - Added Pausable for emergency stops
 * - Optimized storage with packed structs
 * - Gas-optimized loops and storage access
 * - Better event structure
 * - Fixed for-sale index management
 * - Added batch operations
 * - Improved error handling with custom errors
 * - Added price change history
 * - Fixed potential issues with sold NFT tracking
 */
contract OnePostNFTV2 is ERC721, Ownable, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;

    error NotTokenOwner();
    error InvalidPrice();
    error NotForSale();
    error CannotBuyOwnPost();
    error IncorrectPaymentAmount();
    error InvalidTokenAddress();
    error ProposalNotActive();
    error ProposalExpired();
    error NotProposalSeller();
    error ArrayLengthMismatch();
    error MaxRoyaltyExceeded();

    struct Post {
        address author;           // 20 bytes
        address currentOwner;     // 20 bytes
        uint96 price;            // 12 bytes (supports up to ~79B tokens with 18 decimals)
        uint32 timestamp;        // 4 bytes (valid until year 2106)
        bool isForSale;          // 1 byte
        string contentHash;      // Dynamic
    }

    struct SellProposal {
        address seller;          // 20 bytes
        uint96 price;           // 12 bytes
        uint32 expiration;      // 4 bytes
        uint256 tokenId;        // 32 bytes
        bool isActive;          // 1 byte
    }

    struct PriceHistory {
        uint96 price;
        uint32 timestamp;
        address seller;
        address buyer;
    }

    // State variables
    uint256 private _tokenCounter = 1;
    uint256 private _proposalCounter = 1;
    
    // MAX royalty of 10%
    uint256 public constant MAX_ROYALTY_BPS = 1000;
    uint256 public royaltyBps = 500; // 5% default
    
    address public immutable baseTokenAddress;
    uint256 public constant PROPOSAL_EXPIRATION = 7 days;

    // Storage mappings
    mapping(uint256 => Post) public posts;
    mapping(uint256 => SellProposal) public sellProposals;
    mapping(uint256 => PriceHistory[]) public priceHistory;
    
    // Optimized indexing
    mapping(address => uint256[]) private _userTokenIds;
    mapping(address => uint256[]) private _userSoldTokenIds;
    uint256[] private _allTokenIds;
    uint256[] private _forSaleTokenIds;
    mapping(uint256 => uint256) private _forSaleIndex; // tokenId => index in _forSaleTokenIds

    // Events
    event PostCreated(
        uint256 indexed tokenId,
        address indexed author,
        string contentHash,
        uint96 price,
        uint32 timestamp
    );
    
    event PostListedForSale(
        uint256 indexed tokenId,
        address indexed seller,
        uint96 price
    );
    
    event PostDelistedFromSale(
        uint256 indexed tokenId,
        address indexed seller
    );
    
    event SellProposed(
        uint256 indexed proposalId,
        address indexed seller,
        uint256 indexed tokenId,
        uint96 price,
        uint32 expiration
    );
    
    event SellCancelled(uint256 indexed proposalId);
    
    event PostSold(
        uint256 indexed tokenId,
        address indexed seller,
        address indexed buyer,
        uint96 price,
        uint96 royaltyPaid
    );
    
    event RoyaltyUpdated(uint256 oldRoyalty, uint256 newRoyalty);

    constructor(address _baseTokenAddress) 
        ERC721("NFT Social Posts", "NSP") 
        Ownable(msg.sender)
    {
        if (_baseTokenAddress == address(0)) revert InvalidTokenAddress();
        baseTokenAddress = _baseTokenAddress;
    }

    // ============ Core Functionality ============

    /**
     * @notice Create a new post NFT
     * @param contentHash IPFS hash of the post content
     * @param price Initial price (0 for not for sale)
     */
    function createPost(string memory contentHash, uint96 price) 
        external 
        whenNotPaused 
        returns (uint256) 
    {
        return _createPostInternal(msg.sender, contentHash, price);
    }

    /**
     * @notice Batch create multiple posts
     * @param contentHashes Array of IPFS hashes
     * @param prices Array of prices
     */
    function createPostBatch(string[] memory contentHashes, uint96[] memory prices) 
        external 
        whenNotPaused 
        returns (uint256[] memory) 
    {
        if (contentHashes.length != prices.length) revert ArrayLengthMismatch();
        
        uint256[] memory tokenIds = new uint256[](contentHashes.length);
        
        for (uint256 i = 0; i < contentHashes.length; i++) {
            tokenIds[i] = _createPostInternal(msg.sender, contentHashes[i], prices[i]);
        }
        
        return tokenIds;
    }

    /**
     * @notice Propose to sell a post
     * @param tokenId Token ID to sell
     * @param price Sale price
     */
    function proposeSell(uint256 tokenId, uint96 price) 
        external 
        whenNotPaused
        returns (uint256) 
    {
        if (ownerOf(tokenId) != msg.sender) revert NotTokenOwner();
        if (price == 0) revert InvalidPrice();

        uint256 proposalId = _proposalCounter++;

        sellProposals[proposalId] = SellProposal({
            seller: msg.sender,
            price: price,
            expiration: uint32(block.timestamp + PROPOSAL_EXPIRATION),
            tokenId: tokenId,
            isActive: true
        });

        posts[tokenId].isForSale = true;
        posts[tokenId].price = price;
        
        _addToForSale(tokenId);

        emit SellProposed(proposalId, msg.sender, tokenId, price, uint32(block.timestamp + PROPOSAL_EXPIRATION));
        return proposalId;
    }

    /**
     * @notice Update price of an existing listing
     * @param tokenId Token to update
     * @param newPrice New price
     */
    function updatePrice(uint256 tokenId, uint96 newPrice) external {
        if (ownerOf(tokenId) != msg.sender) revert NotTokenOwner();
        if (newPrice == 0) revert InvalidPrice();
        
        Post storage post = posts[tokenId];
        post.price = newPrice;
        
        if (!post.isForSale) {
            post.isForSale = true;
            _addToForSale(tokenId);
        }
        
        emit PostListedForSale(tokenId, msg.sender, newPrice);
    }

    /**
     * @notice Cancel a sell proposal
     * @param proposalId Proposal ID to cancel
     */
    function cancelSell(uint256 proposalId) external {
        SellProposal storage proposal = sellProposals[proposalId];
        
        if (!proposal.isActive) revert ProposalNotActive();
        if (proposal.seller != msg.sender) revert NotProposalSeller();

        proposal.isActive = false;
        
        Post storage post = posts[proposal.tokenId];
        post.isForSale = false;
        post.price = 0;
        
        _removeFromForSale(proposal.tokenId);

        emit SellCancelled(proposalId);
        emit PostDelistedFromSale(proposal.tokenId, msg.sender);
    }

    /**
     * @notice Buy a post with ETH or ERC20
     * @param tokenId Token to purchase
     * @param tokenAddress Address(0) for ETH, or ERC20 token address
     */
    function buyPost(uint256 tokenId, address tokenAddress) 
        external 
        payable 
        nonReentrant 
        whenNotPaused 
    {
        Post storage post = posts[tokenId];
        
        if (!post.isForSale) revert NotForSale();
        if (post.currentOwner == msg.sender) revert CannotBuyOwnPost();
        if (post.price == 0) revert InvalidPrice();

        address seller = post.currentOwner;
        uint96 price = post.price;
        
        // Calculate royalty (only for secondary sales)
        uint96 royaltyAmount = (post.author != seller) 
            ? uint96((uint256(price) * royaltyBps) / 10000)
            : 0;

        // Handle payment
        if (tokenAddress == address(0)) {
            _handleETHPayment(price, royaltyAmount, post.author, seller);
        } else {
            _handleERC20Payment(tokenAddress, price, royaltyAmount, post.author, seller);
        }

        // Record price history
        priceHistory[tokenId].push(PriceHistory({
            price: price,
            timestamp: uint32(block.timestamp),
            seller: seller,
            buyer: msg.sender
        }));

        // Transfer NFT
        _transfer(seller, msg.sender, tokenId);

        // Update post state
        post.currentOwner = msg.sender;
        post.isForSale = false;
        post.price = 0;
        
        _removeFromForSale(tokenId);

        // Track sold NFT
        _userSoldTokenIds[seller].push(tokenId);
        _userTokenIds[msg.sender].push(tokenId);

        emit PostSold(tokenId, seller, msg.sender, price, royaltyAmount);
    }

    // ============ Internal Functions ============

    function _createPostInternal(address author, string memory contentHash, uint96 price) internal returns(uint256){
        uint256 tokenId = _tokenCounter++;

        _safeMint(author, tokenId);

        posts[tokenId] = Post({
            author: author,
            currentOwner: author,
            contentHash: contentHash,
            timestamp: uint32(block.timestamp),
            isForSale: price > 0,
            price: price
        });

        _allTokenIds.push(tokenId);
        _userTokenIds[author].push(tokenId);

        if(price > 0){
            _addToForSale(tokenId);
            emit PostListedForSale(tokenId, author, price);
        }

        emit PostCreated(tokenId, author, contentHash, price, uint32(block.timestamp));
        return tokenId;
    }

    function _handleETHPayment(
        uint96 price,
        uint96 royaltyAmount,
        address author,
        address seller
    ) internal {
        if (msg.value != price) revert IncorrectPaymentAmount();

        if (royaltyAmount > 0) {
            (bool successRoyalty, ) = payable(author).call{value: royaltyAmount}("");
            require(successRoyalty, "Royalty transfer failed");
        }

        uint96 sellerAmount = price - royaltyAmount;
        if (sellerAmount > 0) {
            (bool successSeller, ) = payable(seller).call{value: sellerAmount}("");
            require(successSeller, "Seller payment failed");
        }
    }

    function _handleERC20Payment(
        address tokenAddress,
        uint96 price,
        uint96 royaltyAmount,
        address author,
        address seller
    ) internal {
        if (tokenAddress != baseTokenAddress) revert InvalidTokenAddress();
        
        IERC20 token = IERC20(baseTokenAddress);

        if (royaltyAmount > 0) {
            token.safeTransferFrom(msg.sender, author, royaltyAmount);
        }

        uint96 sellerAmount = price - royaltyAmount;
        if (sellerAmount > 0) {
            token.safeTransferFrom(msg.sender, seller, sellerAmount);
        }
    }

    function _addToForSale(uint256 tokenId) internal {
        if (_forSaleIndex[tokenId] == 0) {
            _forSaleTokenIds.push(tokenId);
            _forSaleIndex[tokenId] = _forSaleTokenIds.length;
        }
    }

    function _removeFromForSale(uint256 tokenId) internal {
        uint256 index = _forSaleIndex[tokenId];
        if (index > 0) {
            uint256 lastIndex = _forSaleTokenIds.length - 1;
            uint256 lastTokenId = _forSaleTokenIds[lastIndex];
            
            _forSaleTokenIds[index - 1] = lastTokenId;
            _forSaleIndex[lastTokenId] = index;
            
            _forSaleTokenIds.pop();
            delete _forSaleIndex[tokenId];
        }
    }

    // ============ View Functions ============

    function getPost(uint256 tokenId) external view returns (Post memory) {
        return posts[tokenId];
    }

    function getSellProposals(uint256 proposalId) external view returns (SellProposal memory) {
        return sellProposals[proposalId];
    }    

    function getUserPosts(address user) external view returns (Post[] memory) {
        uint256[] memory tokenIds = _userTokenIds[user];
        Post[] memory userPosts = new Post[](tokenIds.length);
        
        for (uint256 i = 0; i < tokenIds.length; i++) {
            userPosts[i] = posts[tokenIds[i]];
        }
        
        return userPosts;
    }

    function getUserTokenIds(address user) external view returns (uint256[] memory) {
        return _userTokenIds[user];
    }

    function getAllPosts(uint256 offset, uint256 limit) 
        external 
        view 
        returns (Post[] memory) 
    {
        uint256 total = _allTokenIds.length;
        if (offset >= total) return new Post[](0);
        
        uint256 end = offset + limit > total ? total : offset + limit;
        uint256 resultLength = end - offset;
        
        Post[] memory result = new Post[](resultLength);
        
        for (uint256 i = 0; i < resultLength; i++) {
            uint256 index = total - 1 - (offset + i);
            result[i] = posts[_allTokenIds[index]];
        }
        
        return result;
    }

    function getAllPostsForSale(uint256 offset, uint256 limit) 
        external 
        view 
        returns (Post[] memory) 
    {
        uint256 total = _forSaleTokenIds.length;
        if (offset >= total) return new Post[](0);
        
        uint256 end = offset + limit > total ? total : offset + limit;
        uint256 resultLength = end - offset;
        
        Post[] memory result = new Post[](resultLength);
        
        for (uint256 i = 0; i < resultLength; i++) {
            result[i] = posts[_forSaleTokenIds[offset + i]];
        }
        
        return result;
    }

    function getUserSoldNfts(address user) external view returns (uint256[] memory) {
        return _userSoldTokenIds[user];
    }

    function getPriceHistory(uint256 tokenId) 
        external 
        view 
        returns (PriceHistory[] memory) 
    {
        return priceHistory[tokenId];
    }

    function totalSupply() external view returns (uint256) {
        return _tokenCounter - 1;
    }

    function totalForSale() external view returns (uint256) {
        return _forSaleTokenIds.length;
    }

    // ============ Admin Functions ============

    function setRoyaltyBps(uint256 newRoyaltyBps) external onlyOwner {
        if (newRoyaltyBps > MAX_ROYALTY_BPS) revert MaxRoyaltyExceeded();
        uint256 oldRoyalty = royaltyBps;
        royaltyBps = newRoyaltyBps;
        emit RoyaltyUpdated(oldRoyalty, newRoyaltyBps);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    // ============ Overrides ============

    function tokenURI(uint256 tokenId) 
        public 
        view 
        override 
        returns (string memory) 
    {
        _requireOwned(tokenId);
        return string(abi.encodePacked("ipfs://", posts[tokenId].contentHash));
    }
}
