import React, { useMemo, useEffect } from "react";
import { Card, Typography, Button, Space, Skeleton } from "antd";
import { getEllipsisTxt } from "helpers/formatters";
import { useWeb3Contract } from "hooks/useWeb3Contract";

export default function CardIndex(props) {
  const {
    cardTitle,
    creator,
    challenger,
    sides,
    status,
    buttonText,
    buttonOnClick,
    buttonDisabled,
  } = props;
  const { runContractFunction, contractResponse, isLoading, isRunning } =
    useWeb3Contract({
      abi: [],
      functionName: "getBettingGameInfo",
      contractAddress: cardTitle,
      params: {},
    });

  const isFetching = useMemo(
    () => isLoading || isRunning,
    [isLoading, isRunning]
  );

  useEffect(() => {
    runContractFunction();
    // eslint-disable-next-line
  }, []);

  return (
    <Card title={getEllipsisTxt(cardTitle)} bordered hoverable>
      <Skeleton loading={isFetching}>
        {contractResponse ? (
          <>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                marginBottom: "2rem",
                fontSize: "16px",
              }}
            >
              <Typography.Text>Creator: {creator ?? "You"}</Typography.Text>
              {challenger && (
                <Typography.Text>
                  challenger: {challenger ?? "You"}
                </Typography.Text>
              )}
              <Typography.Text>Sides: {sides}</Typography.Text>
              <Typography.Text>
                Status: {status === 0 ? "OPEN" : "CLOSED"}
              </Typography.Text>
            </div>
            <Space direction="vertical" size="middle" style={{ width: "100%" }}>
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
