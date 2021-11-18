import React, { useState, useMemo } from "react";
import { Space, Typography, Select, Button } from "antd";
import { useWeb3Contract } from "hooks/useWeb3Contract";
import ERC20ABI from "../../contracts/ERC20.json";
import PriceConverterABI from "../../contracts/PriceConverter.json";
import BettingGameABI from "../../contracts/BettingGame.json";
import deployedContracts from "../../list/deployedContracts.json";
import chainlinkPriceFeeds from "../../list/chainlinkPriceFeeds.json";
import erc20TokenAddress from "../../list/erc20TokenAddress.json";
import { useMoralisDapp } from "providers/MoralisDappProvider/MoralisDappProvider";

export default function DepositAsset(props) {
  const {
    depositAsset,
    handleSelect,
    nativeTokenPrice,
    sides,
    handleNext,
    bettingGameAddress,
    isCreator,
  } = props;
  const { chainId } = useMoralisDapp();
  const { abi: erc20ABI } = ERC20ABI;
  const { abi: priceConverterABI } = PriceConverterABI;
  const { abi: bettingGameABI } = BettingGameABI;
  const [isApproved, setIsApproved] = useState(false);

  const {
    runContractFunction: runGetPriceConverter,
    isLoading: isPriceConverterLoading,
    isRunning: isPriceConverterRunning,
  } = useWeb3Contract({
    abi: priceConverterABI,
    contractAddress: deployedContracts[chainId].priceConverter,
    functionName: "getDerivedPrice",
    params: {
      _base: chainlinkPriceFeeds[chainId][depositAsset]["usd"],
      _quote: chainlinkPriceFeeds[chainId]["eth"]["usd"],
      _decimals: 18,
    },
  });

  const {
    runContractFunction: runApprove,
    isLoading: isApproveLoading,
    isRunning: isApproveRunning,
  } = useWeb3Contract({
    abi: erc20ABI,
    contractAddress: erc20TokenAddress[chainId][depositAsset],
    functionName: "approve",
  });

  const {
    runContractFunction: runDeposit,
    isLoading: isDepositLoading,
    isRunning: isDepositRunning,
  } = useWeb3Contract({
    abi: bettingGameABI,
    contractAddress: bettingGameAddress,
    functionName: "deposit",
    params: {
      _tokenAddress: erc20TokenAddress[chainId][depositAsset],
      _baseAddress: chainlinkPriceFeeds[chainId][depositAsset]["usd"],
      _quoteAddress: chainlinkPriceFeeds[chainId]["eth"]["usd"],
    },
  });

  const disableButton = useMemo(
    () =>
      isPriceConverterLoading ||
      isPriceConverterRunning ||
      isApproveRunning ||
      isApproveLoading ||
      isDepositLoading ||
      isDepositRunning,
    [
      isPriceConverterLoading,
      isPriceConverterRunning,
      isApproveLoading,
      isApproveRunning,
      isDepositLoading,
      isDepositRunning,
    ]
  );

  return (
    <Space direction="vertical" size="middle">
      <Typography.Text style={{ fontSize: "20px" }}>
        {isCreator
          ? "Choose ERC20 you want to deposit"
          : "Deposit your ERC20 token"}
      </Typography.Text>
      {isCreator && (
        <Select
          style={{ width: "100%" }}
          value={depositAsset}
          onChange={handleSelect}
          disabled={isApproved}
        >
          <Select.Option value="uni">Uniswap (UNI)</Select.Option>
          <Select.Option value="link">Chainlink (LINK)</Select.Option>
          <Select.Option value="dai">Dai Stablecoin (DAI)</Select.Option>
        </Select>
      )}
      {depositAsset && (
        <Typography.Text style={{ fontSize: "16px" }}>
          You will deposit approximately{" "}
          <b>
            {(
              (nativeTokenPrice ? 1 / nativeTokenPrice : 0) *
              sides *
              0.01
            ).toFixed(3)}{" "}
            {depositAsset.toUpperCase()} ({sides * 0.01} ETH)
          </b>
        </Typography.Text>
      )}
      <Button
        type="primary"
        style={{ width: "100%" }}
        disabled={disableButton}
        onClick={() => {
          if (isApproved) {
            runDeposit({ onSuccess: () => handleNext() });
          } else {
            runGetPriceConverter({
              onSuccess: (amount) => {
                runApprove({
                  params: {
                    spender: bettingGameAddress,
                    amount,
                  },
                  onSuccess: () => setIsApproved(true),
                });
              },
            });
          }
        }}
      >
        {isApproved ? "Deposit" : "Approve"}
      </Button>
    </Space>
  );
}
