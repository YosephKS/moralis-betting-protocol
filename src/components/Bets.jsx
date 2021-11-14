import React from "react";
import { Typography, Row, Col, Card, Button } from "antd";

export default function Bets() {
  return (
    <div style={{ width: "100%" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Typography.Title>Your Bets</Typography.Title>
        <Button type="primary" style={{ width: "150px" }}>
          Create Game
        </Button>
      </div>
      <Row gutter={16}>
        <Col span={8}>
          <Card
            title="0xb46bb2E9d9B55D5EAE10960EbBA27F966D9511d1"
            bordered
            hoverable
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                marginBottom: "2rem",
                fontSize: "16px",
              }}
            >
              <Typography.Text>Creator: You</Typography.Text>
              <Typography.Text>Sides: 5</Typography.Text>
              <Typography.Text>Status: OPEN</Typography.Text>
            </div>
            <Button
              size="large"
              disabled
              type="primary"
              style={{ width: "100%" }}
            >
              NO ACTION
            </Button>
          </Card>
        </Col>
        <Col span={8}>
          <Card
            title="0xb46bb2E9d9B55D5EAE10960EbBA27F966D9511d1"
            bordered
            hoverable
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                marginBottom: "2rem",
                fontSize: "16px",
              }}
            >
              <Typography.Text>Creator: You</Typography.Text>
              <Typography.Text>Sides: 5</Typography.Text>
              <Typography.Text>Status: CLOSED</Typography.Text>
            </div>
            <Button size="large" type="primary" style={{ width: "100%" }}>
              WITHDRAW
            </Button>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
