import React, { useEffect, useState } from "react";
import { Modal, Steps } from "antd";
import useNativeTokenPrice from "hooks/useNativeTokenPrice";
import BurnToken from "./BurnToken";
import DepositAsset from "./DepositAsset";
import PlayGame from "./PlayGame";

export default function GameModal(props) {
  const { visible, handleClose, isCreator } = props;
  const { fetchNativeTokenPrice, nativeTokenPrice } = useNativeTokenPrice();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sides, setSides] = useState(1);
  const [depositAsset, setDepositAsset] = useState("eth");
  const [bettingGameAddress, setBettingGameAddress] = useState("");
  const tokenAddressList = {
    uni: "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984",
    link: "0x514910771af9ca656af840dff83e8264ecf986ca",
    dai: "0x6b175474e89094c44da98b954eedeac495271d0f",
  };

  useEffect(() => {
    if (depositAsset && depositAsset !== "eth") {
      fetchNativeTokenPrice({
        address: tokenAddressList[depositAsset],
        exchange: "uniswap-v3",
      });
    }
    // eslint-disable-next-line
  }, [depositAsset]);

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
            handleBettingGameAddress={(res) => setBettingGameAddress(res)}
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
            bettingGameAddress={bettingGameAddress}
          />
        )}
        {currentIndex === 2 && (
          <PlayGame
            isCreator={isCreator}
            onCompleted={handleClose}
            bettingGameAddress={bettingGameAddress}
          />
        )}
      </div>
    </Modal>
  );
}
