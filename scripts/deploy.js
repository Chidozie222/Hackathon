const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  const factory = await hre.ethers.deployContract("EscrowFactory");
  await factory.waitForDeployment();

  console.log(`EscrowFactory deployed to ${factory.target}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
