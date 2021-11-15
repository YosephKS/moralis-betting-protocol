import React, { useState, useMemo } from "react";
import { Space, Typography, InputNumber, Button } from "antd";
import { useMoralis } from "react-moralis";
import { useWeb3Contract } from "hooks/useWeb3Contract";
import ERC20BasicABI from "../../contracts/ERC20Basic.json";
import BettingGameRegistryABI from "../../contracts/BettingGameRegistry.json";

export default function BurnToken(props) {
  const { sides, handleInputNumberChange, handleNext } = props;
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
    contractAddress: "0x9ca6E4683371a99355c476Be3fc6CF4d31e67350",
    functionName: "approve",
    params: {
      spender: "0x112749001D291ecCE228123D2EBba0ef24661a49",
      amount: Moralis.Units.Token(0.01 * sides, 18),
    },
  });

  const {
    runContractFunction: runCreateGame,
    isLoading: isCreateGameLoading,
    isRunning: isCreateGameRunning,
  } = useWeb3Contract({
    abi: bettingGameRegistryABI,
    contractAddress: "0x112749001D291ecCE228123D2EBba0ef24661a49",
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
            runApprove({ onSuccess: () => setIsApproved(true) });
          }
        }}
        style={{ width: "100%" }}
      >
        {isApproved ? "Burn" : "Approve"}
      </Button>
    </Space>
  );
}
