const ERC20Basic = artifacts.require("ERC20Basic");
const BettingGameRegistry = artifacts.require("BettingGameRegistry");
const ChainlinkVRF = require("../list/ChainlinkVRF.json");

module.exports = async (deployer, network) => {
  const ChainlinkVRFObj = ChainlinkVRF[network];
  const bettingGameTokenInst = await ERC20Basic.deployed();
  await deployer.deploy(
    BettingGameRegistry,
    bettingGameTokenInst.address,
    ChainlinkVRFObj.vrfCoordinatorAddress,
    ChainlinkVRFObj.linkTokenAddress,
    ChainlinkVRFObj.keyHash,
    ChainlinkVRFObj.fee
  );
};
