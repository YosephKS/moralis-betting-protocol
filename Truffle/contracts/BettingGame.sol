// SPDX-License-Identifier: MIT
pragma solidity >=0.4.17 <0.9.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBase.sol";

contract BettingGame is Ownable, VRFConsumerBase {
   bytes32 internal keyHash;
   uint256 internal fee;
   uint256 public randomResult;

   constructor(address _vrfCoordinatorAddress, address _linkTokenAddress, bytes32 _keyHash, uint256 _fee) 
      VRFConsumerBase(_vrfCoordinatorAddress, _linkTokenAddress)
    {
        keyHash = _keyHash;
        fee = _fee; // 0.1 LINK (Varies by network)
    }

   function deposit() public {}

   function play() public returns (bytes32 requestId) {
      require(LINK.balanceOf(address(this)) >= fee, "Not enough LINK - fill contract with faucet");
      requestId = requestRandomness(keyHash, fee);
   }

   function fulfillRandomness(bytes32 requestId, uint256 randomness) internal override {
      randomResult = randomness;
   }

   function cancel() public {}
}