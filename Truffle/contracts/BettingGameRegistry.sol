// SPDX-License-Identifier: MIT
pragma solidity >=0.4.17 <0.9.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";
import "./BettingGame.sol";
import "./IERC20Burnable.sol";

contract BettingGameRegistry is Ownable, ChainlinkClient {
    using SafeMath for uint256;

    event BettingGameCreated(
        uint256 bettingGameId,
        address creator,
        uint256 sides,
        uint256 expiryTime
    );
    event BettingGameChallengerRegistered(
        uint256 bettingGameId,
        address challenger
    );

    address public nativeTokenAddress;
    address internal vrfCoordinatorAddress;
    address internal linkTokenAddress;
    bytes32 internal keyHash;
    uint256 internal fee;
    uint256 private bettingGameCount = 0;
    mapping(uint256 => address) public bettingGameDataRegistry;

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
    }

    /**
     * Making sure that the `_bettingGameId` is valid
     */
    modifier onlyExistingGame(uint256 _bettingGameId) {
        require(_bettingGameId <= bettingGameCount);
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
        nativeToken.burnFrom(msg.sender, SafeMath.mul(0.01 * 10**18, _sides));

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

        existingGame.challenge(msg.sender, nativeTokenAddress);
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

    function depositBettingAsset(address _tokenAddress, uint256 _bettingGameId)
        public
        onlyExistingGame(_bettingGameId)
    {
        BettingGame existingGame = BettingGame(
            bettingGameDataRegistry[_bettingGameId]
        );

        existingGame.deposit(msg.sender, _tokenAddress);
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
