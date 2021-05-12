import React, { useEffect, useMemo, useState } from "react";
import { listenToOrders, openConnection, subscribeToOrderbook } from "./api";
import {
  applyChangeset,
  messagesToChangesets,
  State,
  groupOrders,
  byPriceDesc,
  OrderChangesets,
} from "./orders";
import { throttleAccumulated } from "./utils";
import { flow, clamp } from "lodash";
import { MAX_LIST_SIZE, OrderList } from "./OrderList";
import { styled } from "./styled";

const THROTTLE_INTERVAL_MS = 150;
const GROUPS = [0.5, 1, 5, 10, 20, 50, 100, 200, 500] as const;
export type Group = typeof GROUPS[number];

function App() {
  const [{ asks, bids }, setState] = useState<State>({
    asks: new Map(),
    bids: new Map(),
  });

  const [groupIndex, setGroupIndex] = useState(0);

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

  const safelyIncrementGroup = (inc: number) => () =>
    setGroupIndex((oldIndex) => clamp(oldIndex + inc, GROUPS.length));

  const group = GROUPS[groupIndex];

  const [asksGrouped, bidsGrouped] = [asks, bids]
    .map(groupOrders(group))
    .map((orders) => [...orders.entries()].sort(byPriceDesc));

  const highestAsks = asksGrouped.slice(0, MAX_LIST_SIZE);
  const lowestBids = bidsGrouped.slice(-MAX_LIST_SIZE);

  return (
    <Container size={{ "@bp1": "small", "@bp2": "normal" }}>
      <Title>PI_XBTUSD</Title>
      <OrdersContainer size={{ "@bp1": "small", "@bp2": "normal" }}>
        <OrderList title="Ask" ordersDesc={highestAsks} />
        {
          <GroupControlsContainer>
            <GroupButton
              disabled={groupIndex === 0}
              onClick={safelyIncrementGroup(-1)}
            >
              ‹
            </GroupButton>
            <GroupText>Group by {group.toFixed(2)}</GroupText>
            <GroupButton
              disabled={groupIndex === GROUPS.length - 1}
              onClick={safelyIncrementGroup(1)}
            >
              ›
            </GroupButton>
          </GroupControlsContainer>
        }
        <OrderList title="Bid" ordersDesc={lowestBids} />
      </OrdersContainer>
    </Container>
  );
}

const applyChangesets =
  (changeset: OrderChangesets) =>
  (oldState: State): State => ({
    asks: applyChangeset(oldState.asks, changeset.asks),
    bids: applyChangeset(oldState.bids, changeset.bids),
  });

const Title = styled("h1", {
  textAlign: "left",
  margin: 0,
  fontSize: "1rem",
  textTransform: "uppercase",
  color: "white",
  marginBottom: "0.2rem",
});

const Container = styled("div", {
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  width: "100vw",
  height: "100vh",

  variants: {
    size: {
      small: {
        "& > *": {
          width: "90%",
        },
      },
      normal: {
        "& > *": {
          width: "80%",
          maxWidth: "900px",
        },
      },
    },
  },
});

const GroupControlsContainer = styled("div", {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
});

const GroupButton = styled("button", {
  padding: "0.2rem 1rem",
  margin: "0 0.5rem",
  backgroundColor: "transparent",
  border: "none",
  borderRadius: "3px",
  fontSize: "2rem",
  color: "white",
  cursor: "pointer",
  "&:hover": {
    background: "#ffffff1f",
  },
});

const GroupText = styled("div", {
  minWidth: "120px",
  textAlign: "center",
});

const OrdersContainer = styled("div", {
  display: "flex",
  alignItems: "center",
  flexDirection: "column",
  boxShadow: "0 0 1rem 0 rgba(0, 0, 0, .2)",
  borderRadius: "5px",
  backgroundColor: "rgba(255, 255, 255, .15)",
  backdropFilter: "blur(5px)",
  variants: {
    size: {
      small: { padding: "0.5rem 1rem" },
      normal: { padding: "1rem" },
    },
  },
});

export default App;
