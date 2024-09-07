// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@redstone-finance/evm-connector/contracts/data-services/MainDemoConsumerBase.sol";

/// @title Credit Manager
/// @notice Manages user credits with ETH-based pricing and bonus credits
/// @dev Inherits from Ownable and MainDemoConsumerBase for price oracle functionality
contract CreditManager is Ownable(msg.sender), MainDemoConsumerBase {
    /// @notice Mapping of user addresses to their credit balances
    mapping(address => uint256) public credits;

    /// @notice Mapping to track used nullifiers for bonus credits
    mapping(bytes32 => bool) public usedNullifiers;

    /// @notice Emitted when credits are added to a user's balance
    /// @param user The address of the user receiving credits
    /// @param amount The amount of credits added
    event CreditAdded(address indexed user, uint256 amount);

    /// @notice Emitted when credits are removed from a user's balance
    /// @param user The address of the user losing credits
    /// @param amount The amount of credits removed
    event CreditRemoved(address indexed user, uint256 amount);

    /// @notice Emitted when bonus credits are added to a user's balance
    /// @param user The address of the user receiving bonus credits
    /// @param amount The amount of bonus credits added
    /// @param nullifier The nullifier used for the bonus credit
    event BonusCreditAdded(address indexed user, uint256 amount, bytes32 nullifier);

    /// @dev Constants for credit calculations and bonus amounts
    uint256 private constant CREDITS_PER_5_USD = 100;
    uint256 private constant USD_DENOMINATOR = 5e18;
    uint256 private constant BONUS_CREDIT_AMOUNT = 100;

    /// @dev Custom errors for better gas efficiency and clarity
    error InvalidEthAmount();
    error InvalidEthPrice();
    error InsufficientCredits();
    error NullifierAlreadyUsed();

    /// @notice Adds credits to a user's balance based on ETH amount
    /// @param user The address of the user to receive credits
    /// @param ethAmount The amount of ETH to convert to credits
    function addCredit(address user, uint256 ethAmount) external onlyOwner {
        if (ethAmount == 0) revert InvalidEthAmount();
        
        uint256 creditsToAdd = calculateCredits(ethAmount);
        if (creditsToAdd == 0) revert InvalidEthAmount();
        
        credits[user] += creditsToAdd;
        emit CreditAdded(user, creditsToAdd);
    }

    /// @notice Removes credits from a user's balance
    /// @param user The address of the user to remove credits from
    /// @param amount The amount of credits to remove
    function removeCredits(address user, uint256 amount) external onlyOwner {
        if (amount == 0) revert InvalidEthAmount();
        if (credits[user] < amount) revert InsufficientCredits();
        
        credits[user] -= amount;
        emit CreditRemoved(user, amount);
    }

    /// @notice Retrieves the credit balance of a user
    /// @param user The address of the user to check
    /// @return The credit balance of the user
    function getCredit(address user) external view returns (uint256) {
        return credits[user];
    }

    /// @notice Calculates the number of credits based on ETH amount
    /// @param ethAmount The amount of ETH to convert to credits
    /// @return The calculated number of credits
    function calculateCredits(uint256 ethAmount) public view returns (uint256) {
        uint256 ethPrice = getOracleNumericValueFromTxMsg(bytes32("ETH"));
        if (ethPrice == 0) revert InvalidEthPrice();

        uint256 usdValue = (ethAmount * ethPrice) / 1e18; // Convert to USD value
        return (usdValue * CREDITS_PER_5_USD) / USD_DENOMINATOR;
    }

    /// @notice Adds bonus credits to a user's balance using a Worldcoin nullifier
    /// @param user The address of the user to receive bonus credits
    /// @param nullifier The Worldcoin nullifier to verify first-time use
    function addBonusCredit(address user, bytes32 nullifier) external {
        if (usedNullifiers[nullifier]) revert NullifierAlreadyUsed();
        
        usedNullifiers[nullifier] = true;
        credits[user] += BONUS_CREDIT_AMOUNT;
        
        emit BonusCreditAdded(user, BONUS_CREDIT_AMOUNT, nullifier);
    }
}
