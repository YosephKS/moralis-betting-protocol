import Transfer from "./components/Transfer";
import { Switch, Route, Redirect } from "react-router-dom";
import NativeBalance from "../NativeBalance";
import Address from "../Address/Address";
import Assets from "./components/Assets";
import Blockie from "../Blockie";
import { Card } from "antd";

const styles = {
  title: {
    fontSize: "30px",
    fontWeight: "600",
  },
  header: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  navLinks: {
    display: "flex",
    justifyContent: "space-around",
    width: "100%",
    marginTop: "20px",
    paddingBottom: "20px",
  },
  navLink: {
    textDecoration: "none",
    color: "#4b5552",
  },
  activeLink: {
    color: "#21BF96",
  },
};

function Wallet() {
  return (
    <Card
      style={{ fontWeight: "500", fontSize: "16px", width: "450px" }}
      title={
        <div style={styles.header}>
          <Blockie scale={5} avatar currentWallet />
          <Address size="6" copyable />
          <NativeBalance />
        </div>
      }
    >
      {/* <div style={styles.navLinks}>
          <NavLink to="/wallet/transfer" style={styles.navLink} activeStyle={styles.activeLink}>
            Transfer
          </NavLink>
          <NavLink to="/wallet/assets" style={styles.navLink} activeStyle={styles.activeLink}>
            Assets
          </NavLink>
        </div> */}
      <Switch>
        <Route path="/wallet/transfer">
          <Transfer />
        </Route>
        <Route path="/wallet/assets">
          <Assets />
        </Route>
        <Redirect to="/wallet/transfer" />
      </Switch>
    </Card>
  );
}

export default Wallet;
