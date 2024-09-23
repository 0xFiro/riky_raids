// SPDX-License-Identifier: The Unlicense
pragma solidity ^0.8.26;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Base64.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

interface IGameMasterContract {
    function ORACLE_ADDRESS() external view returns (address);
}

contract Raid is ReentrancyGuard, ERC1155 {
    using Strings for uint256; 

    uint256 public ticketPrice;
    uint256 public endBlock;
    address public assetAddress;
    address public winner;
    uint256 public winningTicket;
    uint256 public ticketsPurchased;
    uint256 public totalWeight;
    string private baseUri;
    string[2] public twitters;
    IGameMasterContract public gameMasterContract;
    IERC20 public rikyToken;

    struct TicketData {
        uint256 nftID;
        address holder;
        string xHandle;
        bool socialCheck;
        uint256 weight;
    }

    struct TokenInfo {
        string tokenURI;
        uint256 totalPurchasable;
        uint256 tokenPrice;
    }

    mapping(uint256 => TicketData) public tickets;
    mapping(uint256 => uint256) public totalPurchasable;

    event TicketPurchased(address indexed player, uint256 ticketNumber, string xHandle);
    event RaidEnded(address indexed winner, address loot);
    event LootClaimed(address indexed winner, address loot);
    event BatchPurchased(address indexed player, uint256 batchSize);

    constructor(
        uint256 _ticketPrice,
        uint256 _gameLength,
        address _assetAddress,
        address _owner,
        string memory _uri,
        uint256[5] memory purchasableAmounts,
        string[2] memory _twitters
    ) ERC1155(_uri) {
        twitters = _twitters;
        baseUri = _uri;
        ticketPrice = _ticketPrice;
        endBlock = block.number + _gameLength;
        assetAddress = _assetAddress;
        gameMasterContract = IGameMasterContract(_owner);
        rikyToken = IERC20(0x729031B3995538DDF6B6BcE6E68D5D6fDEb3CCB5);
        for (uint i = 0; i < purchasableAmounts.length; i++) {
            totalPurchasable[i + 1] = purchasableAmounts[i];
        }
    }

    modifier oracle() {
        require(gameMasterContract.ORACLE_ADDRESS() == msg.sender, "Caller is not the oracle");
        _;
    }

    function buyBatch(uint256 batchSize, string memory xHandle) external nonReentrant {
        require(block.number < endBlock, "Raid has ended");
        require(batchSize > 0 && batchSize <= 5, "Invalid batch size");
        require(totalPurchasable[batchSize] > 0, "Batch sold out");

        uint256 totalCost = ticketPrice * batchSize;
        require(rikyToken.transferFrom(msg.sender, address(this), totalCost), "RIKY transfer failed");

        // Assign weight based on batch size with .5 increments
        uint256 weight = 10 + (batchSize - 1) * 5; 

        for (uint256 i = 0; i < batchSize; i++) {
            ticketsPurchased++;
            tickets[ticketsPurchased] = TicketData(batchSize, msg.sender, xHandle, false, weight);
            totalWeight += weight;
            emit TicketPurchased(msg.sender, ticketsPurchased, xHandle);
        }

        _mint(msg.sender, batchSize, 1, "");
        totalPurchasable[batchSize]--;
        emit BatchPurchased(msg.sender, batchSize);
    }

    function endRaid() external {
        require(block.number > endBlock, "Raid is still ongoing");
        require(winner == address(0), "Raid already ended");

        uint256 randomNumber = uint256(blockhash(endBlock)) % totalWeight + 1;
        uint256 cumulativeWeight = 0;

        for (uint256 i = 1; i <= ticketsPurchased; i++) {
            cumulativeWeight += tickets[i].weight;
            if (randomNumber <= cumulativeWeight) {
                winningTicket = i;
                winner = tickets[i].holder;
                break;
            }
        }

        emit RaidEnded(winner, assetAddress);
    }

    function claimLoot() external nonReentrant {
        require(msg.sender == winner, "Not the winner");
        require(winner != address(0), "Raid not ended");
        require(tickets[winningTicket].socialCheck, "You haven't followed all socials");

        require(IERC20(assetAddress).transfer(winner, IERC20(assetAddress).balanceOf(address(this))), "Loot transfer failed");
        require(rikyToken.transfer(address(gameMasterContract), rikyToken.balanceOf(address(this))), "RIKY transfer failed");

        emit LootClaimed(winner, assetAddress);
    }

    function verifySocials(uint256 ticketNum) external oracle {
        tickets[ticketNum].socialCheck = true;
    }

    function uri(uint256 tokenId) public view virtual override returns (string memory) {
        return string(abi.encodePacked(baseUri, tokenId.toString(), ".json")); 
    }

    function getTokenInfos() public view returns (TokenInfo[5] memory) {
        TokenInfo[5] memory infos;

        for (uint256 i = 1; i <= 5; i++) {
            infos[i - 1] = TokenInfo({
                tokenURI: uri(i),
                totalPurchasable: totalPurchasable[i],
                tokenPrice: ticketPrice * i
            });
        }

        return infos;
    }
}
