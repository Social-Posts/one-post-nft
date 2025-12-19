import { Abi } from "viem";

const deployedContracts = {
  baseSepolia: {
    OnePostNFT: {
     address: "0x68BFB3856C31C4326d4b275e43ebD7BAD568d36e",
     abi: [{"type":"constructor","inputs":[{"name":"_baseTokenAddress","type":"address","internalType":"address"}],"stateMutability":
      "nonpayable"},{"type":"function","name":"approve","inputs":[{"name":"to","type":"address","internalType":"address"},{"name":"tokenId","type":
      "uint256","internalType":"uint256"}],"outputs":[],"stateMutability":"nonpayable"},{"type":"function","name":"balanceOf","inputs":[{"name":"owner"
      ,"type":"address","internalType":"address"}],"outputs":[{"name":"","type":"uint256","internalType":"uint256"}],"stateMutability":"view"},{"type":
      "function","name":"baseTokenAddress","inputs":[],"outputs":[{"name":"","type":"address","internalType":"address"}],"stateMutability":"view"},{
      "type":"function","name":"buyPost","inputs":[{"name":"tokenId","type":"uint256","internalType":"uint256"},{"name":"tokenAddress","type":"address"
      ,"internalType":"address"}],"outputs":[],"stateMutability":"payable"},{"type":"function","name":"cancelSell","inputs":[{"name":"proposalId",
      "type":"uint256","internalType":"uint256"}],"outputs":[],"stateMutability":"nonpayable"},{"type":"function","name":"createPost","inputs":[{"name"
      :"contentHash","type":"string","internalType":"string"},{"name":"price","type":"uint256","internalType":"uint256"}],"outputs":[{"name":"","type":
      "uint256","internalType":"uint256"}],"stateMutability":"nonpayable"},{"type":"function","name":"getAllPosts","inputs":[{"name":"offset","type":
      "uint32","internalType":"uint32"},{"name":"limit","type":"uint32","internalType":"uint32"}],"outputs":[{"name":"","type":"tuple[]","internalType"
      :"struct OnePostNFT.Post[]","components":[{"name":"tokenId","type":"uint256","internalType":"uint256"},{"name":"author","type":"address",
      "internalType":"address"},{"name":"currentOwner","type":"address","internalType":"address"},{"name":"contentHash","type":"string","internalType":
      "string"},{"name":"timestamp","type":"uint256","internalType":"uint256"},{"name":"isForSale","type":"bool","internalType":"bool"},{"name":"price"
      ,"type":"uint256","internalType":"uint256"}]}],"stateMutability":"view"},{"type":"function","name":"getAllPostsForSale","inputs":[{"name":
      "offset","type":"uint32","internalType":"uint32"},{"name":"limit","type":"uint32","internalType":"uint32"}],"outputs":[{"name":"","type":
      "tuple[]","internalType":"struct OnePostNFT.Post[]","components":[{"name":"tokenId","type":"uint256","internalType":"uint256"},{"name":"author",
      "type":"address","internalType":"address"},{"name":"currentOwner","type":"address","internalType":"address"},{"name":"contentHash","type":
      "string","internalType":"string"},{"name":"timestamp","type":"uint256","internalType":"uint256"},{"name":"isForSale","type":"bool","internalType"
      :"bool"},{"name":"price","type":"uint256","internalType":"uint256"}]}],"stateMutability":"view"},{"type":"function","name":"getApproved","inputs"
      :[{"name":"tokenId","type":"uint256","internalType":"uint256"}],"outputs":[{"name":"","type":"address","internalType":"address"}],
      "stateMutability":"view"},{"type":"function","name":"getPostByTokenId","inputs":[{"name":"tokenId","type":"uint256","internalType":"uint256"}],
      "outputs":[{"name":"","type":"tuple","internalType":"struct OnePostNFT.Post","components":[{"name":"tokenId","type":"uint256","internalType":
      "uint256"},{"name":"author","type":"address","internalType":"address"},{"name":"currentOwner","type":"address","internalType":"address"},{"name":
      "contentHash","type":"string","internalType":"string"},{"name":"timestamp","type":"uint256","internalType":"uint256"},{"name":"isForSale","type":
      "bool","internalType":"bool"},{"name":"price","type":"uint256","internalType":"uint256"}]}],"stateMutability":"view"},{"type":"function","name":
      "getPostPrice","inputs":[{"name":"tokenId","type":"uint256","internalType":"uint256"}],"outputs":[{"name":"","type":"uint256","internalType":
      "uint256"}],"stateMutability":"view"},{"type":"function","name":"getSellProposals","inputs":[{"name":"user","type":"address","internalType":
      "address"}],"outputs":[{"name":"","type":"tuple[]","internalType":"struct OnePostNFT.SellProposal[]","components":[{"name":"id","type":"uint256",
      "internalType":"uint256"},{"name":"tokenId","type":"uint256","internalType":"uint256"},{"name":"seller","type":"address","internalType":"address"
      },{"name":"buyer","type":"address","internalType":"address"},{"name":"price","type":"uint256","internalType":"uint256"},{"name":"expiration",
      "type":"uint256","internalType":"uint256"},{"name":"isActive","type":"bool","internalType":"bool"}]}],"stateMutability":"view"},{"type":
      "function","name":"getUserPosts","inputs":[{"name":"user","type":"address","internalType":"address"}],"outputs":[{"name":"","type":"tuple[]",
      "internalType":"struct OnePostNFT.Post[]","components":[{"name":"tokenId","type":"uint256","internalType":"uint256"},{"name":"author","type":
      "address","internalType":"address"},{"name":"currentOwner","type":"address","internalType":"address"},{"name":"contentHash","type":"string",
      "internalType":"string"},{"name":"timestamp","type":"uint256","internalType":"uint256"},{"name":"isForSale","type":"bool","internalType":"bool"
      },{"name":"price","type":"uint256","internalType":"uint256"}]}],"stateMutability":"view"},{"type":"function","name":"getUserSoldCount","inputs"
      :[{"name":"user","type":"address","internalType":"address"}],"outputs":[{"name":"","type":"uint32","internalType":"uint32"}],"stateMutability":
      "view"},{"type":"function","name":"getUserSoldNfts","inputs":[{"name":"user","type":"address","internalType":"address"}],"outputs":[{"name":"",
      "type":"uint256[]","internalType":"uint256[]"}],"stateMutability":"view"},{"type":"function","name":"isApprovedForAll","inputs":[{"name":"owner",
      "type":"address","internalType":"address"},{"name":"operator","type":"address","internalType":"address"}],"outputs":[{"name":"","type":"bool",
      "internalType":"bool"}],"stateMutability":"view"},{"type":"function","name":"isPostForSale","inputs":[{"name":"tokenId","type":"uint256",
      "internalType":"uint256"}],"outputs":[{"name":"","type":"bool","internalType":"bool"}],"stateMutability":"view"},{"type":"function","name":"name"
      ,"inputs":[],"outputs":[{"name":"","type":"string","internalType":"string"}],"stateMutability":"view"},{"type":"function","name":"ownerOf",
      "inputs":[{"name":"tokenId","type":"uint256","internalType":"uint256"}],"outputs":[{"name":"","type":"address","internalType":"address"}],
      "stateMutability":"view"},{"type":"function","name":"posts","inputs":[{"name":"arg0","type":"uint256","internalType":"uint256"}],"outputs":[{
      "name":"tokenId","type":"uint256","internalType":"uint256"},{"name":"author","type":"address","internalType":"address"},{"name":"currentOwner",
      "type":"address","internalType":"address"},{"name":"contentHash","type":"string","internalType":"string"},{"name":"timestamp","type":"uint256",
      "internalType":"uint256"},{"name":"isForSale","type":"bool","internalType":"bool"},{"name":"price","type":"uint256","internalType":"uint256"}],
      "stateMutability":"view"},{"type":"function","name":"proposeSell","inputs":[{"name":"tokenId","type":"uint256","internalType":"uint256"},{"name":
      "price","type":"uint256","internalType":"uint256"}],"outputs":[{"name":"","type":"uint256","internalType":"uint256"}],"stateMutability":
      "nonpayable"},{"type":"function","name":"royaltyPercentage","inputs":[],"outputs":[{"name":"","type":"uint256","internalType":"uint256"}],
      "stateMutability":"view"},{"type":"function","name":"safeTransferFrom","inputs":[{"name":"from","type":"address","internalType":"address"},{
      "name":"to","type":"address","internalType":"address"},{"name":"tokenId","type":"uint256","internalType":"uint256"}],"outputs":[],
      "stateMutability":"nonpayable"},{"type":"function","name":"safeTransferFrom","inputs":[{"name":"from","type":"address","internalType":"address"
      },{"name":"to","type":"address","internalType":"address"},{"name":"tokenId","type":"uint256","internalType":"uint256"},{"name":"data","type":
      "bytes","internalType":"bytes"}],"outputs":[],"stateMutability":"nonpayable"},{"type":"function","name":"sellProposals","inputs":[{"name":"arg0",
      "type":"uint256","internalType":"uint256"}],"outputs":[{"name":"id","type":"uint256","internalType":"uint256"},{"name":"tokenId","type":"uint256"
      ,"internalType":"uint256"},{"name":"seller","type":"address","internalType":"address"},{"name":"buyer","type":"address","internalType":"address"
      },{"name":"price","type":"uint256","internalType":"uint256"},{"name":"expiration","type":"uint256","internalType":"uint256"},{"name":"isActive",
      "type":"bool","internalType":"bool"}],"stateMutability":"view"},{"type":"function","name":"setApprovalForAll","inputs":[{"name":"operator","type"
      :"address","internalType":"address"},{"name":"approved","type":"bool","internalType":"bool"}],"outputs":[],"stateMutability":"nonpayable"},{
      "type":"function","name":"supportsInterface","inputs":[{"name":"interfaceId","type":"bytes4","internalType":"bytes4"}],"outputs":[{"name":"",
      "type":"bool","internalType":"bool"}],"stateMutability":"view"},{"type":"function","name":"symbol","inputs":[],"outputs":[{"name":"","type":
      "string","internalType":"string"}],"stateMutability":"view"},{"type":"function","name":"tokenURI","inputs":[{"name":"tokenId","type":"uint256",
      "internalType":"uint256"}],"outputs":[{"name":"","type":"string","internalType":"string"}],"stateMutability":"view"},{"type":"function","name":
      "transferFrom","inputs":[{"name":"from","type":"address","internalType":"address"},{"name":"to","type":"address","internalType":"address"},{
      "name":"tokenId","type":"uint256","internalType":"uint256"}],"outputs":[],"stateMutability":"nonpayable"},{"type":"event","name":"Approval",
      "inputs":[{"name":"owner","type":"address","indexed":true,"internalType":"address"},{"name":"approved","type":"address","indexed":true,
      "internalType":"address"},{"name":"tokenId","type":"uint256","indexed":true,"internalType":"uint256"}],"anonymous":false},{"type":"event","name":
      "ApprovalForAll","inputs":[{"name":"owner","type":"address","indexed":true,"internalType":"address"},{"name":"operator","type":"address",
      "indexed":true,"internalType":"address"},{"name":"approved","type":"bool","indexed":false,"internalType":"bool"}],"anonymous":false},{"type":
      "event","name":"PostCreated","inputs":[{"name":"tokenId","type":"uint256","indexed":true,"internalType":"uint256"},{"name":"author","type":
      "address","indexed":true,"internalType":"address"},{"name":"contentHash","type":"string","indexed":false,"internalType":"string"},{"name":"price"
      ,"type":"uint256","indexed":false,"internalType":"uint256"},{"name":"timestamp","type":"uint256","indexed":false,"internalType":"uint256"}],
      "anonymous":false},{"type":"event","name":"PostListedForSale","inputs":[{"name":"tokenId","type":"uint256","indexed":true,"internalType":
      "uint256"},{"name":"seller","type":"address","indexed":true,"internalType":"address"},{"name":"price","type":"uint256","indexed":false,
      "internalType":"uint256"}],"anonymous":false},{"type":"event","name":"PostSold","inputs":[{"name":"tokenId","type":"uint256","indexed":true,
      "internalType":"uint256"},{"name":"seller","type":"address","indexed":true,"internalType":"address"},{"name":"buyer","type":"address","indexed":
      true,"internalType":"address"},{"name":"price","type":"uint256","indexed":false,"internalType":"uint256"},{"name":"royaltyPaid","type":"uint256",
      "indexed":false,"internalType":"uint256"}],"anonymous":false},{"type":"event","name":"SellCancelled","inputs":[{"name":"proposalId","type":
      "uint256","indexed":true,"internalType":"uint256"}],"anonymous":false},{"type":"event","name":"SellProposed","inputs":[{"name":"proposalId",
      "type":"uint256","indexed":true,"internalType":"uint256"},{"name":"seller","type":"address","indexed":true,"internalType":"address"},{"name":
      "buyer","type":"address","indexed":true,"internalType":"address"},{"name":"tokenId","type":"uint256","indexed":false,"internalType":"uint256"},{
      "name":"price","type":"uint256","indexed":false,"internalType":"uint256"}],"anonymous":false},{"type":"event","name":"Transfer","inputs":[{"name"
      :"from","type":"address","indexed":true,"internalType":"address"},{"name":"to","type":"address","indexed":true,"internalType":"address"},{"name":
      "tokenId","type":"uint256","indexed":true,"internalType":"uint256"}],"anonymous":false},{"type":"error","name":"ERC721IncorrectOwner","inputs":[{
      "name":"sender","type":"address","internalType":"address"},{"name":"tokenId","type":"uint256","internalType":"uint256"},{"name":"owner","type":
      "address","internalType":"address"}]},{"type":"error","name":"ERC721InsufficientApproval","inputs":[{"name":"operator","type":"address",
      "internalType":"address"},{"name":"tokenId","type":"uint256","internalType":"uint256"}]},{"type":"error","name":"ERC721InvalidApprover","inputs"
      :[{"name":"approver","type":"address","internalType":"address"}]},{"type":"error","name":"ERC721InvalidOperator","inputs":[{"name":"operator",
      "type":"address","internalType":"address"}]},{"type":"error","name":"ERC721InvalidOwner","inputs":[{"name":"owner","type":"address",
      "internalType":"address"}]},{"type":"error","name":"ERC721InvalidReciever","inputs":[{"name":"receiver","type":"address","internalType":"address"
      }]},{"type":"error","name":"ERC721InvalidSender","inputs":[{"name":"sender","type":"address","internalType":"address"}]},{"type":"error","name":
      "ERC721NonexistentToken","inputs":[{"name":"tokenId","type":"uint256","internalType":"uint256"}]},{"type":"error","name":
      "SafeERC20FailedOperation","inputs":[{"name":"token","type":"address","internalType":"address"}]}],
    },
    MockBASE: {
     address: "0x2FD20D692B5B93f90b38a25Cc5Bf1f849D9E0374",
     abi: [{"type":"constructor","inputs":[],"stateMutability":"nonpayable"},{"type":"function","name":"allowance","inputs":[{"name":"owner",
      "type":"address","internalType":"address"},{"name":"spender","type":"address","internalType":"address"}],"outputs":[{"name":"","type":"uint256",
      "internalType":"uint256"}],"stateMutability":"view"},{"type":"function","name":"approve","inputs":[{"name":"spender","type":"address",
      "internalType":"address"},{"name":"amount","type":"uint256","internalType":"uint256"}],"outputs":[{"name":"","type":"bool","internalType":"bool"
      }],"stateMutability":"nonpayable"},{"type":"function","name":"balanceOf","inputs":[{"name":"account","type":"address","internalType":"address"}],
      "outputs":[{"name":"","type":"uint256","internalType":"uint256"}],"stateMutability":"view"},{"type":"function","name":"decimals","inputs":[],
      "outputs":[{"name":"","type":"uint8","internalType":"uint8"}],"stateMutability":"view"},{"type":"function","name":"decreaseAllowance","inputs":[{
      "name":"spender","type":"address","internalType":"address"},{"name":"subtractedValue","type":"uint256","internalType":"uint256"}],"outputs":[{
      "name":"","type":"bool","internalType":"bool"}],"stateMutability":"nonpayable"},{"type":"function","name":"increaseAllowance","inputs":[{"name":
      "spender","type":"address","internalType":"address"},{"name":"addedValue","type":"uint256","internalType":"uint256"}],"outputs":[{"name":"",
      "type":"bool","internalType":"bool"}],"stateMutability":"nonpayable"},{"type":"function","name":"mint","inputs":[{"name":"to","type":"address",
      "internalType":"address"},{"name":"amount","type":"uint256","internalType":"uint256"}],"outputs":[],"stateMutability":"nonpayable"},{"type":
      "function","name":"name","inputs":[],"outputs":[{"name":"","type":"string","internalType":"string"}],"stateMutability":"view"},{"type":"function"
      ,"name":"symbol","inputs":[],"outputs":[{"name":"","type":"string","internalType":"string"}],"stateMutability":"view"},{"type":"function","name":
      "totalSupply","inputs":[],"outputs":[{"name":"","type":"uint256","internalType":"uint256"}],"stateMutability":"view"},{"type":"function","name":
      "transfer","inputs":[{"name":"to","type":"address","internalType":"address"},{"name":"amount","type":"uint256","internalType":"uint256"}],
      "outputs":[{"name":"","type":"bool","internalType":"bool"}],"stateMutability":"nonpayable"},{"type":"function","name":"transferFrom","inputs":[{
      "name":"from","type":"address","internalType":"address"},{"name":"to","type":"address","internalType":"address"},{"name":"amount","type":
      "uint256","internalType":"uint256"}],"outputs":[{"name":"","type":"bool","internalType":"bool"}],"stateMutability":"nonpayable"},{"type":"event",
      "name":"Approval","inputs":[{"name":"owner","type":"address","indexed":true,"internalType":"address"},{"name":"spender","type":"address",
      "indexed":true,"internalType":"address"},{"name":"value","type":"uint256","indexed":false,"internalType":"uint256"}],"anonymous":false},{"type":
      "event","name":"Transfer","inputs":[{"name":"from","type":"address","indexed":true,"internalType":"address"},{"name":"to","type":"address",
      "indexed":true,"internalType":"address"},{"name":"value","type":"uint256","indexed":false,"internalType":"uint256"}],"anonymous":false},{"type":
      "error","name":"ERC20InsufficientAllowance","inputs":[{"name":"spender","type":"address","internalType":"address"},{"name":"allowance","type":
      "uint256","internalType":"uint256"},{"name":"needed","type":"uint256","internalType":"uint256"}]},{"type":"error","name":
      "ERC20InsufficientBalance","inputs":[{"name":"sender","type":"address","internalType":"address"},{"name":"balance","type":"uint256",
      "internalType":"uint256"},{"name":"needed","type":"uint256","internalType":"uint256"}]},{"type":"error","name":"ERC20InvalidApprover","inputs":[{
      "name":"approver","type":"address","internalType":"address"}]},{"type":"error","name":"ERC20InvalidReceiver","inputs":[{"name":"receiver","type":
      "address","internalType":"address"}]},{"type":"error","name":"ERC20InvalidSender","inputs":[{"name":"sender","type":"address","internalType":
      "address"}]},{"type":"error","name":"ERC20InvalidSpender","inputs":[{"name":"spender","type":"address","internalType":"address"}]}],
    },
  },
  base: {
    OnePostNFT: {
     address: "0xE54Bd15E6b5D41F6B726B90BA110B73A5CD0f22A",
      abi: [
       {"type":"constructor","inputs":[{"name":"_baseTokenAddress","type":"address","internalType":"address"}],"stateMutability":"nonpayable"},
       {"type":"function","name":"approve","inputs":[{"name":"to","type":"address","internalType":"address"},{"name":"tokenId","type":"uint256","internalType":"uint256"}],"outputs":[],"stateMutability":"nonpayable"},
       {"type":"function","name":"balanceOf","inputs":[{"name":"owner","type":"address","internalType":"address"}],"outputs":[{"name":"","type":"uint256","internalType":"uint256"}],"stateMutability":"view"},
       {"type":"function","name":"baseTokenAddress","inputs":[],"outputs":[{"name":"","type":"address","internalType":"address"}],"stateMutability":"view"},
       {"type":"function","name":"buyPost","inputs":[{"name":"tokenId","type":"uint256","internalType":"uint256"}],"outputs":[],"stateMutability":"nonpayable"},
       {"type":"function","name":"cancelSell","inputs":[{"name":"proposalId","type":"uint256","internalType":"uint256"}],"outputs":[],"stateMutability":"nonpayable"},
       {"type":"function","name":"createPost","inputs":[{"name":"contentHash","type":"string","internalType":"string"},{"name":"price","type":"uint256","internalType":"uint256"}],"outputs":[{"name":"","type":"uint256","internalType":"uint256"}],"stateMutability":"nonpayable"},
       {"type":"function","name":"getAllPosts","inputs":[{"name":"offset","type":"uint32","internalType":"uint32"},{"name":"limit","type":"uint32","internalType":"uint32"}],"outputs":[{"name":"","type":"tuple[]","internalType":"struct OnePostNFT.Post[]","components":[{"name":"tokenId","type":"uint256","internalType":"uint256"},{"name":"author","type":"address","internalType":"address"},{"name":"currentOwner","type":"address","internalType":"address"},{"name":"contentHash","type":"string","internalType":"string"},{"name":"timestamp","type":"uint256","internalType":"uint256"},{"name":"isForSale","type":"bool","internalType":"bool"},{"name":"price","type":"uint256","internalType":"uint256"}]}],"stateMutability":"view"},
       {"type":"function","name":"getAllPostsForSale","inputs":[{"name":"offset","type":"uint32","internalType":"uint32"},{"name":"limit","type":"uint32","internalType":"uint32"}],"outputs":[{"name":"","type":"tuple[]","internalType":"struct OnePostNFT.Post[]","components":[{"name":"tokenId","type":"uint256","internalType":"uint256"},{"name":"author","type":"address","internalType":"address"},{"name":"currentOwner","type":"address","internalType":"address"},{"name":"contentHash","type":"string","internalType":"string"},{"name":"timestamp","type":"uint256","internalType":"uint256"},{"name":"isForSale","type":"bool","internalType":"bool"},{"name":"price","type":"uint256","internalType":"uint256"}]}],"stateMutability":"view"},
       {"type":"function","name":"getApproved","inputs":[{"name":"tokenId","type":"uint256","internalType":"uint256"}],"outputs":[{"name":"","type":"address","internalType":"address"}],"stateMutability":"view"},
       {"type":"function","name":"getPostByTokenId","inputs":[{"name":"tokenId","type":"uint256","internalType":"uint256"}],"outputs":[{"name":"","type":"tuple","internalType":"struct OnePostNFT.Post","components":[{"name":"tokenId","type":"uint256","internalType":"uint256"},{"name":"author","type":"address","internalType":"address"},{"name":"currentOwner","type":"address","internalType":"address"},{"name":"contentHash","type":"string","internalType":"string"},{"name":"timestamp","type":"uint256","internalType":"uint256"},{"name":"isForSale","type":"bool","internalType":"bool"},{"name":"price","type":"uint256","internalType":"uint256"}]}],"stateMutability":"view"},
       {"type":"function","name":"getPostPrice","inputs":[{"name":"tokenId","type":"uint256","internalType":"uint256"}],"outputs":[{"name":"","type":"uint256","internalType":"uint256"}],"stateMutability":"view"},
       {"type":"function","name":"getSellProposals","inputs":[{"name":"user","type":"address","internalType":"address"}],"outputs":[{"name":"","type":"tuple[]","internalType":"struct OnePostNFT.SellProposal[]","components":[{"name":"id","type":"uint256","internalType":"uint256"},{"name":"tokenId","type":"uint256","internalType":"uint256"},{"name":"seller","type":"address","internalType":"address"},{"name":"buyer","type":"address","internalType":"address"},{"name":"price","type":"uint256","internalType":"uint256"},{"name":"expiration","type":"uint256","internalType":"uint256"},{"name":"isActive","type":"bool","internalType":"bool"}]}],"stateMutability":"view"},
       {"type":"function","name":"getUserPosts","inputs":[{"name":"user","type":"address","internalType":"address"}],"outputs":[{"name":"","type":"tuple[]","internalType":"struct OnePostNFT.Post[]","components":[{"name":"tokenId","type":"uint256","internalType":"uint256"},{"name":"author","type":"address","internalType":"address"},{"name":"currentOwner","type":"address","internalType":"address"},{"name":"contentHash","type":"string","internalType":"string"},{"name":"timestamp","type":"uint256","internalType":"uint256"},{"name":"isForSale","type":"bool","internalType":"bool"},{"name":"price","type":"uint256","internalType":"uint256"}]}],"stateMutability":"view"},
       {"type":"function","name":"getUserSoldNfts","inputs":[{"name":"user","type":"address","internalType":"address"}],"outputs":[{"name":"","type":"uint256[]","internalType":"uint256[]"}],"stateMutability":"view"},
       {"type":"function","name":"isApprovedForAll","inputs":[{"name":"owner","type":"address","internalType":"address"},{"name":"operator","type":"address","internalType":"address"}],"outputs":[{"name":"","type":"bool","internalType":"bool"}],"stateMutability":"view"},
       {"type":"function","name":"isPostForSale","inputs":[{"name":"tokenId","type":"uint256","internalType":"uint256"}],"outputs":[{"name":"","type":"bool","internalType":"bool"}],"stateMutability":"view"},
       {"type":"function","name":"name","inputs":[],"outputs":[{"name":"","type":"string","internalType":"string"}],"stateMutability":"pure"},
       {"type":"function","name":"ownerOf","inputs":[{"name":"tokenId","type":"uint256","internalType":"uint256"}],"outputs":[{"name":"","type":"address","internalType":"address"}],"stateMutability":"view"},
       {"type":"function","name":"posts","inputs":[{"name":"","type":"uint256","internalType":"uint256"}],"outputs":[{"name":"tokenId","type":"uint256","internalType":"uint256"},{"name":"author","type":"address","internalType":"address"},{"name":"currentOwner","type":"address","internalType":"address"},{"name":"contentHash","type":"string","internalType":"string"},{"name":"timestamp","type":"uint256","internalType":"uint256"},{"name":"isForSale","type":"bool","internalType":"bool"},{"name":"price","type":"uint256","internalType":"uint256"}],"stateMutability":"view"},
       {"type":"function","name":"proposeSell","inputs":[{"name":"tokenId","type":"uint256","internalType":"uint256"},{"name":"price","type":"uint256","internalType":"uint256"}],"outputs":[{"name":"","type":"uint256","internalType":"uint256"}],"stateMutability":"nonpayable"},
       {"type":"function","name":"royaltyPercentage","inputs":[],"outputs":[{"name":"","type":"uint256","internalType":"uint256"}],"stateMutability":"view"},
       {"type":"function","name":"safeTransferFrom","inputs":[{"name":"from","type":"address","internalType":"address"},{"name":"to","type":"address","internalType":"address"},{"name":"tokenId","type":"uint256","internalType":"uint256"}],"outputs":[],"stateMutability":"nonpayable"},
       {"type":"function","name":"safeTransferFrom","inputs":[{"name":"from","type":"address","internalType":"address"},{"name":"to","type":"address","internalType":"address"},{"name":"tokenId","type":"uint256","internalType":"uint256"},{"name":"data","type":"bytes","internalType":"bytes"}],"outputs":[],"stateMutability":"nonpayable"},
       {"type":"function","name":"sellProposals","inputs":[{"name":"","type":"uint256","internalType":"uint256"}],"outputs":[{"name":"id","type":"uint256","internalType":"uint256"},{"name":"tokenId","type":"uint256","internalType":"uint256"},{"name":"seller","type":"address","internalType":"address"},{"name":"buyer","type":"address","internalType":"address"},{"name":"price","type":"uint256","internalType":"uint256"},{"name":"expiration","type":"uint256","internalType":"uint256"},{"name":"isActive","type":"bool","internalType":"bool"}],"stateMutability":"view"},
       {"type":"function","name":"setApprovalForAll","inputs":[{"name":"operator","type":"address","internalType":"address"},{"name":"approved","type":"bool","internalType":"bool"}],"outputs":[],"stateMutability":"nonpayable"},
       {"type":"function","name":"supportsInterface","inputs":[{"name":"interfaceId","type":"bytes4","internalType":"bytes4"}],"outputs":[{"name":"","type":"bool","internalType":"bool"}],"stateMutability":"view"},
       {"type":"function","name":"symbol","inputs":[],"outputs":[{"name":"","type":"string","internalType":"string"}],"stateMutability":"pure"},
       {"type":"function","name":"tokenURI","inputs":[{"name":"tokenId","type":"uint256","internalType":"uint256"}],"outputs":[{"name":"","type":"string","internalType":"string"}],"stateMutability":"view"},
       {"type":"function","name":"transferFrom","inputs":[{"name":"from","type":"address","internalType":"address"},{"name":"to","type":"address","internalType":"address"},{"name":"tokenId","type":"uint256","internalType":"uint256"}],"outputs":[],"stateMutability":"nonpayable"},
       {"type":"event","name":"Approval","inputs":[{"name":"owner","type":"address","indexed":true,"internalType":"address"},{"name":"approved","type":"address","indexed":true,"internalType":"address"},{"name":"tokenId","type":"uint256","indexed":true,"internalType":"uint256"}],"anonymous":false},
       {"type":"event","name":"ApprovalForAll","inputs":[{"name":"owner","type":"address","indexed":true,"internalType":"address"},{"name":"operator","type":"address","indexed":true,"internalType":"address"},{"name":"approved","type":"bool","indexed":false,"internalType":"bool"}],"anonymous":false},
       {"type":"event","name":"PostCreated","inputs":[{"name":"tokenId","type":"uint256","indexed":true,"internalType":"uint256"},{"name":"author","type":"address","indexed":true,"internalType":"address"},{"name":"contentHash","type":"string","indexed":false,"internalType":"string"},{"name":"price","type":"uint256","indexed":false,"internalType":"uint256"},{"name":"timestamp","type":"uint256","indexed":false,"internalType":"uint256"}],"anonymous":false},
       {"type":"event","name":"PostListedForSale","inputs":[{"name":"tokenId","type":"uint256","indexed":true,"internalType":"uint256"},{"name":"seller","type":"address","indexed":true,"internalType":"address"},{"name":"price","type":"uint256","indexed":false,"internalType":"uint256"}],"anonymous":false},
       {"type":"event","name":"PostSold","inputs":[{"name":"tokenId","type":"uint256","indexed":true,"internalType":"uint256"},{"name":"seller","type":"address","indexed":true,"internalType":"address"},{"name":"buyer","type":"address","indexed":true,"internalType":"address"},{"name":"price","type":"uint256","indexed":false,"internalType":"uint256"},{"name":"royaltyPaid","type":"uint256","indexed":false,"internalType":"uint256"}],"anonymous":false},
       {"type":"event","name":"SellCancelled","inputs":[{"name":"proposalId","type":"uint256","indexed":true,"internalType":"uint256"}],"anonymous":false},
       {"type":"event","name":"SellProposed","inputs":[{"name":"proposalId","type":"uint256","indexed":true,"internalType":"uint256"},{"name":"seller","type":"address","indexed":true,"internalType":"address"},{"name":"buyer","type":"address","indexed":true,"internalType":"address"},{"name":"tokenId","type":"uint256","indexed":false,"internalType":"uint256"},{"name":"price","type":"uint256","indexed":false,"internalType":"uint256"}],"anonymous":false},
       {"type":"event","name":"Transfer","inputs":[{"name":"from","type":"address","indexed":true,"internalType":"address"},{"name":"to","type":"address","indexed":true,"internalType":"address"},{"name":"tokenId","type":"uint256","indexed":true,"internalType":"uint256"}],"anonymous":false}
      ] as Abi,
    },
    MockBASE: {
     // For mainnet use the same MockBASE address as used on sepolia or replace with a proper mainnet token address
     address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
      abi: [
       { "type": "function", "name": "name", "inputs": [], "outputs": [{ "name": "", "type": "string" }], "stateMutability": "view" },
       { "type": "function", "name": "symbol", "inputs": [], "outputs": [{ "name": "", "type": "string" }], "stateMutability": "view" },
       { "type": "function", "name": "decimals", "inputs": [], "outputs": [{ "name": "", "type": "uint8" }], "stateMutability": "view" },
       { "type": "function", "name": "totalSupply", "inputs": [], "outputs": [{ "name": "", "type": "uint256" }], "stateMutability": "view" },
       { "type": "function", "name": "balanceOf", "inputs": [{ "name": "account", "type": "address" }], "outputs": [{ "name": "", "type": "uint256" }], "stateMutability": "view" },
       { "type": "function", "name": "allowance", "inputs": [{ "name": "owner", "type": "address" }, { "name": "spender", "type": "address" }], "outputs": [{ "name": "", "type": "uint256" }], "stateMutability": "view" },
       { "type": "function", "name": "approve", "inputs": [{ "name": "spender", "type": "address" }, { "name": "amount", "type": "uint256" }], "outputs": [{ "name": "", "type": "bool" }], "stateMutability": "nonpayable" },
       { "type": "function", "name": "transfer", "inputs": [{ "name": "to", "type": "address" }, { "name": "amount", "type": "uint256" }], "outputs": [{ "name": "", "type": "bool" }], "stateMutability": "nonpayable" },
       { "type": "function", "name": "transferFrom", "inputs": [{ "name": "from", "type": "address" }, { "name": "to", "type": "address" }, { "name": "amount", "type": "uint256" }], "outputs": [{ "name": "", "type": "bool" }], "stateMutability": "nonpayable" },
       { "type": "event", "name": "Approval", "inputs": [{ "name": "owner", "type": "address", "indexed": true }, { "name": "spender", "type": "address", "indexed": true }, { "name": "value", "type": "uint256", "indexed": false }], "anonymous": false },
       { "type": "event", "name": "Transfer", "inputs": [{ "name": "from", "type": "address", "indexed": true }, { "name": "to", "type": "address", "indexed": true }, { "name": "value", "type": "uint256", "indexed": false }], "anonymous": false }
      ] as Abi,
    },
  },
} as const;

export default deployedContracts;
