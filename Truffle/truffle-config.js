const HDWalletProvider = require("@truffle/hdwallet-provider");
const fs = require("fs");
const mnemonic = fs.readFileSync(".secret").toString().trim();
require("dotenv").config();

module.exports = {
  plugins: ["truffle-plugin-verify"],
	api_keys: {
		etherscan: process.env.ETHERSCAN_API_KEY,
	},
  networks: {
    develop: {
      host: "127.0.0.1",
      port: 7545,
      chainId: 1337,
      network_id: 1337,
    },
    ropsten: {
			provider: () =>
				new HDWalletProvider(
					mnemonic,
					"Moralis RPC Node",
				),
			network_id: 3,
			gas: 5500000,
			confirmations: 2,
			timeoutBlocks: 200,
			skipDryRun: true,
		},
  },
  kovan: {
    provider: () =>
      new HDWalletProvider(
        mnemonic,
        "Moralis RPC Node",
      ),
    network_id: 42,
    gasPrice: 20000000000,
    gas: 3716887,
    skipDryRun: true,
    networkCheckTimeout: 100000,
  },
  rinkeby: {
    provider: () =>
      new HDWalletProvider(
        mnemonic,
        "Moralis RPC Node",
      ),
    network_id: 4,
    skipDryRun: true,
  },
  mainnet: {
    provider: function () {
      return new HDWalletProvider(
        mnemonic,
        "Moralis RPC Node",
      );
    },
    gas: 5000000,
    gasPrice: 5e9,
    network_id: 1,
  },
  compilers: {
		solc: {
			version: "0.8.9",
			settings: {
				optimizer: {
					enabled: false,
					runs: 200,
				},
			},
		},
	},
};
