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
      <Title>{title}</Title>
      <Table>
        <thead>
          <TableHeader>Price</TableHeader>
          <TableHeader>Size</TableHeader>
          <TableHeader>Total</TableHeader>
        </thead>
        <tbody>
          {cappedOrders.map(([price, size]) => (
            <TableRow key={price}>
              <TableData>{numberWithCommas(+price.toFixed(2))}</TableData>
              <TableData>{numberWithCommas(size)}</TableData>
              <TableData>{numberWithCommas(totals[+price])}</TableData>
            </TableRow>
          ))}
        </tbody>
      </Table>
    </Container>
  );
}

function numberWithCommas(x: number) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

const Title = styled("h2", {
  position: "absolute",
  margin: 0,
  fontSize: "3rem",
  textTransform: "uppercase",
  color: "#ffffff87",
});

const Container = styled("div", {
  minHeight: 250,
  width: "100%",
  margin: "1rem",
  background: "#ffffff0d",
  borderRadius: "4px",
});

const Table = styled("table", {
  borderCollapse: "collapse",
  textAlign: "right",
  width: "100%",
});

const TableRow = styled("tr", {
  borderBottom: "1px solid",
  borderColor: "#ffffff73",
  height: "1rem",
});

const TableData = styled("td", {
  padding: "5px 10px",
  "& > span": {
    background: "#eee",
    color: "dimgrey",
    display: "none",
    fontSize: "10px",
    fontWeight: "bold",
    padding: "2px",
    position: "absolute",
    top: 0,
    left: 0,
  },
});

const TableHeader = styled("th", {
  padding: "10px 10px",
  width: "33%",
  textTransform: "uppercase",
  letterSpacing: "0.3rem",
});
