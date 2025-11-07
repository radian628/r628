export type TypeLevelError<T> = {
  _brand: "TYPE-LEVEL ERROR:";
  msg: T;
};
