# SVPChain Smart Contract Deployment Pipeline

[![Solidity](https://img.shields.io/badge/Solidity-^0.8.24-363636?logo=solidity)](https://soliditylang.org/)
[![Node.js](https://img.shields.io/badge/Node.js->=20.0.0-339933?logo=node.js)](https://nodejs.org/)
[![EVM](https://img.shields.io/badge/EVM-Compatible-627EEA?logo=ethereum)](https://ethereum.org/)
[![Network](https://img.shields.io/badge/Network-SVPChain_Testnet_(2517)-2563EB)](https://svpchain.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A production-grade, lightweight smart contract deployment and testing pipeline optimized for **SVPChain Testnet** (EVM Chain ID: `2517`). Built with standard EVM compatibility, native EIP-1559 fee calculation, and automated deployment verification.

---

## 📑 Table of Contents

- [Overview](#overview)
- [Architecture & Network Constants](#architecture--network-constants)
- [Directory Structure](#directory-structure)
- [Prerequisites](#prerequisites)
- [Installation & Quick Start](#installation--quick-start)
- [Configuration](#configuration)
- [Deployment Workflow](#deployment-workflow)
- [Smart Contracts](#smart-contracts)
- [Security Considerations](#security-considerations)
- [Troubleshooting](#troubleshooting)
- [License](#license)

---

## 📖 Overview

SVPChain is an EVM-compatible sovereign Layer 1 blockchain built on the Cosmos SDK and CometBFT consensus engine. This repository provides an end-to-end toolchain to:

1. Compile Solidity smart contracts natively using the `solc` pipeline.
2. Calculate and enforce minimum chain gas price thresholds (`2 Gwei`).
3. Broadcast signed contract deployment transactions.
4. Verify block confirmation and output real-time transaction hash references for block explorers and quest verifications.

---

## 🌐 Architecture & Network Constants

SVPChain enforces strict network parameters. All deployment transactions dispatched through this pipeline adhere to the official network specifications:

| Parameter | Value |
| :--- | :--- |
| **Network Name** | SVPChain Testnet |
| **EVM Chain ID** | `2517` |
| **Cosmos Chain ID** | `svp-2517-1` |
| **Public JSON-RPC** | `https://svp-dataseeds-testnet.svpchain.org` |
| **Public WebSocket** | `wss://svp-dataseeds-testnet.svpchain.org/ws` |
| **Block Explorer** | [https://explorer.svpchain.com](https://explorer.svpchain.com) |
| **Native Currency** | `SVP` (Smallest unit: `asvp`, 18 decimals) |
| **Minimum Gas Price** | `2 Gwei` (`2000000000 asvp`) |
| **Block Time & Finality** | ~1 second (Instant single-block finality) |

---

## 📂 Directory Structure

```text
svpchain/
├── contracts/
│   └── Counter.sol          # Primary smart contract with state and event logging
├── scripts/
│   └── deploy.js            # Hardhat-compatible deployment script
├── .env.example             # Template for local environment variables
├── .gitignore               # Ignored files (node_modules, .env, build caches)
├── deploy.js                # Standalone zero-dependency deployment runner
├── hardhat.config.js        # Hardhat project configuration
├── package.json             # Dependencies and npm automation scripts
└── README.md                # Project documentation
```

---

## ⚙️ Prerequisites

Ensure your development environment meets the following specifications:

- **Node.js**: `v20.0.0` or higher (verified compatible through Node `v25.x`)
- **Package Manager**: `npm` `v10.x`+ or `pnpm` / `yarn`
- **Funded Testnet Wallet**: An EVM address holding testnet `SVP` for gas fees.
  - Testnet Faucet: [https://www.svpchain.org/faucet](https://www.svpchain.org/faucet)

---

## 🚀 Installation & Quick Start

### 1. Clone & Install Dependencies

```bash
git clone <repository-url>
cd svpchain
npm install
```

### 2. Environment Configuration

Copy the example environment file and populate your credentials:

```bash
cp .env.example .env
```

Open `.env` in your editor and supply your testnet private key:

```env
PRIVATE_KEY=0xYOUR_TESTNET_PRIVATE_KEY_HERE
```

> [!WARNING]
> **NEVER** commit your `.env` file or expose private keys containing real mainnet assets. Use a dedicated burner or development wallet for testnet interactions.

---

## 📦 Deployment Workflow

Execute the automated deployment pipeline via the configured npm script:

```bash
npm run deploy
```

### Pipeline Execution Details:

1. **Environment Validation**: Inspects `.env` for valid formatting and key presence.
2. **Provider & Balance Check**: Queries the SVPChain Testnet RPC (`eth_getBalance`) to ensure adequate `SVP` gas balance.
3. **Compilation**: Invokes `solc` (`^0.8.24`) on [`contracts/Counter.sol`](file:///D:/web3/svpchain/contracts/Counter.sol) with full optimization (runs: 200).
4. **Gas Price Guarantee**: Sets gas price to `max(rpcGasPrice, 2 Gwei)` to prevent `tx underpriced` consensus rejections.
5. **Transaction Broadcast**: Signs and transmits `eth_sendRawTransaction`.
6. **Block Verification**: Awaits block inclusion and prints:
   - **Contract Address**
   - **Transaction Hash**
   - **Explorer URL**

#### Example Console Output:

```text
==================================================
🚀 SVPChain Testnet Contract Deployer
==================================================
Deployer Address : 0x71C...B29
Deployer Balance : 1.0 SVP

📦 Compiling contracts/Counter.sol...
✅ Contract compiled successfully!

⏳ Mengirim transaksi deployment ke SVPChain Testnet...

==================================================
🎉 TRANSAKSI DEPLOYMENT BERHASIL DIKIRIM!
==================================================
📌 Deployment Tx Hash :
0x3a4f89d...c0182

🔍 Cek di Explorer    : https://explorer.svpchain.com/tx/0x3a4f89d...c0182

Menunggu konfirmasi block...
🏠 Deployed Address   : 0x5FbDB2315678afecb367f032d93F642f64180aa3
==================================================

📋 SILAKAN SALIN TX HASH DI ATAS DAN PASTE KE QUEST:
0x3a4f89d...c0182
==================================================
```

---

## 📜 Smart Contracts

### [`contracts/Counter.sol`](file:///D:/web3/svpchain/contracts/Counter.sol)

A lean, gas-efficient state counter implementing view and state-mutating functions:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract Counter {
    uint256 public count;

    event CountUpdated(uint256 newCount);

    function get() public view returns (uint256) {
        return count;
    }

    function inc() public {
        count += 1;
        emit CountUpdated(count);
    }

    function dec() public {
        count -= 1;
        emit CountUpdated(count);
    }
}
```

---

## 🔒 Security Considerations

- **Private Key Isolation**: Private keys are read exclusively from process environment memory via `dotenv` and never persisted to logs or disk artifacts.
- **Git Hygiene**: `.gitignore` explicitly prevents tracking of `.env`, `node_modules`, build artifacts, and sensitive key files.
- **Replay Protection**: Strict adherence to EIP-155 with explicit `chainId: 2517` prevents cross-chain signature reuse.

---

## 🛠️ Troubleshooting

| Issue | Root Cause | Solution |
| :--- | :--- | :--- |
| `tx underpriced` | Gas price submitted below protocol floor (`2 Gwei`). | The deploy script automatically enforces `2 Gwei`. Do not decrease below `2000000000 asvp`. |
| `Deployer balance is 0 SVP` | Address has not received testnet tokens. | Request testnet funds from the [official faucet](https://www.svpchain.org/faucet). |
| `Missing or invalid PRIVATE_KEY` | `.env` file is missing or contains placeholder string. | Populate `PRIVATE_KEY=0x...` in `.env`. |
| `RPC Timeout` / `Connection refused` | Public RPC node is undergoing rate-limiting or network maintenance. | Verify connectivity using `curl https://svp-dataseeds-testnet.svpchain.org` or retry after backoff. |

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
