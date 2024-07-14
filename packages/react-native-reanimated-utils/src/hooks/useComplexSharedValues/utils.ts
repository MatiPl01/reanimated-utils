/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-underscore-dangle */
import type {
  AnySchema,
  ArraySchema,
  ComplexSharedValuesSchema,
  RecordSchema,
  SchemaArray,
  SchemaMutable,
  SchemaObject,
  SchemaRecord,
  SchemaTuple
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

export type SchemaFactory<V> = (args: {
  mutable: typeof mutable;
  tuple: typeof tuple;
  array: typeof array;
  record: typeof record;
  object: typeof object;
}) => ComplexSharedValuesSchema<V>;

export function evaluateSchema<V>(
  schema: ComplexSharedValuesSchema<V> | SchemaFactory<V>
): ComplexSharedValuesSchema<V> {
  if (typeof schema === 'function') {
    return (schema as SchemaFactory<V>)({
      array,
      mutable,
      object,
      record,
      tuple
    });
  }
  return schema;
}

export function isArraySchema(
  schema: ComplexSharedValuesSchema<any>
): schema is ArraySchema {
  return (
    !!schema &&
    ((typeof schema === 'object' && schema.__type === SchemaType.Array) ||
      (Array.isArray(schema) && schema.length === 1))
  );
}

export function isRecordSchema(
  schema: ComplexSharedValuesSchema<any>
): schema is RecordSchema {
  return (
    !!schema &&
    typeof schema === 'object' &&
    (Object.keys(schema as object).toString() === '$key' ||
      schema.__type === SchemaType.Record)
  );
}

export function createFromSchema<V>(schema: AnySchema, value: Patch<V> = {}) {
  'worklet';
}

export function updateFromSchema<V>(
  schema: AnySchema,
  currentValue: V,
  value: Patch<V>
) {
  'worklet';
}

export function cancelAnimations<V>(value: V) {
  'worklet';
}
