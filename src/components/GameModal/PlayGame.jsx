import React, { useMemo } from "react";
import { Space, Typography, Button } from "antd";
import { useWeb3Contract } from "hooks/useWeb3Contract";
import BettingGameABI from "../../contracts/BettingGame.json";

export default function PlayGame(props) {
  const { onCompleted, bettingGameAddress, isCreator } = props;
  const { abi: bettingGameABI } = BettingGameABI;
  const { runContractFunction, isLoading, isRunning } = useWeb3Contract({
    abi: bettingGameABI,
    contractAddress: bettingGameAddress,
    functionName: "play",
    params: {},
  });

  const disableButton = useMemo(
    () => isLoading || isRunning,
    [isLoading, isRunning]
  );

  return (
    <Space direction="vertical" align="center" size="middle">
      <Typography.Text>
        If the sum of your bet result and your challenger's is{" "}
        <b>{isCreator ? "EVEN" : "ODD"}</b>, you WIN!
      </Typography.Text>
      <Typography.Text>Otherwise, you LOSE</Typography.Text>
      <Button
        type="primary"
        disabled={disableButton}
        loading={disableButton}
        style={{ width: "100%" }}
        onClick={() => runContractFunction({ onSuccess: () => onCompleted() })}
      >
        Bet now!
      </Button>
    </Space>
  );
}
