import { FeedPush } from "./api";
import { applyChangeset, groupOrders, messagesToChangesets } from "./orders";

describe("messagesToChangesets", () => {
  it("maps empty push", () => {
    const push: FeedPush = {
      feed: "Example Feed",
      product_id: "X_PRODUCT",
      bids: [],
      asks: [],
    };

    const result = messagesToChangesets([push]);

    expect(result).toEqual({
      bids: new Map(),
      asks: new Map(),
    });
  });

  it("maps single push", () => {
    const push: FeedPush = {
      feed: "Example Feed",
      product_id: "X_PRODUCT",
      bids: [[10.1, 1000]],
      asks: [[9.5, 500]],
    };

    const result = messagesToChangesets([push]);

    expect(result).toEqual({
      bids: new Map([[10.1, 1000]]),
      asks: new Map([[9.5, 500]]),
    });
  });

  it("merges multiple pushes", () => {
    const push: FeedPush = {
      feed: "Example Feed",
      product_id: "X_PRODUCT",
      bids: [
        [10.1, 1000],
        [10.1, 1200],
        [1, 1],
      ],
      asks: [
        [9.5, 500],
        [1, 1],
        [9.5, 100],
      ],
    };

    const result = messagesToChangesets([push]);

    expect(result).toEqual({
      bids: new Map([
        [10.1, 1200],
        [1, 1],
      ]),
      asks: new Map([
        [9.5, 100],
        [1, 1],
      ]),
    });
  });
});

describe("groupOrders", () => {
  it("groups single order to the closest price level", () => {
    const orders = new Map([[1.1, 1000]]);
    const priceLevel = 1;
    const result = groupOrders(priceLevel)(orders);

    expect(result).toEqual(new Map([[1, 1000]]));
  });

  it("accumulates sizes on the same price level", () => {
    const orders = new Map([
      [1.1, 1000],
      [0.9, 500],
    ]);
    const priceLevel = 1;
    const result = groupOrders(priceLevel)(orders);

    expect(result).toEqual(new Map([[1, 1500]]));
  });

  it("combines multiple price levels", () => {
    const orders = new Map([
      [1.1, 1000],
      [2.499999, 200],
      [0.9, 500],
      [1.5, 200],
    ]);
    const priceLevel = 1;
    const result = groupOrders(priceLevel)(orders);

    expect(result).toEqual(
      new Map([
        [1, 1500],
        [2, 400],
      ])
    );
  });
});

describe("applyChangeset", () => {
  it("removes orders of size 0", () => {
    const oldState = new Map([
      [1, 1000],
      [2, 1000],
    ]);
    const changeset = new Map([[1, 0]]);

    const result = applyChangeset(oldState, changeset);

    expect(result).toEqual(new Map([[2, 1000]]));
  });

  it("replaces old orders", () => {
    const oldState = new Map([[1, 1000]]);
    const changeset = new Map([[1, 2000]]);

    const result = applyChangeset(oldState, changeset);

    expect(result).toEqual(new Map([[1, 2000]]));
  });

  it("adds new orders", () => {
    const oldState = new Map<number, number>([]);
    const changeset = new Map([[1, 2000]]);

    const result = applyChangeset(oldState, changeset);

    expect(result).toEqual(new Map([[1, 2000]]));
  });
});
