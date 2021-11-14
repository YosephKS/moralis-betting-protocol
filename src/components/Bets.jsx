import React, { useMemo, useState } from "react";
import {
  Typography,
  Row,
  Col,
  Button,
  Modal,
  Steps,
  Space,
  InputNumber,
  Select,
} from "antd";
import { useMoralisWeb3Api } from "react-moralis";
import GameCard from "./GameCard";
// import { useMoralisDapp } from "providers/MoralisDappProvider/MoralisDappProvider";

export default function Bets() {
  const Web3Api = useMoralisWeb3Api();
  const [visible, setVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sides, setSides] = useState(1);
  const [depositAsset, setDepositAsset] = useState("");
  const erc20TokenPrice = useMemo(
    async () =>
      depositAsset !== "" &&
      (await Web3Api.token.getTokenPrice({
        address: "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984",
      })),
    [depositAsset, Web3Api.token]
  );

  return (
    <>
      <Modal
        title="Create Game"
        centered
        visible={visible}
        closable={false}
        width={1000}
        footer={null}
      >
        <Steps current={currentIndex}>
          <Steps.Step
            title="Burn BET"
            description="Burn your token to create game."
          />
          <Steps.Step
            title="Deposit ERC20"
            description="Select your asset to place a bet on."
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
            <Space
              direction="vertical"
              size="middle"
              style={{ fontSize: "16px" }}
            >
              <Typography.Text>Choose the number of sides</Typography.Text>
              <InputNumber
                min={1}
                value={sides}
                onChange={(value) => setSides(value)}
                style={{ width: "100%" }}
              />
              <Button type="default" style={{ width: "100%" }}>
                Approve
              </Button>
              <Button
                type="primary"
                onClick={() => setCurrentIndex((i) => i + 1)}
                style={{ width: "100%" }}
              >
                Burn
              </Button>
            </Space>
          )}
          {currentIndex === 1 && (
            <Space direction="vertical" size="middle">
              <Typography.Text style={{ fontSize: "20px" }}>
                Choose ERC20 you want to deposit
              </Typography.Text>
              <Select
                style={{ width: "100%" }}
                value={depositAsset}
                onChange={(value) => setDepositAsset(value)}
              >
                <Select.Option value="uni">Uniswap (UNI)</Select.Option>
                <Select.Option value="link">Chainlink (LINK)</Select.Option>
                <Select.Option value="dai">Dai Stablecoin (DAI)</Select.Option>
              </Select>
              {depositAsset && (
                <Typography.Text style={{ fontSize: "16px" }}>
                  You will deposit approximately{" "}
                  <b>... {depositAsset.toUpperCase()}</b>
                </Typography.Text>
              )}
              <Button type="default" style={{ width: "100%" }}>
                Approve
              </Button>
              <Button
                type="primary"
                onClick={() => setCurrentIndex((i) => i + 1)}
                style={{ width: "100%" }}
              >
                Deposit
              </Button>
            </Space>
          )}
          {currentIndex === 2 && <></>}
        </div>
      </Modal>
      <div style={{ width: "100%" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography.Title>Your Bets</Typography.Title>
          <Button
            type="primary"
            style={{ width: "150px" }}
            onClick={() => setVisible(true)}
          >
            Create Game
          </Button>
        </div>
        <Row gutter={16}>
          <Col span={8}>
            <GameCard
              cardTitle="0xb46bb2E9d9B55D5EAE10960EbBA27F966D9511d1"
              sides={5}
              status={0}
              buttonText="withdraw"
            />
          </Col>
        </Row>
      </div>
    </>
  );
}
