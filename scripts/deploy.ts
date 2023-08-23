// imports
import { ethers, network, run } from 'hardhat';

// async main

async function main() {
    const SimpleStorageFactory = await ethers.getContractFactory(
        'SimpleStorage'
    );
    console.log('Deploying contract...');
    const simpleStorage = await SimpleStorageFactory.deploy();
    await simpleStorage.deployTransaction;

    const getSimpleStorageAddress = await simpleStorage.address;
    console.log(`Deployed the contract to: ${getSimpleStorageAddress}`);

    //console.log(network.config);
    // Verifying which network did we deployed our code
    // 4 == 4 -> true
    // 4 == "4" -> true
    // 4 === "4" -> false
    if (network.config.chainId === 11155111 && process.env.ETHERSCAN_API_KEY) {
        await simpleStorage.deployTransaction.wait(6);
        await verify(simpleStorage.address, []);
    }

    const currentValue = await simpleStorage.retrieve();
    console.log(`Current Value is : ${currentValue}`);

    //Update the current value:
    const transactionResponse = await simpleStorage.store(7);
    await transactionResponse.wait(1);
    const updatedValue = await simpleStorage.retrieve();
    console.log(`Updated Value: ${updatedValue}`);

    // Getting the current transaction Hash
    const txHash = await simpleStorage.deployTransaction;
    //console.log('Deployment Transaction Hash:', txHash);

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
async function verify(contractAddress: string, args: string[]) {
    console.log('Verifying contract...');
    // we use trycatch because if the verification does not works,
    // the script will continue
    try {
        await run('verify: verify', {
            address: contractAddress,
            constructorArguments: args,
        });
    } catch (e: any) {
        if (e.message.toLowerCase().includes('already verified')) {
            console.log('Already verified');
        } else {
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
