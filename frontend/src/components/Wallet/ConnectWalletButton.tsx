import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Wallet } from 'lucide-react';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';

interface ConnectWalletButtonProps {
  className?: string;
  size?: 'default' | 'sm' | 'lg' | 'icon';
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
}

const ConnectWalletButton: React.FC<ConnectWalletButtonProps> = ({
  className = '',
  size = 'default',
  variant = 'default'
}) => {
  const { isConnected } = useAccount();

  // If already connected, don't show the button
  if (isConnected) {
    return null;
  }

  return (
    <div className={className}>
      <ConnectButton />
    </div>
  );
};

export default ConnectWalletButton;

