import React from "react";
import { useMoralis } from "react-moralis";
import { Timeline, Typography } from "antd";

const styles = {
  wrapper: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "100%",
  },
};

export default function Dashboard() {
  const { Moralis } = useMoralis();

  return (
    <div style={styles.wrapper}>
      <Typography.Title level={1}>Place d'BET. Win d'Game.</Typography.Title>
      <Typography.Text style={{ fontSize: "20px" }}>
        Try your luck fairly on the decentralized protocol.
      </Typography.Text>
    </div>
  );
}
