import { http, createConfig } from "wagmi";
import { baseSepolia } from "wagmi/chains";
import { coinbaseWallet, metaMask, walletConnect } from "wagmi/connectors";

export const config = createConfig({
  chains: [baseSepolia],
  connectors: [
    coinbaseWallet({
      appName: "One Post Nft",
      preference: "smartWallet",
    }),
    metaMask(),
    walletConnect({ projectId: "f8fc66aef70efafe5c553752d3d4e236" }),
  ],
  transports: {
    [baseSepolia.id]: http(
      "https://base-sepolia.g.alchemy.com/v2/SRtSnNb7fiMWCFojDi_2y63y3H5YNz1X"
    ),
  },
});
