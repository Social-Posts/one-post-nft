import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Wallet, ExternalLink, Smartphone, Download, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useAccount, useConnect } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';

interface MobileWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  title: string;
  description: string;
}

// Detect if user is on mobile device
const isMobileDevice = () => {
  if (typeof window === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

const MobileWalletModal: React.FC<MobileWalletModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  title,
  description,
}) => {
  const [isMobile, setIsMobile] = useState(false);
  const { connect, connectors } = useConnect();
  const { isConnected } = useAccount();

  useEffect(() => {
    setIsMobile(isMobileDevice());
  }, []);

  useEffect(() => {
    if (isConnected) {
      onSuccess();
    }
  }, [isConnected, onSuccess]);

  const getWalletIcon = (connectorId: string) => {
    const id = connectorId.toLowerCase();
    if (id.includes('metamask')) {
      return '🦊';
    } else if (id.includes('coinbase')) {
      return '🪙';
    } else if (id.includes('walletconnect')) {
      return '🌐';
    }
    return '💼';
  };

  const getWalletName = (connectorId: string, connectorName?: string) => {
    if (connectorName) return connectorName;
    const id = connectorId.toLowerCase();
    if (id.includes('metamask')) return 'MetaMask';
    if (id.includes('coinbase')) return 'Coinbase Wallet';
    if (id.includes('walletconnect')) return 'WalletConnect';
    return connectorId;
  };

  const handleConnect = (connector: any) => {
    connect({ connector });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            {title}
          </DialogTitle>
          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 mt-4">
          {/* RainbowKit Connect Button */}
          <div className="flex justify-center">
            <ConnectButton />
          </div>

          {/* Alternative Wallets */}
          {connectors.map((connector) => (
            <Card key={connector.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getWalletIcon(connector.id)}</span>
                  <div>
                    <h3 className="font-semibold">{getWalletName(connector.id, connector.name)}</h3>
                    {isMobile && (
                      <p className="text-xs text-muted-foreground">
                        {connector.id.includes('injected') ? 'Browser Extension' : 'Mobile App'}
                      </p>
                    )}
                  </div>
                </div>

                <Button
                  onClick={() => handleConnect(connector)}
                  disabled={false}
                  size="sm"
                  className="min-w-[80px]"
                >
                  Connect
                </Button>
              </div>
            </Card>
          ))}

          {/* No wallets found message */}
          {connectors.length === 0 && (
            <Card className="p-6 text-center">
              <AlertCircle className="w-12 h-12 mx-auto mb-3 text-yellow-500" />
              <h3 className="font-semibold mb-2">No Wallet Found</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {isMobile
                  ? 'You need to install a wallet app to continue.'
                  : 'You need to install a wallet extension to continue.'
                }
              </p>
            </Card>
          )}

          {/* Installation options for mobile */}
          {isMobile && connectors.length === 0 && (
            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground mb-3 flex items-center gap-2">
                <Download className="w-4 h-4" />
                Don't have a wallet? Install one:
              </p>
              
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-between"
                  onClick={() => window.open('https://metamask.io/download/', '_blank')}
                >
                  <span className="flex items-center gap-2">
                    <span>🦊</span>
                    <span>Install MetaMask</span>
                  </span>
                  <ExternalLink className="w-4 h-4" />
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full justify-between"
                  onClick={() => window.open('https://www.coinbase.com/wallet/downloads', '_blank')}
                >
                  <span className="flex items-center gap-2">
                    <span>🪙</span>
                    <span>Install Coinbase Wallet</span>
                  </span>
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Desktop installation instructions */}
          {!isMobile && connectors.length === 0 && (
            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground mb-3">
                Install a wallet extension:
              </p>
              
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-between"
                  onClick={() => window.open('https://metamask.io/download/', '_blank')}
                >
                  <span>MetaMask Extension</span>
                  <ExternalLink className="w-4 h-4" />
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full justify-between"
                  onClick={() => window.open('https://www.coinbase.com/wallet/downloads', '_blank')}
                >
                  <span>Coinbase Wallet Extension</span>
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Mobile-specific help text */}
          {isMobile && (
            <Card className="p-4 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-3">
                <Smartphone className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                    Mobile Wallet Connection
                  </p>
                  <p className="text-blue-700 dark:text-blue-300">
                    Use RainbowKit for the best experience, or choose an alternative wallet above. Please approve the connection request in your wallet app.
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MobileWalletModal;