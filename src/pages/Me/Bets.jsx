import React, { useState } from "react";
import { Typography, Row, Col, Button } from "antd";
import GameCard from "../../components/GameCard";
import GameModal from "../../components/GameModal";

export default function Bets() {
  const [visible, setVisible] = useState(false);

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
        <Row gutter={16}>
          <Col span={8}>
            <GameCard
              cardTitle="0x145a328AE0a6eaA365C13E754E329E3DA9EEcF3E"
              sides={5}
              status={0}
              buttonText="Withdraw"
            />
          </Col>
        </Row>
      </div>
    </>
  );
}
