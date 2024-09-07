// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test, console2} from "forge-std/Test.sol";
import {CreditManager} from "../contracts/CreditManager.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract CreditManagerTest is Test {
    CreditManager public creditManager;
    address public owner;
    address public user;

    function setUp() public {
        owner = address(this);
        user = address(0x1);
        creditManager = new CreditManager();
    }

    function testAddCredit() public {
        uint256 amount = 100;
        creditManager.addCredit(user, amount);
        assertEq(creditManager.getCredit(user), amount);
    }

    function testRemoveCredits() public {
        uint256 initialAmount = 200;
        uint256 removeAmount = 100;
        
        creditManager.addCredit(user, initialAmount);
        creditManager.removeCredits(user, removeAmount);
        
        assertEq(creditManager.getCredit(user), initialAmount - removeAmount);
    }

    function testAddBonusCredit() public {
        bytes32 nullifier = keccak256("test_nullifier");

        creditManager.addBonusCredit(user, nullifier);
        assertEq(creditManager.getCredit(user), 100); // BONUS_CREDIT_AMOUNT is 100

        vm.expectRevert(abi.encodeWithSignature("NullifierAlreadyUsed()"));
        creditManager.addBonusCredit(user, nullifier);
    }

    function testOnlyOwnerCanAddCredit() public {
        vm.prank(user);
        vm.expectRevert();
        creditManager.addCredit(user, 100);
    }

    function testOnlyOwnerCanRemoveCredits() public {
        vm.prank(user);
        vm.expectRevert();
        creditManager.removeCredits(user, 100);
    }

    function testCannotAddZeroCredits() public {
        vm.expectRevert(abi.encodeWithSignature("InvalidCreditAmount()"));
        creditManager.addCredit(user, 0);
    }

    function testCannotRemoveZeroCredits() public {
        vm.expectRevert(abi.encodeWithSignature("InvalidCreditAmount()"));
        creditManager.removeCredits(user, 0);
    }

    function testCannotRemoveMoreThanAvailable() public {
        creditManager.addCredit(user, 100);
        
        vm.expectRevert(abi.encodeWithSignature("InsufficientCredits()"));
        creditManager.removeCredits(user, 101);
    }
}
