const ERC20Basic = artifacts.require("ERC20Basic");
const BettingGame = artifacts.require("BettingGame");
const BettingGameRegistry = artifacts.require("BettingGameRegistry");
const ChainlinkVRF = require("../list/ChainlinkVRF.json");

module.exports = async (deployer, network) => {
  const ChainlinkVRFObj = ChainlinkVRF[network];
  await deployer.deploy(ERC20Basic, "Betting Game Token", "BET");
  const bettingGameTokenInst = await ERC20Basic.deployed();
  // await deployer.deploy(
  //   BettingGameRegistry,
  //   bettingGameTokenInst.address,
  //   ChainlinkVRFObj.vrfCoordinatorAddress,
  //   ChainlinkVRFObj.linkTokenAddress,
  //   ChainlinkVRFObj.keyHash,
  //   ChainlinkVRFObj.fee
  // );
  await deployer.deploy(
    BettingGame,
    ChainlinkVRFObj.vrfCoordinatorAddress,
    ChainlinkVRFObj.linkTokenAddress,
    ChainlinkVRFObj.keyHash,
    ChainlinkVRFObj.fee,
    "0x01D81d7c9383eeAB47618DfBdb7F1dBf544AAe86",
    2,
    bettingGameTokenInst.address
  );
};
