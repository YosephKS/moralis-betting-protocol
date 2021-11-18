import React, { useMemo, useEffect } from "react";
import { Card, Typography, Button, Space, Skeleton } from "antd";
import { getEllipsisTxt } from "helpers/formatters";
import { useWeb3Contract } from "hooks/useWeb3Contract";
import BettingGameABI from "../../contracts/BettingGame.json";
import { useMoralisDapp } from "providers/MoralisDappProvider/MoralisDappProvider";
import { networkConfigs } from "helpers/networks";

export default function CardIndex(props) {
  const { cardTitle, handleChallenge } = props;
  const { walletAddress, chainId } = useMoralisDapp();
  const { abi } = BettingGameABI;

  /**
   * @description Get Betting Game Info Details to be displayed
   */
  const {
    runContractFunction: runGetBettingGameInfo,
    contractResponse,
    isLoading: isGetBettingGameLoading,
    isRunning: isGetBettingGameRunning,
  } = useWeb3Contract({
    abi,
    functionName: "getBettingGameInfo",
    contractAddress: cardTitle,
    params: {},
  });

  /**
   * @description Withdraw ERC20 tokens (reward) from the BettingGame for winners only
   */
  const {
    runContractFunction: runWithdraw,
    isLoading: isWithdrawLoading,
    isRunning: isWithdrawRunning,
  } = useWeb3Contract({
    abi,
    functionName: "withdraw",
    contractAddress: cardTitle,
    params: {},
  });

  const isFetching = useMemo(
    () =>
      isGetBettingGameLoading ||
      isGetBettingGameRunning ||
      isWithdrawLoading ||
      isWithdrawRunning,
    [
      isGetBettingGameLoading,
      isGetBettingGameRunning,
      isWithdrawLoading,
      isWithdrawRunning,
    ]
  );

  const isCreator = useMemo(() => {
    if (contractResponse && Object.keys(contractResponse).length === 7) {
      return contractResponse[0].toLowerCase() === walletAddress;
    }

    return false;
  }, [contractResponse, walletAddress]);

  const isChallenger = useMemo(() => {
    if (contractResponse && Object.keys(contractResponse).length === 7) {
      return contractResponse[1].toLowerCase() === walletAddress;
    }

    return false;
  }, [contractResponse, walletAddress]);

  const isWinner = useMemo(() => {
    if (contractResponse && Object.keys(contractResponse).length === 7) {
      return contractResponse[6].toLowerCase() === walletAddress;
    }

    return false;
  }, [contractResponse, walletAddress]);

  useEffect(() => {
    runGetBettingGameInfo();
    // eslint-disable-next-line
  }, []);

  return (
    <Card title={getEllipsisTxt(cardTitle, 15)} bordered hoverable>
      <Skeleton loading={isFetching}>
        {contractResponse && Object.keys(contractResponse).length === 7 ? (
          <>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                marginBottom: "2rem",
                fontSize: "16px",
              }}
            >
              <Typography.Text type="secondary" style={{ fontSize: "16px" }}>
                Creator
              </Typography.Text>
              <Typography.Text>
                <a
                  target="_blank"
                  rel="noreferrer"
                  href={`${networkConfigs[chainId].blockExplorerUrl}address/${contractResponse[0]}`}
                >
                  {isCreator ? "You" : contractResponse[0]}
                </a>
              </Typography.Text>
              {contractResponse[1] !==
                "0x0000000000000000000000000000000000000000" && (
                <>
                  <Typography.Text
                    type="secondary"
                    style={{ fontSize: "16px", marginTop: "1rem" }}
                  >
                    Challenger:
                  </Typography.Text>
                  <Typography.Text>
                    <a
                      target="_blank"
                      rel="noreferrer"
                      href={`${networkConfigs[chainId].blockExplorerUrl}address/${contractResponse[1]}`}
                    >
                      {isChallenger ? "You" : contractResponse[1]}
                    </a>
                  </Typography.Text>
                </>
              )}
              <Typography.Text
                type="secondary"
                style={{ fontSize: "16px", marginTop: "1rem" }}
              >
                Sides
              </Typography.Text>
              <Typography.Text>{contractResponse[2]}</Typography.Text>
              <Typography.Text
                type="secondary"
                style={{ fontSize: "16px", marginTop: "1rem" }}
              >
                Status
              </Typography.Text>
              <Typography.Text>
                {contractResponse[3] === "0" ? "OPEN" : "CLOSED"}
              </Typography.Text>
              <Typography.Text
                type="secondary"
                style={{ fontSize: "16px", marginTop: "1rem" }}
              >
                Expiry Time
              </Typography.Text>
              <Typography.Text>{contractResponse[4]}</Typography.Text>
              {contractResponse[5] !==
                "0x0000000000000000000000000000000000000000" && (
                <>
                  <Typography.Text
                    type="secondary"
                    style={{ fontSize: "16px", marginTop: "1rem" }}
                  >
                    Deposit Asset
                  </Typography.Text>
                  <Typography.Text>
                    <a
                      target="_blank"
                      rel="noreferrer"
                      href={`${networkConfigs[chainId].blockExplorerUrl}address/${contractResponse[5]}`}
                    >
                      {contractResponse[5]}
                    </a>
                  </Typography.Text>
                </>
              )}
              {contractResponse[6] !==
                "0x0000000000000000000000000000000000000000" && (
                <>
                  <Typography.Text
                    type="secondary"
                    style={{ fontSize: "16px", marginTop: "1rem" }}
                  >
                    Winner
                  </Typography.Text>
                  <Typography.Text>
                    <a
                      target="_blank"
                      rel="noreferrer"
                      href={`${networkConfigs[chainId].blockExplorerUrl}address/${contractResponse[6]}`}
                    >
                      {isWinner ? "You" : contractResponse[6]}
                    </a>
                  </Typography.Text>
                </>
              )}
            </div>
            <Space direction="vertical" size="middle" style={{ width: "100%" }}>
              <Button
                size="large"
                type="default"
                style={{ width: "100%" }}
                onClick={() =>
                  window.open(
                    `${networkConfigs[chainId].blockExplorerUrl}address/${cardTitle}`
                  )
                }
              >
                View Details
              </Button>
              {contractResponse[3] === "0" ? (
                <Button
                  size="large"
                  disabled={isCreator}
                  type="primary"
                  style={{ width: "100%" }}
                  onClick={() => handleChallenge()}
                >
                  {isCreator ? "WAIT FOR CHALLENGER" : "BET"}
                </Button>
              ) : (
                <Button
                  size="large"
                  disabled={isWinner}
                  type="primary"
                  style={{ width: "100%" }}
                  onClick={() => runWithdraw()}
                >
                  {isWinner ? "WITHDRAW" : "YOU LOSE"}
                </Button>
              )}
            </Space>
          </>
        ) : (
          <></>
        )}
      </Skeleton>
    </Card>
  );
}
