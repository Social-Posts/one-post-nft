import { Button } from '@/components/ui/button';
import { useConnect } from 'wagmi';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

const WalletConnectButton = () => {
  const { connectors, connect } = useConnect();
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();

  const handleConnect = (connector: any) => {
    connect({ connector });
    setIsOpen(false);
  };

  const handleMobileConnect = () => {
    const mobileConnector = connectors.find((c) => c.id === 'io.metamask' || c.id === 'com.coinbase.wallet');
    if (mobileConnector) {
      handleConnect(mobileConnector);
    } else {
      // if no mobile connector is found, open the dialog
      setIsOpen(true);
    }
  };

  if (isMobile) {
    return <Button onClick={handleMobileConnect}>Connect Wallet</Button>;
  }

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Connect Wallet</Button>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Connect Wallet</DialogTitle>
            <DialogDescription>Choose your wallet provider</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col space-y-2">
            {connectors.map((connector) => (
              <Button key={connector.uid} onClick={() => handleConnect(connector)}>
                {connector.name}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default WalletConnectButton;
