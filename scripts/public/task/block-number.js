"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("hardhat/config");
(0, config_1.task)('block-number', 'Prints the current block number').setAction(async (taskArgs, hre) => {
    const blockNumber = hre.ethers.provider.getBlockNumber();
    console.log(`Current block number: ${blockNumber}`);
});
