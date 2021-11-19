import React, { useEffect, useState } from "react";
import { Modal, Steps } from "antd";
import { useMoralisQuery } from "react-moralis";
import useNativeTokenPrice from "hooks/useNativeTokenPrice";
import BurnToken from "./BurnToken";
import DepositAsset from "./DepositAsset";
import PlayGame from "./PlayGame";
import ShowResult from "./ShowResult";
import { useMoralisDapp } from "providers/MoralisDappProvider/MoralisDappProvider";
import erc20TokenAddress from "../../list/erc20TokenAddress";

export default function GameModal(props) {
  const { visible, handleClose, isCreator, initialValues } = props;
  const {
    sides: initialSides,
    depositTokenAddress: initialDepositAsset,
    bettingGameAddress: initialBettingGameAddress,
    // expiryTime,
    // status
  } = initialValues || {};
  const { chainId } = useMoralisDapp();
  const { fetchNativeTokenPrice, nativeTokenPrice } = useNativeTokenPrice();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sides, setSides] = useState(1);
  const [depositAsset, setDepositAsset] = useState("native");
  const [bettingGameAddress, setBettingGameAddress] = useState("");
  const [createGameTransactionHash, setCreateGameTransactionHash] =
    useState("");
  const tokenAddressList = {
    uni: "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984",
    link: "0x514910771af9ca656af840dff83e8264ecf986ca",
    dai: "0x6b175474e89094c44da98b954eedeac495271d0f",
  };

  const { data } = useMoralisQuery(
    "BettingGameCreatedKovan",
    (query) => query.equalTo("transaction_hash", createGameTransactionHash),
    [createGameTransactionHash],
    {
      live: true,
    }
  );

  useEffect(() => {
    if (depositAsset && depositAsset !== "native") {
      const exchange = () => {
        switch (chainId) {
          case "0x2a":
            return "uniswap-v3";
          case "0x61":
            return "pancakeswap-v2";
          case "0x13881":
            return "quickswap";
          default:
            return "uniswap-v3";
        }
      };

      fetchNativeTokenPrice({
        address: tokenAddressList[depositAsset],
        exchange: exchange(),
      });
    }
    // eslint-disable-next-line
  }, [depositAsset]);

  useEffect(() => {
    if (initialSides) {
      setSides(initialSides);
    }
    // eslint-disable-next-line
  }, [initialSides]);

  useEffect(() => {
    if (
      initialDepositAsset &&
      initialDepositAsset !== "0x0000000000000000000000000000000000000000"
    ) {
      const getDepositAsset = Object.keys(erc20TokenAddress[chainId]).find(
        (erc20) =>
          erc20TokenAddress[chainId][erc20].toLowerCase() ===
          initialDepositAsset.toLowerCase()
      );
      setDepositAsset(getDepositAsset);
    }
    // eslint-disable-next-line
  }, [initialDepositAsset]);

  useEffect(() => {
    if (initialBettingGameAddress) {
      setBettingGameAddress(initialBettingGameAddress);
    } else if (data && data?.length === 1 && bettingGameAddress === "") {
      const { attributes } = data[0];
      const { bettingGameAddress: res } = attributes;
      setBettingGameAddress(res);
      setCurrentIndex(1);
    }
    // eslint-disable-next-line
  }, [bettingGameAddress, data]);

  return (
    <Modal
      title="Create New Game"
      centered
      visible={visible}
      closable={false}
      width={1000}
      footer={null}
    >
      <Steps current={currentIndex}>
        <Steps.Step
          title="Burn BET"
          description={`Burn your token to ${
            isCreator ? "create a game." : "challenge the game."
          }`}
        />
        <Steps.Step
          title="Deposit ERC20"
          description={
            isCreator
              ? "Select your asset to place a bet on."
              : "Deposit you asset before placing a bet."
          }
        />
        <Steps.Step
          title="Try your luck!"
          description="It's all up to the blockchain now!"
        />
      </Steps>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          padding: "3rem",
        }}
      >
        {currentIndex === 0 && (
          <BurnToken
            sides={sides}
            isCreator={isCreator}
            handleInputNumberChange={(value) => setSides(value)}
            handleBettingGameAddress={(res) =>
              setCreateGameTransactionHash(res ?? "")
            }
            bettingGameAddress={initialBettingGameAddress ?? bettingGameAddress}
            handleNext={() => setCurrentIndex((i) => i + 1)}
          />
        )}
        {currentIndex === 1 && (
          <DepositAsset
            depositAsset={depositAsset}
            nativeTokenPrice={nativeTokenPrice}
            sides={sides}
            isCreator={isCreator}
            handleSelect={(value) => setDepositAsset(value)}
            handleNext={() => setCurrentIndex((i) => i + 1)}
            bettingGameAddress={initialBettingGameAddress ?? bettingGameAddress}
          />
        )}
        {currentIndex === 2 && (
          <PlayGame
            isCreator={isCreator}
            handleNext={() => setCurrentIndex((i) => i + 1)}
            bettingGameAddress={initialBettingGameAddress ?? bettingGameAddress}
          />
        )}
        {currentIndex === 3 && (
          <ShowResult
            isCreator={isCreator}
            handleClose={handleClose}
            bettingGameAddress={bettingGameAddress}
          />
        )}
      </div>
    </Modal>
  );
}
