/* eslint-disable @typescript-eslint/no-explicit-any */

import type { SharedValue } from 'react-native-reanimated';

import type {
  AnyFunction,
  AreSameType,
  IsInfiniteArray,
  IsInfiniteObject
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

export type ComplexSharedValuesSchema<V> = ConvertToSchema<V>;

export type ComplexSharedValuesCurrentType<V> =
  AreSameType<V, ConvertToSharedValue<V>> extends true
    ? V
    : V extends AnyFunction
      ? ConvertToSharedValue<ReturnType<V>>
      : ConvertToSharedValue<V>;

export type ArrayMethods<V> = {
  // TODO
};

export type RecordMethods<V> = {
  // TODO
};

export type SingletonMethods<V> = {
  // TODO
};
