// SPDX-License-Identifier: The Unlicense
pragma solidity ^0.8.26;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract RaidMaster is Ownable {

    uint256 public totalRaids = 0;
    address public ORACLE_ADDRESS;
    address public BURN_ADDRESS;
    address public MARKETING_ADDRESS;
    address public STAKING_ADDRESS;
    IERC20 public rikyToken;

    mapping(uint256 => address) public raids;

    constructor() Ownable(msg.sender) {
        ORACLE_ADDRESS = 0x6833013ddfB590F2E36deD9E96A63a81053d88Ff;
        BURN_ADDRESS = 0x000000000000000000000000000000000000dEaD;
        MARKETING_ADDRESS = 0x454C8Ab2001C422A2D06e3aBfaDf038186c66177;
        STAKING_ADDRESS = 0xAAf4De6281C8B6B267bF237d05B6C1Ed7DB40F81;
        rikyToken = IERC20(0x729031B3995538DDF6B6BcE6E68D5D6fDEb3CCB5);
    }

    event RaidCreated(uint256 gameId, address raidAddress);
    event AddressUpdated(uint8 indexed addressType, address newAddress);
    event MechanismsExecuted(uint256 marketingAmount, uint256 burnAmount, uint256 stakingAmount);

    function createRaid(
        uint256 ticketPrice,
        uint256 gameLength,
        address assetAddress,
        string memory uri,
        uint256[5] memory purchasableAmounts,
        bytes memory bytecode,
        string[2] memory twitters
    ) external onlyOwner {
        require(isERC20(assetAddress), "Asset address is not a valid ERC20 token");
        address newRaid = _deployContract(bytecode, abi.encode(ticketPrice, gameLength, assetAddress, address(this), uri, purchasableAmounts,twitters));
        raids[totalRaids] = newRaid;
        emit RaidCreated(totalRaids, newRaid);
        totalRaids++;
    }

    function updateAddress(uint8 addressType, address newAddress) external onlyOwner {
        require(addressType <= 3, "Invalid address type");

        if (addressType == 0) {
            BURN_ADDRESS = newAddress;
        } else if (addressType == 1) {
            MARKETING_ADDRESS = newAddress;
        } else if (addressType == 2) {
            STAKING_ADDRESS = newAddress;
        } else if (addressType == 3) {
            ORACLE_ADDRESS = newAddress;
        }

        emit AddressUpdated(addressType, newAddress);
    }

    function handleDistributions() external onlyOwner {
        uint256 balance = rikyToken.balanceOf(address(this));
        require(balance > 0, "No RIKY balance to distribute");

        uint256 marketingAmount = (balance * 50) / 100;
        uint256 stakingAmount = (balance * 25) / 100;

        require(rikyToken.transfer(MARKETING_ADDRESS, marketingAmount), "Transfer to MARKETING_ADDRESS failed");
        require(rikyToken.transfer(STAKING_ADDRESS, stakingAmount), "Transfer to STAKING_ADDRESS failed");

        uint256 remainingBalance = rikyToken.balanceOf(address(this));
        require(rikyToken.transfer(BURN_ADDRESS, remainingBalance), "Transfer to STAKING_ADDRESS failed");

        emit MechanismsExecuted(marketingAmount, stakingAmount, remainingBalance);
    }

    function isERC20(address assetAddress) internal view returns (bool) {
        uint256 codeSize;
        assembly {
            codeSize := extcodesize(assetAddress)
        }
        if (codeSize == 0) {
            return false;
        }

        try IERC20(assetAddress).totalSupply() returns (uint256) {
            return true;
        } catch {
            return false;
        }
    }

    function _deployContract(bytes memory bytecode, bytes memory constructorArgs) internal returns (address) {
        bytes memory payload = abi.encodePacked(bytecode, constructorArgs);
        address addr;
        assembly {
            addr := create(0, add(payload, 0x20), mload(payload))
            if iszero(extcodesize(addr)) {
                revert(0, 0)
            }
        }
        return addr;
    }
}
