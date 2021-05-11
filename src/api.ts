import { JsonDecoder } from "ts.data.json";
import { Order } from "./transform";

type Nominal<T, Type extends string> = T & {
  __Type: Type;
};

type ConnectedSocket = Nominal<WebSocket, "ConnectedSocket">;

const SERVER_URL = "wss://www.cryptofacilities.com/ws/v1";

export function openConnection(): Promise<ConnectedSocket> {
  return new Promise((resolve, reject) => {
    const socket = new WebSocket(SERVER_URL);

    socket.onopen = () => resolve(socket as ConnectedSocket);
    socket.onerror = reject;
  });
}

export function subscribeToOrderbook(socket: ConnectedSocket): ConnectedSocket {
  const payload = JSON.stringify({
    event: "subscribe",
    feed: "book_ui_1",
    product_ids: ["PI_XBTUSD"],
  });

  socket.send(payload);

  return socket;
}

type OrderConsumer = (order: FeedPush) => void;

export function listenToOrders(
  consumer: OrderConsumer
): (socket: ConnectedSocket) => ConnectedSocket {
  return (socket) => {
    socket.onmessage = (message) =>
      Promise.resolve(message.data)
        .then(JSON.parse)
        .then((payload) => FeedPushDecoder.decodeToPromise(payload))
        .then(consumer)
        .catch(console.warn);

    return socket;
  };
}

export type FeedPush = {
  feed: string;
  product_id: string;
  bids: Order[];
  asks: Order[];
};

const FeedPushDecoder = JsonDecoder.object<FeedPush>(
  {
    feed: JsonDecoder.string,
    product_id: JsonDecoder.string,
    bids: JsonDecoder.array(
      JsonDecoder.tuple([JsonDecoder.number, JsonDecoder.number], "BidDecoder"),
      "BidsDecoder"
    ),
    asks: JsonDecoder.array(
      JsonDecoder.tuple([JsonDecoder.number, JsonDecoder.number], "AskDecoder"),
      "AsksDecoder"
    ),
  },
  "OrderDecoder"
);
