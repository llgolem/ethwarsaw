// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Test, console2} from "forge-std/Test.sol";
import {CreditManager} from "../contracts/CreditManager.sol";

contract MockRedstonePayload is Test {
    function getRedstonePayload(
        string memory priceFeed
    ) public returns (bytes memory) {
        string[] memory args = new string[](3);
        args[0] = "node";
        args[1] = "getRedstonePayload.js";
        args[2] = priceFeed;

        return vm.ffi(args);
    }
}

contract CreditManagerTest is Test, MockRedstonePayload {
    CreditManager public creditManager;
    address public owner;
    address public user;

    function setUp() public {
        owner = address(this);
        user = address(0x1);
        creditManager = new CreditManager();
    }

    function testAddCredit() public {
        uint256 ethAmount = 1 ether;
        bytes memory redstonePayload = getRedstonePayload("ETH:2000:8");

        bytes memory encodedFunction = abi.encodeWithSignature(
            "addCredit(address,uint256)",
            user,
            ethAmount
        );
        bytes memory encodedFunctionWithRedstonePayload = abi.encodePacked(
            encodedFunction,
            redstonePayload
        );

        (bool success, ) = address(creditManager).call(
            encodedFunctionWithRedstonePayload
        );
        assertEq(success, true);

        uint256 expectedCredits = 40000; // (1 ETH * $2000) / $5 * 100 credits
        assertEq(creditManager.getCredit(user), expectedCredits);
    }

    function testRemoveCredits() public {
        // First, add credits
        bytes memory addRedstonePayload = getRedstonePayload("ETH:2000:8");
        bytes memory addEncodedFunction = abi.encodeWithSignature(
            "addCredit(address,uint256)",
            user,
            5 ether
        );
        bytes memory addEncodedFunctionWithRedstonePayload = abi.encodePacked(
            addEncodedFunction,
            addRedstonePayload
        );
        (bool addSuccess, ) = address(creditManager).call(
            addEncodedFunctionWithRedstonePayload
        );
        assertEq(addSuccess, true);

        uint256 removeAmount = 100000; // 100,000 credits
        bytes memory removeEncodedFunction = abi.encodeWithSignature(
            "removeCredits(address,uint256)",
            user,
            removeAmount
        );
        (bool removeSuccess, ) = address(creditManager).call(removeEncodedFunction);
        assertEq(removeSuccess, true);

        assertEq(creditManager.getCredit(user), 100000); // 200,000 - 100,000
    }

    function testAddBonusCredit() public {
        bytes32 nullifier = keccak256("test_nullifier");

        creditManager.addBonusCredit(user, nullifier);
        assertEq(creditManager.getCredit(user), 100); // Assuming BONUS_CREDIT_AMOUNT is 100

        vm.expectRevert(abi.encodeWithSignature("NullifierAlreadyUsed()"));
        creditManager.addBonusCredit(user, nullifier);
    }

    function testCalculateCredits() public {
        uint256 ethAmount = 1 ether;
        bytes memory redstonePayload = getRedstonePayload("ETH:2000:8");

        bytes memory encodedFunction = abi.encodeWithSignature(
            "calculateCredits(uint256)",
            ethAmount
        );
        bytes memory encodedFunctionWithRedstonePayload = abi.encodePacked(
            encodedFunction,
            redstonePayload
        );

        (bool success, bytes memory result) = address(creditManager).call(
            encodedFunctionWithRedstonePayload
        );
        assertEq(success, true);

        uint256 expectedCredits = 40000; // (1 ETH * $2000) / $5 * 100 credits
        assertEq(abi.decode(result, (uint256)), expectedCredits);
    }

    function testOnlyOwnerCanAddCredit() public {
        vm.prank(user);
        bytes memory redstonePayload = getRedstonePayload("ETH:2000:8");

        bytes memory encodedFunction = abi.encodeWithSignature(
            "addCredit(address,uint256)",
            user,
            1 ether
        );
        bytes memory encodedFunctionWithRedstonePayload = abi.encodePacked(
            encodedFunction,
            redstonePayload
        );

        vm.expectRevert("Ownable: caller is not the owner");
        (bool success, ) = address(creditManager).call(
            encodedFunctionWithRedstonePayload
        );
        assertEq(success, false);
    }

    function testOnlyOwnerCanRemoveCredits() public {
        vm.prank(user);
        vm.expectRevert("Ownable: caller is not the owner");
        creditManager.removeCredits(user, 100);
    }
}
