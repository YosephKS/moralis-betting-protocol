import React from "react";
import { Typography, Row, Col } from "antd";
import GameCard from "./GameCard";

const styles = {
  wrapper: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "100%",
  },
};

export default function Dashboard() {
  return (
    <div style={styles.wrapper}>
      <Typography.Title level={1}>Place d'BET. Win d'Game.</Typography.Title>
      <Typography.Text style={{ fontSize: "20px" }}>
        Try your luck fairly in a fairer and more trustless manner.
      </Typography.Text>
      <Row gutter={16} style={{ marginTop: "2rem" }}>
        <Col span={8}>
          <GameCard
            cardTitle="0xb46bb2E9d9B55D5EAE10960EbBA27F966D9511d1"
            sides={3}
            status={0}
            buttonText="Bet"
            buttonOnClick={() => {}}
            button
          />
        </Col>
        <Col span={8}>
          <GameCard
            cardTitle="0xb46bb2E9d9B55D5EAE10960EbBA27F966D9511d1"
            sides={3}
            status={0}
            buttonText="Bet"
            buttonOnClick={() => {}}
            button
          />
        </Col>
        <Col span={8}>
          <GameCard
            cardTitle="0xb46bb2E9d9B55D5EAE10960EbBA27F966D9511d1"
            sides={3}
            status={0}
            buttonText="Bet"
            buttonOnClick={() => {}}
            button
          />
        </Col>
      </Row>
    </div>
  );
}
