import { FeedPush } from "./api";
import { Nominal } from "./types";

export type Price = number;
type Size = number;

type OrdersState = Nominal<Record<Price, Size>, "OrdersState">;
export type Order = [Price, Size];

const orderToChangeset = (order: Order): OrdersState =>
  ({
    [order[0]]: order[1],
  } as OrdersState);

const batchToChangeset = (batch: Order[]): OrdersState =>
  Object.assign({}, ...batch.map(orderToChangeset));

const batchesToChangeset = (batches: Order[][]): OrdersState =>
  Object.assign({}, ...batches.map(batchToChangeset));

export type OrderChangesets = {
  asks: OrdersState;
  bids: OrdersState;
};

export const messagesToChangesets = (
  messages: FeedPush[]
): OrderChangesets => ({
  asks: batchesToChangeset(messages.map((message) => message.asks)),
  bids: batchesToChangeset(messages.map((message) => message.bids)),
});

type Totals = Nominal<Record<Price, Size>, "Totals">;
export type OrderTotals = {
  asks: Totals;
  bids: Totals;
};

export type State = Nominal<OrderChangesets, "State">;

export const applyChangesets =
  (changeset: OrderChangesets) =>
  (oldState: State): State => ({
    ...oldState,
    asks: { ...oldState.asks, ...changeset.asks },
    bids: { ...oldState.bids, ...changeset.bids },
  });
