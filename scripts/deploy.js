import hre from "hardhat";

async function main() {
  console.log("==========================================");
  console.log("Deploying Counter to SVPChain Testnet...");
  console.log("==========================================");

  const signers = await hre.ethers.getSigners();
  if (signers.length === 0) {
    throw new Error("No deployer account configured. Please set PRIVATE_KEY in your .env file.");
  }
  const deployer = signers[0];

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Deployer Address :", deployer.address);
  console.log("Deployer Balance :", hre.ethers.formatEther(balance), "SVP");

  if (balance === 0n) {
    console.warn("\n⚠️ Warning: Deployer balance is 0 SVP.");
    console.warn("Please get testnet SVP from faucet: https://www.svpchain.org/faucet\n");
  }

  const Counter = await hre.ethers.getContractFactory("Counter");
  const counter = await Counter.deploy();

  const deployTx = counter.deploymentTransaction();
  console.log("Deployment Tx Hash:", deployTx.hash);

  console.log("Waiting for block confirmation...");
  await counter.waitForDeployment();

  const contractAddress = await counter.getAddress();
  console.log("==========================================");
  console.log("✅ Contract Deployed Successfully!");
  console.log("Contract Address  :", contractAddress);
  console.log("Deployment Tx Hash:", deployTx.hash);
  console.log("Explorer Link     :", `https://explorer.svpchain.com/tx/${deployTx.hash}`);
  console.log("==========================================");
  console.log("\n📋 Paste this Tx Hash to your quest verification:");
  console.log(deployTx.hash);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
