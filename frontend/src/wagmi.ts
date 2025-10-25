import { http, createConfig } from "wagmi";
import { baseSepolia } from "wagmi/chains";
import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import {
  metaMaskWallet,
  coinbaseWallet,
  walletConnectWallet,
  injectedWallet,
  braveWallet,
} from "@rainbow-me/rainbowkit/wallets";

const projectId =
  import.meta.env.VITE_WC_PROJECT_ID ?? "f8fc66aef70efafe5c553752d3d4e236";
const chains = [baseSepolia] as const;

// RainbowKit v2 expects wallet builder functions (not invoked)
// and global options passed to connectorsForWallets.
const connectors = connectorsForWallets(
  [
    {
      groupName: "Popular",
      wallets: [
        metaMaskWallet,
        coinbaseWallet,
        walletConnectWallet,
        injectedWallet,
        braveWallet,
      ],
    },
  ],
  { appName: "One Post Nft", projectId }
);

export const config = createConfig({
  chains,
  connectors,
  transports: {
    [baseSepolia.id]: http(
      "https://base-sepolia.g.alchemy.com/v2/SRtSnNb7fiMWCFojDi_2y63y3H5YNz1X"
    ),
  },
});

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}
