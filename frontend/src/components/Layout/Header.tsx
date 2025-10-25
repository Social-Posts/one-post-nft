import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wallet, LogOut, Plus } from 'lucide-react';
import { useAccount, useDisconnect } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import onePostNftLogo from '@/Images/onepostnft_image.png';

interface HeaderProps {
  onCreatePost: () => void;
  canCreatePost: boolean;
}

const Header: React.FC<HeaderProps> = ({ onCreatePost, canCreatePost }) => {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { openConnectModal } = useConnectModal();

  const truncateAddress = (addr: `0x${string}`) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <>
      <Card className="border-border bg-card animate-fade-in rounded-t-xl fixed mx-auto max-w-[875px] top-0 left-0 right-0 z-50">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center animate-pulse-glow">
              <img
                src={onePostNftLogo}
                alt="OnePostNft Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground py-3">
                OnePostNft
              </h1>
              <p className="text-sm md:text-base text-muted-foreground animate-fade-in-up"> Powered by Base </p> 
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={onCreatePost}
              className="hidden md:flex bg-primary hover:bg-primary/90 animate-scale-in"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Post
            </Button>

            {/* Wallet section - both mobile and desktop */}
            <div className="flex items-center">
              {isConnected ? (
                <div className="flex items-center gap-2 animate-slide-up">
                  <Badge variant="outline" className="text-xs md:text-sm px-2 py-1">
                    {truncateAddress(address!)}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => disconnect()}
                    className="hover:bg-destructive hover:text-destructive-foreground"
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <Button onClick={() => openConnectModal?.()}>
                  <Wallet className="w-4 h-4 mr-2" />
                  Connect Wallet
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>
    </>
  );
};

export default Header;