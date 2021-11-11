// SPDX-License-Identifier: MIT
pragma solidity >=0.4.17 <0.9.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";
import "./BettingGame.sol";
import "./interfaces/IERC20Burnable.sol";

contract BettingGameRegistry is Ownable, ChainlinkClient {
    using SafeMath for uint256;
    using Chainlink for Chainlink.Request;
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
        setPublicChainlinkToken();
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
        require(
            existingGame.creator() != msg.sender,
            "You are the creator of this game!"
        );
        require(
            block.timestamp < existingGame.expiryTime(),
            "This game has not expired!"
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
        string memory _symbols,
        uint256 _bettingGameId,
        address _oracle,
        bytes32 _jobId,
        uint256 _fee
    ) public onlyExistingGame(_bettingGameId) returns (bytes32 requestId) {
        Chainlink.Request memory request = buildChainlinkRequest(
            _jobId,
            address(this),
            this.fulfill.selector
        );

        // 1. Set the URL to perform the GET request on
        request.add(
            "get",
            string(
                abi.encodePacked(
                    "https://min-api.cryptocompare.com/data/pricemultifull?tsyms=ETH&fsyms=",
                    _symbols
                )
            )
        );

        request.add(
            "path",
            string(abi.encodePacked("RAW.ETH.", _symbols, ".VOLUME24HOUR"))
        );

        // 2. Multiply the result by 1000000000000000000 to remove decimals
        int256 timesAmount = 10**18;
        request.addInt("times", timesAmount);

        // 3. Sends the request
        requestId = sendChainlinkRequestTo(_oracle, request, _fee);
        requestIdToBettingGameIdRegistry[requestId] = DepositFulfillment(
            _bettingGameId,
            _tokenAddress
        );
    }

    function fulfill(bytes32 _requestId, uint256 _price)
        public
        recordChainlinkFulfillment(_requestId)
    {
        uint256 bettingGameId = requestIdToBettingGameIdRegistry[_requestId]
            .bettingGameId;
        address tokenAddress = requestIdToBettingGameIdRegistry[_requestId]
            .tokenAddress;
        BettingGame existingGame = BettingGame(
            bettingGameDataRegistry[bettingGameId]
        );

        existingGame.deposit(msg.sender, tokenAddress, _price);
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
