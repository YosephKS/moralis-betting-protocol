const { oracle } = require("@chainlink/test-helpers");
const { expectRevert, time } = require("@openzeppelin/test-helpers");
const { LinkToken } = require("@chainlink/contracts/truffle/v0.4/LinkToken");
const { Oracle } = require("@chainlink/contracts/truffle/v0.6/Oracle");
const BettingGameRegistry = artifacts.require("BettingGameRegistry");

contract("BettingGameRegistry", (accounts) => {
  const defaultAccount = accounts[0];
  const oracleNode = accounts[1];
  const stranger = accounts[2];
  const consumer = accounts[3];

  // These parameters are used to validate the data was received
  // on the deployed oracle contract. The Job ID only represents
  // the type of data, but will not work on a public testnet.
  // For the latest JobIDs, visit a node listing service like:
  // https://market.link/
  const jobId = web3.utils.toHex("4c7b7ffb66b344fbaa64995af81e355a");
  const url =
    "https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD,EUR,JPY";
  const path = "USD";
  const times = 100;

  // Represents 1 LINK for testnet requests
  const payment = web3.utils.toWei("1");

  let link, oc, cc;

  beforeEach(async () => {
    link = await LinkToken.new({ from: defaultAccount });
    oc = await Oracle.new(link.address, { from: defaultAccount });
    cc = await BettingGameRegistry.new(link.address, { from: consumer });
    await oc.setFulfillmentPermission(oracleNode, true, {
      from: defaultAccount,
    });
  });
});
