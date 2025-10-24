import { useAccount as useWagmiAccount } from 'wagmi';

/**
 * Wrapper around wagmi's useAccount hook for Base network compatibility
 */
export function useAccount() {
  return useWagmiAccount();
}
