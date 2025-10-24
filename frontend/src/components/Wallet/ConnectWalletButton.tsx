import React from 'react';
import { useAccount } from 'wagmi';
import WalletConnectButton from './WalletConnectButton';

interface ConnectWalletButtonProps {
  className?: string;
  size?: 'default' | 'sm' | 'lg' | 'icon';
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
}

const ConnectWalletButton: React.FC<ConnectWalletButtonProps> = ({
  className = '',
}) => {
  const { isConnected } = useAccount();

  // If already connected, don't show the button
  if (isConnected) {
    return null;
  }

  return (
    <div className={className}>
      <WalletConnectButton />
    </div>
  );
};

export default ConnectWalletButton;

