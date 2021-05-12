import React from "react";
import { OrdersMap, byPriceDesc } from "./orders";
import { capOrders, calculateTotals } from "./orders";
import { styled } from "./styled";

type Props = {
  title: string;
  orders: OrdersMap;
};

const MAX_LIST_SIZE = 7;

export function OrderList({ title, orders }: Props) {
  const sortedOrders = [...orders.entries()]
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
                <TableData>
                  <span>{formatNumber(price, true)}</span>
                </TableData>
                <TableData>
                  <span>{formatNumber(size)}</span>
                </TableData>
                <TableData>
                  <span>{formatNumber(totals.get(price)!)}</span>
                </TableData>
              </TableRow>
            ))}
          </tbody>
        </Table>
      </TableContainer>
    </Container>
  );
}

const formatNumber = (x: number, float = false) =>
  (float ? x.toFixed(2) : x.toString()).replace(/\B(?=(\d{3})+(?!\d))/g, ",");

const TableContainer = styled("div", {
  minHeight: 265,
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
      normal: {
        margin: "1rem",
        background: "#ffffff0d",
        "& *": {
          letterSpacing: "0.3rem",
        },
      },
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
  height: "2rem",
  position: "relative",
  "& > span": {
    fontSize: "1rem",
    fontWeight: "bold",
    position: "absolute",
    padding: "5px",
    bottom: 0,
    right: 0,
  },
});

const TableHeader = styled("th", {
  padding: "10px 5px",
  width: "33%",
  textTransform: "uppercase",
});
