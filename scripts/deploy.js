const hre = require("hardhat");

async function main() {
  const [deployer, seller, arbiter] = await hre.ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  // Deploy Escrow with 1 ETH deposit
  // Arguments: seller address, arbiter address
  const escrow = await hre.ethers.deployContract("Escrow", [seller.address, arbiter.address], {
    value: hre.ethers.parseEther("1.0"),
  });

  await escrow.waitForDeployment();

  console.log(`Escrow deployed to ${escrow.target} with 1 ETH`);
  console.log(`Buyer: ${deployer.address}`);
  console.log(`Seller: ${seller.address}`);
  console.log(`Arbiter: ${arbiter.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
