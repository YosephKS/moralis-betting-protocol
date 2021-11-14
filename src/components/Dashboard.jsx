import React from "react";
import { Typography, Card, Row, Col, Button } from "antd";

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
        Try your luck fairly on the decentralized protocol.
      </Typography.Text>
      <Row gutter={16} style={{ marginTop: "2rem" }}>
        <Col span={8}>
          <Card
            title="0xb46bb2E9d9B55D5EAE10960EbBA27F966D9511d1"
            bordered
            hoverable
          >
            <Button size="large" type="primary" style={{ width: "100%" }}>
              Bet
            </Button>
          </Card>
        </Col>
        <Col span={8}>
          <Card
            title="0xb46bb2E9d9B55D5EAE10960EbBA27F966D9511d1"
            bordered
            hoverable
          >
            <Button size="large" type="primary" style={{ width: "100%" }}>
              Bet
            </Button>
          </Card>
        </Col>
        <Col span={8}>
          <Card
            title="0xb46bb2E9d9B55D5EAE10960EbBA27F966D9511d1"
            bordered
            hoverable
          >
            <Button size="large" type="primary" style={{ width: "100%" }}>
              Bet
            </Button>{" "}
          </Card>
        </Col>
        <Col span={8}>
          <Card
            title="0xb46bb2E9d9B55D5EAE10960EbBA27F966D9511d1"
            bordered
            hoverable
          >
            <Button size="large" type="primary" style={{ width: "100%" }}>
              Bet
            </Button>
          </Card>
        </Col>
        <Col span={8}>
          <Card
            title="0xb46bb2E9d9B55D5EAE10960EbBA27F966D9511d1"
            bordered
            hoverable
          >
            <Button size="large" type="primary" style={{ width: "100%" }}>
              Bet
            </Button>
          </Card>
        </Col>
        <Col span={8}>
          <Card
            title="0xb46bb2E9d9B55D5EAE10960EbBA27F966D9511d1"
            bordered
            hoverable
          >
            <Button size="large" type="primary" style={{ width: "100%" }}>
              Bet
            </Button>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
