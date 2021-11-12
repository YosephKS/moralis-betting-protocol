const BettingGameRegistry = artifacts.require("BettingGameRegistry");

contract("BettingGameRegistry", (accounts) => {
  let bettingGameRegistryInst;
  beforeEach(async () => {
    bettingGameRegistryInst = await BettingGameRegistry.deployed();
  });

  it("Test Creating New Game", async () => {
    console.log("Creating Game...");
    await bettingGameRegistryInst.createGame(2);
    console.log("Finished Creating Game");
  });
});
