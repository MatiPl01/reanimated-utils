/* eslint-disable @typescript-eslint/no-explicit-any */
export type IsInfiniteObject<T> = T extends { [key: string]: any }
  ? string extends keyof T
    ? true
    : false
  : false;

export type IsInfiniteArray<T> =
  T extends ReadonlyArray<any>
    ? number extends T['length']
      ? true
      : false
    : false;

export type AreSameType<T, U> = T extends U
  ? U extends T
    ? true
    : false
  : false;
