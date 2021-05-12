import React from "react";
import { OrdersMap, byPriceDesc } from "./orders";
import { capOrders, priceToNumber, calculateTotals } from "./orders";
import { styled } from "./styled";

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
    <Container size={{ "@bp1": "small", "@bp2": "normal" }}>
      <Title size={{ "@bp1": "small", "@bp2": "big" }}>{title}</Title>
      <TableContainer>
        <Table>
          <thead>
            <TableHeader>Price</TableHeader>
            <TableHeader>Size</TableHeader>
            <TableHeader>Total</TableHeader>
          </thead>
          <tbody>
            {cappedOrders.map(([price, size]) => (
              <TableRow key={price}>
                <TableData>{formatNumber(price, true)}</TableData>
                <TableData>{formatNumber(size)}</TableData>
                <TableData>{formatNumber(totals[+price])}</TableData>
              </TableRow>
            ))}
          </tbody>
        </Table>
      </TableContainer>
    </Container>
  );
}

function formatNumber(x: number, float = false) {
  return (float ? x.toFixed(2) : x.toString()).replace(
    /\B(?=(\d{3})+(?!\d))/g,
    ","
  );
}
const TableContainer = styled("div", {
  minHeight: 250,
});

const Title = styled("h2", {
  margin: 0,
  textTransform: "uppercase",
  color: "#ffffff87",
  variants: {
    size: {
      small: { fontSize: "1rem" },
      big: { position: "absolute", fontSize: "3rem" },
    },
  },
});

const Container = styled("div", {
  width: "100%",
  borderRadius: "4px",
  variants: {
    size: {
      small: { margin: "0.2rem", background: "transparent" },
      normal: { margin: "1rem", background: "#ffffff0d" },
    },
  },
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
  height: "1rem",
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
