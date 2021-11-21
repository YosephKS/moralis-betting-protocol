import React, { useMemo } from "react";
import { Space, Typography, Button } from "antd";
import {
  useMoralis,
  useMoralisWeb3Api,
  useMoralisWeb3ApiCall,
} from "react-moralis";
import { useWeb3Contract } from "hooks/useWeb3Contract";
import BettingGameABI from "contracts/BettingGame.json";
import erc20TokenAddress from "list/erc20TokenAddress.json";
import { useMoralisDapp } from "providers/MoralisDappProvider/MoralisDappProvider";

export default function PlayGame(props) {
  const { handleNext, isCreator, bettingGameAddress } = props;
  const { Moralis } = useMoralis();
  const { chainId } = useMoralisDapp();
  const Web3Api = useMoralisWeb3Api();
  const { abi: bettingGameABI } = BettingGameABI;

  /**
   * @description Get BettingGame's token balance to check whether the LINK token has arrived yet
   */
  const {
    fetch: runGetTokenBalances,
    isLoading: isGettingTokenBalancesLoading,
    isFetching: isGettingTokenBalancesFetching,
  } = useMoralisWeb3ApiCall(Web3Api.account.getTokenBalances, {
    chain: chainId,
    address: bettingGameAddress,
  });

  /**
   * @description Play the betting game
   */
  const {
    runContractFunction: runPlayGame,
    isLoading: isPlayingLoading,
    isRunning: isPlayingRunning,
  } = useWeb3Contract({
    abi: bettingGameABI,
    contractAddress: bettingGameAddress,
    functionName: "play",
    params: {},
  });

  const disableButton = useMemo(
    () =>
      isPlayingLoading ||
      isPlayingRunning ||
      isGettingTokenBalancesFetching ||
      isGettingTokenBalancesLoading,
    [
      isPlayingLoading,
      isPlayingRunning,
      isGettingTokenBalancesFetching,
      isGettingTokenBalancesLoading,
    ]
  );

  return (
    <Space direction="vertical" align="center" size="middle">
      <Typography.Text>
        If the sum of your bet result and your challenger's is{" "}
        <b>{isCreator ? "EVEN" : "ODD"}</b>, you WIN!
      </Typography.Text>
      <Typography.Text>Otherwise, you LOSE</Typography.Text>
      <Button
        type="primary"
        disabled={disableButton}
        loading={disableButton}
        style={{ width: "100%" }}
        onClick={() => {
          runGetTokenBalances({
            onSuccess: (result) => {
              if (result && result?.length >= 0) {
                const { balance: linkBalance } = result.find(
                  (r) => r?.token_address === erc20TokenAddress[chainId]?.link
                );
                if (
                  parseInt(linkBalance) >=
                  parseInt(Moralis.Units.Token(0.2, 18))
                ) {
                  runPlayGame({ onSuccess: () => handleNext() });
                } else {
                  alert(
                    "LINK Token insufficient. Please wait for a moment till the LINK token arrives!"
                  );
                }
              } else {
                alert(`No ERC20 Token found in ${bettingGameAddress}!`);
              }
            },
          });
        }}
      >
        Bet now!
      </Button>
    </Space>
  );
}
