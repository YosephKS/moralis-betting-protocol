// SPDX-License-Identifier: MIT
pragma solidity >=0.4.17 <0.9.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "./BettingGame.sol";
import "./interfaces/IERC20Burnable.sol";

contract BettingGameRegistry is Ownable {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;
    using SafeERC20 for IERC20Burnable;

    event BettingGameCreated(
        uint256 bettingGameId,
        address creator,
        uint256 sides,
        uint256 expiryTime
    );

    struct DepositFulfillment {
        uint256 bettingGameId;
        address tokenAddress;
    }

    address public nativeTokenAddress;
    address internal vrfCoordinatorAddress;
    address internal linkTokenAddress;
    bytes32 internal keyHash;
    uint256 internal fee;
    uint256 private bettingGameCount;
    mapping(uint256 => address) public bettingGameDataRegistry;
    mapping(bytes32 => DepositFulfillment)
        public requestIdToBettingGameIdRegistry;

    constructor(
        address _nativeTokenAddress,
        address _vrfCoordinatorAddress,
        address _linkTokenAddress,
        bytes32 _keyHash,
        uint256 _fee
    ) {
        nativeTokenAddress = _nativeTokenAddress;
        vrfCoordinatorAddress = _vrfCoordinatorAddress;
        linkTokenAddress = _linkTokenAddress;
        keyHash = _keyHash;
        fee = _fee;
        bettingGameCount = 0;
    }

    /**
     * Making sure that the `_bettingGameId` is valid
     */
    modifier onlyExistingGame(uint256 _bettingGameId) {
        require(_bettingGameId < bettingGameCount);
        _;
    }

    function setNativeTokenAddress(address newNativeTokenAddress)
        public
        onlyOwner
    {
        nativeTokenAddress = newNativeTokenAddress;
    }

    function createGame(uint256 _sides) public {
        // 1. Burn some token
        IERC20Burnable nativeToken = IERC20Burnable(nativeTokenAddress);
        uint256 burnPrice = SafeMath.mul(0.01 * 10**18, _sides);
        nativeToken.safeApprove(address(this), burnPrice);
        nativeToken.burnFrom(msg.sender, burnPrice);

        // 2. Create new `BettingGame` smart contract
        BettingGame newBettingGame = new BettingGame(
            vrfCoordinatorAddress,
            linkTokenAddress,
            keyHash,
            fee,
            msg.sender,
            _sides,
            block.timestamp + 7 days
        );
        bettingGameDataRegistry[bettingGameCount] = address(newBettingGame);

        // 3. Increase Betting Game Counter
        bettingGameCount = SafeMath.add(bettingGameCount, 1);
    }

    function challengeGame(uint256 _bettingGameId)
        public
        onlyExistingGame(_bettingGameId)
    {
        BettingGame existingGame = BettingGame(
            bettingGameDataRegistry[_bettingGameId]
        );
        require(
            existingGame.creator() != msg.sender,
            "You are the creator of this game!"
        );
        require(
            existingGame.challenger() != address(0),
            "Challenger position is filled!"
        );
        require(
            block.timestamp < existingGame.expiryTime(),
            "This game has expired!"
        );

        // Burn the token (to avoid mallicious attempt at rigging the game)
        IERC20Burnable nativeToken = IERC20Burnable(nativeTokenAddress);
        uint256 burnPrice = SafeMath.mul(0.01 * 10**18, existingGame.sides());
        nativeToken.safeApprove(address(this), burnPrice);
        nativeToken.burnFrom(msg.sender, burnPrice);

        existingGame.challenge(msg.sender);
    }

    function cancelGame(uint256 _bettingGameId)
        public
        onlyExistingGame(_bettingGameId)
    {
        BettingGame existingGame = BettingGame(
            bettingGameDataRegistry[_bettingGameId]
        );

        existingGame.cancel(msg.sender);
    }

    function playGame(uint256 _bettingGameId)
        public
        onlyExistingGame(_bettingGameId)
    {
        BettingGame existingGame = BettingGame(
            bettingGameDataRegistry[_bettingGameId]
        );

        existingGame.play(msg.sender);
    }

    function depositBettingAsset(
        address _tokenAddress,
        address _aggregatorAddress,
        uint256 _bettingGameId
    ) public onlyExistingGame(_bettingGameId) {
        BettingGame existingGame = BettingGame(
            bettingGameDataRegistry[_bettingGameId]
        );
        require(
            msg.sender == existingGame.creator() ||
                msg.sender == existingGame.challenger(),
            "You are not the creator or the challenger of this game!"
        );
        require(
            block.timestamp < existingGame.expiryTime(),
            "This game has expired!"
        );

        AggregatorV3Interface priceFeed = AggregatorV3Interface(
            _aggregatorAddress
        );

        // 1. Get Price Feeds Data from Chainlink
        (, int256 price, , , ) = priceFeed.latestRoundData();

        // 2. Transfer ERC20 token from user to the `BettingGame` contract
        IERC20 token = IERC20(_tokenAddress);
        uint256 tokenAmount = SafeMath.div(
            SafeMath.mul(uint256(price), existingGame.sides()),
            100
        );
        token.safeApprove(address(this), tokenAmount);
        token.safeTransferFrom(msg.sender, address(existingGame), tokenAmount);
        existingGame.deposit(msg.sender, _tokenAddress, tokenAmount);
    }

    function withdrawBettingAsset(uint256 _bettingGameId)
        public
        onlyExistingGame(_bettingGameId)
    {
        BettingGame existingGame = BettingGame(
            bettingGameDataRegistry[_bettingGameId]
        );

        existingGame.withdraw(msg.sender);
    }
}
