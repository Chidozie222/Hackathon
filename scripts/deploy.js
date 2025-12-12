const hre = require("hardhat");
const fs = require("fs");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Network:", hre.network.name);

  const factory = await hre.ethers.deployContract("EscrowFactory");
  await factory.waitForDeployment();

  const address = await factory.getAddress();
  
  const output = `
========================================
DEPLOYMENT SUCCESSFUL!
========================================
EscrowFactory deployed to: ${address}
Network: ${hre.network.name}
Deployer: ${deployer.address}
========================================

Update your .env file with:
NEXT_PUBLIC_FACTORY_ADDRESS=${address}
========================================
`;

  console.log(output);
  
  // Write to file for easy access
  fs.writeFileSync("FACTORY_ADDRESS.txt", address);
  console.log("\nFactory address also saved to FACTORY_ADDRESS.txt");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
