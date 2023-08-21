"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("@nomicfoundation/hardhat-toolbox");
require("dotenv/config");
const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const config = {
    // here isn't shown but by default we have:
    // defaultNetwork: "hardhat"
    // this fake hardhat network automatically provides you
    // a RPC_URL and a PRIVATE_KEY
    // you can run an specific network by running the command
    // npx hardhat run scripts/public/scripts/deploy.js --network hardhat//network name//
    defaultNetwork: 'hardhat',
    networks: {
        sepolia: {
            url: SEPOLIA_RPC_URL,
            accounts: [PRIVATE_KEY],
            chainId: 11155111,
        },
    },
    solidity: '0.8.8',
};
exports.default = config;
