import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Wallet, ExternalLink, Smartphone, Download, AlertCircle } from 'lucide-react';
import { useConnect, useAccount } from 'wagmi';
import { toast } from 'sonner';

interface UnifiedWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  title?: string;
  description?: string;
}

const isMobileDevice = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

const UnifiedWalletModal: React.FC<UnifiedWalletModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  title = "Connect Wallet",
  description
}) => {
  const { connect, connectors } = useConnect();
  const { status } = useAccount();
  
  const [connectingWalletId, setConnectingWalletId] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(isMobileDevice());
  }, []);

  useEffect(() => {
    if (status === 'connected' && connectingWalletId) {
      toast.success('🎉 Wallet connected successfully!');
      if (onSuccess) {
        onSuccess();
      }
      onClose();
      setConnectingWalletId(null);
    }
  }, [status, connectingWalletId, onSuccess, onClose]);

  useEffect(() => {
    if (!isOpen) {
      setConnectingWalletId(null);
    }
  }, [isOpen]);

  const handleWalletConnect = async (connectorId: string) => {
    try {
      setConnectingWalletId(connectorId);
      const connector = connectors.find(c => c.id === connectorId);

      if (!connector) {
        toast.error('❌ Wallet not found. Please install the wallet first.');
        setConnectingWalletId(null);
        return;
      }

      await connect({ connector });
    } catch (error: any) {
      console.error('Wallet connection error:', error);

      if (error.message?.includes('User rejected') || error.message?.includes('rejected')) {
        toast.error('❌ Connection cancelled by user');
      } else {
        toast.error(`❌ Failed to connect: ${error.message || 'Please try again'}`);
      }
      setConnectingWalletId(null);
    }
  };

  const renderWalletCard = (connector: any) => {
    const isCurrentlyConnecting = connectingWalletId === connector.id;

    return (
      <Card key={connector.id} className="p-4 hover:border-primary/50 transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{connector.icon ? <img src={connector.icon} alt={connector.name} className="w-8 h-8" /> : '💼'}</span>
            <div>
              <h3 className="font-semibold">{connector.name}</h3>
            </div>
          </div>

          <Button
            onClick={() => handleWalletConnect(connector.id)}
            disabled={isCurrentlyConnecting || !!connectingWalletId}
            size="sm"
            className="min-w-[80px]"
          >
            {isCurrentlyConnecting ? (
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Connecting...</span>
              </div>
            ) : (
              <>
                <Wallet className="w-4 h-4 mr-2" />
                Connect
              </>
            )}
          </Button>
        </div>
      </Card>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            {title}
          </DialogTitle>
          <DialogDescription>
            {description || (isMobile
              ? 'Choose a wallet to connect to Base network.'
              : 'Choose a wallet to connect to the platform on Base network.'
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {connectors.length > 0 ? (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Available Wallets</p>
              <div className="space-y-2">
                {connectors.map(renderWalletCard)}
              </div>
            </div>
          ) : (
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

          <div className="text-center pt-2">
            <Button variant="ghost" onClick={onClose} className="text-sm">
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UnifiedWalletModal;