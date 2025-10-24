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
   git clone https://github.com/your-repo/one-post-nft.git
   ```
2. Navigate to the frontend directory:
   ```sh
   cd one-post-nft/frontend
   ```
3. Install the dependencies:
   ```sh
   npm install
   ```

### Running the Development Server

To start the development server, run the following command:

```sh
npm run dev
```

This will start the application on `http://localhost:5173`.

## Building for Production

To create a production build, run:

```sh
npm run build
```

This will create a `dist` directory with the production-ready files.

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
