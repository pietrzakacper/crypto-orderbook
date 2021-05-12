import { FeedPush } from "./api";
import { messagesToChangesets } from "./orders";

describe("messagesToChangesets", () => {
  it("correctly maps empty push", () => {
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

  it("correctly maps single push", () => {
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

  it("correctly merges multiple pushes", () => {
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
