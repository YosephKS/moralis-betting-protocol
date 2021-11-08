// SPDX-License-Identifier: MIT
pragma solidity >=0.4.17 <0.9.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";
import "./BettingGame.sol";
import "./IERC20Burnable.sol";

contract BettingGameRegistry is Ownable, ChainlinkClient {
   using SafeMath for uint;

   event BettingGameCreated(uint256 bettingGameId, address creator, uint256 sides, uint256 expiryTime);
   event BettingGameChallengerRegistered(uint256 bettingGameId, address challenger);

   address public nativeTokenAddress;
   address internal vrfCoordinatorAddress;
   address internal linkTokenAddress;
   bytes32 internal keyHash;
   uint256 internal fee;
   uint256 private bettingGameCount = 0;
   mapping (uint256 => address) public bettingGameDataRegistry;

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

   function setNativeTokenAddress(address newNativeTokenAddress) public onlyOwner {
      nativeTokenAddress = newNativeTokenAddress;
   }

   function createGame(uint256 _sides) public {
      // 1. Burn some token
      IERC20Burnable nativeToken = IERC20Burnable(nativeTokenAddress);
      nativeToken.burnFrom(msg.sender, SafeMath.mul(0.01 * 10 ** 18, _sides));

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

   function challengeGame(uint256 _bettingGameId) public onlyExistingGame(_bettingGameId) {
      BettingGame existingGame = BettingGame(bettingGameDataRegistry[_bettingGameId]);
      require(block.timestamp < existingGame.expiryTime(), "This game has expired!");
      require(existingGame.creator() != msg.sender, "You cannot challenge your own bet!");

      // 1. Burn the token
      IERC20Burnable nativeToken = IERC20Burnable(nativeTokenAddress);
      nativeToken.burnFrom(msg.sender, SafeMath.mul(0.01 * 10 ** 18, existingGame.sides()));

      // 2. Run the `challenge` function
      existingGame.challenge(msg.sender);
   }

   function cancelGame(uint256 _bettingGameId) public onlyExistingGame(_bettingGameId) {
      BettingGame existingGame = BettingGame(bettingGameDataRegistry[_bettingGameId]);
      require(existingGame.creator() == msg.sender, "You cancel a game you didn't create!");

      // Execute the internal `cancel` function
      existingGame.cancel();
   }

   function playGame(uint256 _bettingGameId) public onlyExistingGame(_bettingGameId) {
      BettingGame existingGame = BettingGame(bettingGameDataRegistry[_bettingGameId]);
      require(
         existingGame.creator() == msg.sender || existingGame.challenger() == msg.sender,
         "You cancel a game you didn't create!"
      );

      // Execute the internal `run` function
      existingGame.play(msg.sender);
   }

   function depositBettingAsset() public {}

   function withdrawBettingAsset() public {}

}