// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/IERC721Metadata.sol";
import "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract OnePostNFT is IERC721, IERC721Metadata {
    using Strings for uint256;
    using SafeERC20 for IERC20;

    struct Post {
        uint256 tokenId;
        address author;
        address currentOwner;
        string contentHash;
        uint256 timestamp;
        bool isForSale;
        uint256 price;
    }

    struct SellProposal {
        uint256 id;
        uint256 tokenId;
        address seller;
        address buyer;
        uint256 price;
        uint256 expiration;
        bool isActive;
    }

    // ERC721 storage
    mapping(uint256 => address) private _owners;
    mapping(address => uint256) private _balances;
    mapping(uint256 => address) private _tokenApprovals;
    mapping(address => mapping(address => bool)) private _operatorApprovals;

    // Post storage
    mapping(uint256 => Post) public posts;
    uint256 private _tokenCounter = 1;

    // Sell storage
    mapping(uint256 => SellProposal) public sellProposals;
    uint256 private _proposalCounter = 1;
    mapping(uint32 => uint256) private _postsForSale; // index -> token_id
    uint32 private _totalPostsForSale;

    // Indexes for queries
    mapping(uint32 => uint256) private _allPosts; // index -> token_id
    uint32 private _totalPosts;
    mapping(address => mapping(uint32 => uint256)) private _userPosts; // user -> index -> token_id
    mapping(address => uint32) private _userPostCount;

    // BASE token integration
    address public baseTokenAddress;

    // Sold NFTs tracking
    mapping(address => mapping(uint32 => uint256)) private _userSoldNfts; // user -> index -> token_id
    mapping(address => uint32) private _userSoldNftCount;

    // Creator royalties (5% default)
    uint256 public royaltyPercentage = 500; // 5% in basis points (500/10000)

    event PostCreated(
        uint256 indexed tokenId,
        address indexed author,
        string contentHash,
        uint256 price,
        uint256 timestamp
    );
    event PostListedForSale(
        uint256 indexed tokenId,
        address indexed seller,
        uint256 price
    );
    event SellProposed(
        uint256 indexed proposalId,
        address indexed seller,
        address indexed buyer,
        uint256 tokenId,
        uint256 price
    );
    event SellCancelled(uint256 indexed proposalId);
    event PostSold(
        uint256 indexed tokenId,
        address indexed seller,
        address indexed buyer,
        uint256 price,
        uint256 royaltyPaid
    );


    uint256 constant PROPOSAL_EXPIRATION = 604800; // 7 days

    constructor(address _baseTokenAddress) {
        baseTokenAddress = _baseTokenAddress;
    }

    // Core functionality
    function createPost(string memory contentHash, uint256 price) external returns (uint256) {
        uint256 tokenId = _tokenCounter;
        _mint(msg.sender, tokenId);

        Post memory post = Post({
            tokenId: tokenId,
            author: msg.sender,
            currentOwner: msg.sender,
            contentHash: contentHash,
            timestamp: block.timestamp,
            isForSale: price > 0,
            price: price
        });

        posts[tokenId] = post;

        // Update indexes
        _allPosts[_totalPosts] = tokenId;
        _totalPosts++;

        uint32 userCount = _userPostCount[msg.sender];
        _userPosts[msg.sender][userCount] = tokenId;
        _userPostCount[msg.sender] = userCount + 1;

        // If post is for sale, add to for_sale index
        if (price > 0) {
            _postsForSale[_totalPostsForSale] = tokenId;
            _totalPostsForSale++;

            emit PostListedForSale(tokenId, msg.sender, price);
        }

        _tokenCounter++;

        emit PostCreated(tokenId, msg.sender, contentHash, price, block.timestamp);
        return tokenId;
    }

    function proposeSell(uint256 tokenId, uint256 price) external returns (uint256) {
        require(ownerOf(tokenId) == msg.sender, "Not owner of token");
        require(price > 0, "Price must be greater than 0");

        uint256 proposalId = _proposalCounter;

        SellProposal memory proposal = SellProposal({
            id: proposalId,
            tokenId: tokenId,
            seller: msg.sender,
            buyer: address(0),
            price: price,
            expiration: block.timestamp + PROPOSAL_EXPIRATION,
            isActive: true
        });

        sellProposals[proposalId] = proposal;
        _proposalCounter++;

        // Update post to be for sale
        posts[tokenId].isForSale = true;
        posts[tokenId].price = price;

        // Add to for_sale index if not already there
        _postsForSale[_totalPostsForSale] = tokenId;
        _totalPostsForSale++;

        emit SellProposed(proposalId, msg.sender, address(0), tokenId, price);
        return proposalId;
    }

    function cancelSell(uint256 proposalId) external {
        SellProposal storage proposal = sellProposals[proposalId];
        require(proposal.isActive, "Proposal not active");
        require(proposal.seller == msg.sender, "Not proposal seller");

        // Remove from sale
        posts[proposal.tokenId].isForSale = false;
        posts[proposal.tokenId].price = 0;

        proposal.isActive = false;

        emit SellCancelled(proposalId);
    }

    function buyPost(uint256 tokenId, address tokenAddress) external payable {
        Post storage post = posts[tokenId];
        require(post.isForSale, "Post not for sale");
        require(post.currentOwner != msg.sender, "Cannot buy own post");
        require(post.price > 0, "Invalid price");

        address seller = post.currentOwner;
        uint256 price = post.price;

        // Calculate royalty for original creator (if not primary sale)
        uint256 royaltyAmount = (post.author != seller) ? (price * royaltyPercentage) / 10000 : 0;

        if (tokenAddress == address(0)) {
            // ETH payment
            require(msg.value == price, "Incorrect ETH amount sent");

            // Transfer royalty to original author if applicable
            if (royaltyAmount > 0) {
                payable(post.author).transfer(royaltyAmount);
            }

            // Transfer remaining amount to seller
            uint256 sellerAmount = price - royaltyAmount;
            if (sellerAmount > 0) {
                payable(seller).transfer(sellerAmount);
            }
        } else {
            // ERC20 token payment
            require(tokenAddress == baseTokenAddress, "Invalid token address");
            IERC20 baseToken = IERC20(baseTokenAddress);

            // Check ERC20 allowance and balance
            require(
                baseToken.allowance(msg.sender, address(this)) >= price,
                "Insufficient ERC20 allowance"
            );
            require(
                baseToken.balanceOf(msg.sender) >= price,
                "Insufficient ERC20 balance"
            );

            // Transfer royalty to original author if applicable
            if (royaltyAmount > 0) {
                baseToken.safeTransferFrom(msg.sender, post.author, royaltyAmount);
            }

            // Transfer remaining amount to seller
            uint256 sellerAmount = price - royaltyAmount;
            if (sellerAmount > 0) {
                baseToken.safeTransferFrom(msg.sender, seller, sellerAmount);
            }
        }

        // Execute sale - transfer NFT
        _transfer(seller, msg.sender, tokenId);

        // Update post status
        post.currentOwner = msg.sender;
        post.isForSale = false;
        post.price = 0;

        // Add to seller's sold NFTs list
        uint32 soldCount = _userSoldNftCount[seller];
        _userSoldNfts[seller][soldCount] = tokenId;
        _userSoldNftCount[seller] = soldCount + 1;

        emit PostSold(tokenId, seller, msg.sender, price, royaltyAmount);
    }

    // View functions
    function getUserPosts(address user) external view returns (Post[] memory) {
        uint32 count = _userPostCount[user];
        Post[] memory userPostsArray = new Post[](count);

        for (uint32 i = 0; i < count; i++) {
            uint256 tokenId = _userPosts[user][i];
            userPostsArray[i] = posts[tokenId];
        }

        return userPostsArray;
    }

    function getSellProposals(address user) external view returns (SellProposal[] memory) {
        uint256 currentProposalCounter = _proposalCounter;
        uint256 activeCount = 0;

        // First pass: count active proposals
        for (uint256 i = 1; i < currentProposalCounter; i++) {
            SellProposal memory proposal = sellProposals[i];
            if (proposal.seller == user && proposal.isActive && block.timestamp <= proposal.expiration) {
                activeCount++;
            }
        }

        SellProposal[] memory proposals = new SellProposal[](activeCount);
        uint256 index = 0;

        // Second pass: populate array
        for (uint256 i = 1; i < currentProposalCounter; i++) {
            SellProposal memory proposal = sellProposals[i];
            if (proposal.seller == user && proposal.isActive && block.timestamp <= proposal.expiration) {
                proposals[index] = proposal;
                index++;
            }
        }

        return proposals;
    }

    function getAllPosts(uint32 offset, uint32 limit) external view returns (Post[] memory) {
        uint32 total = _totalPosts;
        if (offset >= total) {
            return new Post[](0);
        }
        uint32 end = (offset + limit > total) ? total : offset + limit;
        uint32 resultLength = end - offset;

        Post[] memory result = new Post[](resultLength);
        for (uint32 i = 0; i < resultLength; i++) {
            uint256 tokenId = _allPosts[total - 1 - (offset + i)]; // Reverse order (newest first)
            result[i] = posts[tokenId];
        }

        return result;
    }

    function getPostByTokenId(uint256 tokenId) external view returns (Post memory) {
        return posts[tokenId];
    }

    function isPostForSale(uint256 tokenId) external view returns (bool) {
        return posts[tokenId].isForSale;
    }

    function getPostPrice(uint256 tokenId) external view returns (uint256) {
        return posts[tokenId].price;
    }

    function getAllPostsForSale(uint32 offset, uint32 limit) external view returns (Post[] memory) {
        uint32 total = _totalPostsForSale;
        if (offset >= total) {
            return new Post[](0);
        }
        uint32 end = (offset + limit > total) ? total : offset + limit;
        uint32 resultLength = end - offset;

        Post[] memory result = new Post[](resultLength);
        for (uint32 i = 0; i < resultLength; i++) {
            uint256 tokenId = _postsForSale[offset + i];
            Post memory post = posts[tokenId];
            if (post.isForSale) { // Double check it's still for sale
                result[i] = post;
            }
        }

        return result;
    }

    function getUserSoldNfts(address user) external view returns (uint256[] memory) {
        uint32 count = _userSoldNftCount[user];
        uint256[] memory soldNfts = new uint256[](count);

        for (uint32 i = 0; i < count; i++) {
            soldNfts[i] = _userSoldNfts[user][i];
        }

        return soldNfts;
    }

    // ERC721 Implementation
    function name() public pure returns (string memory) {
        return "NFT Social Posts";
    }

    function symbol() public pure returns (string memory) {
        return "NSP";
    }

    function tokenURI(uint256 tokenId) public view returns (string memory) {
        require(_exists(tokenId), "Token does not exist");
        return string(abi.encodePacked("ipfs://", posts[tokenId].contentHash));
    }

    function ownerOf(uint256 tokenId) public view returns (address) {
        address owner = _owners[tokenId];
        require(owner != address(0), "Token does not exist");
        return owner;
    }

    function balanceOf(address owner) public view returns (uint256) {
        require(owner != address(0), "Invalid owner");
        return _balances[owner];
    }

    function approve(address to, uint256 tokenId) public {
        address owner = ownerOf(tokenId);
        require(msg.sender == owner || isApprovedForAll(owner, msg.sender), "Not authorized");
        _tokenApprovals[tokenId] = to;
        emit Approval(owner, to, tokenId);
    }

    function getApproved(uint256 tokenId) public view returns (address) {
        require(_exists(tokenId), "Token does not exist");
        return _tokenApprovals[tokenId];
    }

    function setApprovalForAll(address operator, bool approved) public {
        require(msg.sender != operator, "Cannot approve self");
        _operatorApprovals[msg.sender][operator] = approved;
        emit ApprovalForAll(msg.sender, operator, approved);
    }

    function isApprovedForAll(address owner, address operator) public view returns (bool) {
        return _operatorApprovals[owner][operator];
    }

    function transferFrom(address from, address to, uint256 tokenId) public {
        require(
            msg.sender == from ||
            msg.sender == getApproved(tokenId) ||
            isApprovedForAll(from, msg.sender),
            "Not authorized"
        );
        _transfer(from, to, tokenId);
    }

    function _exists(uint256 tokenId) internal view returns (bool) {
        return _owners[tokenId] != address(0);
    }

    function _mint(address to, uint256 tokenId) internal {
        require(to != address(0), "Cannot mint to zero address");
        require(!_exists(tokenId), "Token already exists");

        _owners[tokenId] = to;
        _balances[to]++;

        emit Transfer(address(0), to, tokenId);
    }

    function _transfer(address from, address to, uint256 tokenId) internal {
        require(to != address(0), "Cannot transfer to zero");
        require(ownerOf(tokenId) == from, "Transfer from incorrect owner");

        // Update post ownership
        posts[tokenId].currentOwner = to;

        // Clear approvals
        delete _tokenApprovals[tokenId];

        // Update balances
        _balances[from]--;
        _balances[to]++;

        // Update ownership
        _owners[tokenId] = to;

        emit Transfer(from, to, tokenId);
    }

    // Minimal safeTransferFrom implementations to satisfy IERC721
    function safeTransferFrom(address from, address to, uint256 tokenId) external {
        transferFrom(from, to, tokenId);
    }

    function safeTransferFrom(address from, address to, uint256 tokenId, bytes calldata /*data*/) external {
        transferFrom(from, to, tokenId);
    }

    // IERC165 support
    function supportsInterface(bytes4 interfaceId) external pure returns (bool) {
        return
            interfaceId == type(IERC165).interfaceId ||
            interfaceId == type(IERC721).interfaceId ||
            interfaceId == type(IERC721Metadata).interfaceId;
    }
}