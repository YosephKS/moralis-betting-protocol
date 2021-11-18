import React, { useState, useMemo } from "react";
import { Space, Typography, InputNumber, Button } from "antd";
import { useMoralis } from "react-moralis";
import { useWeb3Contract } from "hooks/useWeb3Contract";
import ERC20BasicABI from "../../contracts/ERC20Basic.json";
import BettingGameRegistryABI from "../../contracts/BettingGameRegistry.json";
import deployedContracts from "../../list/deployedContracts.json";
import { useMoralisDapp } from "providers/MoralisDappProvider/MoralisDappProvider";

export default function BurnToken(props) {
  const { sides, handleInputNumberChange, handleApprove, handleNext } = props;
  const { chainId } = useMoralisDapp();
  const { abi: erc20BasicABI } = ERC20BasicABI;
  const { abi: bettingGameRegistryABI } = BettingGameRegistryABI;
  const { Moralis } = useMoralis();
  const [isApproved, setIsApproved] = useState(false);
  const {
    runContractFunction: runApprove,
    isLoading: isApproveLoading,
    isRunning: isApproveRunning,
  } = useWeb3Contract({
    abi: erc20BasicABI,
    contractAddress: deployedContracts[chainId].erc20Basic,
    functionName: "approve",
    params: {
      spender: deployedContracts[chainId].bettingGameRegistry,
      amount: Moralis.Units.Token(0.01 * sides, 18),
    },
  });

  const {
    runContractFunction: runCreateGame,
    isLoading: isCreateGameLoading,
    isRunning: isCreateGameRunning,
  } = useWeb3Contract({
    abi: bettingGameRegistryABI,
    contractAddress: deployedContracts[chainId].bettingGameRegistry,
    functionName: "createGame",
    params: {
      _sides: sides,
    },
  });

  const disableButton = useMemo(
    () =>
      isApproveLoading ||
      isApproveRunning ||
      isCreateGameLoading ||
      isCreateGameRunning,
    [
      isApproveLoading,
      isApproveRunning,
      isCreateGameLoading,
      isCreateGameRunning,
    ]
  );

  return (
    <Space direction="vertical" size="middle" style={{ fontSize: "16px" }}>
      <Typography.Text>Choose the number of sides</Typography.Text>
      <InputNumber
        min={1}
        value={sides}
        onChange={handleInputNumberChange}
        style={{ width: "100%" }}
        disabled={isApproved}
      />
      <Button
        type="primary"
        disabled={disableButton}
        onClick={() => {
          if (isApproved) {
            runCreateGame({
              onSuccess: () => handleNext(),
            });
          } else {
            runApprove({
              onSuccess: (result) => {
                handleApprove(result);
                setIsApproved(true);
              },
            });
          }
        }}
        style={{ width: "100%" }}
      >
        {isApproved ? "Burn" : "Approve"}
      </Button>
    </Space>
  );
}
