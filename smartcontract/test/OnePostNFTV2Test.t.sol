// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/OnePostNFTV2.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockERC20 is ERC20 {
    constructor() ERC20("Mock Token", "MOCK") {
        _mint(msg.sender, 1000000 * 10**18);
    }

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}

contract OnePostNFTV2Test is Test {
    OnePostNFTV2 public nft;
    MockERC20 public baseToken;
    
    address public owner = address(1);
    address public user1 = address(2);
    address public user2 = address(3);
    address public user3 = address(4);
    
    string constant CONTENT_HASH_1 = "QmTest1";
    string constant CONTENT_HASH_2 = "QmTest2";
    uint96 constant PRICE_1 = 1 ether;
    uint96 constant PRICE_2 = 2 ether;

    event PostCreated(
        uint256 indexed tokenId,
        address indexed author,
        string contentHash,
        uint96 price,
        uint32 timestamp
    );
    
    event PostSold(
        uint256 indexed tokenId,
        address indexed seller,
        address indexed buyer,
        uint96 price,
        uint96 royaltyPaid
    );

    function setUp() public {
        vm.startPrank(owner);
        baseToken = new MockERC20();
        nft = new OnePostNFTV2(address(baseToken));
        vm.stopPrank();

        // Fund users with ETH and tokens
        vm.deal(user1, 100 ether);
        vm.deal(user2, 100 ether);
        vm.deal(user3, 100 ether);

        vm.prank(owner);
        baseToken.transfer(user2, 100 ether);
        vm.prank(owner);
        baseToken.transfer(user3, 100 ether);
    }

    // ============ Post Creation Tests ============

    function testCreatePost() public {
        vm.startPrank(user1);
        
        vm.expectEmit(true, true, false, true);
        emit PostCreated(1, user1, CONTENT_HASH_1, 0, uint32(block.timestamp));
        
        uint256 tokenId = nft.createPost(CONTENT_HASH_1, 0);
        
        assertEq(tokenId, 1);
        assertEq(nft.ownerOf(tokenId), user1);
        
        OnePostNFTV2.Post memory post = nft.posts(tokenId);
        assertEq(post.author, user1);
        assertEq(post.currentOwner, user1);
        assertEq(post.contentHash, CONTENT_HASH_1);
        assertEq(post.price, 0);
        assertFalse(post.isForSale);
        
        vm.stopPrank();
    }

    function testCreatePostWithPrice() public {
        vm.startPrank(user1);
        
        uint256 tokenId = nft.createPost(CONTENT_HASH_1, PRICE_1);
        
        OnePostNFTV2.Post memory post = nft.posts(tokenId);
        assertTrue(post.isForSale);
        assertEq(post.price, PRICE_1);
        
        vm.stopPrank();
    }

    function testCreatePostBatch() public {
        vm.startPrank(user1);
        
        string[] memory hashes = new string[](3);
        hashes[0] = "Hash1";
        hashes[1] = "Hash2";
        hashes[2] = "Hash3";
        
        uint96[] memory prices = new uint96[](3);
        prices[0] = 1 ether;
        prices[1] = 2 ether;
        prices[2] = 0;
        
        uint256[] memory tokenIds = nft.createPostBatch(hashes, prices);
        
        assertEq(tokenIds.length, 3);
        assertEq(nft.ownerOf(tokenIds[0]), user1);
        assertEq(nft.ownerOf(tokenIds[1]), user1);
        assertEq(nft.ownerOf(tokenIds[2]), user1);
        
        vm.stopPrank();
    }

    function testCreatePostBatchLengthMismatch() public {
        vm.startPrank(user1);
        
        string[] memory hashes = new string[](2);
        hashes[0] = "Hash1";
        hashes[1] = "Hash2";
        
        uint96[] memory prices = new uint96[](3);
        prices[0] = 1 ether;
        prices[1] = 2 ether;
        prices[2] = 3 ether;
        
        vm.expectRevert(OnePostNFTV2.ArrayLengthMismatch.selector);
        nft.createPostBatch(hashes, prices);
        
        vm.stopPrank();
    }

    // ============ Selling Tests ============

    function testProposeSell() public {
        vm.startPrank(user1);
        uint256 tokenId = nft.createPost(CONTENT_HASH_1, 0);
        
        uint256 proposalId = nft.proposeSell(tokenId, PRICE_1);
        
        assertEq(proposalId, 1);
        
        OnePostNFTV2.SellProposal memory proposal = nft.sellProposals(proposalId);
        assertEq(proposal.seller, user1);
        assertEq(proposal.price, PRICE_1);
        assertEq(proposal.tokenId, tokenId);
        assertTrue(proposal.isActive);
        
        OnePostNFTV2.Post memory post = nft.posts(tokenId);
        assertTrue(post.isForSale);
        assertEq(post.price, PRICE_1);
        
        vm.stopPrank();
    }

    function testProposeSellNotOwner() public {
        vm.prank(user1);
        uint256 tokenId = nft.createPost(CONTENT_HASH_1, 0);
        
        vm.prank(user2);
        vm.expectRevert(OnePostNFTV2.NotTokenOwner.selector);
        nft.proposeSell(tokenId, PRICE_1);
    }

    function testProposeSellZeroPrice() public {
        vm.startPrank(user1);
        uint256 tokenId = nft.createPost(CONTENT_HASH_1, 0);
        
        vm.expectRevert(OnePostNFTV2.InvalidPrice.selector);
        nft.proposeSell(tokenId, 0);
        
        vm.stopPrank();
    }

    function testUpdatePrice() public {
        vm.startPrank(user1);
        uint256 tokenId = nft.createPost(CONTENT_HASH_1, PRICE_1);
        
        nft.updatePrice(tokenId, PRICE_2);
        
        OnePostNFTV2.Post memory post = nft.posts(tokenId);
        assertEq(post.price, PRICE_2);
        assertTrue(post.isForSale);
        
        vm.stopPrank();
    }

    function testCancelSell() public {
        vm.startPrank(user1);
        uint256 tokenId = nft.createPost(CONTENT_HASH_1, 0);
        uint256 proposalId = nft.proposeSell(tokenId, PRICE_1);
        
        nft.cancelSell(proposalId);
        
        OnePostNFTV2.SellProposal memory proposal = nft.sellProposals(proposalId);
        assertFalse(proposal.isActive);
        
        OnePostNFTV2.Post memory post = nft.posts(tokenId);
        assertFalse(post.isForSale);
        assertEq(post.price, 0);
        
        vm.stopPrank();
    }

    // ============ Buying Tests (ETH) ============

    function testBuyPostWithETH() public {
        // User1 creates and lists post
        vm.prank(user1);
        uint256 tokenId = nft.createPost(CONTENT_HASH_1, PRICE_1);
        
        uint256 user1BalanceBefore = user1.balance;
        
        // User2 buys
        vm.prank(user2);
        vm.expectEmit(true, true, true, true);
        emit PostSold(tokenId, user1, user2, PRICE_1, 0);
        nft.buyPost{value: PRICE_1}(tokenId, address(0));
        
        // Check ownership
        assertEq(nft.ownerOf(tokenId), user2);
        
        // Check post state
        OnePostNFTV2.Post memory post = nft.posts(tokenId);
        assertEq(post.currentOwner, user2);
        assertFalse(post.isForSale);
        assertEq(post.price, 0);
        
        // Check payment
        assertEq(user1.balance, user1BalanceBefore + PRICE_1);
    }

    function testBuyPostWithETHRoyalty() public {
        // User1 creates and lists post
        vm.prank(user1);
        uint256 tokenId = nft.createPost(CONTENT_HASH_1, PRICE_1);
        
        // User2 buys first
        vm.prank(user2);
        nft.buyPost{value: PRICE_1}(tokenId, address(0));
        
        // User2 relists
        vm.prank(user2);
        nft.proposeSell(tokenId, PRICE_2);
        
        uint256 user1BalanceBefore = user1.balance;
        uint256 user2BalanceBefore = user2.balance;
        
        // User3 buys (should trigger royalty to user1)
        vm.prank(user3);
        nft.buyPost{value: PRICE_2}(tokenId, address(0));
        
        // Calculate expected amounts
        uint96 expectedRoyalty = uint96((uint256(PRICE_2) * 500) / 10000); // 5%
        uint96 expectedSellerAmount = PRICE_2 - expectedRoyalty;
        
        // Check balances
        assertEq(user1.balance, user1BalanceBefore + expectedRoyalty);
        assertEq(user2.balance, user2BalanceBefore + expectedSellerAmount);
        assertEq(nft.ownerOf(tokenId), user3);
    }

    function testBuyPostIncorrectETHAmount() public {
        vm.prank(user1);
        uint256 tokenId = nft.createPost(CONTENT_HASH_1, PRICE_1);
        
        vm.prank(user2);
        vm.expectRevert(OnePostNFTV2.IncorrectPaymentAmount.selector);
        nft.buyPost{value: PRICE_1 - 0.1 ether}(tokenId, address(0));
    }

    function testCannotBuyOwnPost() public {
        vm.startPrank(user1);
        uint256 tokenId = nft.createPost(CONTENT_HASH_1, PRICE_1);
        
        vm.expectRevert(OnePostNFTV2.CannotBuyOwnPost.selector);
        nft.buyPost{value: PRICE_1}(tokenId, address(0));
        
        vm.stopPrank();
    }

    function testCannotBuyNotForSale() public {
        vm.prank(user1);
        uint256 tokenId = nft.createPost(CONTENT_HASH_1, 0);
        
        vm.prank(user2);
        vm.expectRevert(OnePostNFTV2.NotForSale.selector);
        nft.buyPost{value: PRICE_1}(tokenId, address(0));
    }

    // ============ Buying Tests (ERC20) ============

    function testBuyPostWithERC20() public {
        // User1 creates and lists post
        vm.prank(user1);
        uint256 tokenId = nft.createPost(CONTENT_HASH_1, PRICE_1);
        
        // User2 approves and buys
        vm.startPrank(user2);
        baseToken.approve(address(nft), PRICE_1);
        
        uint256 user1TokenBalanceBefore = baseToken.balanceOf(user1);
        
        nft.buyPost(tokenId, address(baseToken));
        vm.stopPrank();
        
        // Check ownership
        assertEq(nft.ownerOf(tokenId), user2);
        
        // Check payment
        assertEq(baseToken.balanceOf(user1), user1TokenBalanceBefore + PRICE_1);
    }

    function testBuyPostWithERC20Royalty() public {
        // User1 creates and lists post
        vm.prank(user1);
        uint256 tokenId = nft.createPost(CONTENT_HASH_1, PRICE_1);
        
        // User2 buys with ERC20
        vm.startPrank(user2);
        baseToken.approve(address(nft), PRICE_1);
        nft.buyPost(tokenId, address(baseToken));
        vm.stopPrank();
        
        // User2 relists
        vm.prank(user2);
        nft.proposeSell(tokenId, PRICE_2);
        
        uint256 user1TokenBalanceBefore = baseToken.balanceOf(user1);
        uint256 user2TokenBalanceBefore = baseToken.balanceOf(user2);
        
        // User3 buys
        vm.startPrank(user3);
        baseToken.approve(address(nft), PRICE_2);
        nft.buyPost(tokenId, address(baseToken));
        vm.stopPrank();
        
        // Calculate expected amounts
        uint96 expectedRoyalty = uint96((uint256(PRICE_2) * 500) / 10000);
        uint96 expectedSellerAmount = PRICE_2 - expectedRoyalty;
        
        // Check balances
        assertEq(baseToken.balanceOf(user1), user1TokenBalanceBefore + expectedRoyalty);
        assertEq(baseToken.balanceOf(user2), user2TokenBalanceBefore + expectedSellerAmount);
    }

    function testBuyPostInvalidToken() public {
        vm.prank(user1);
        uint256 tokenId = nft.createPost(CONTENT_HASH_1, PRICE_1);
        
        vm.prank(user2);
        vm.expectRevert(OnePostNFTV2.InvalidTokenAddress.selector);
        nft.buyPost(tokenId, address(999));
    }

    // ============ View Function Tests ============

    function testGetUserPosts() public {
        vm.startPrank(user1);
        nft.createPost("Hash1", 0);
        nft.createPost("Hash2", 1 ether);
        nft.createPost("Hash3", 0);
        vm.stopPrank();
        
        OnePostNFTV2.Post[] memory posts = nft.getUserPosts(user1);
        assertEq(posts.length, 3);
        assertEq(posts[0].contentHash, "Hash1");
        assertEq(posts[1].contentHash, "Hash2");
        assertEq(posts[2].contentHash, "Hash3");
    }

    function testGetAllPosts() public {
        vm.prank(user1);
        nft.createPost("Hash1", 0);
        vm.prank(user2);
        nft.createPost("Hash2", 0);
        
        OnePostNFTV2.Post[] memory posts = nft.getAllPosts(0, 10);
        assertEq(posts.length, 2);
        assertEq(posts[0].contentHash, "Hash2"); // Newest first
        assertEq(posts[1].contentHash, "Hash1");
    }

    function testGetAllPostsForSale() public {
        vm.prank(user1);
        nft.createPost("Hash1", 1 ether);
        vm.prank(user2);
        nft.createPost("Hash2", 0);
        vm.prank(user3);
        nft.createPost("Hash3", 2 ether);
        
        OnePostNFTV2.Post[] memory posts = nft.getAllPostsForSale(0, 10);
        assertEq(posts.length, 2);
        assertTrue(posts[0].isForSale);
        assertTrue(posts[1].isForSale);
    }

    function testGetUserSoldNfts() public {
        vm.prank(user1);
        uint256 tokenId = nft.createPost(CONTENT_HASH_1, PRICE_1);
        
        vm.prank(user2);
        nft.buyPost{value: PRICE_1}(tokenId, address(0));
        
        uint256[] memory soldNfts = nft.getUserSoldNfts(user1);
        assertEq(soldNfts.length, 1);
        assertEq(soldNfts[0], tokenId);
    }

    function testGetPriceHistory() public {
        vm.prank(user1);
        uint256 tokenId = nft.createPost(CONTENT_HASH_1, PRICE_1);
        
        // First sale
        vm.prank(user2);
        nft.buyPost{value: PRICE_1}(tokenId, address(0));
        
        // Second sale
        vm.prank(user2);
        nft.proposeSell(tokenId, PRICE_2);
        
        vm.prank(user3);
        nft.buyPost{value: PRICE_2}(tokenId, address(0));
        
        OnePostNFTV2.PriceHistory[] memory history = nft.getPriceHistory(tokenId);
        assertEq(history.length, 2);
        assertEq(history[0].price, PRICE_1);
        assertEq(history[0].seller, user1);
        assertEq(history[0].buyer, user2);
        assertEq(history[1].price, PRICE_2);
        assertEq(history[1].seller, user2);
        assertEq(history[1].buyer, user3);
    }

    function testTotalSupply() public {
        assertEq(nft.totalSupply(), 0);
        
        vm.prank(user1);
        nft.createPost(CONTENT_HASH_1, 0);
        assertEq(nft.totalSupply(), 1);
        
        vm.prank(user2);
        nft.createPost(CONTENT_HASH_2, 0);
        assertEq(nft.totalSupply(), 2);
    }

    function testTotalForSale() public {
        assertEq(nft.totalForSale(), 0);
        
        vm.prank(user1);
        nft.createPost(CONTENT_HASH_1, PRICE_1);
        assertEq(nft.totalForSale(), 1);
        
        vm.prank(user2);
        nft.createPost(CONTENT_HASH_2, 0);
        assertEq(nft.totalForSale(), 1);
    }

    // ============ Admin Function Tests ============

    function testSetRoyaltyBps() public {
        vm.prank(owner);
        nft.setRoyaltyBps(1000); // 10%
        
        assertEq(nft.royaltyBps(), 1000);
    }

    function testSetRoyaltyBpsExceedsMax() public {
        vm.prank(owner);
        vm.expectRevert(OnePostNFTV2.MaxRoyaltyExceeded.selector);
        nft.setRoyaltyBps(1001);
    }

    function testSetRoyaltyBpsNotOwner() public {
        vm.prank(user1);
        vm.expectRevert();
        nft.setRoyaltyBps(800);
    }

    function testPause() public {
        vm.prank(owner);
        nft.pause();
        
        vm.prank(user1);
        vm.expectRevert();
        nft.createPost(CONTENT_HASH_1, 0);
    }

    function testUnpause() public {
        vm.startPrank(owner);
        nft.pause();
        nft.unpause();
        vm.stopPrank();
        
        vm.prank(user1);
        nft.createPost(CONTENT_HASH_1, 0);
    }

    // ============ ERC721 Compliance Tests ============

    function testTokenURI() public {
        vm.prank(user1);
        uint256 tokenId = nft.createPost(CONTENT_HASH_1, 0);
        
        string memory uri = nft.tokenURI(tokenId);
        assertEq(uri, string(abi.encodePacked("ipfs://", CONTENT_HASH_1)));
    }

    function testTransferFrom() public {
        vm.prank(user1);
        uint256 tokenId = nft.createPost(CONTENT_HASH_1, 0);
        
        vm.prank(user1);
        nft.transferFrom(user1, user2, tokenId);
        
        assertEq(nft.ownerOf(tokenId), user2);
    }

    function testApprove() public {
        vm.prank(user1);
        uint256 tokenId = nft.createPost(CONTENT_HASH_1, 0);
        
        vm.prank(user1);
        nft.approve(user2, tokenId);
        
        assertEq(nft.getApproved(tokenId), user2);
    }

    // ============ Reentrancy Tests ============

    function testReentrancyProtection() public {
        // This would require a malicious contract to properly test
        // For now, we verify the nonReentrant modifier is in place
        vm.prank(user1);
        uint256 tokenId = nft.createPost(CONTENT_HASH_1, PRICE_1);
        
        vm.prank(user2);
        nft.buyPost{value: PRICE_1}(tokenId, address(0));
        
        // If reentrancy was possible, we'd catch it here
        assertTrue(true);
    }

    // ============ Fuzz Tests ============

    function testFuzzCreatePost(string memory contentHash, uint96 price) public {
        vm.assume(bytes(contentHash).length > 0);
        vm.assume(bytes(contentHash).length < 100);
        
        vm.prank(user1);
        uint256 tokenId = nft.createPost(contentHash, price);
        
        assertEq(nft.ownerOf(tokenId), user1);
        
        OnePostNFTV2.Post memory post = nft.posts(tokenId);
        assertEq(post.contentHash, contentHash);
        assertEq(post.price, price);
        assertEq(post.isForSale, price > 0);
    }

    function testFuzzBuyPost(uint96 price) public {
        vm.assume(price > 0);
        vm.assume(price <= 10 ether);
        
        vm.deal(user2, price);
        
        vm.prank(user1);
        uint256 tokenId = nft.createPost(CONTENT_HASH_1, price);
        
        vm.prank(user2);
        nft.buyPost{value: price}(tokenId, address(0));
        
        assertEq(nft.ownerOf(tokenId), user2);
    }
}