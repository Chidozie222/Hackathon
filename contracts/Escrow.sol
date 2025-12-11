// SPDX-License-Identifier: MIT
pragma solidity 0.8.27;

contract Escrow {
	address public buyer;
	address public seller;
	address public arbiter;
	bool public isDeliveryConfirmed;
	bool public isRefunded;

	event Deposit(address indexed buyer, uint amount);
	event DeliveryConfirmed(address indexed buyer, uint amount);
	event Refunded(address indexed buyer, uint amount);

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
