import React, { useEffect, useMemo, useState } from "react";
import { listenToOrders, openConnection, subscribeToOrderbook } from "./api";
import {
  applyChangesets,
  messagesToChangesets,
  State,
  groupOrders,
} from "./orders";
import { throttleAccumulated } from "./utils";
import { flow, clamp } from "lodash";
import { OrderList } from "./OrderList";
import { styled } from "@stitches/react";

const THROTTLE_INTERVAL_MS = 300;
const GROUPS = [0.5, 1, 5, 10, 20, 50, 100, 200, 500] as const;
export type Group = typeof GROUPS[number];

function App() {
  const [{ asks, bids }, setState] = useState<State>({
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

  const [groupIndex, setGroupIndex] = useState(0);
  const group = GROUPS[groupIndex];
  const safelyIncrementGroup = (inc: number) => () =>
    setGroupIndex((oldIndex) => clamp(oldIndex + inc, GROUPS.length));

  const [asksGrouped, bidsGrouped] = [asks, bids].map(groupOrders(group));

  return (
    <Container>
      <OrdersContainer>
        <OrderList title="Ask" orders={asksGrouped} />
        <OrderList title="Bid" orders={bidsGrouped} />
      </OrdersContainer>
    </Container>
  );
  // {
  //   /* <h1>Example</h1>
  // <div>
  //   Group by {group}
  //   <button disabled={groupIndex === 0} onClick={safelyIncrementGroup(-1)}>
  //     -
  //   </button>
  //   |
  //   <button
  //     disabled={groupIndex === GROUPS.length - 1}
  //     onClick={safelyIncrementGroup(1)}
  //   >
  //     +
  //   </button>
  // </div> */
  // }
}

const Container = styled("div", {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "100vw",
  height: "100vh",
});

const OrdersContainer = styled("div", {
  width: "80%",
  maxWidth: "900px",
  display: "flex",
  padding: "1rem",
  alignItems: "center",
  flexDirection: "column",
  boxShadow: "0 0 1rem 0 rgba(0, 0, 0, .2)",
  borderRadius: "5px",
  backgroundColor: "rgba(255, 255, 255, .15)",
  backdropFilter: "blur(5px)",
});

export default App;
