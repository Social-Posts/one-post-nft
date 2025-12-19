import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/sonner';
import { useAccount } from 'wagmi';
import { Post } from '@/context/AppContext';
import { buyPost, approveERC20, mintMockTokens } from '@/services/contract';
import { useWalletClient } from 'wagmi';
import { CreditCard, Wallet, Coins } from 'lucide-react';
import deployedContracts from '../../../contracts/deployedContracts';
import { formatEther } from 'viem';

interface BuyModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: Post;
}

const BuyModal: React.FC<BuyModalProps> = ({ isOpen, onClose, post }) => {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('eth');
  const [isProcessing, setIsProcessing] = useState(false);

  const paymentMethods = [
    {
      id: 'eth',
      name: 'ETH',
      icon: <Wallet className="w-4 h-4" />,
      description: 'Pay with Ethereum',
      fee: 'Network fee only'
    },
    {
      id: 'mockbase',
      name: 'Nft Social Mock Token',
      icon: <Coins className="w-4 h-4" />,
      description: 'Pay with MockBASE tokens',
      fee: 'Network fee only'
    },
    
  ];

  const handlePurchase = async () => {
    if (!isConnected) {
      toast.error('🔐 Please connect your wallet to buy NFTs');
      return;
    }

    if (!walletClient) {
      toast.error('🔗 Please connect an Ethereum-compatible wallet');
      return;
    }

    if (selectedPaymentMethod !== 'eth' && selectedPaymentMethod !== 'mockbase') {
      toast.error('Only ETH and MockBASE payments are currently supported');
      return;
    }

    setIsProcessing(true);
    try {
      toast.loading('💳 Processing purchase...', { duration: 0 });

      if (selectedPaymentMethod === 'mockbase') {
        // Get contract addresses from deployedContracts
        const CONTRACT_ADDRESS = deployedContracts.base.OnePostNFT.address as `0x${string}`;
        const MOCK_BASE_CONTRACT_ADDRESS = deployedContracts.base.MockBASE.address as `0x${string}`;

        // First approve the NFT contract to spend MockBASE tokens
        toast.loading('🔓 Approving MockBASE tokens...', { duration: 0 });
        await approveERC20(walletClient, CONTRACT_ADDRESS, BigInt(Math.floor(post.price * 1e18)));

        // Then buy the NFT with MockBASE
        toast.loading('💳 Processing MockBASE purchase...', { duration: 0 });
        await buyPost(walletClient, post.tokenId, MOCK_BASE_CONTRACT_ADDRESS);
      } else {
        // Buy with ETH
        await buyPost(walletClient, post.tokenId);
      }

      toast.dismiss();
      toast.success(`🎉 Successfully purchased NFT #${post.tokenId}! 🚀`);

      onClose();
    } catch (error: unknown) {
      console.error('Error buying NFT:', error);
      toast.dismiss();

      const errorMessage = error instanceof Error ? error.message : 'Failed to purchase NFT';

      if (errorMessage.includes('insufficient') || errorMessage.includes('balance')) {
        toast.error(`❌ Insufficient ${selectedPaymentMethod === 'mockbase' ? 'MockBASE' : 'ETH'} balance to complete the purchase`);
      } else if (errorMessage.includes('rejected') || errorMessage.includes('denied')) {
        toast.error('❌ Transaction rejected by user');
      } else if (errorMessage.includes('network') || errorMessage.includes('connection')) {
        toast.error('❌ Network error. Please try again');
      } else {
        toast.error(`❌ ${errorMessage}`);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-4">
        <DialogHeader>
          <DialogTitle>Buy NFT</DialogTitle>
          <DialogDescription>
            Complete your purchase for NFT #{post.tokenId}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* NFT Preview */}
          <Card className="p-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                <span className="text-sm text-muted-foreground">NFT</span>
              </div>
              <div className="flex-1">
                <h3 className="font-medium">NFT #{post.tokenId}</h3>
                <p className="text-sm text-muted-foreground">
                  by {post.author.slice(0, 6)}...{post.author.slice(-4)}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary">{formatEther(BigInt(post.price.toString()))} ETH</Badge>
                </div>
              </div>
            </div>
          </Card>

          {/* Payment Methods */}
          <div className="space-y-4">
            <h4 className="font-medium">Payment Method</h4>
            <RadioGroup
              value={selectedPaymentMethod}
              onValueChange={setSelectedPaymentMethod}
              className="space-y-3"
            >
              {paymentMethods.map((method) => (
                <div key={method.id} className="flex items-center space-x-3">
                  <RadioGroupItem
                    value={method.id}
                    id={method.id}
                  disabled={false}
                  />
                  <Label
                    htmlFor={method.id}
                    className="flex-1 cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      {method.icon}
                      <div className="flex-1">
                        <div className="font-medium">{method.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {method.description}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Fee: {method.fee}
                        </div>
                      </div>

                    </div>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <Separator />

          {/* Order Summary */}
          <div className="space-y-2">
            <h4 className="font-medium">Order Summary</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>NFT Price</span>
                <span>{formatEther(BigInt(post.price.toString()))} ETH</span>
              </div>
              <div className="flex justify-between">
                <span>Network Fee</span>
                <span>~0.001 ETH</span>
              </div>
              <Separator />
              <div className="flex justify-between font-medium">
                <span>Total</span>
                <span>{(parseFloat(formatEther(BigInt(post.price.toString()))) + 0.001).toFixed(4)} ETH</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handlePurchase}
              disabled={isProcessing || !isConnected}
              className="flex-1"
            >
              {isProcessing ? 'Processing...' : `Buy for ${formatEther(BigInt(post.price.toString()))} ${selectedPaymentMethod === 'mockbase' ? 'MockBASE' : 'ETH'}`}
            </Button>
          </div>

          {!isConnected && (
            <p className="text-sm text-muted-foreground text-center">
              Connect your wallet to complete the purchase
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BuyModal;
