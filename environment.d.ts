import { Bytes, BytesLike } from 'ethers';

export {};

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PRIVATE_KEY: BytesLike;
      RPC_URL: string;
      PRIVATE_KEY_PASSWORD: string;
    }
  }
}
