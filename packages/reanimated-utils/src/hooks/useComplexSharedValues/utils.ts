/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-underscore-dangle */
import type { SharedValue } from 'react-native-reanimated';
import {
  cancelAnimation,
  isSharedValue,
  makeMutable
} from 'react-native-reanimated';

import type {
  AnySchema,
  ArraySchema,
  ComplexSharedValuesSchema,
  Patch,
  RecordSchema,
  SchemaArray,
  SchemaMutable,
  SchemaObject,
  SchemaRecord,
  SchemaTuple
} from './types';
import { SchemaType } from './types';

const MAX_TRAVERSE_DEPTH = 30; // to prevent infinite loops

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

export type SchemaFactory<V = any> = (args: {
  mutable: typeof mutable;
  tuple: typeof tuple;
  array: typeof array;
  record: typeof record;
  object: typeof object;
}) => ComplexSharedValuesSchema<V>;

export function getSchema<V>(
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

function resolveSchemaType(schemaValue: any): SchemaType {
  'worklet';
  if (Array.isArray(schemaValue)) {
    return schemaValue.length > 1 ? SchemaType.Tuple : SchemaType.Array;
  } else if (typeof schemaValue === 'object' && schemaValue !== null) {
    if (schemaValue.__type) {
      return schemaValue.__type;
    } else if (
      '$key' in schemaValue &&
      Object.keys(schemaValue as object).length === 1
    ) {
      return SchemaType.Record;
    }
    return SchemaType.Object;
  }
  return SchemaType.Primitive;
}

function resolveSchemaValue(schemaValue: any, type: SchemaType): any {
  'worklet';
  switch (type) {
    case SchemaType.Array:
      return Array.isArray(schemaValue)
        ? schemaValue[0]
        : schemaValue.defaultValue;
    case SchemaType.Record:
      return schemaValue.$key ? schemaValue.$key : schemaValue.defaultValue;
    case SchemaType.Object:
    case SchemaType.Tuple:
      return schemaValue.defaultValue ?? schemaValue;
    case SchemaType.Mutable:
      return schemaValue.defaultValue;
    case SchemaType.Primitive:
    default:
      return schemaValue;
  }
}

function traverseObject<V>(obj: V, callback: (value: any) => boolean): void {
  'worklet';

  const traverse = (value: any, depth: number) => {
    'worklet';
    if (depth > MAX_TRAVERSE_DEPTH) {
      throw new Error('[reanimated-utils] traverseObject: Max depth reached');
    }

    // stop traversing if callback returns false
    if (!callback(value)) {
      return;
    }

    if (Array.isArray(value)) {
      value.forEach(v => traverse(v, depth + 1));
    } else if (typeof value === 'object' && value !== null) {
      Object.values(value as object).forEach(v => traverse(v, depth + 1));
    }
  };

  traverse(obj, 0);
}

type TraverseInParams = {
  schemaType: SchemaType;
  resolvedSchemaValue: any;
  currentValue: any;
  patchValue: any;
};

type TraverseCallback = (
  params: TraverseInParams,
  traverse: (schemaValue: any, patchValue?: any, currentValue?: any) => any
) => any;

function traverseWithDepthCheck<V>(
  inputs: { patch?: Patch<V>; schema: AnySchema; current?: V },
  callback: TraverseCallback
): any {
  'worklet';

  function traverse(
    schemaValue: any,
    patchValue: any,
    currentValue: any,
    depth: number = 0
  ): any {
    'worklet';
    if (depth > MAX_TRAVERSE_DEPTH) {
      throw new Error('[reanimated-utils] traverse: Max depth reached');
    }

    const schemaType = resolveSchemaType(schemaValue);
    const resolvedSchemaValue = resolveSchemaValue(schemaValue, schemaType);

    return callback(
      { currentValue, patchValue, resolvedSchemaValue, schemaType },
      (...params) => traverse(...params, depth + 1)
    );
  }

  return traverse(inputs.schema, inputs.patch, inputs.current);
}

function makeMutableWithCheck<V>(value: V): SharedValue<V> {
  'worklet';
  try {
    return makeMutable(value);
  } catch (e) {
    throw new Error(
      '[reanimated-utils] Cannot create mutable value on the UI thread. If you want to create new mutable values, make sure to run the .set method on the JS thread.'
    );
  }
}

export function createFromSchema<V>(schema: AnySchema, patch?: Patch<V>): any {
  'worklet';

  return traverseWithDepthCheck(
    { patch, schema },
    ({ patchValue, resolvedSchemaValue, schemaType }, traverse) => {
      'worklet';
      switch (schemaType) {
        case SchemaType.Array: {
          return (patchValue || []).map((item: any) =>
            traverse(resolvedSchemaValue, item)
          );
        }
        case SchemaType.Record: {
          const value: Record<string, any> = {};
          for (const key in patchValue || {}) {
            value[key] = traverse(resolvedSchemaValue, patchValue[key]);
          }
          return value;
        }
        case SchemaType.Object: {
          const value: Record<string, any> = {};
          for (const key in resolvedSchemaValue) {
            value[key] = traverse(resolvedSchemaValue[key], patchValue?.[key]);
          }
          return value;
        }
        case SchemaType.Tuple: {
          return resolvedSchemaValue.map((item: any, index: number) =>
            traverse(item, patchValue?.[index])
          );
        }
        case SchemaType.Mutable:
          return makeMutableWithCheck(
            traverse(resolvedSchemaValue, patchValue)
          );
        case SchemaType.Primitive:
        default:
          return patchValue ?? resolvedSchemaValue;
      }
    }
  );
}

export function updateFromSchema<V>(
  schema: AnySchema,
  current: V,
  patch?: Patch<V>
): any {
  'worklet';

  return traverseWithDepthCheck(
    { current, patch, schema },
    (
      { currentValue, patchValue, resolvedSchemaValue, schemaType },
      traverse
    ) => {
      'worklet';
      switch (schemaType) {
        case SchemaType.Array: {
          if (patchValue) {
            return patchValue?.map((item: any, index: number) => {
              return traverse(
                resolvedSchemaValue,
                item,
                currentValue ? currentValue[index] : undefined
              );
            });
          }
          return currentValue;
        }
        case SchemaType.Record: {
          const value: Record<string, any> = {};
          for (const key in patchValue || {}) {
            value[key] = traverse(
              resolvedSchemaValue,
              patchValue[key],
              currentValue ? currentValue[key] : undefined
            );
          }
          return Object.keys(value).length > 0 ? value : currentValue;
        }
        case SchemaType.Object: {
          for (const key in patchValue || {}) {
            if (key in resolvedSchemaValue) {
              currentValue[key] = traverse(
                resolvedSchemaValue[key],
                patchValue[key],
                currentValue[key]
              );
            }
          }
          return currentValue;
        }
        case SchemaType.Tuple: {
          for (const index in patchValue || []) {
            if (index < resolvedSchemaValue.length) {
              currentValue[index] = traverse(
                resolvedSchemaValue[index],
                patchValue[index],
                currentValue[index]
              );
            }
          }
          return currentValue;
        }
        case SchemaType.Mutable: {
          if (patchValue !== undefined) {
            if (currentValue) {
              currentValue.value = traverse(
                resolvedSchemaValue,
                patchValue,
                currentValue.value
              );
            } else {
              currentValue = makeMutableWithCheck(
                traverse(resolvedSchemaValue, patchValue)
              );
            }
          }
          return currentValue;
        }
        case SchemaType.Primitive:
        default:
          return patchValue ?? resolvedSchemaValue;
      }
    }
  );
}

export function resetFromSchema<V>(schema: AnySchema, current: V): void {
  'worklet';

  traverseWithDepthCheck(
    { current, schema },
    ({ currentValue, resolvedSchemaValue, schemaType }, traverse) => {
      'worklet';
      switch (schemaType) {
        case SchemaType.Array: {
          return [];
        }
        case SchemaType.Record: {
          return {};
        }
        case SchemaType.Object: {
          for (const key in resolvedSchemaValue) {
            currentValue[key] = traverse(
              resolvedSchemaValue[key],
              undefined,
              currentValue[key]
            );
          }
          return currentValue;
        }
        case SchemaType.Tuple: {
          return resolvedSchemaValue.map((item: any, index: number) =>
            traverse(item, undefined, currentValue[index])
          );
        }
        case SchemaType.Mutable:
          currentValue.value = traverse(
            resolvedSchemaValue,
            undefined,
            currentValue.value
          );
          return currentValue;
        case SchemaType.Primitive:
        default:
          return resolvedSchemaValue;
      }
    }
  );
}

export function cancelAnimations<V>(value: V): void {
  'worklet';
  traverseObject(value, v => {
    if (isSharedValue(v)) {
      cancelAnimation(v);
      return false; // stop traversing
    }
    return true; // continue traversing
  });
}
