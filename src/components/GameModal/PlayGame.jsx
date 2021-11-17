import React, { useMemo } from "react";
import { Space, Typography, Button } from "antd";
import { useWeb3Contract } from "hooks/useWeb3Contract";

export default function PlayGame(props) {
  const { onCompleted } = props;
  const { runContractFunction, isLoading, isRunning } = useWeb3Contract({});

  const disableButton = useMemo(
    () => isLoading || isRunning,
    [isLoading, isRunning]
  );
  return (
    <Space direction="vertical" align="center" size="middle">
      <Typography.Text>
        If the sum of your bet result and your challenger's is <b>EVEN</b>, you
        WIN!
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
