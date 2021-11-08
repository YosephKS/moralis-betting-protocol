// SPDX-License-Identifier: MIT
pragma solidity >=0.4.17 <0.9.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBase.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./IERC20Burnable.sol";

contract BettingGame is Ownable, VRFConsumerBase {
   enum BettingGameStatus { OPEN, CLOSED }

   struct DepositBalance {
      uint256 amount;
      uint256 decimals;
   }

   bytes32 internal keyHash;
   uint256 internal fee;
   uint256 public randomResult;
   address public creator;
   address public challenger;
   uint256 public sides;
   BettingGameStatus public status;
   uint256 public expiryTime;

   mapping (bytes32 => address) requestIdToAddressRegistry;
   mapping (address => uint256) playerBetRecordRegistry;
   mapping (address => DepositBalance) public depositBalanceRegistry;

   constructor(
      address _vrfCoordinatorAddress,
      address _linkTokenAddress,
      bytes32 _keyHash,
      uint256 _fee,
      address _creator,
      uint256 _sides,
      uint256 _expiryTime
   ) 
      VRFConsumerBase(_vrfCoordinatorAddress, _linkTokenAddress)
    {
        keyHash = _keyHash;
        fee = _fee;
        creator = _creator;
        challenger = address(0);
        sides = _sides;
        status = BettingGameStatus.OPEN;
        expiryTime = _expiryTime;
    }

   /**
    * Allow `_msgSend` address to register as a challenger
    */
    function challenge(address _msgSend) public onlyOwner {
      challenger = _msgSend;
    }

   /**
    *  Cancel the created Betting Game
    */
   function cancel() public onlyOwner {
      status = BettingGameStatus.CLOSED;
   }

   /**
    * Allow player `_msgSend` to place a bet on the game
    */
   function play(address _msgSend) public onlyOwner returns (bytes32 requestId) {
      require(LINK.balanceOf(address(this)) >= fee, "Not enough LINK - fill contract with faucet");
      requestId = requestRandomness(keyHash, fee);
      requestIdToAddressRegistry[requestId] = _msgSend;
   }

   /**
    * This is a function overriden from Chainlink VRF contract to get the randomness result
    */
   function fulfillRandomness(bytes32 requestId, uint256 randomness) internal override {
      address playerAddress = requestIdToAddressRegistry[requestId];
      playerBetRecordRegistry[playerAddress] = randomness % sides;

      if (playerAddress == challenger) {
         if ((playerBetRecordRegistry[creator] + playerBetRecordRegistry[challenger]) % 2 == 0) {
            
         } else {

         }
      }
   }

   function deposit() public {}

   function withdraw() public {
   }
}