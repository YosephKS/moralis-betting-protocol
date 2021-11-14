// SPDX-License-Identifier: MIT
pragma solidity >=0.4.17 <0.9.0;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBase.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "../interfaces/IERC20Burnable.sol";

contract BettingGame is VRFConsumerBase {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    enum BettingGameStatus {
        OPEN,
        CLOSED
    }

    struct DepositMetadata {
        mapping(uint256 => address) balance;
        uint256 balanceCount;
    }

    bytes32 internal keyHash;
    uint256 internal fee;
    address public creator;
    address public challenger;
    uint256 public sides;
    BettingGameStatus public status;
    uint256 public expiryTime;
    address public nativeTokenAddress;
    address public winner;

    mapping(bytes32 => address) requestIdToAddressRegistry;
    mapping(address => uint256) public playerBetRecordRegistry;
    mapping(address => DepositMetadata) public depositBalanceRegistry;

    constructor(
        address _vrfCoordinatorAddress,
        address _linkTokenAddress,
        bytes32 _keyHash,
        uint256 _fee,
        address _creator,
        uint256 _sides,
        address _nativeTokenAddress
    ) VRFConsumerBase(_vrfCoordinatorAddress, _linkTokenAddress) {
        keyHash = _keyHash;
        fee = _fee;
        creator = _creator;
        challenger = address(0);
        sides = _sides;
        status = BettingGameStatus.OPEN;
        expiryTime = block.timestamp + 30 minutes;
        nativeTokenAddress = _nativeTokenAddress;
    }

    /**
     * Making sure that `_msgSend` is either a creator or not (depends `isEqual`)
     */
    modifier onlyCreator(bool isEqual) {
        if (isEqual) {
            require(
                creator == msg.sender,
                "You are not the creator of this game!"
            );
        } else {
            require(creator != msg.sender, "You are the creator of this game!");
        }
        _;
    }

    /**
     * Making sure that `_msgSend` is either the creator or the challenger of the game
     */
    modifier onlyCreatorAndChallenger() {
        require(
            msg.sender == creator || msg.sender == challenger,
            "You are not the creator or the challenger of this game!"
        );
        _;
    }

    /**
     * Making sure that the challenger position is not filled
     */
    modifier onlyEmptyChallenger() {
        require(challenger == address(0), "Challenger position is filled!");
        _;
    }

    /**
     * Making sure that this game has either expired or not (depends on `isExpired`)
     */
    modifier onlyExpiredGame(bool isExpired) {
        if (isExpired) {
            require(
                block.timestamp >= expiryTime ||
                    status == BettingGameStatus.CLOSED,
                "This game has not expired!"
            );
        } else {
            require(
                block.timestamp < expiryTime &&
                    status == BettingGameStatus.OPEN,
                "This game has expired!"
            );
        }
        _;
    }

    modifier onlyWinner() {
        require(msg.sender == winner, "You are not the winner of this game!");
        _;
    }

    /**
     * Allow `_msgSend` address to register as a challenger
     */
    function challenge()
        public
        onlyCreator(false)
        onlyEmptyChallenger
        onlyExpiredGame(false)
    {
        IERC20Burnable nativeToken = IERC20Burnable(nativeTokenAddress);
        uint256 burnPrice = SafeMath.mul(0.01 * 10**18, sides);
        nativeToken.burnFrom(msg.sender, burnPrice);

        challenger = msg.sender;
    }

    /**
     *  Cancel the created Betting Game
     */
    function cancel() public onlyCreator(true) {
        status = BettingGameStatus.CLOSED;
    }

    /**
     * Allow player `_msgSend` to place a bet on the game
     */
    function play()
        public
        onlyCreatorAndChallenger
        onlyExpiredGame(false)
        returns (bytes32 requestId)
    {
        require(
            LINK.balanceOf(address(this)) >= fee,
            "Not enough LINK - fill contract with faucet"
        );
        requestId = requestRandomness(keyHash, fee);
        requestIdToAddressRegistry[requestId] = msg.sender;
    }

    /**
     * This is a function overriden from Chainlink VRF contract to get the randomness result
     */
    function fulfillRandomness(bytes32 requestId, uint256 randomness)
        internal
        override
    {
        address playerAddress = requestIdToAddressRegistry[requestId];
        playerBetRecordRegistry[playerAddress] = (randomness % sides) + 1;

        if (
            playerBetRecordRegistry[creator] != 0 &&
            playerBetRecordRegistry[challenger] != 0
        ) {
            // Close the game
            status = BettingGameStatus.CLOSED;

            if (
                (playerBetRecordRegistry[creator] +
                    playerBetRecordRegistry[challenger]) %
                    2 ==
                0
            ) {
                winner = creator;
            } else {
                winner = challenger;
            }
        }
    }

    /**
     * Handle depositing ERC20 token to the `BettingGame` contract
     */
    function deposit(address _tokenAddress, address _aggregatorAddress)
        public
        onlyCreatorAndChallenger
        onlyExpiredGame(false)
    {
        AggregatorV3Interface priceFeed = AggregatorV3Interface(
            _aggregatorAddress
        );

        // 1. Get Price Feeds Data from Chainlink
        (, int256 price, , , ) = priceFeed.latestRoundData();

        // 2. Transfer ERC20 token from user to the `BettingGame` contract
        IERC20 token = IERC20(_tokenAddress);
        uint256 tokenAmount = SafeMath.div(
            SafeMath.mul(uint256(price), sides),
            100
        );
        token.safeTransferFrom(msg.sender, address(this), tokenAmount);

        // Register deposit data to `depositBalanceRegistry` mapping
        uint256 balanceCount = depositBalanceRegistry[msg.sender].balanceCount;
        depositBalanceRegistry[msg.sender].balance[
            balanceCount
        ] = _tokenAddress;
        depositBalanceRegistry[msg.sender].balanceCount = SafeMath.add(
            balanceCount,
            1
        );
    }

    /**
     * Handle creator and challenger ERC20 token withdrawal after both have played
     */
    function withdraw()
        public
        onlyCreatorAndChallenger
        onlyExpiredGame(true)
        onlyWinner
    {
        for (
            uint256 i = 0;
            i < depositBalanceRegistry[msg.sender].balanceCount;
            i++
        ) {
            IERC20 token = IERC20(
                depositBalanceRegistry[msg.sender].balance[i]
            );
            token.safeTransfer(msg.sender, token.balanceOf(address(this)));
        }
    }
}
