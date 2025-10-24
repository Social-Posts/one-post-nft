# 🏗 OnePost NFT - Base Network

<h4 align="center">
  <a href="https://docs.base.org/">Base Documentation</a> |
  <a href="https://base.org/">Base Website</a>
</h4>

An open-source NFT social media platform built on Base blockchain. Users can create, buy, and sell social media posts as NFTs with royalty payments to original creators.

⚙️ Built using Solidity, Foundry, OpenZeppelin, and deployed on Base Sepolia testnet.

- **ERC721 NFT Standard**: Full compliance with ERC721 for post ownership
- **Royalty System**: 5% automatic royalties to original post creators
- **Marketplace Features**: Buy/sell posts with price proposals and expiration
- **BASE Integration**: Native ERC20 token support for payments
- **Secure Transfers**: SafeERC20 for secure token operations

## 0. Requirements

Before you begin, you need to install the following tools:

- [Node (>= v18)](https://nodejs.org/en/download/)
- Yarn ([v1](https://classic.yarnpkg.com/en/docs/install/) or [v2+](https://yarnpkg.com/getting-started/install))
- [Git](https://git-scm.com/downloads)
- [Foundry](https://book.getfoundry.sh/getting-started/installation)

## 1. Install Foundry

Foundry is a blazing fast, portable and modular toolkit for Ethereum application development.

```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

## 2. Quickstart

### Clone and Setup

```bash
git clone <your-repo>
cd nft-socials-app
cd packages/smartcontract
forge install
```

### Build Contracts

```shell
forge build
```

### Run Tests

```shell
forge test
```

### Deploy to Base Sepolia

1. Set your private key (with 0x prefix):
```bash
export PRIVATE_KEY=0xyour_private_key_here
```

2. Deploy contracts:
```bash
forge script script/DeployOnePostNFT.s.sol --rpc-url https://sepolia.base.org --private-key $PRIVATE_KEY --broadcast --verify
```

## 3. Contract Architecture

### OnePostNFT.sol
- **ERC721 Implementation**: Full NFT standard with custom post storage
- **Post Creation**: Create posts with content hash and pricing
- **Marketplace**: Propose/cancel/buy posts with royalty system
- **Royalties**: 5% automatic payment to original creators on secondary sales

### MockBASE.sol
- **ERC20 Token**: Mock BASE token for testing (replace with real BASE token in production)
- **Minting**: Deployer can mint tokens for testing

## 4. Key Features

### Post Creation
```solidity
function createPost(string memory contentHash, uint256 price) external returns (uint256)
```
- Creates NFT with content hash
- Sets initial price (0 = not for sale)

### Marketplace
```solidity
function proposeSell(uint256 tokenId, uint256 price) external returns (uint256)
function buyPost(uint256 tokenId) external
```
- Propose sale with expiration (7 days)
- Buy posts with automatic royalty distribution

### Royalties
- 5% royalty to original creator on secondary sales
- Primary sales go directly to creator

## 5. Testing

Run comprehensive test suite:
```bash
forge test --match-path test/OnePostNFT.t.sol -v
```

Tests cover:
- ✅ Post creation and ownership
- ✅ Buying/selling with royalties
- ✅ Marketplace functionality
- ✅ Error cases and edge conditions

## 6. Deployment Addresses

After deployment, update these addresses in your frontend:

- **OnePostNFT**: `0x...`
- **BASE Token**: `0x...` (or use wrapped BASE on mainnet)

## 7. Frontend Integration

The contracts are designed to work with the React frontend in `packages/frontend/`. Key integration points:

- **Contract Address**: Update in `packages/frontend/src/contracts/deployedContracts.ts`
- **ABI**: Generated in `packages/frontend/public/abi.json`
- **Hooks**: Use custom hooks in `packages/frontend/src/hooks/usePostNFT.ts`

## 8. Foundry Commands

### Build
```shell
forge build
```

### Test
```shell
forge test
```

### Format
```shell
forge fmt
```

### Gas Snapshots
```shell
forge snapshot
```

### Local Node
```shell
anvil
```

### Deploy
```bash
forge script script/DeployOnePostNFT.s.sol --rpc-url <rpc_url> --private-key <private_key> --broadcast
```

### Interact
```shell
cast <subcommand>
```

## 9. Network Configuration

### Base Sepolia Testnet
- **RPC URL**: `https://sepolia.base.org`
- **Chain ID**: 84532
- **Currency**: ETH
- **Block Explorer**: https://sepolia.basescan.org

### Base Mainnet
- **RPC URL**: `https://mainnet.base.org`
- **Chain ID**: 8453
- **Currency**: ETH
- **Block Explorer**: https://basescan.org

## 10. Security Considerations

- ✅ **ReentrancyGuard**: Prevents reentrancy attacks
- ✅ **SafeERC20**: Secure token transfers
- ✅ **Access Control**: Only contract owner can modify certain parameters
- ✅ **Input Validation**: Comprehensive checks on all inputs

## 11. Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 12. License

This project is licensed under the MIT License - see the LICENSE file for details.

---

Built for the Base ecosystem