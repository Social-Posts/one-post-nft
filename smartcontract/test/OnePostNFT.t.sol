// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test, console} from "forge-std/Test.sol";
import {OnePostNFT} from "../src/OnePostNFT.sol";
import {MockBASE} from "../src/MockBASE.sol";

contract OnePostNFTTest is Test {
    OnePostNFT public onePostNFT;
    MockBASE public mockBASE;

    address public user1 = vm.addr(1);
    address public user2 = vm.addr(2);
    address public user3 = vm.addr(3);

    function setUp() public {
        mockBASE = new MockBASE();
        onePostNFT = new OnePostNFT(address(mockBASE));

        // Mint some BASE to users
        mockBASE.mint(user1, 1000 * 10**18);
        mockBASE.mint(user2, 1000 * 10**18);
        mockBASE.mint(user3, 1000 * 10**18);

        // Approve the contract to spend tokens
        vm.prank(user1);
        mockBASE.approve(address(onePostNFT), 1000 * 10**18);
        vm.prank(user2);
        mockBASE.approve(address(onePostNFT), 1000 * 10**18);
        vm.prank(user3);
        mockBASE.approve(address(onePostNFT), 1000 * 10**18);
    }

    function testCreatePost() public {
        vm.prank(user1);
        uint256 tokenId = onePostNFT.createPost("ipfs://QmTest", 100 * 10**18);

        assertEq(tokenId, 1);
        assertEq(onePostNFT.ownerOf(tokenId), user1);

        OnePostNFT.Post memory post = onePostNFT.getPostByTokenId(tokenId);
        assertEq(post.author, user1);
        assertEq(post.currentOwner, user1);
        assertEq(post.contentHash, "ipfs://QmTest");
        assertEq(post.price, 100 * 10**18);
        assertTrue(post.isForSale);
    }

    function testProposeSell() public {
        vm.prank(user1);
        uint256 tokenId = onePostNFT.createPost("ipfs://QmTest", 0);

        vm.prank(user1);
        uint256 proposalId = onePostNFT.proposeSell(tokenId, 200 * 10**18);

        assertEq(proposalId, 1);

        (uint256 id, uint256 tId, address seller, address buyer, uint256 price, uint256 expiration, bool isActive) = onePostNFT.sellProposals(proposalId);
        OnePostNFT.SellProposal memory proposal = OnePostNFT.SellProposal(id, tId, seller, buyer, price, expiration, isActive);
        assertEq(proposal.tokenId, tokenId);
        assertEq(proposal.seller, user1);
        assertEq(proposal.price, 200 * 10**18);
        assertTrue(proposal.isActive);

        OnePostNFT.Post memory post = onePostNFT.getPostByTokenId(tokenId);
        assertTrue(post.isForSale);
        assertEq(post.price, 200 * 10**18);
    }

    function testBuyPostWithETH() public {
        vm.prank(user1);
        uint256 tokenId = onePostNFT.createPost("ipfs://QmTest", 1 ether);

        vm.deal(user2, 2 ether);
        console.log("user2 balance before buyPost:", address(user2).balance);
        console.log("post price:", onePostNFT.getPostPrice(tokenId));

        vm.prank(user2);
        onePostNFT.buyPost{value: 1 ether}(tokenId, address(0));

        assertEq(onePostNFT.ownerOf(tokenId), user2);

        OnePostNFT.Post memory post = onePostNFT.getPostByTokenId(tokenId);
        assertEq(post.currentOwner, user2);
        assertFalse(post.isForSale);
        assertEq(post.price, 0);

        assertEq(address(user1).balance, 1 ether);
        assertEq(address(user2).balance, 1 ether);
    }

    function testBuyPostWithMockToken() public {
        vm.prank(user1);
        uint256 tokenId = onePostNFT.createPost("ipfs://QmTest", 100 * 10**18);

        vm.prank(user2);
        onePostNFT.buyPost(tokenId, address(mockBASE));

        assertEq(onePostNFT.ownerOf(tokenId), user2);

        OnePostNFT.Post memory post = onePostNFT.getPostByTokenId(tokenId);
        assertEq(post.currentOwner, user2);
        assertFalse(post.isForSale);
        assertEq(post.price, 0);

        // Check balances
        assertEq(mockBASE.balanceOf(user1), 1100 * 10**18);
        assertEq(mockBASE.balanceOf(user2), 900 * 10**18);
    }

    function testBuyPostWithRoyaltyWithETH() public {
        vm.prank(user1);
        uint256 tokenId = onePostNFT.createPost("ipfs://QmTest", 1 ether);

        vm.deal(user2, 2 ether);
        vm.prank(user2);
        onePostNFT.buyPost{value: 1 ether}(tokenId, address(0));

        vm.prank(user2);
        onePostNFT.proposeSell(tokenId, 2 ether);

        vm.deal(user3, 3 ether);
        vm.prank(user3);
        onePostNFT.buyPost{value: 2 ether}(tokenId, address(0));

        assertEq(address(user1).balance, 1 ether + (2 ether * 500) / 10000);
        assertEq(address(user2).balance, 1 ether + (2 ether - (2 ether * 500) / 10000));
        assertEq(address(user3).balance, 1 ether);
    }

    function testBuyPostWithRoyaltyWithMockToken() public {
        vm.prank(user1);
        uint256 tokenId = onePostNFT.createPost("ipfs://QmTest", 100 * 10**18);

        vm.prank(user2);
        onePostNFT.buyPost(tokenId, address(mockBASE));

        vm.prank(user2);
        onePostNFT.proposeSell(tokenId, 200 * 10**18);

        vm.prank(user3);
        onePostNFT.buyPost(tokenId, address(mockBASE));

        assertEq(mockBASE.balanceOf(user1), 1000 * 10**18 + 100 * 10**18 + (200 * 10**18 * 500) / 10000);
        assertEq(mockBASE.balanceOf(user2), 1000 * 10**18 - 100 * 10**18 + (200 * 10**18 - (200 * 10**18 * 500) / 10000));
        assertEq(mockBASE.balanceOf(user3), 1000 * 10**18 - 200 * 10**18);
    }

    function testCancelSell() public {
        vm.prank(user1);
        uint256 tokenId = onePostNFT.createPost("ipfs://QmTest", 0);

        vm.prank(user1);
        uint256 proposalId = onePostNFT.proposeSell(tokenId, 100 * 10**18);

        vm.prank(user1);
        onePostNFT.cancelSell(proposalId);

        (uint256 id, uint256 tId, address seller, address buyer, uint256 price, uint256 expiration, bool isActive) = onePostNFT.sellProposals(proposalId);
        OnePostNFT.SellProposal memory proposal = OnePostNFT.SellProposal(id, tId, seller, buyer, price, expiration, isActive);
        assertFalse(proposal.isActive);

        OnePostNFT.Post memory post = onePostNFT.getPostByTokenId(tokenId);
        assertFalse(post.isForSale);
    }

    function testGetUserPosts() public {
        vm.prank(user1);
        onePostNFT.createPost("ipfs://QmTest1", 0);

        vm.prank(user1);
        onePostNFT.createPost("ipfs://QmTest2", 0);

        OnePostNFT.Post[] memory posts = onePostNFT.getUserPosts(user1);
        assertEq(posts.length, 2);
        assertEq(posts[0].contentHash, "ipfs://QmTest1");
        assertEq(posts[1].contentHash, "ipfs://QmTest2");
    }

    function testGetAllPosts() public {
        vm.prank(user1);
        onePostNFT.createPost("ipfs://QmTest1", 0);

        vm.prank(user2);
        onePostNFT.createPost("ipfs://QmTest2", 0);

        OnePostNFT.Post[] memory posts = onePostNFT.getAllPosts(0, 10);
        assertEq(posts.length, 2);
        // Should be in reverse order (newest first)
        assertEq(posts[0].contentHash, "ipfs://QmTest2");
        assertEq(posts[1].contentHash, "ipfs://QmTest1");
    }

    function testGetAllPostsForSale() public {
        vm.prank(user1);
        onePostNFT.createPost("ipfs://QmTest1", 100 * 10**18);

        vm.prank(user2);
        onePostNFT.createPost("ipfs://QmTest2", 0);

        vm.prank(user2);
        onePostNFT.proposeSell(2, 200 * 10**18);

        OnePostNFT.Post[] memory posts = onePostNFT.getAllPostsForSale(0, 10);
        assertEq(posts.length, 2);
    }

    function testTokenURI() public {
        vm.prank(user1);
        uint256 tokenId = onePostNFT.createPost("QmTest", 0);

        string memory uri = onePostNFT.tokenURI(tokenId);
        assertEq(uri, "ipfs://QmTest");
    }

    function testCannotBuyOwnPost() public {
        vm.prank(user1);
        uint256 tokenId = onePostNFT.createPost("ipfs://QmTest", 100 * 10**18);

        vm.prank(user1);
        vm.expectRevert("Cannot buy own post");
        onePostNFT.buyPost(tokenId, address(mockBASE));
    }

    function testCannotProposeSellNotOwner() public {
        vm.prank(user1);
        uint256 tokenId = onePostNFT.createPost("ipfs://QmTest", 0);

        vm.prank(user2);
        vm.expectRevert("Not owner of token");
        onePostNFT.proposeSell(tokenId, 100 * 10**18);
    }
}