-include .env

deploy-base:
	forge script script/DeployOnePostNFTMainnet.s.sol:DeployOnePostNFTMainnet --rpc-url $(BASE_RPC_URL) --private-key $(PRIVATE_KEY) --broadcast --verify --etherscan-api-key $(ETHERSCAN_API_KEY)

deploy-base-no-verify:
	forge script script/DeployOnePostNFTMainnet.s.sol:DeployOnePostNFTMainnet --rpc-url $(BASE_RPC_URL) --private-key $(PRIVATE_KEY) --broadcast
