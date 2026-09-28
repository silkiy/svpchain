import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { ethers } from "ethers";
import dotenv from "dotenv";
import solc from "solc";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const RPC_URL = "https://svp-dataseeds-testnet.svpchain.org";
const CHAIN_ID = 2517;

async function main() {
  console.log("==================================================");
  console.log("🚀 SVPChain Testnet Contract Deployer");
  console.log("==================================================");

  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey || privateKey.trim() === "" || privateKey === "your_private_key_here") {
    console.error("\n❌ Error: PRIVATE_KEY belum diisi di file .env!");
    console.log("Silakan buat atau edit file .env dengan format:");
    console.log("PRIVATE_KEY=0x<private_key_wallet_anda>\n");
    return;
  }

  const formattedKey = privateKey.trim().startsWith("0x") ? privateKey.trim() : `0x${privateKey.trim()}`;

  // 1. Connect to SVP Testnet provider
  const provider = new ethers.JsonRpcProvider(RPC_URL, {
    chainId: CHAIN_ID,
    name: "svpTestnet"
  });

  const wallet = new ethers.Wallet(formattedKey, provider);
  console.log("Deployer Address :", wallet.address);

  // Check balance
  const balance = await provider.getBalance(wallet.address);
  console.log("Deployer Balance :", ethers.formatEther(balance), "SVP");

  if (balance === 0n) {
    console.error("\n❌ Saldo SVP Anda 0! Anda membutuhkan testnet SVP untuk gas fee.");
    console.log("👉 Silakan klaim faucet di: https://www.svpchain.org/faucet");
    console.log(`Masukkan address wallet Anda: ${wallet.address}\n`);
    return;
  }

  // 2. Compile Counter.sol
  console.log("\n📦 Compiling contracts/Counter.sol...");
  const contractPath = path.resolve(__dirname, "./contracts/Counter.sol");
  const source = fs.readFileSync(contractPath, "utf8");

  const input = {
    language: "Solidity",
    sources: {
      "Counter.sol": {
        content: source,
      },
    },
    settings: {
      outputSelection: {
        "*": {
          "*": ["abi", "evm.bytecode"],
        },
      },
    },
  };

  const output = JSON.parse(solc.compile(JSON.stringify(input)));

  if (output.errors) {
    let hasError = false;
    for (const err of output.errors) {
      if (err.severity === "error") {
        console.error("Compile Error:", err.formattedMessage);
        hasError = true;
      }
    }
    if (hasError) return;
  }

  const contractFile = output.contracts["Counter.sol"]["Counter"];
  const abi = contractFile.abi;
  const bytecode = contractFile.evm.bytecode.object;

  console.log("✅ Contract compiled successfully!");

  // 3. Deploy Contract
  console.log("\n⏳ Mengirim transaksi deployment ke SVPChain Testnet...");
  const factory = new ethers.ContractFactory(abi, bytecode, wallet);

  // SVPChain min gasPrice: 2 Gwei
  const feeData = await provider.getFeeData();
  const gasPrice = feeData.gasPrice && feeData.gasPrice > 2000000000n ? feeData.gasPrice : 2000000000n;

  const contract = await factory.deploy({
    gasPrice: gasPrice
  });

  const deployTx = contract.deploymentTransaction();
  console.log("\n==================================================");
  console.log("🎉 TRANSAKSI DEPLOYMENT BERHASIL DIKIRIM!");
  console.log("==================================================");
  console.log("📌 Deployment Tx Hash :");
  console.log(deployTx.hash);
  console.log("🔍 Cek di Explorer    :", `https://explorer.svpchain.com/tx/${deployTx.hash}`);
  
  console.log("\nMenunggu konfirmasi block...");
  await contract.waitForDeployment();
  const contractAddress = await contract.getAddress();
  console.log("🏠 Deployed Address   :", contractAddress);
  console.log("==================================================");
  console.log("\n📋 SILAKAN SALIN TX HASH DI ATAS DAN PASTE KE QUEST:");
  console.log(deployTx.hash);
  console.log("==================================================");
}

main().catch((err) => {
  console.error("Error during deployment:", err);
  process.exit(1);
});
