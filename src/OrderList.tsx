import React from "react";
import { OrdersMap, byPriceDesc } from "./orders";
import { capOrders, priceToNumber, calculateTotals } from "./orders";
import { styled } from "@stitches/react";

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
    <Container>
      <h2>{title}</h2>
      <Table>
        <thead>
          <TableHeader>Price</TableHeader>
          <TableHeader>Size</TableHeader>
          <TableHeader>Total</TableHeader>
        </thead>
        <tbody>
          {cappedOrders.map(([price, size]) => (
            <TableRow key={price}>
              <TableData>{price.toFixed(2)}</TableData>
              <TableData>{size}</TableData>
              <TableData>{totals[+price]}</TableData>
            </TableRow>
          ))}
        </tbody>
      </Table>
    </Container>
  );
}
const Container = styled("div", {
  height: 400,
  width: "80%",
});

const Table = styled("table", {
  borderCollapse: "collapse",
  textAlign: "right",
  width: "100%",
});

const TableRow = styled("tr", {
  background: "white",
  borderBottom: "1px solid",
  height: "3rem",
});

const TableData = styled("td", {
  padding: "10px 20px",
  "& > span": {
    background: "#eee",
    color: "dimgrey",
    display: "none",
    fontSize: "10px",
    fontWeight: "bold",
    padding: "5px",
    position: "absolute",
    top: 0,
    left: 0,
  },
});

const TableHeader = styled("th", {
  padding: "10px 20px",
  width: "33%",
});
