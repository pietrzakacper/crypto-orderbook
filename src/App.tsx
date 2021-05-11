import React, { useEffect, useMemo, useState } from "react";
import { listenToOrders, openConnection, subscribeToOrderbook } from "./api";
import {
  applyChangesets,
  messagesToChangesets,
  State,
  byPriceDesc,
  groupOrders,
  priceToNumber,
  calculateTotals,
} from "./orders";
import { throttleAccumulated } from "./utils";
import { flow } from "lodash";

const THROTTLE_INTERVAL_MS = 100;
const GROUPS = [10, 20, 50, 100, 200, 500];

function App() {
  const [state, setState] = useState<State>({
    asks: {},
    bids: {},
  });

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

  const [groupIndex, setGroupIndex] = useState(~~GROUPS.length / 2);
  const group = GROUPS[groupIndex];
  const safelyIncrementGroup = (index: number) => () =>
    setGroupIndex(Math.min(GROUPS.length - 1, Math.max(groupIndex + index, 0)));

  const asksGrouped = groupOrders(state.asks, group);
  const totals = calculateTotals(asksGrouped);

  return (
    <>
      <h1>Example</h1>
      <div>
        Group by {group}
        <button disabled={groupIndex === 0} onClick={safelyIncrementGroup(-1)}>
          -
        </button>
        |
        <button
          disabled={groupIndex === GROUPS.length - 1}
          onClick={safelyIncrementGroup(1)}
        >
          +
        </button>
      </div>
      {Object.entries(asksGrouped)
        .map(priceToNumber)
        .filter(([, size]) => size !== 0)
        .sort(byPriceDesc)
        .map(([price, size]) => (
          <div key={price}>
            Price: {price} | Size: {size} | Total: {totals[+price]}
          </div>
        ))}
    </>
  );
}

export default App;
