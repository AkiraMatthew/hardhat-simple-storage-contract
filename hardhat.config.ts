import 'hardhat-gas-reporter';
import { HardhatUserConfig } from 'hardhat/config';
import 'dotenv/config';
import '@nomiclabs/hardhat-ethers';
import './tasks/block-number';
import 'solidity-coverage';

const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL || 'https://eth-sepolia';
const PRIVATE_KEY = process.env.PRIVATE_KEY || '0xkey';
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || 'key';
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY || 'key';

interface MyHardhatConfig extends HardhatUserConfig {
    etherscan: {
        apiKey: string | Record<string, string> | undefined;
    };
}

const config: MyHardhatConfig = {
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
        localhost: {
            url: 'http://127.0.0.1:8545/',
            //accounts: hardhat has already placed it
            chainId: 31337,
        },
    },
    solidity: '0.8.8',
    etherscan: {
        apiKey: ETHERSCAN_API_KEY,
    },
    gasReporter: {
        enabled: true,
        outputFile: 'gas-report.txt',
        noColors: true,
        currency: 'USD',
        coinmarketcap: COINMARKETCAP_API_KEY,
        token: 'MATIC',
    },
};

export default config;
