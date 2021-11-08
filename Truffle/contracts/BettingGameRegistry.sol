// SPDX-License-Identifier: MIT
pragma solidity >=0.4.17 <0.9.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";
import "./IERC20Burnable.sol";

contract BettingGameRegistry is Ownable, ChainlinkClient {
   using SafeMath for uint;

   enum BettingGameStatus { OPEN, CLOSED }
   struct BettingGame {
      address creator;
      address challenger;
      uint256 sides;
      BettingGameStatus status;
      uint256 expiryTime;
   }

   struct DepositBalance {
      uint256 amount;
      uint256 decimals;
   }

   address public nativeTokenAddress;
   uint256 private bettingGameCount = 0;
   mapping (uint256 => BettingGame) public bettingGameDataRegister;
   mapping (address => mapping (address => DepositBalance)) public depositBalanceRegister;

   constructor(address _nativeTokenAddress) {
      nativeTokenAddress = _nativeTokenAddress;
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

      // 2. Create new `BettingGame` instance
      bettingGameDataRegister[bettingGameCount] = BettingGame(msg.sender, address(0), _sides, BettingGameStatus.OPEN, block.timestamp + 7 days);

      // 3. Increase Betting Game Counter
      bettingGameCount = SafeMath.add(bettingGameCount, 1);
   }

   function challengeGame(uint256 _bettingGameId) public onlyExistingGame(_bettingGameId) {
      require(block.timestamp < bettingGameDataRegister[_bettingGameId].expiryTime, "This game has expired!");
      require(bettingGameDataRegister[_bettingGameId].creator != msg.sender, "You cannot challenge your own bet!");
      // 1. Burn some token
      IERC20Burnable nativeToken = IERC20Burnable(nativeTokenAddress);
      uint256 sides = bettingGameDataRegister[_bettingGameId].sides;
      nativeToken.burnFrom(msg.sender, SafeMath.mul(0.01 * 10 ** 18, sides));

      // 2. Assign Challenger to the Registry
      bettingGameDataRegister[_bettingGameId].challenger = msg.sender;
   }

   function cancelGame(uint256 _bettingGameId) public onlyExistingGame(_bettingGameId) {
      require(bettingGameDataRegister[_bettingGameId].creator == msg.sender, "You cancel a game you didn't create!");
      bettingGameDataRegister[_bettingGameId].status = BettingGameStatus.CLOSED;
   }

   function depositBettingAsset() public {}

   function playGame() public {}
}