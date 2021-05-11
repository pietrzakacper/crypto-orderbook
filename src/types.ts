export type Nominal<T, Type extends string> = T & {
  __Type: Type;
};
