import { FeedPush } from "./api";

export type Price = number;
type Size = number;

type OrdersState = Record<Price, Size>;
export type Order = [Price, Size];

const orderToChangeset = (order: Order): OrdersState => ({
  [order[0]]: order[1],
});

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
