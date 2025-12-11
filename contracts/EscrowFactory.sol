// SPDX-License-Identifier: MIT
pragma solidity 0.8.27;

import "./Escrow.sol";

contract EscrowFactory {
    event EscrowCreated(address indexed escrowAddress, address indexed buyer, address indexed seller, uint amount);

    struct EscrowInfo {
        address escrowAddress;
        address buyer;
        address seller;
        address arbiter;
        uint amount;
    }

    EscrowInfo[] public escrows;

    function createEscrow(address _seller, address _arbiter) external payable {
        Escrow newEscrow = (new Escrow){value: msg.value}(msg.sender, _seller, _arbiter); // Pass msg.sender as buyer
        escrows.push(EscrowInfo(address(newEscrow), msg.sender, _seller, _arbiter, msg.value));
        emit EscrowCreated(address(newEscrow), msg.sender, _seller, msg.value);
    }

    function getAllEscrows() external view returns (EscrowInfo[] memory) {
        return escrows;
    }
}
