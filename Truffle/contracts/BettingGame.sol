// SPDX-License-Identifier: MIT
pragma solidity >=0.4.17 <0.9.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBase.sol";
import "./interfaces/IERC20Burnable.sol";

contract BettingGame is Ownable, VRFConsumerBase {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    enum BettingGameStatus {
        OPEN,
        CLOSED
    }

    struct DepositBalance {
        uint256 amount;
        address tokenAddress;
    }

    struct DepositMetadata {
        mapping(uint256 => DepositBalance) balance;
        uint256 balanceCount;
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
    mapping(address => DepositMetadata) public depositBalanceRegistry;

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
    function challenge(address _msgSend) public onlyOwner {
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

        // Resolving the winner/loser
        if (playerAddress == challenger) {
            if (
                (playerBetRecordRegistry[creator] +
                    playerBetRecordRegistry[challenger]) %
                    2 ==
                0
            ) {
                for (
                    uint256 i = 0;
                    i < depositBalanceRegistry[challenger].balanceCount;
                    i++
                ) {
                    uint256 creatorBalanceCount = depositBalanceRegistry[
                        creator
                    ].balanceCount;
                    uint256 challengerBalanceCount = depositBalanceRegistry[
                        challenger
                    ].balanceCount;
                    uint256 challengerTokenAmount = depositBalanceRegistry[
                        challenger
                    ].balance[i].amount;
                    address challengerTokenAddress = depositBalanceRegistry[
                        challenger
                    ].balance[i].tokenAddress;

                    // 1. Creator Wins
                    depositBalanceRegistry[creator].balance[
                        creatorBalanceCount
                    ] = DepositBalance(
                        challengerTokenAmount,
                        challengerTokenAddress
                    );
                    depositBalanceRegistry[creator].balanceCount = SafeMath.add(
                        creatorBalanceCount,
                        1
                    );

                    // 2. Challenger Lose
                    depositBalanceRegistry[challenger].balance[
                            SafeMath.sub(challengerBalanceCount, 1)
                        ] = DepositBalance(0, address(0));
                    depositBalanceRegistry[challenger].balanceCount = SafeMath
                        .sub(challengerBalanceCount, 1);
                }
            } else {
                for (
                    uint256 i = 0;
                    i < depositBalanceRegistry[challenger].balanceCount;
                    i++
                ) {
                    uint256 challengerBalanceCount = depositBalanceRegistry[
                        challenger
                    ].balanceCount;
                    uint256 creatorBalanceCount = depositBalanceRegistry[
                        creator
                    ].balanceCount;
                    uint256 creatorTokenAmount = depositBalanceRegistry[creator]
                        .balance[i]
                        .amount;
                    address creatorTokenAddress = depositBalanceRegistry[
                        creator
                    ].balance[i].tokenAddress;

                    // 1. Challenger Wins
                    depositBalanceRegistry[challenger].balance[
                            challengerBalanceCount
                        ] = DepositBalance(
                        creatorTokenAmount,
                        creatorTokenAddress
                    );
                    depositBalanceRegistry[challenger].balanceCount = SafeMath
                        .add(challengerBalanceCount, 1);

                    // 2. Challenger Lose
                    depositBalanceRegistry[creator].balance[
                        SafeMath.sub(creatorBalanceCount, 1)
                    ] = DepositBalance(0, address(0));
                    depositBalanceRegistry[creator].balanceCount = SafeMath.sub(
                        creatorBalanceCount,
                        1
                    );
                }
            }
        }
    }

    /**
     * Handle depositing ERC20 token to the `BettingGame` contract
     */
    function deposit(
        address _msgSend,
        address _tokenAddress,
        uint256 _price
    )
        public
        onlyOwner
        onlyCreatorAndChallenger(_msgSend)
        onlyExpiredGame(false)
    {
        // 1. Transfer ERC20 token from user to the `BettingGame` contract
        IERC20 token = IERC20(_tokenAddress);
        uint256 tokenAmount = SafeMath.div(SafeMath.mul(_price, sides), 100);
        token.safeApprove(address(this), token.balanceOf(_msgSend));
        token.safeTransferFrom(_msgSend, address(this), tokenAmount);

        // 2. Register deposit data to `depositBalanceRegistry` mapping
        uint256 balanceCount = depositBalanceRegistry[_msgSend].balanceCount;
        depositBalanceRegistry[_msgSend].balance[balanceCount] = DepositBalance(
            tokenAmount,
            _tokenAddress
        );
        depositBalanceRegistry[_msgSend].balanceCount = SafeMath.add(
            balanceCount,
            1
        );
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
        for (
            uint256 i = 0;
            i < depositBalanceRegistry[_msgSend].balanceCount;
            i++
        ) {
            IERC20 token = IERC20(
                depositBalanceRegistry[_msgSend].balance[i].tokenAddress
            );
            token.safeTransfer(
                _msgSend,
                depositBalanceRegistry[_msgSend].balance[i].amount
            );
        }

        // Close the game
        status = BettingGameStatus.CLOSED;
    }
}
