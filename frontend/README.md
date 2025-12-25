# OnePost NFT Frontend

This is the frontend for the OnePost NFT application, a decentralized social media platform where every post is an NFT.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- Node.js (v18 or later)
- npm

### Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/Social-Posts/one-post-nft.git
   ```
2. Navigate to the frontend directory:
   ```sh
   cd one-post-nft/frontend
   ```
3. Install the dependencies:
   ```sh
   npm install
   ```

### Environment Configuration

The application requires several environment variables to function correctly. Create a `.env.local` file in the `frontend` directory:

```sh
cp .env.local.example .env.local
```

Then edit `.env.local` with your configuration:

```env
# Contract address for OnePostNFT
VITE_CONTRACT_ADDRESS=0x...

# Supabase configuration (for chat and notifications)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here

# Network (mainnet or sepolia)
VITE_NETWORK=sepolia
```

#### Supabase Setup

The application uses **Supabase** for real-time chat and user data storage.

1. Create a project at [supabase.com](https://supabase.com)
2. Get your API credentials from **Settings > API**.
3. Run the SQL scripts provided in `SUPABASE_SETUP.md` in your Supabase SQL Editor to initialize the database schema.

#### IPFS Setup

The application uses Pinata for IPFS storage. Ensure you have your Pinata API keys if you plan to modify the IPFS service. Default configuration uses a public gateway for reading.

### Running the Development Server

To start the development server, run the following command:

```sh
npm run dev
```

This will start the application on `http://localhost:5173`.

### Local Development Workflow

To link the frontend with a locally running blockchain (e.g., Anvil):

1. **Deploy Contracts Locally:**
   Navigate to the `smartcontract` directory and deploy your contracts to your local node.

   ```sh
   cd smartcontract
   forge script script/Deploy.s.sol --rpc-url http://localhost:8545 --broadcast
   ```

2. **Update Frontend Contract Info:**
   The frontend uses the contract ABIs and addresses stored in `frontend/src/contracts/deployedContracts.ts`. When you deploy locally, ensure this file is updated with the local contract address.

3. **Update Environment Variables:**
   Set `VITE_CONTRACT_ADDRESS` in your `.env.local` to the address of your locally deployed contract.

4. **Connect Wallet to Local Network:**
   Configure your wallet (e.g., MetaMask) to connect to `http://localhost:8545` (Chain ID 31337 for Anvil).

## Building for Production

To create a production build, run:

```sh
npm run build
```

This will create a `dist` directory with the production-ready files. Ensure all environment variables are correctly set in your CI/CD environment.

## Network

The application is configured to run on the **Base Sepolia test network**. Make sure your wallet is connected to this network to interact with the application.

## Key Features

- **NFT Creation:** Create a new post and mint it as an NFT on the Base network.
- **Marketplace:** Browse, buy, and sell NFT posts.
- **Real-time Chat:** Chat with other users on the platform.
- **User Profiles:** View your own and other users' profiles and NFT collections.
- **Wallet Integration:** Connect your wallet using RainbowKit.

## Technologies Used

- [Vite](https://vitejs.dev/): A next-generation frontend tooling that is fast and lean.
- [React](https://reactjs.org/): A JavaScript library for building user interfaces.
- [TypeScript](https://www.typescriptlang.org/): A typed superset of JavaScript that compiles to plain JavaScript.
- [wagmi](https://wagmi.sh/): A collection of React Hooks for Ethereum.
- [RainbowKit](https://www.rainbowkit.com/): A React library that makes it easy to add wallet connection to your dapp.
- [Tailwind CSS](https://tailwindcss.com/): A utility-first CSS framework for rapid UI development.
- [shadcn/ui](https://ui.shadcn.com/): A collection of re-usable components built using Radix UI and Tailwind CSS.

## Folder Structure

```
frontend/
├── public/         # Static assets
├── src/
│   ├── components/   # Reusable React components
│   ├── context/      # React context providers
│   ├── hooks/        # Custom React hooks
│   ├── services/     # Services for interacting with contracts, IPFS, etc.
│   ├── pages/        # Main pages of the application
│   ├── styles/       # Global styles
│   └── utils/        # Utility functions
├── vite.config.ts  # Vite configuration
└── ...
```

## Troubleshooting

- **Wallet Connection Issues:** Ensure your wallet is on the correct network (Base Sepolia or Localhost).
- **IPFS Upload Failures:** Check your Pinata API keys and ensure you have a stable internet connection.
- **Chat Not Working:** Verify your Supabase credentials and ensure the database schema is correctly initialized.
- **Node Version:** If you encounter build errors, ensure you are using Node.js v18 or later.
