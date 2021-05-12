import { sum } from "lodash";
import { FeedPush } from "./api";

export type Price = number;
type Size = number;

export type OrdersMap = Map<Price, Size>;
export type Order = [Price, Size];

export type OrderChangesets = {
  asks: OrdersMap;
  bids: OrdersMap;
};

type Totals = Map<Price, Size>;
export type OrderTotals = {
  asks: Totals;
  bids: Totals;
};

type MergedOrders = OrderChangesets;

export type State = MergedOrders;

const toChangeset = (
  messages: FeedPush[],
  selectOrders: (message: FeedPush) => Order[]
): OrdersMap => new Map(messages.flatMap(selectOrders));

export const messagesToChangesets = (
  messages: FeedPush[]
): OrderChangesets => ({
  asks: toChangeset(messages, (msg) => msg.asks),
  bids: toChangeset(messages, (msg) => msg.bids),
});

export const byPriceAsc = ([priceA]: Order, [priceB]: Order) => priceA - priceB;
export const byPriceDesc = ([priceA]: Order, [priceB]: Order) =>
  priceB - priceA;

const accumulateSizes = (
  acc: Totals,
  order: Order,
  index: number,
  ordersByPrice: Order[]
): Totals => {
  if (index === ordersByPrice.length - 1) {
    return acc.set(...order);
  }

  const prevAccumulatedSize = acc.get(ordersByPrice[index + 1][0]);
  return acc.set(order[0], order[1] + prevAccumulatedSize!);
};

export const calculateTotals = (ordersDesc: Order[]): Totals =>
  ordersDesc.reduceRight<Totals>(accumulateSizes, new Map());

const getGroupedPrice = (price: number, groupRange: number) =>
  Math.round(price / groupRange) * groupRange;

export const groupOrders =
  (groupRange: number) =>
  (orders: OrdersMap): OrdersMap => {
    const groupedMap = new Map();

    for (const [price, size] of orders) {
      const groupedPrice = getGroupedPrice(price, groupRange);
      const oldSize = groupedMap.get(groupedPrice) || 0;
      groupedMap.set(groupedPrice, oldSize + size);
    }

    return groupedMap;
  };

export const applyChangesets =
  (changeset: OrderChangesets) =>
  (oldState: State): State => ({
    asks: new Map([...oldState.asks, ...changeset.asks]),
    bids: new Map([...oldState.bids, ...changeset.bids]),
  });

export const capOrders = (ordersDesc: Order[], maxSize: number) => {
  if (ordersDesc.length <= maxSize) {
    return ordersDesc;
  }

  const ordersBeforePivot = ordersDesc.slice(0, maxSize - 2);
  const remainingOrders = ordersDesc.slice(maxSize - 1);

  const pivotPrice = remainingOrders[0][0];
  const combinedRemainingSizes = sum(remainingOrders.map(([, size]) => size));

  return [
    ...ordersBeforePivot,
    [pivotPrice, combinedRemainingSizes],
  ] as Order[];
};
