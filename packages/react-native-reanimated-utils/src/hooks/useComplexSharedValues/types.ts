/* eslint-disable @typescript-eslint/no-explicit-any */

import type { SharedValue } from 'react-native-reanimated';

import type {
  AnyFunction,
  AreSameType,
  DeepPartial,
  IsInfiniteArray,
  IsInfiniteObject,
  NonEmptyArray
} from '../../types';

export enum SchemaType {
  Array = 'Array',
  Mutable = 'Mutable',
  Object = 'Object',
  Record = 'Record',
  Tuple = 'Tuple'
}

export type SchemaMutable<V> = {
  __type: SchemaType.Mutable;
  defaultValue: V;
};

export type SchemaArray<V> = {
  __type: SchemaType.Array;
  defaultValue: V;
};

export type SchemaRecord<V> = {
  __type: SchemaType.Record;
  defaultValue: V;
};

export type SchemaTuple<V> = {
  __type: SchemaType.Tuple;
  defaultValue: V;
};

export type SchemaObject<V> = {
  __type: SchemaType.Object;
  defaultValue: V;
};

type ConvertToSchemaOutsideMutable<T> =
  T extends SchemaTuple<infer U>
    ? SchemaTuple<{
        [K in keyof U]: ConvertToSchemaOutsideMutable<U[K]>;
      }>
    : T extends SharedValue<infer U>
      ? SchemaMutable<ConvertToSchemaInsideMutable<U>>
      : T extends Array<infer U>
        ? IsInfiniteArray<T> extends false
          ? SchemaTuple<{
              [K in keyof T]: ConvertToSchemaOutsideMutable<T[K]>;
            }>
          :
              | [ConvertToSchemaOutsideMutable<U>]
              | SchemaArray<ConvertToSchemaOutsideMutable<U>>
        : IsInfiniteObject<T> extends true
          ? SchemaRecord<ConvertToSchemaOutsideMutable<T[keyof T]>>
          : T extends Record<string, any>
            ?
                | {
                    [K in keyof T]: ConvertToSchemaOutsideMutable<T[K]>;
                  }
                | SchemaObject<{
                    [K in keyof T]: ConvertToSchemaOutsideMutable<T[K]>;
                  }>
            : T;

type ConvertToSchemaInsideMutable<T> =
  T extends SharedValue<any>
    ? never
    : T extends Array<infer U>
      ? IsInfiniteArray<T> extends false
        ? SchemaTuple<{
            [K in keyof T]: ConvertToSchemaInsideMutable<T[K]>;
          }>
        :
            | [ConvertToSchemaInsideMutable<U>]
            | SchemaArray<ConvertToSchemaInsideMutable<U>>
      : IsInfiniteObject<T> extends true
        ? SchemaRecord<ConvertToSchemaInsideMutable<T[keyof T]>>
        : T extends Record<string, any>
          ?
              | {
                  [K in keyof T]: ConvertToSchemaInsideMutable<T[K]>;
                }
              | SchemaObject<{
                  [K in keyof T]: ConvertToSchemaInsideMutable<T[K]>;
                }>
          : T;

type ConvertToSchema<T> = ConvertToSchemaOutsideMutable<T>;

type ConvertToSharedValue<T> = T extends
  | SchemaMutable<infer U>
  | SharedValue<infer U>
  ? SharedValue<ConvertToSharedValue<U>>
  : T extends SchemaTuple<infer U>
    ? ConvertToSharedValue<U>
    : T extends SchemaArray<infer U>
      ? Array<ConvertToSharedValue<U>>
      : T extends SchemaRecord<infer U>
        ? Record<string, ConvertToSharedValue<U>>
        : T extends SchemaObject<infer U>
          ? { [K in keyof U]: ConvertToSharedValue<U[K]> }
          : T extends Array<infer U>
            ? IsInfiniteArray<T> extends true
              ? Array<ConvertToSharedValue<U>>
              : { [K in keyof T]: ConvertToSharedValue<T[K]> }
            : T extends Record<string, any>
              ? keyof T extends '$key'
                ? Record<string, ConvertToSharedValue<T[keyof T]>>
                : { [K in keyof T]: ConvertToSharedValue<T[K]> }
              : T;

type ReplaceSharedValues<T> =
  T extends SharedValue<infer U>
    ? U
    : T extends object
      ? { [K in keyof T]: ReplaceSharedValues<T[K]> }
      : T;

export type ComplexSharedValuesSchema<V> = ConvertToSchema<V>;

export type ComplexSharedValuesCurrentType<V> =
  AreSameType<V, ConvertToSharedValue<V>> extends true
    ? V
    : V extends AnyFunction
      ? ConvertToSharedValue<ReturnType<V>>
      : ConvertToSharedValue<V>;

type ExtractValueType<T> =
  T extends Array<any>
    ? IsInfiniteArray<T> extends true
      ? T[number]
      : T
    : T extends Record<string, any>
      ? IsInfiniteObject<T> extends true
        ? T[keyof T]
        : T
      : T;

// Convert to shared value first as V is assigned the schema type if not explicit type is provided
type Patch<V> = DeepPartial<ReplaceSharedValues<ComplexValue<V>>>;

type ComplexValue<V> = ExtractValueType<ComplexSharedValuesCurrentType<V>>;

export type ArrayMethods<V> = {
  get(index: string, fallbackToDefault: true): ComplexValue<V>;
  get(index: string, fallbackToDefault?: boolean): ComplexValue<V> | undefined;

  set(index: number, value?: Patch<V>, patch?: boolean): ComplexValue<V>;

  push(value?: Patch<V>): ComplexValue<V>;
  push(count: number, value?: Patch<V>): Array<ComplexValue<V>>;

  unshift(value?: Patch<V>): ComplexValue<V>;
  unshift(count: number, value?: Patch<V>): Array<ComplexValue<V>>;

  pop(): ComplexValue<V>;

  slice(start: number, end?: number): Array<ComplexValue<V>>;

  splice(start: number, end?: number): Array<ComplexValue<V>>;

  clear(): void;
};

export type RecordMethods<V> = {
  get(key: string, fallbackToDefault: true): ComplexValue<V>;
  get(key: string, fallbackToDefault?: boolean): ComplexValue<V> | undefined;

  set(key: string, value?: Patch<V>, patch?: boolean): ComplexValue<V>;
  set<K extends string>(
    keys: NonEmptyArray<K>,
    value?: Patch<V>,
    patch?: boolean
  ): Record<K, ComplexValue<V>>;

  has(key: string): boolean;

  clear(): void;

  remove(key: string): ComplexValue<V>;
  remove<K extends string>(
    ...keys: NonEmptyArray<K>
  ): Record<K, ComplexValue<V>>;

  reset(key: string): ComplexValue<V>;
  reset<K extends string>(
    ...keys: NonEmptyArray<K>
  ): Record<K, ComplexValue<V>>;
};

export type SingletonMethods<V> = {
  reset(): ComplexValue<V>;

  update(value: Patch<V>, patch?: boolean): ComplexValue<V>;
};
