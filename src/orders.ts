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

export const applyChangeset = (
  oldState: OrdersMap,
  changeset: OrdersMap
): OrdersMap => {
  const newState = new Map([...oldState]);

  for (const [price, size] of changeset) {
    if (size === 0) {
      newState.delete(price);
    } else {
      newState.set(price, size);
    }
  }

  return newState;
};
