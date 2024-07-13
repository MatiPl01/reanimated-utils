/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-redeclare */

import type { IsInfiniteArray, IsInfiniteObject, Simplify } from '../../types';
import type {
  ArrayMethods,
  ComplexSharedValuesCurrentType,
  ComplexSharedValuesSchema,
  RecordMethods,
  SchemaArray,
  SchemaMutable,
  SchemaObject,
  SchemaRecord,
  SchemaTuple,
  SingletonMethods
} from './types';
import { SchemaType } from './types';

export const mutable = <V>(defaultValue: V): SchemaMutable<V> => ({
  __type: SchemaType.Mutable,
  defaultValue
});

export const tuple = <V extends Array<any>>(
  ...defaultValue: V
): SchemaTuple<V> => ({
  __type: SchemaType.Tuple,
  defaultValue
});

export const array = <V>(defaultValue: V): SchemaArray<V> => ({
  __type: SchemaType.Array,
  defaultValue
});

export const record = <V>(defaultValue: V): SchemaRecord<V> => ({
  __type: SchemaType.Record,
  defaultValue
});

export const object = <V>(defaultValue: V): SchemaObject<V> => ({
  __type: SchemaType.Object,
  defaultValue
});

type SchemaFactory<V> = (args: {
  mutable: typeof mutable;
  tuple: typeof tuple;
  array: typeof array;
  record: typeof record;
  object: typeof object;
}) => ComplexSharedValuesSchema<V>;

// Determine method type based on whether the type is an infinite array or object
type MethodType<V> =
  IsInfiniteArray<V> extends true
    ? ArrayMethods<V>
    : IsInfiniteObject<V> extends true
      ? RecordMethods<V>
      : SingletonMethods<V>;

type ComplexSharedValuesReturnType<V> = Simplify<
  {
    current: ComplexSharedValuesCurrentType<V>;
  } & MethodType<ComplexSharedValuesCurrentType<V>>
>;

// Function overloads
export function useComplexSharedValues<V>(
  schema: SchemaFactory<V>
): ComplexSharedValuesReturnType<V>;

export function useComplexSharedValues<V>(
  schema: ComplexSharedValuesSchema<V>
): ComplexSharedValuesReturnType<V>;

export function useComplexSharedValues<V>(
  schema: ComplexSharedValuesSchema<V> | SchemaFactory<V>
): ComplexSharedValuesReturnType<V> {
  // TODO - implement
}
