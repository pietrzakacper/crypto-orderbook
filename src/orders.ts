import { groupBy, mapValues, sum } from "lodash";
import { FeedPush } from "./api";

export type Price = number;
type Size = number;

type OrdersState = Record<Price, Size>;
export type Order = [Price, Size];

export type OrderChangesets = {
  asks: OrdersState;
  bids: OrdersState;
};

type Totals = Record<Price, Size>;
export type OrderTotals = {
  asks: Totals;
  bids: Totals;
};

type MergedOrders = OrderChangesets;

export type State = MergedOrders;

const orderToChangeset = (order: Order): OrdersState => ({
  [order[0]]: order[1],
});

const batchToChangeset = (batch: Order[]): OrdersState =>
  Object.assign({}, ...batch.map(orderToChangeset));

export const messagesToChangesets = (
  messages: FeedPush[]
): OrderChangesets => ({
  asks: batchToChangeset(messages.flatMap((message) => message.asks)),
  bids: batchToChangeset(messages.flatMap((message) => message.bids)),
});

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

export const calculateTotals = (orders: OrdersState): Totals =>
  Object.entries(orders)
    .map(priceToNumber)
    .sort(byPriceAsc)
    .reduce<Totals>(accumulateSizes, {});

export const groupOrders = (orders: OrdersState, groupRange: number) =>
  mapValues(
    groupBy(
      Object.entries(orders),
      ([price]) => Math.ceil(+price / groupRange) * groupRange
    ),
    (groupedOrders) => sum(groupedOrders.map(([, size]) => size))
  );

export const applyChangesets =
  (changeset: OrderChangesets) =>
  (oldState: State): State => {
    const mergedOrders = mergeOrders(oldState, changeset);

    return {
      ...oldState,
      ...mergedOrders,
    };
  };
