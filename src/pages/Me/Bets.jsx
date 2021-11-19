import React, { useMemo, useState } from "react";
import { Typography, Row, Col, Button } from "antd";
import { useMoralis, useMoralisQuery } from "react-moralis";
import GameCard from "../../components/GameCard";
import GameModal from "../../components/GameModal";
import { useMoralisDapp } from "providers/MoralisDappProvider/MoralisDappProvider";

export default function Bets() {
  const [visible, setVisible] = useState(false);
  const { isInitialized } = useMoralis();
  const { walletAddress } = useMoralisDapp();
  const { data } = useMoralisQuery(
    "BettingGameCreatedKovan",
    (query) =>
      query.equalTo("creator", walletAddress).descending("bettingGameId"),
    [walletAddress, isInitialized],
    {
      live: true,
    }
  );

  const bettingGameData = useMemo(() => {
    return data.map((d) => {
      const { attributes } = d || {};
      const { bettingGameAddress } = attributes || {};
      return bettingGameAddress;
    });
  }, [data]);

  return (
    <>
      <GameModal
        visible={visible}
        handleClose={() => setVisible(false)}
        isCreator
      />
      <div style={{ width: "100%" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography.Title>Your Bets</Typography.Title>
          <Button
            type="primary"
            style={{ width: "150px" }}
            onClick={() => setVisible(true)}
          >
            Create Game
          </Button>
        </div>
        {bettingGameData && bettingGameData?.length > 0 ? (
          <Row gutter={16}>
            {bettingGameData.map((address) => {
              return (
                <Col span={8}>
                  <GameCard cardTitle={address} />
                </Col>
              );
            })}
          </Row>
        ) : (
          <Typography.Text style={{ fontSize: "16px" }}>
            You have not created any game yet.
          </Typography.Text>
        )}
      </div>
    </>
  );
}
