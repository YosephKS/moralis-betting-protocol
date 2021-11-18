import React, { useState, useMemo } from "react";
import { Typography, Row, Col } from "antd";
import GameCard from "../components/GameCard";
import GameModal from "components/GameModal";
import { useMoralisDapp } from "providers/MoralisDappProvider/MoralisDappProvider";
import { useMoralisQuery } from "react-moralis";

const styles = {
  wrapper: {
    width: "100%",
  },
  title: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
};

export default function Dashboard() {
  const [visible, setVisible] = useState(false);
  const { walletAddress } = useMoralisDapp();
  const { data } = useMoralisQuery(
    "BettingGameCreatedKovan",
    (query) => query.notEqualTo("creator", walletAddress ?? ""),
    [],
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
      <GameModal visible={visible} handleClose={() => setVisible()} />
      <div style={styles.wrapper}>
        <div style={styles.title}>
          <Typography.Title level={1}>
            Place d'BET. Win d'Game.
          </Typography.Title>
          <Typography.Text style={{ fontSize: "20px" }}>
            Try your luck fairly in a fairer and more trustless manner.
          </Typography.Text>
        </div>
        <Row gutter={16} style={{ marginTop: "2rem" }}>
          {bettingGameData.map((address) => {
            return (
              <Col span={8}>
                <GameCard cardTitle={address} />
              </Col>
            );
          })}
        </Row>
      </div>
    </>
  );
}
