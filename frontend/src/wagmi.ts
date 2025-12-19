import { http, createConfig } from "wagmi";
import { base } from "wagmi/chains";
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
const chains = [base] as const;

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
    [base.id]: http((import.meta as any).env?.VITE_BASE_PROVIDER_URL || 'https://mainnet.base.org'),
  },
});

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}
