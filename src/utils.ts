type Callback<T> = (accumulatedEvents: T[]) => void;
type ThrottleFn<T> = (event: T) => void;

export function throttleAccumulated<T>(
  callback: Callback<T>,
  intervalMs: number
): ThrottleFn<T> {
  let events: T[] = [];
  let shouldFire = false;

  setInterval(() => {
    shouldFire = true;
  }, intervalMs);

  return (event) => {
    events.push(event);

    if (shouldFire) {
      callback(events);
      events = [];
      shouldFire = false;
    }
  };
}
