import React, { useState } from "react";
import { Typography, InputNumber, Space, Button } from "antd";

export default function Faucet() {
  const [betValue, setBetValue] = useState(0);

  /**
   *
   * @param {number} value - Value inputted in the `InputNumber`
   */
  const onChange = (value) => {
    setBetValue(value);
  };

  return (
    <div>
      <Typography.Title level={1}>Request Testnet BET</Typography.Title>
      <div style={{ width: "60%", fontSize: "18px" }}>
        <Typography.Text>
          Get up to <b>100 testnet BET</b> for your account on one of the
          supported blockchain testnets so you can use our betting protocol and
          place a bet. Note that you need some native token to mint new testnet
          BET.
        </Typography.Text>
      </div>
      <div
        style={{ display: "flex", flexDirection: "column", marginTop: "2rem" }}
      >
        <Space
          size="large"
          style={{ display: "flex", alignItems: "center", fontSize: "20px" }}
        >
          <InputNumber
            size="large"
            bordered
            value={betValue}
            onChange={onChange}
            max={100}
            style={{ width: "20vw" }}
          />
          <Typography.Text>BET</Typography.Text>
        </Space>
        <Button
          type="primary"
          size="large"
          style={{ width: "25vw", marginTop: "2rem" }}
        >
          Request Testnet BET
        </Button>
      </div>
    </div>
  );
}
