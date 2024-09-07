import "@nomicfoundation/hardhat-toolbox-viem"
import "@nomicfoundation/hardhat-viem"
import "dotenv/config"
import "hardhat-contract-sizer"
import "./scripts/generate"
import "./scripts/deploy"
import { HardhatUserConfig } from "hardhat/config"
import { HDAccountsUserConfig } from "hardhat/types"

const mnemonic = process.env.MNEMONIC
if (!mnemonic) {
  throw new Error("Please set your MNEMONIC in a .env file")
}

const accounts: HDAccountsUserConfig = {
  mnemonic,
  count: 100,
}

const config: HardhatUserConfig = {
  solidity: {
    compilers: [{ version: "0.8.24" }],
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  contractSizer: {
    alphaSort: true,
    disambiguatePaths: false,
    runOnCompile: true,
    strict: true,
  },
  defaultNetwork: "localhost",
  networks: {
    localhost: {
      url: "http://localhost:8545",
    },
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "https://rpc.ankr.com/eth_sepolia",
      accounts,
    },
    base_sepolia: {
      url:
      process.env.BASE_SEPOLIA_RPC_URL || "https://rpc.ankr.com/base_sepolia",
      accounts,
    },
    optimism_sepolia: {
      url:
        process.env.OPTIMISM_SEPOLIA_RPC_URL ||
        "https://rpc.ankr.com/optimism_sepolia",
      accounts,
    },
    celo_alfajores: {
      url:
        process.env.CELO_ALFAJORES_RPC_URL ||
        "https://alfajores-forno.celo-testnet.org",
      accounts,
    },
    mantle_sepolia: {
      url: process.env.MANTLE_SEPOLIA_RPC_URL || "https://rpc.sepolia.mantle.xyz",
      accounts,
    },
    zircuit_testnet: {
      url: process.env.ZIRCUIT_TESTNET_RPC_URL || "https://zircuit1.p2pify.com",
      accounts,
    },
  },
  gasReporter: {
    enabled: true,
    currency: "USD",
  },
  mocha: {
    timeout: 20000,
  },
  sourcify: {
    enabled: true,
  },
}

export default config
