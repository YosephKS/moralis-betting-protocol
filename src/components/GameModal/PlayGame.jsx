import React, { useMemo, useState } from "react";
import { Space, Typography, Button } from "antd";
import { useWeb3Contract } from "hooks/useWeb3Contract";
import BettingGameABI from "../../contracts/BettingGame.json";
import { useEffect } from "react/cjs/react.development";

export default function PlayGame(props) {
  const { onCompleted, isCreator } = props;
  const [isPlayed, setIsPlayed] = useState(false);
  const [, setBettingResult] = useState({});
  const { abi: bettingGameABI } = BettingGameABI;
  const {
    runContractFunction: runPlayGame,
    isLoading: isPlayingLoading,
    isRunning: isPlayingRunning,
  } = useWeb3Contract({
    abi: bettingGameABI,
    contractAddress: "0x145a328AE0a6eaA365C13E754E329E3DA9EEcF3E",
    functionName: "play",
    params: {},
  });

  const {
    runContractFunction: runGetBettingResult,
    isLoading: isGetBettingResultLoading,
    isRunning: isGetBettingResultRunning,
  } = useWeb3Contract({
    abi: bettingGameABI,
    contractAddress: "0x145a328AE0a6eaA365C13E754E329E3DA9EEcF3E",
    functionName: "getPlayerBettingResult",
    params: {},
  });

  const disableButton = useMemo(
    () =>
      isPlayingLoading ||
      isPlayingRunning ||
      isGetBettingResultLoading ||
      isGetBettingResultRunning,
    [
      isPlayingLoading,
      isPlayingRunning,
      isGetBettingResultLoading,
      isGetBettingResultRunning,
    ]
  );

  useEffect(() => {
    if (isPlayed) {
      runGetBettingResult({
        onSuccess: (result) => setBettingResult(result),
      });
    }
    // eslint-disable-next-line
  }, [isPlayed]);

  return (
    <Space direction="vertical" align="center" size="middle">
      {!isPlayed ? (
        <>
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
            onClick={() => runPlayGame({ onSuccess: () => setIsPlayed(true) })}
          >
            Bet now!
          </Button>
        </>
      ) : (
        <>
          <Typography.Text></Typography.Text>
          <Button
            type="primary"
            disabled={disableButton}
            loading={disableButton}
            style={{ width: "100%" }}
            onClick={() => onCompleted()}
          >
            Close
          </Button>
        </>
      )}
    </Space>
  );
}
