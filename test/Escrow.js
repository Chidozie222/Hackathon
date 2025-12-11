const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Escrow", function () {
  let Escrow;
  let escrow;
  let buyer, seller, arbiter;

  beforeEach(async function () {
    [buyer, seller, arbiter] = await ethers.getSigners();
    const EscrowFactory = await ethers.getContractFactory("Escrow");
    // Buyer deploys usually, passing buyer(self), seller and arbiter
    escrow = await EscrowFactory.connect(buyer).deploy(buyer.address, seller.address, arbiter.address, { value: ethers.parseEther("1.0") });
    await escrow.waitForDeployment();
  });

  it("Should store the correct balances and addresses", async function () {
    expect(await escrow.buyer()).to.equal(buyer.address);
    expect(await escrow.seller()).to.equal(seller.address);
    expect(await escrow.arbiter()).to.equal(arbiter.address);
    expect(await ethers.provider.getBalance(escrow.target)).to.equal(ethers.parseEther("1.0"));
  });

  it("Should allow buyer to confirm delivery", async function () {
    const initialSellerBalance = await ethers.provider.getBalance(seller.address);
    
    const tx = await escrow.connect(buyer).confirmDelivery();
    await tx.wait();

    const finalSellerBalance = await ethers.provider.getBalance(seller.address);
    // Use BigInt for calculation or just check approx if creating new blocks
    // In hardhat, balances are predictable.
    // The seller receives 1.0 ETH.
    expect(finalSellerBalance).to.equal(initialSellerBalance + ethers.parseEther("1.0"));
  });

  it("Should allow refund by arbiter", async function () {
    const initialBuyerBalance = await ethers.provider.getBalance(buyer.address);
    
    const tx = await escrow.connect(arbiter).refund();
    await tx.wait();
    
    const finalBuyerBalance = await ethers.provider.getBalance(buyer.address);
    // Buyer receives 1.0 ETH.
    // Buyer balance is initial + refund.
    // Note: buyer didn't pay gas for THIS tx, arbiter did.
    expect(finalBuyerBalance).to.equal(initialBuyerBalance + ethers.parseEther("1.0"));
  });

  it("Should allow refund by seller", async function () {
      const initialBuyerBalance = await ethers.provider.getBalance(buyer.address);
      const tx = await escrow.connect(seller).refund();
      await tx.wait();
      const finalBuyerBalance = await ethers.provider.getBalance(buyer.address);
      expect(finalBuyerBalance).to.equal(initialBuyerBalance + ethers.parseEther("1.0"));
  });
});
