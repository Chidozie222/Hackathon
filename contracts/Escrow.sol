// SPDX-License-Identifier: MIT
pragma solidity 0.8.27;

contract Escrow {
	address public buyer;
	address public seller;
	address public arbiter;
	bool public isDeliveryConfirmed;
	bool public isRefunded;
	bool public isDisputed;
	string public disputeReason;
	uint256 public disputeTimestamp;

	event Deposit(address indexed buyer, uint amount);
	event DeliveryConfirmed(address indexed buyer, uint amount);
	event Refunded(address indexed buyer, uint amount);
	event DisputeRaised(address indexed buyer, string reason, uint256 timestamp);

	constructor(address _buyer, address _seller, address _arbiter) payable {
		buyer = _buyer;
		seller = _seller;
		arbiter = _arbiter;
		emit Deposit(buyer, msg.value);
	}

	function confirmDelivery() external {
		require(msg.sender == buyer, "Only buyer can confirm delivery");
		require(address(this).balance > 0, "No funds to release");
		
		isDeliveryConfirmed = true;
		(bool sent, ) = payable(seller).call{value: address(this).balance}("");
		require(sent, "Failed to send Ether");
		
		emit DeliveryConfirmed(buyer, address(this).balance);
	}

	function raiseDispute(string memory _reason) external {
		require(msg.sender == buyer, "Only buyer can raise dispute");
		require(!isDisputed, "Dispute already raised");
		require(!isDeliveryConfirmed, "Cannot dispute after delivery confirmed");
		require(!isRefunded, "Cannot dispute after refund");
		require(bytes(_reason).length > 0, "Dispute reason cannot be empty");
		require(bytes(_reason).length <= 1000, "Dispute reason too long");
		
		isDisputed = true;
		disputeReason = _reason;
		disputeTimestamp = block.timestamp;
		
		emit DisputeRaised(buyer, _reason, block.timestamp);
	}

	function refund() external {
		require(msg.sender == seller || msg.sender == arbiter, "Only seller or arbiter can refund");
		require(address(this).balance > 0, "No funds to refund");

		isRefunded = true;
		(bool sent, ) = payable(buyer).call{value: address(this).balance}("");
		require(sent, "Failed to send Ether");

		emit Refunded(buyer, address(this).balance);
	}

	function getBalance() public view returns (uint) {
		return address(this).balance;
	}
}
