// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {OnePostNFT} from "../src/OnePostNFT.sol";
import {MockBASE} from "../src/MockBASE.sol";

contract DeployOnePostNFT is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        // Deploy MockBASE token first
        MockBASE mockBASE = new MockBASE();
        console.log("MockBASE deployed at:", address(mockBASE));

        // Deploy OnePostNFT with MockBASE address
        OnePostNFT onePostNFT = new OnePostNFT(address(mockBASE));
        console.log("OnePostNFT deployed at:", address(onePostNFT));

        vm.stopBroadcast();
    }
}