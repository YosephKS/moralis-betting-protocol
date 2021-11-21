[
  { db: "BettingGameCreatedKovan", network: "Kovan" },
  { db: "BettingGameCreatedBSCTestnet", network: "BSC Testnet" },
  { db: "BettingGameCreatedPolygonMumbai", network: "Polygon Mumbai" },
].forEach((chainInfo) => {
  const { db, network } = chainInfo || {};
  Moralis.Cloud.afterSave(db, async function (request) {
    const logger = Moralis.Cloud.getLogger();
    const confirmed = request.object.get("confirmed");
    if (confirmed) {
      const transferAddress = request.object.get("bettingGameAddress");
      Moralis.Cloud.httpRequest({
        method: "POST",
        url: "https://api.defender.openzeppelin.com/autotasks/68e20b58-a683-4fbd-951d-f23d7540feae/runs/webhook/0fbbed21-c3f0-4410-ada7-3a12cf7526d2/3MTT8CzdFgtbfoxPVLEqYr",
        body: { transferAddress },
        headers: {
          "Content-Type": "application/json",
        },
        followRedirects: true,
      }).then(
        function () {
          logger.info(
            "Successfully sent LINK to " + transferAddress + " - " + network
          );
        },
        function (httpResponse) {
          logger.error(
            "Request failed with response code " + httpResponse.status
          );
          logger.info(JSON.stringify(httpResponse));
        }
      );
    }
  });
});
