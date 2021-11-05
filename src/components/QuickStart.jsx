import { Timeline, Typography } from "antd";
import React, { useMemo } from "react";
import { useMoralis } from "react-moralis";

const { Text } = Typography;

const styles = {
  title: {
    fontSize: "25px",
    fontWeight: "700",
    marginLeft: "-15px",
    marginBottom: "20px",
  },
  text: {
    fontSize: "17px",
  },
  wrapper: {
    width: "60vw",
    padding: "15px",
  },
};

export default function QuickStart({ isServerInfo }) {
  const { Moralis } = useMoralis();

  const isInchDex = useMemo(
    () => (Moralis.Plugins?.oneInch ? true : false),
    [Moralis.Plugins?.oneInch]
  );

  return (
    <div style={styles.wrapper}>
      <h1 style={styles.title}>📝To-Do List</h1>
      <Timeline mode="left">
        <Timeline.Item dot="📄" style={styles.text}>
          <Text delete>
            Clone or fork{" "}
            <a
              href="https://github.com/ethereum-boilerplate/ethereum-boilerplate#-quick-start"
              target="_blank"
              rel="noopener noreferrer"
            >
              ethereum-boilerplate
            </a>{" "}
          </Text>
        </Timeline.Item>

        <Timeline.Item dot="💿" style={styles.text}>
          <Text delete>
            Install all dependencies: <Text code>npm install</Text>
          </Text>
        </Timeline.Item>

        <Timeline.Item dot="🧰" style={styles.text}>
          <Text delete={isServerInfo}>
            Sign up for a free account on{" "}
            <a
              href="https://moralis.io?utm_source=boilerplatehosted&utm_medium=todo&utm_campaign=ethereum-boilerplate"
              target="_blank"
              rel="noopener noreferrer"
            >
              Moralis
            </a>
          </Text>
        </Timeline.Item>

        <Timeline.Item dot="💾" style={styles.text}>
          <Text delete={isServerInfo}>
            Create a Moralis Server (
            <a
              href="https://docs.moralis.io/moralis-server/getting-started/create-a-moralis-server"
              target="_blank"
              rel="noopener noreferrer"
            >
              How to start Moralis Server
            </a>
            )
          </Text>
        </Timeline.Item>

        <Timeline.Item dot="🔏" style={styles.text}>
          <Text delete={isServerInfo}>
            Rename <Text code>.env.example</Text> to <Text code>.env</Text> and provide your{" "}
            <Text strong>appId</Text> and <Text strong>serverUrl</Text> from{" "}
            <a
              href="https://moralis.io?utm_source=boilerplatehosted&utm_medium=todo&utm_campaign=ethereum-boilerplate"
              target="_blank"
              rel="noopener noreferrer"
            >
              Moralis
            </a>
            :
          </Text>
          <Text code delete={isServerInfo} style={{ display: "block" }}>
            REACT_APP_MORALIS_APPLICATION_ID = xxxxxxxxxxxx
          </Text>
          <Text code delete={isServerInfo} style={{ display: "block" }}>
            REACT_APP_MORALIS_SERVER_URL = https://xxxxxx.grandmoralis.com:2053/server
          </Text>
        </Timeline.Item>

        <Timeline.Item dot="🔁" style={styles.text}>
          <Text delete={isServerInfo}>
            Stop the app and start it again <Text code>npm run start</Text>
          </Text>
        </Timeline.Item>

        <Timeline.Item dot="💿" style={styles.text}>
          <Text delete={isInchDex}>
            Install{" "}
            <a
              href="https://moralis.io/plugins/1inch/?utm_source=boilerplatehosted&utm_medium=todo&utm_campaign=ethereum-boilerplate"
              target="_blank"
              rel="noopener noreferrer"
            >
              1inch Moralis Plugin
            </a>{" "}
            needed for the<Text code>{"<InchDex />"}</Text> component (optional)
          </Text>
        </Timeline.Item>

        <Timeline.Item dot="🚀" style={styles.text}>
          <Text>BUIDL!!!</Text>
        </Timeline.Item>
      </Timeline>

      <h1 style={styles.title}>💣Additional steps to start a local devchain</h1>
      <Timeline mode="left">
        <Timeline.Item dot="💿" style={styles.text}>
          <Text>
            Install{" "}
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://www.npmjs.com/package/truffle"
            >
              Truffle
            </a>{" "}
            and{" "}
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://www.npmjs.com/package/ganache-cli"
            >
              ganache-cli
            </a>{" "}
            <Text code>npm install -g ganache-cli truffle</Text>
          </Text>
        </Timeline.Item>
        <Timeline.Item dot="⚙️" style={styles.text}>
          <Text>
            Start you local devchain: <Text code>npm run devchain</Text> on a new terminal
          </Text>
        </Timeline.Item>
        <Timeline.Item dot="📡" style={styles.text}>
          <Text>
            Deploy test contract: <Text code>npm run deploy</Text> on a new terminal
          </Text>
        </Timeline.Item>
        <Timeline.Item dot="✅" style={styles.text}>
          <Text>
            Open the <Text strong>📄 Contract</Text> tab
          </Text>
        </Timeline.Item>
      </Timeline>

      <Timeline mode="left">
        <Timeline.Item dot="⭐️" style={styles.text}>
          <Text>
            Please star this{" "}
            <a
              href="https://github.com/ethereum-boilerplate/ethereum-boilerplate/"
              target="_blank"
              rel="noopener noreferrer"
            >
              boilerplate
            </a>
            , every star makes us very happy!
          </Text>
        </Timeline.Item>

        <Timeline.Item dot="📖" style={styles.text}>
          <Text>
            Read more about{" "}
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://docs.moralis.io/introduction/readme"
            >
              Moralis
            </a>
          </Text>
        </Timeline.Item>

        <Timeline.Item dot="🙋" style={styles.text}>
          <Text>
            You have questions? Ask them on the {""}
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://forum.moralis.io/t/ethereum-boilerplate-questions/3951/29"
            >
              Moralis forum
            </a>
          </Text>
        </Timeline.Item>
      </Timeline>
    </div>
  );
}
