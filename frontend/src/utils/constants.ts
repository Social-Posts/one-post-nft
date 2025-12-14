export const FEED_PAGE_SIZE = 20;

/**
 * Contract address for OnePostNFT
 * Read from environment variable VITE_CONTRACT_ADDRESS
 * Example: VITE_CONTRACT_ADDRESS=0x... yarn dev
 */
export const CONTRACT_ADDRESS =
  import.meta.env.VITE_CONTRACT_ADDRESS || '0x987029D7a894FcbDdD9e819fF177c0D44CCaF0Ce';