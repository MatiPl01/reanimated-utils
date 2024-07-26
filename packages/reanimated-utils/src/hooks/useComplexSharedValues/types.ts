/* eslint-disable @typescript-eslint/no-explicit-any */

import type { SharedValue } from 'react-native-reanimated';

import type {
  AnyFunction,
  AreSameType,
  DeepPartial,
  IsInfiniteArray,
  IsInfiniteObject,
  NonEmptyArray,
  Primitive,
  Simplify
} from '../../types';

export enum SchemaType {
  Array = 'Array',
  Mutable = 'Mutable',
  Object = 'Object',
  Primitive = 'Primitive',
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

// for same reason I have to explicitly use types from above in order not
// to get circular reference ts error
type SchemaValueInsideMutable =
  // record
  | {
      __type: SchemaType.Record;
      defaultValue: SchemaValueInsideMutable;
    }
  // arrays
  | (
      | [SchemaValueInsideMutable]
      | {
          __type: SchemaType.Array;
          defaultValue: SchemaValueInsideMutable;
        }
    )
  // objects
  | (
      | { [key: string]: SchemaValueInsideMutable }
      | SchemaObject<{ [key: string]: SchemaValueInsideMutable }>
    )
  | Primitive
  // tuple
  | SchemaTuple<{ [key: number]: SchemaValueInsideMutable }>;

type SchemaValue =
  // record
  | {
      __type: SchemaType.Record;
      defaultValue: SchemaValue;
    }
  // arrays
  | (
      | [SchemaValue]
      | {
          __type: SchemaType.Array;
          defaultValue: SchemaValue;
        }
    )
  // objects
  | (
      | { [key: string]: SchemaValue }
      | SchemaObject<{ [key: string]: SchemaValue }>
    )
  | Primitive
  // mutable (can only contain non-mutable types)
  | SchemaMutable<SchemaValueInsideMutable>
  // tuple
  | SchemaTuple<{ [key: number]: SchemaValue }>;

export type ArraySchema = [SchemaValue] | SchemaArray<SchemaValue>;
export type RecordSchema = { $key: SchemaValue } | SchemaRecord<SchemaValue>;
export type SingletonSchema = SchemaValue;
export type AnySchema = SchemaValue;

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
          ?
              | { $key: ConvertToSchemaOutsideMutable<T[keyof T]> }
              | SchemaRecord<ConvertToSchemaOutsideMutable<T[keyof T]>>
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
        ?
            | { $key: ConvertToSchemaInsideMutable<T[keyof T]> }
            | SchemaRecord<ConvertToSchemaInsideMutable<T[keyof T]>>
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

type ComplexSharedValuesCurrentType<V> =
  AreSameType<V, ConvertToSharedValue<V>> extends true
    ? V
    : V extends AnyFunction
      ? ConvertToSharedValue<ReturnType<V>>
      : ConvertToSharedValue<V>;

// Determine method type based on whether the type is an infinite array or object
type MethodType<V> =
  IsInfiniteArray<V> extends true
    ? ArrayMethods<V>
    : IsInfiniteObject<V> extends true
      ? RecordMethods<V>
      : SingletonMethods<V>;

export type DepsType<V> =
  IsInfiniteArray<V> extends true
    ? number // items count in the top level array
    : V extends SchemaArray<any>
      ? number
      : IsInfiniteObject<V> extends true
        ? Array<string> // keys of the top level object
        : V extends SchemaRecord<any>
          ? Array<string>
          : never;

export type ComplexSharedValuesReturnType<V> = Simplify<
  {
    current: ComplexSharedValuesCurrentType<V>;
  } & MethodType<ComplexSharedValuesCurrentType<V>>
>;

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
export type Patch<V> = DeepPartial<ReplaceSharedValues<ComplexValue<V>>>;

export type ComplexValue<V> = ExtractValueType<
  ComplexSharedValuesCurrentType<V>
>;

export type ArrayMethods<V> = {
  set(index: number, value?: Patch<V>, patch?: boolean): ComplexValue<V>;

  get(index: number, fallbackToDefault: true): ComplexValue<V>;
  get(index: number, fallbackToDefault?: boolean): ComplexValue<V> | undefined;

  push(value?: Patch<V>): ComplexValue<V>;
  push(count: number, value?: Patch<V>): Array<ComplexValue<V>>;

  unshift(value?: Patch<V>): ComplexValue<V>;
  unshift(count: number, value?: Patch<V>): Array<ComplexValue<V>>;

  pop(): ComplexValue<V> | undefined;

  slice(start: number, end?: number): Array<ComplexValue<V>>;

  splice(start: number, end?: number): Array<ComplexValue<V>>;

  clear(): void;

  remove(index: number): ComplexValue<V> | undefined;
  remove(...indexes: NonEmptyArray<number>): Array<ComplexValue<V>>;

  reset(index: number): void;
  reset(...indexes: NonEmptyArray<number>): void;
};

export type RecordMethods<V> = {
  set(key: string, value?: Patch<V>, patch?: boolean): ComplexValue<V>;
  set<K extends string>(
    keys: NonEmptyArray<K>,
    value?: Patch<V>,
    patch?: boolean
  ): Record<K, ComplexValue<V>>;

  get(key: string, fallbackToDefault: true): ComplexValue<V>;
  get(key: string, fallbackToDefault?: boolean): ComplexValue<V> | undefined;

  has(key: string): boolean;

  clear(): void;

  remove(key: string): ComplexValue<V> | undefined;
  remove<K extends string>(
    ...keys: NonEmptyArray<K>
  ): Record<K, ComplexValue<V>>;

  reset(key: string): void;
  reset<K extends string>(...keys: NonEmptyArray<K>): void;
};

export type SingletonMethods<V> = {
  reset(): void;

  update(value: Patch<V>): ComplexValue<V>;
};
