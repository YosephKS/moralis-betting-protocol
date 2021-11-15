import React from "react";
import { Card, Typography, Button, Space } from "antd";
import { getEllipsisTxt } from "helpers/formatters";

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
  return (
    <Card title={getEllipsisTxt(cardTitle)} bordered hoverable>
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
          <Typography.Text>challenger: {challenger ?? "You"}</Typography.Text>
        )}
        <Typography.Text>Sides: {sides}</Typography.Text>
        <Typography.Text>
          Status: {status === 0 ? "OPEN" : "CLOSED"}
        </Typography.Text>
      </div>
      <Space direction="vertical" size="middle" style={{ width: "100%" }}>
        <Button
          size="large"
          type="default"
          style={{ width: "100%" }}
          // onClick={onClick}
        >
          View Details
        </Button>
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
    </Card>
  );
}
