import React, { useState, useMemo } from "react";
import { Space, Typography, Select, Button } from "antd";
import { useWeb3Contract } from "hooks/useWeb3Contract";
import ERC20ABI from "../../contracts/ERC20.json";
import PriceConverterABI from "../../contracts/PriceConverter.json";
import BettingGameABI from "../../contracts/BettingGame.json";
import deployedContracts from "../../list/deployedContracts.json";
import { useMoralisDapp } from "providers/MoralisDappProvider/MoralisDappProvider";

export default function DepositAsset(props) {
  const { depositAsset, handleSelect, nativeTokenPrice, sides, handleNext } =
    props;
  const { chainId } = useMoralisDapp();
  const tokenAddressList = {
    uni: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
    link: "0xa36085F69e2889c224210F603D836748e7dC0088",
    dai: "0x4f96fe3b7a6cf9725f59d353f723c1bdb64ca6aa",
  };
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
      _base: "",
      _quote: "",
      _decimals: 18,
    },
  });

  const {
    runContractFunction: runApprove,
    isLoading: isApproveLoading,
    isRunning: isApproveRunning,
  } = useWeb3Contract({
    abi: erc20ABI,
    contractAddress: tokenAddressList[depositAsset],
    functionName: "approve",
  });

  const {
    runContractFunction: runDeposit,
    isLoading: isDepositLoading,
    isRunning: isDepositRunning,
  } = useWeb3Contract({
    abi: bettingGameABI,
    contractAddress: "0x7Fd119af008d6E34d4E55c6156A31B432D6359bA",
    functionName: "deposit",
    params: {
      _tokenAddress: tokenAddressList[depositAsset],
      _aggregatorAddress: "0xDA5904BdBfB4EF12a3955aEcA103F51dc87c7C39",
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
        Choose ERC20 you want to deposit
      </Typography.Text>
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
                    spender: "0x7Fd119af008d6E34d4E55c6156A31B432D6359bA",
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
