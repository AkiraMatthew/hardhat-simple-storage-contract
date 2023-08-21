// imports
import { ethers } from 'hardhat';

// async main

async function main() {
    const SimpleStorageFactory = await ethers.getContractFactory(
        'SimpleStorage'
    );
    console.log('Deploying contract...');
    const simpleStorage = await SimpleStorageFactory.deploy();
    await simpleStorage.deploymentTransaction();

    const getSimpleStorageAddress = await simpleStorage.getAddress();
    console.log(`Deployed the contract to: ${getSimpleStorageAddress}`);

    // Getting the current transaction Hash
    const txHash = await simpleStorage.deploymentTransaction();
    console.log('Deployment Transaction Hash:', txHash?.hash);

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

// main

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
