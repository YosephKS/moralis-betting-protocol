import React, { useMemo, useEffect } from "react";
import { Card, Typography, Button, Space, Skeleton } from "antd";
import { getEllipsisTxt } from "helpers/formatters";
import { useWeb3Contract } from "hooks/useWeb3Contract";
import BettingGameABI from "../../contracts/BettingGame.json";
import { useMoralisDapp } from "providers/MoralisDappProvider/MoralisDappProvider";

export default function CardIndex(props) {
  const { cardTitle, buttonText, buttonOnClick, buttonDisabled } = props;
  const { walletAddress } = useMoralisDapp();
  const { abi } = BettingGameABI;

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

  const {
    // runContractFunction: runWithdraw,
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
                  href={`https://kovan.etherscan.io/address/${contractResponse[0]}`}
                >
                  {contractResponse[0].toLowerCase() === walletAddress
                    ? "You"
                    : contractResponse[0]}
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
                      href={`https://kovan.etherscan.io/address/${contractResponse[1]}`}
                    >
                      {contractResponse[1].toLowerCase() === walletAddress
                        ? "You"
                        : contractResponse[1]}
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
              <Typography.Text
                type="secondary"
                style={{ fontSize: "16px", marginTop: "1rem" }}
              >
                Deposit Token Address
              </Typography.Text>
              <Typography.Text>
                <a
                  target="_blank"
                  rel="noreferrer"
                  href={`https://kovan.etherscan.io/address/${contractResponse[5]}`}
                >
                  {contractResponse[5]}
                </a>
              </Typography.Text>

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
                      href={`https://kovan.etherscan.io/address/${contractResponse[6]}`}
                    >
                      {contractResponse[6]}
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
                  window.open(`https://kovan.etherscan.io/address/${cardTitle}`)
                }
              >
                View Details
              </Button>
              <Button
                size="large"
                disabled={buttonDisabled}
                type="primary"
                style={{ width: "100%" }}
                onClick={buttonOnClick}
              >
                {buttonText}
              </Button>
            </Space>
          </>
        ) : (
          <></>
        )}
      </Skeleton>
    </Card>
  );
}
