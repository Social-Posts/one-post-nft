import { base, baseSepolia } from "wagmi/chains";
import { Chain } from "wagmi/chains";

export type ScaffoldConfig = {
  targetNetworks: readonly Chain[];
  pollingInterval: number;
  onlyLocalBurnerWallet: boolean;
  rpcProviderUrl: {
    [key: string]: string;
  };
  walletAutoConnect: boolean;
  autoConnectTTL: number;
};

const scaffoldConfig = {
  targetNetworks: [baseSepolia],
  // Only show the Burner Wallet when running on Base Sepolia
  onlyLocalBurnerWallet: false,
  rpcProviderUrl: {
    baseSepolia:
      process.env.NEXT_PUBLIC_BASE_SEPOLIA_PROVIDER_URL ||
      process.env.NEXT_PUBLIC_PROVIDER_URL ||
      "",
    base:
      process.env.NEXT_PUBLIC_BASE_PROVIDER_URL ||
      process.env.NEXT_PUBLIC_PROVIDER_URL ||
      "",
  },
  // The interval at which your front-end polls the RPC servers for new data
  // it has no effect if you only target the local network (default is 30_000)
  pollingInterval: 30_000,
  /**
   * Auto connect:
   * 1. If the user was connected into a wallet before, on page reload reconnect automatically
   * 2. If user is not connected to any wallet:  On reload, connect to burner wallet if burnerWallet.enabled is true && burnerWallet.onlyLocal is false
   */
  autoConnectTTL: 60000,
  walletAutoConnect: true,
} as const satisfies ScaffoldConfig;

export default scaffoldConfig;
