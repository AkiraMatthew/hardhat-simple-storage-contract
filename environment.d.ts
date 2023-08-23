import { Bytes, BytesLike } from 'ethers';

export {};

declare global {
    namespace NodeJS {
        interface ProcessEnv {
            PRIVATE_KEY: string;
            SEPOLIA_RPC_URL: string;
            ETHERSCAN_API_KEY: string;
            //PRIVATE_KEY_PASSWORD: string;
        }
    }
}
