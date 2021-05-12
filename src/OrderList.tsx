import React from "react";
import { OrdersMap, byPriceDesc } from "./orders";
import { capOrders, priceToNumber, calculateTotals } from "./orders";

type Props = {
  title: string;
  orders: OrdersMap;
};

const MAX_LIST_SIZE = 7;

export function OrderList({ title, orders }: Props) {
  const sortedOrders = Object.entries(orders)
    .map(priceToNumber)
    .filter(([, size]) => size !== 0)
    .sort(byPriceDesc);

  const cappedOrders = capOrders(sortedOrders, MAX_LIST_SIZE);
  const totals = calculateTotals(cappedOrders);

  return (
    <>
      <h2>{title}</h2>
      {cappedOrders.map(([price, size]) => (
        <div key={price}>
          Price: {price} | Size: {size} | Total: {totals[+price]}
        </div>
      ))}
    </>
  );
}
