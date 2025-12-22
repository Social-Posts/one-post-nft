// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {OnePostNFT} from "../src/OnePostNFT.sol";

contract DeployOnePostNFTMainnet is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address baseTokenAddress = vm.envAddress("BASE_TOKEN_ADDRESS");

        vm.startBroadcast(deployerPrivateKey);

        // Deploy OnePostNFT with existing Base Token address
        OnePostNFT onePostNFT = new OnePostNFT(baseTokenAddress);
        console.log("OnePostNFT deployed at:", address(onePostNFT));

        vm.stopBroadcast();
    }
}
