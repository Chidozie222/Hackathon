const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("EscrowFactory", function () {
  it("Should create a new Escrow contract", async function () {
    const [deployer, seller, arbiter] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("EscrowFactory");
    const factory = await Factory.deploy();
    await factory.waitForDeployment();

    const tx = await factory.createEscrow(seller.address, arbiter.address, { value: ethers.parseEther("1.0") });
    const receipt = await tx.wait();

    const escrows = await factory.getAllEscrows();
    expect(escrows.length).to.equal(1);
    expect(escrows[0].buyer).to.equal(deployer.address);
    expect(escrows[0].amount).to.equal(ethers.parseEther("1.0"));
    expect(escrows[0].seller).to.equal(seller.address);
    expect(escrows[0].arbiter).to.equal(arbiter.address);
  });
});
