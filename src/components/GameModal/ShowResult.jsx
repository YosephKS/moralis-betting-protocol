import React, { useState } from "react";
import { Space, Typography, Button } from "antd";
import { useWeb3Contract } from "hooks/useWeb3Contract";
import BettingGameABI from "contracts/BettingGame.json";
import { useEffect } from "react/cjs/react.development";

export default function ShowResult(props) {
  const { isCreator, handleClose, bettingGameAddress } = props;
  const { abi: bettingGameABI } = BettingGameABI;
  const [, setBettingResult] = useState({});

  const {
    runContractFunction: runGetBettingResult,
    isLoading: isGetBettingResultLoading,
    isRunning: isGetBettingResultRunning,
  } = useWeb3Contract({
    abi: bettingGameABI,
    contractAddress: bettingGameAddress,
    functionName: "getPlayerBettingResult",
    params: {},
  });

  useEffect(() => {
    runGetBettingResult({
      onSuccess: (result) => setBettingResult(result),
    });
    // eslint-disable-next-line
  }, []);

  return (
    <Space direction="vertical">
      <Typography.Text>
        {isCreator ? "Now wait for a Challenger to bet against you!" : ""}
      </Typography.Text>
      <Button
        type="primary"
        disabled={isGetBettingResultLoading || isGetBettingResultRunning}
        style={{ width: "100%" }}
        onClick={handleClose}
      >
        Close
      </Button>
    </Space>
  );
}
