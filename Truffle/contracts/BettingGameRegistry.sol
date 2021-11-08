// SPDX-License-Identifier: MIT
pragma solidity >=0.4.17 <0.9.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract BettingGameRegistry is Ownable {
   enum BettingGameStatus { OPEN, CLOSED }
   struct BettingGame {
      address owner;
      uint256 sides;
      BettingGameStatus status;
      uint256 expiryTime;
   }

   address public nativeTokenAddress;
   uint256 private bettingGameCount = 0;
   mapping (uint256 => BettingGame) public bettingGameDataRegsiter;

   constructor(address _nativeTokenAddress) {
      nativeTokenAddress = _nativeTokenAddress;
   }

   function setNativeTokenAddress(address newNativeTokenAddress) public onlyOwner {
      nativeTokenAddress = newNativeTokenAddress;
   }

   function createGame(uint256 _sides) public {
      // 1. Burn some token
      IERC20 nativeToken = IERC20(nativeTokenAddress);

      // 2. Create new `BettingGame` instance
      bettingGameDataRegsiter[bettingGameCount] = BettingGame(msg.sender, _sides, BettingGameStatus.OPEN, block.timestamp + 7 days);
   }

   function challengeGame() public {}

   function cancelGame() public {}

   function depositBettingAsset() public {}

   function playGame() public {}
}