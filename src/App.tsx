import React, { useEffect, useMemo, useState } from "react";
import { listenToOrders, openConnection, subscribeToOrderbook } from "./api";
import { applyChangesets, messagesToChangesets, State } from "./orders";
import { throttleAccumulated } from "./utils";
import { flow } from "fp-ts/function";

const THROTTLE_INTERVAL_MS = 100;

function App() {
  const [state, setState] = useState({ asks: {}, bids: {} } as State);

  const onMessage = useMemo(
    () =>
      throttleAccumulated(
        flow(messagesToChangesets, applyChangesets, setState),
        THROTTLE_INTERVAL_MS
      ),
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
