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

type Totals = Record<Price, Size>;
export type OrderTotals = {
  asks: Totals;
  bids: Totals;
};

type MergedOrders = OrderChangesets;

const mergeOrders = (
  state: State,
  changeset: OrderChangesets
): MergedOrders => ({
  asks: { ...state.asks, ...changeset.asks },
  bids: { ...state.bids, ...changeset.bids },
});

export const priceToNumber = ([price, size]: [string, number]): Order => [
  +price,
  size,
];

export const byPriceAsc = ([priceA]: Order, [priceB]: Order) => priceA - priceB;
export const byPriceDesc = ([priceA]: Order, [priceB]: Order) =>
  priceB - priceA;

const accumulateSizes = (
  acc: Totals,
  order: Order,
  index: number,
  ordersByPrice: Order[]
): Totals => {
  if (index === 0) {
    return orderToChangeset(order);
  }

  const prevAccumulatedSize = acc[ordersByPrice[index - 1][0]];

  return {
    ...acc,
    [order[0]]: order[1] + prevAccumulatedSize,
  };
};

const calculateTotals = (orders: OrdersState): Totals =>
  Object.entries(orders)
    .map(priceToNumber)
    .sort(byPriceAsc)
    .reduce<Totals>(accumulateSizes, {});

const calculateOrdersTotals = (orders: MergedOrders): OrderTotals => ({
  asks: calculateTotals(orders.asks),
  bids: calculateTotals(orders.bids),
});

export type State = MergedOrders & { totals: OrderTotals };

export const applyChangesets =
  (changeset: OrderChangesets) =>
  (oldState: State): State => {
    const mergedOrders = mergeOrders(oldState, changeset);
    const totals = calculateOrdersTotals(mergedOrders);

    return {
      ...oldState,
      ...mergedOrders,
      totals,
    };
  };
