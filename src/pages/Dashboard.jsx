import React, { useState } from "react";
import { Typography, Row, Col } from "antd";
import GameCard from "../components/GameCard";
import GameModal from "components/GameModal";

const styles = {
  wrapper: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "100%",
  },
};

export default function Dashboard() {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <GameModal visible={visible} handleClose={() => setVisible()} />
      <div style={styles.wrapper}>
        <Typography.Title level={1}>Place d'BET. Win d'Game.</Typography.Title>
        <Typography.Text style={{ fontSize: "20px" }}>
          Try your luck fairly in a fairer and more trustless manner.
        </Typography.Text>
        <Row gutter={16} style={{ marginTop: "2rem" }}>
          <Col span={8}>
            <GameCard
              cardTitle="0x145a328AE0a6eaA365C13E754E329E3DA9EEcF3E"
              handleChallenge={() => setVisible(true)}
            />
          </Col>
          <Col span={8}>
            <GameCard
              cardTitle="0x145a328AE0a6eaA365C13E754E329E3DA9EEcF3E"
              handleChallenge={() => {}}
            />
          </Col>
          <Col span={8}>
            <GameCard
              cardTitle="0x145a328AE0a6eaA365C13E754E329E3DA9EEcF3E"
              handleChallenge={() => {}}
            />
          </Col>
        </Row>
      </div>
    </>
  );
}
