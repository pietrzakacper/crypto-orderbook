import React, { useEffect, useMemo, useState } from "react";
import {
  listenToOrders,
  openConnection,
  subscribeToOrderbook,
  FeedPush,
} from "./api";
import { messagesToChangesets, OrderChangesets } from "./transform";
import { throttleAccumulated } from "./utils";

const THROTTLE_INTERVAL_MS = 100;

type State = OrderChangesets;

function App() {
  const [state, setState] = useState<State>({ asks: {}, bids: {} });

  const onMessage = useMemo(
    () =>
      throttleAccumulated((messages: FeedPush[]) => {
        const changeset = messagesToChangesets(messages);

        setState((oldState) => ({
          asks: { ...oldState.asks, ...changeset.asks },
          bids: { ...oldState.bids, ...changeset.bids },
        }));
      }, THROTTLE_INTERVAL_MS),
    []
  );

  useEffect(() => {
    openConnection().then(subscribeToOrderbook).then(listenToOrders(onMessage));
  }, [onMessage]);

  return (
    <>
      <h1>Example</h1>
      {Object.entries(state.asks)
        .filter(([, size]) => size !== 0)
        .map(([price, size]) => (
          <div key={price}>
            {price} | {size}
          </div>
        ))}
    </>
  );
}

export default App;
