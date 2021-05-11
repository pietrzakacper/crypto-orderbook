import React, { useEffect, useMemo, useState } from "react";
import { listenToOrders, openConnection, subscribeToOrderbook } from "./api";
import {
  applyChangesets,
  messagesToChangesets,
  State,
  priceToNumber,
  byPriceDesc,
} from "./orders";
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
        .map(priceToNumber)
        .filter(([, size]) => size !== 0)
        .sort(byPriceDesc)
        .map(([price, size]) => (
          <div key={price}>
            Price: {price} | Size: {size} | Total: {state.totals.asks[+price]}
          </div>
        ))}
    </>
  );
}

export default App;
