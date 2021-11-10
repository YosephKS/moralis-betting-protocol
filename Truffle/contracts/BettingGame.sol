// SPDX-License-Identifier: MIT
pragma solidity >=0.4.17 <0.9.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBase.sol";
import "./IERC20Burnable.sol";

contract BettingGame is Ownable, VRFConsumerBase {
    using SafeMath for uint256;

    enum BettingGameStatus {
        OPEN,
        CLOSED
    }

    struct DepositBalance {
        uint256 amount;
        address tokenAddress;
    }

    bytes32 internal keyHash;
    uint256 internal fee;
    uint256 public randomResult;
    address public creator;
    address public challenger;
    uint256 public sides;
    BettingGameStatus public status;
    uint256 public expiryTime;

    mapping(bytes32 => address) requestIdToAddressRegistry;
    mapping(address => uint256) playerBetRecordRegistry;
    mapping(address => DepositBalance[]) public depositBalanceRegistry;

    constructor(
        address _vrfCoordinatorAddress,
        address _linkTokenAddress,
        bytes32 _keyHash,
        uint256 _fee,
        address _creator,
        uint256 _sides,
        uint256 _expiryTime
    ) VRFConsumerBase(_vrfCoordinatorAddress, _linkTokenAddress) {
        keyHash = _keyHash;
        fee = _fee;
        creator = _creator;
        challenger = address(0);
        sides = _sides;
        status = BettingGameStatus.OPEN;
        expiryTime = _expiryTime;
    }

    /**
     * Making sure that `_msgSend` is either a creator or not (depends `isEqual`)
     */
    modifier onlyCreator(address _msgSend, bool isEqual) {
        if (isEqual) {
            require(
                creator == _msgSend,
                "You are not the creator of this game!"
            );
        } else {
            require(creator != _msgSend, "You are the creator of this game!");
        }
        _;
    }

    /**
     * Making sure that `_msgSend` is either the creator or the challenger of the game
     */
    modifier onlyCreatorAndChallenger(address _msgSend) {
        require(
            _msgSend == creator || _msgSend == challenger,
            "You are not the creator or the challenger of this game!"
        );
        _;
    }

    /**
     * Making sure that this game has either expired or not (depends on `isExpired`)
     */
    modifier onlyExpiredGame(bool isExpired) {
        if (isExpired) {
            require(block.timestamp >= expiryTime, "This game has expired!");
        } else {
            require(block.timestamp < expiryTime, "This game has not expired!");
        }
        _;
    }

    /**
     * Allow `_msgSend` address to register as a challenger
     */
    function challenge(address _msgSend, address _nativeTokenAddress)
        public
        onlyOwner
        onlyCreator(_msgSend, false)
        onlyExpiredGame(false)
    {
        // Burn the token
        IERC20Burnable nativeToken = IERC20Burnable(_nativeTokenAddress);
        nativeToken.burnFrom(msg.sender, SafeMath.mul(0.01 * 10**18, sides));

        challenger = _msgSend;
    }

    /**
     *  Cancel the created Betting Game
     */
    function cancel(address _msgSend)
        public
        onlyOwner
        onlyCreator(_msgSend, true)
    {
        status = BettingGameStatus.CLOSED;
    }

    /**
     * Allow player `_msgSend` to place a bet on the game
     */
    function play(address _msgSend)
        public
        onlyOwner
        onlyCreatorAndChallenger(_msgSend)
        onlyExpiredGame(false)
        returns (bytes32 requestId)
    {
        require(
            LINK.balanceOf(address(this)) >= fee,
            "Not enough LINK - fill contract with faucet"
        );
        requestId = requestRandomness(keyHash, fee);
        requestIdToAddressRegistry[requestId] = _msgSend;
    }

    /**
     * This is a function overriden from Chainlink VRF contract to get the randomness result
     */
    function fulfillRandomness(bytes32 requestId, uint256 randomness)
        internal
        override
    {
        address playerAddress = requestIdToAddressRegistry[requestId];
        playerBetRecordRegistry[playerAddress] = randomness % sides;

        if (playerAddress == challenger) {
            if (
                (playerBetRecordRegistry[creator] +
                    playerBetRecordRegistry[challenger]) %
                    2 ==
                0
            ) {} else {}
        }
    }

    /**
     * Handle depositing ERC20 token to the `BettingGame` contract
     */
    function deposit(address _msgSend, address _tokenAddress)
        public
        onlyOwner
        onlyCreatorAndChallenger(_msgSend)
        onlyExpiredGame(false)
    {
        // 1. Transfer ERC20 token from user to the `BettingGame` contract
        IERC20 token = IERC20(_tokenAddress);
        token.approve(address(this), token.balanceOf(_msgSend));
        token.transferFrom(_msgSend, address(this), 0);

        // 2. Register deposit data to `depositBalanceRegistry` mapping
        //   DepositBalance[] memory depositArray = new DepositBalance[](1);
        //   depositArray[0] = DepositBalance(0, _tokenAddress);
        //   depositBalanceRegistry[_msgSend] = [DepositBalance(0, _tokenAddress)];
    }

    /**
     * Handle creator and challenger ERC20 token withdrawal after both have played
     */
    function withdraw(address _msgSend)
        public
        onlyOwner
        onlyCreatorAndChallenger(_msgSend)
        onlyExpiredGame(true)
    {
        for (uint256 i = 0; i < depositBalanceRegistry[_msgSend].length; i++) {
            IERC20 token = IERC20(
                depositBalanceRegistry[_msgSend][i].tokenAddress
            );
            token.transfer(
                _msgSend,
                depositBalanceRegistry[_msgSend][i].amount
            );
        }

        // Close the game
        status = BettingGameStatus.CLOSED;
    }
}
