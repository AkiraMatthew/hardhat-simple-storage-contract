"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// imports
const hardhat_1 = require("hardhat");
require("@nomicfoundation/hardhat-ethers");
// async main
async function main() {
    const SimpleStorageFactory = await hardhat_1.ethers.getContractFactory('SimpleStorage');
    console.log('Deploying contract...');
    const simpleStorage = await SimpleStorageFactory.deploy();
    await simpleStorage.deploymentTransaction();
    const getSimpleStorageAddress = await simpleStorage.getAddress();
    console.log(`Deployed the contract to: ${getSimpleStorageAddress}`);
    console.log(hardhat_1.network.config);
    // Verifying which network did we deployed our code
    // 4 == 4 -> true
    // 4 == "4" -> true
    // 4 === "4" -> false
    if (hardhat_1.network.config.chainId === 11155111 && process.env.ETHERSCAN_API_KEY) {
        await simpleStorage.deploymentTransaction()?.wait(6);
        await verify(simpleStorage.getAddress(), []);
    }
    // Getting the current transaction Hash
    const txHash = await simpleStorage.deploymentTransaction;
    console.log('Deployment Transaction Hash:', txHash);
    // Getting the transaction details for reading the CLI
    /*provider
        .getTransaction(txHash)
        .then((transaction) => {
            console.log(`Sender: ${transaction.from}`);
            console.log(`Contract: ${transaction.to}`);
            console.log(`Transaction Data: ${transaction.data}`);
        })
        .catch((error) => {
            console.error(`Error: ${error}`);
        });*/
}
// This function will serve to verify automatically the code
// in the blockexplorer, right after its deployment.
async function verify(contractAddress, args) {
    console.log('Verifying contract...');
    // we use trycatch because if the verification does not works,
    // the script will continue
    try {
        await (0, hardhat_1.run)('verify: verify', {
            address: contractAddress,
            constructorArguments: args,
        });
    }
    catch (e) {
        if (e.message.toLowerCase().includes('already verified')) {
            console.log('Already verified');
        }
        else {
            console.log(e);
        }
    }
}
// main
main()
    .then(() => process.exit(0))
    .catch((error) => {
    console.error(error);
    process.exit(1);
});
