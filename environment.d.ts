import { Bytecode } from 'hardhat/internal/hardhat-network/stack-traces/model';

export {};

declare global {
    namespace NodeJS {
        interface ProcessEnv {
            PRIVATE_KEY: string;
            SEPOLIA_RPC_URL: string;
            //PRIVATE_KEY_PASSWORD: string;
        }
    }
}
