const BettingGameToken = artifacts.require("BettingGameToken");
const BettingGameRegistry = artifacts.require("BettingGameRegistry");
const ChainlinkVRF = require("../list/ChainlinkVRF.json");

module.exports = async (deployer, network) => {
  const ChainlinkVRFObj = ChainlinkVRF[network];
  await deployer.deploy(BettingGameToken, "Betting Game Token", "BET");
  const bettingGameTokenInst = await BettingGameToken.deployed();
  await deployer.deploy(
    BettingGameRegistry,
    bettingGameTokenInst.address,
    ChainlinkVRFObj.vrfCoordinatorAddress,
    ChainlinkVRFObj.linkTokenAddress,
    ChainlinkVRFObj.keyHash,
    ChainlinkVRFObj.fee
  );
};
