import React, { useEffect, useMemo, useState } from "react";
import { listenToOrders, openConnection, subscribeToOrderbook } from "./api";
import {
  applyChangesets,
  messagesToChangesets,
  State,
  groupOrders,
} from "./orders";
import { throttleAccumulated } from "./utils";
import { flow } from "lodash";
import { OrderList } from "./OrderList";

const THROTTLE_INTERVAL_MS = 100;
const GROUPS = [0.5, 1, 5, 10, 20, 50, 100, 200, 500] as const;
export type Group = typeof GROUPS[number];

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

  const [asksGrouped, bidsGrouped] = [state.asks, state.bids].map(
    groupOrders(group)
  );

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
      <OrderList title="Ask" orders={asksGrouped} />
      <OrderList title="Bid" orders={bidsGrouped} />
    </>
  );
}

export default App;
