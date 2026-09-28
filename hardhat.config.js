import "@nomicfoundation/hardhat-toolbox";
import dotenv from "dotenv";

dotenv.config();

const privateKey = process.env.PRIVATE_KEY;
const accounts = privateKey ? [privateKey.startsWith("0x") ? privateKey : `0x${privateKey}`] : [];

/** @type import('hardhat/config').HardhatUserConfig */
export default {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    svpTestnet: {
      url: "https://svp-dataseeds-testnet.svpchain.org",
      chainId: 2517,
      gasPrice: 2000000000,
      accounts: accounts,
    },
  },
};
