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
import { useEffect } from "react/cjs/react.development";

export default function DepositAsset(props) {
  const {
    depositAsset,
    handleSelect,
    nativeTokenPrice,
    sides,
    handleNext,
    // bettingGameAddress,
    isCreator,
  } = props;
  const { chainId } = useMoralisDapp();
  const { abi: erc20ABI } = ERC20ABI;
  const { abi: priceConverterABI } = PriceConverterABI;
  const { abi: bettingGameABI } = BettingGameABI;
  const [isApproved, setIsApproved] = useState(false);

  /**
   * @description Get pricing for ETH/BSC/MATIC to UNI/LINK/DAI
   */
  const {
    contractResponse: depositAmount,
    runContractFunction: runGetPriceConverter,
    isLoading: isPriceConverterLoading,
    isRunning: isPriceConverterRunning,
  } = useWeb3Contract({
    abi: priceConverterABI,
    contractAddress: deployedContracts[chainId].priceConverter,
    functionName: "getDerivedPrice",
    params: {
      _base: chainlinkPriceFeeds[chainId]?.eth?.usd,
      _quote: chainlinkPriceFeeds[chainId][depositAsset]?.usd,
      _decimals: 18,
    },
  });

  console.log(depositAsset);

  /**
   * @description Approve ERC20 token before depositing into smart contract
   */
  const {
    runContractFunction: runApprove,
    isLoading: isApproveLoading,
    isRunning: isApproveRunning,
  } = useWeb3Contract({
    abi: erc20ABI,
    contractAddress: erc20TokenAddress[chainId][depositAsset],
    functionName: "approve",
    params: {
      spender: "0x8de65d9db4dc5b1ed43591d7d46e30c276848c28",
      amount: depositAmount ?? 0,
    },
  });

  /**
   * @description Deposit ERC20 token to BettingGame smart contract
   */
  const {
    runContractFunction: runDeposit,
    isLoading: isDepositLoading,
    isRunning: isDepositRunning,
  } = useWeb3Contract({
    abi: bettingGameABI,
    contractAddress: "0x8de65d9db4dc5b1ed43591d7d46e30c276848c28",
    functionName: "deposit",
    params: {
      _tokenAddress: erc20TokenAddress[chainId][depositAsset],
      _baseAddress: chainlinkPriceFeeds[chainId]?.eth?.usd,
      _quoteAddress: chainlinkPriceFeeds[chainId][depositAsset]?.usd,
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

  useEffect(() => {
    if (depositAsset !== "eth") {
      runGetPriceConverter();
    }
    // eslint-disable-next-line
  }, [depositAsset]);

  return (
    <Space direction="vertical" size="middle">
      <Typography.Text style={{ fontSize: "20px" }}>
        {isCreator
          ? "Choose ERC20 you want to deposit"
          : "Deposit your ERC20 token"}
      </Typography.Text>
      {!isCreator && (
        <Typography.Text>
          Prepare some <b>{depositAsset?.toUpperCase()}</b> before depositing
          it.
        </Typography.Text>
      )}
      {isCreator && (
        <Select
          style={{ width: "100%" }}
          value={depositAsset === "eth" ? "" : depositAsset}
          onChange={handleSelect}
          disabled={isApproved}
        >
          <Select.Option value="uni">Uniswap (UNI)</Select.Option>
          <Select.Option value="link">Chainlink (LINK)</Select.Option>
          <Select.Option value="dai">Dai Stablecoin (DAI)</Select.Option>
        </Select>
      )}
      {depositAsset !== "eth" && (
        <Typography.Text style={{ fontSize: "16px" }}>
          You will deposit approximately{" "}
          <b>
            {(
              (nativeTokenPrice ? 1 / nativeTokenPrice : 0) *
              sides *
              0.01
            ).toFixed(3)}{" "}
            {depositAsset?.toUpperCase()} ({sides * 0.01} ETH)
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
            runApprove({
              onSuccess: () => setIsApproved(true),
            });
          }
        }}
      >
        {isApproved ? "Deposit" : "Approve"}
      </Button>
    </Space>
  );
}
