/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useCallback, useMemo } from 'react';

import { useCurrentValue } from './hooks';
import {
  type ArrayMethods,
  type ArraySchema,
  type ComplexSharedValuesReturnType,
  type Patch,
  type SchemaArray,
  SchemaType
} from './types';
import {
  cancelAnimations,
  createFromSchema,
  resetFromSchema,
  updateFromSchema
} from './utils';

function isSchemaArray(obj: any): obj is SchemaArray<any> {
  // eslint-disable-next-line no-underscore-dangle, @typescript-eslint/no-unsafe-member-access
  return obj.__type === SchemaType.Array;
}

export function useComplexSharedValuesArray<V>(
  arraySchema: ArraySchema
): ComplexSharedValuesReturnType<V> {
  const schema = isSchemaArray(arraySchema)
    ? arraySchema.defaultValue
    : arraySchema[0];
  const current = useCurrentValue<Array<any>>([]);

  /**
   * Internal functions
   */

  const setSingle = useCallback(
    (index: number, value?: Patch<V>, patch = true) => {
      'worklet';
      if (!patch || current[index] === undefined) {
        cancelAnimations(current[index]);
        current[index] = createFromSchema(schema, value);
      } else if (value) {
        current[index] = updateFromSchema(schema, current[index], value);
      }
      return current[index];
    },
    [schema, current]
  );

  const pushSingle = useCallback(
    (value?: Patch<V>) => {
      'worklet';
      current.push(createFromSchema(schema, value));
      return current[current.length - 1];
    },
    [schema, current]
  );

  const unshiftSingle = useCallback(
    (value?: Patch<V>) => {
      'worklet';
      current.unshift(createFromSchema(schema, value));
      return current[0];
    },
    [schema, current]
  );

  /**
   * Exposed functions as methods
   */

  const set = useCallback(
    (index: number, value?: Patch<V>, patch = true) => {
      'worklet';
      return setSingle(index, value, patch);
    },
    [setSingle]
  );

  const get = useCallback(
    (index: number, fallbackToDefault = false) => {
      'worklet';
      if (fallbackToDefault && current[index] === undefined) {
        return setSingle(index);
      }
      return current[index];
    },
    [current, setSingle]
  );

  const push = useCallback(
    (countOrValue?: Patch<V> | number, value?: Patch<V>) => {
      'worklet';
      if (typeof countOrValue === 'number') {
        return Array.from({ length: countOrValue }, () => pushSingle(value));
      }
      return pushSingle(countOrValue);
    },
    [pushSingle]
  );

  const unshift = useCallback(
    (countOrValue?: Patch<V> | number, value?: Patch<V>) => {
      'worklet';
      if (typeof countOrValue === 'number') {
        return Array.from({ length: countOrValue }, () => unshiftSingle(value));
      }
      return unshiftSingle(countOrValue);
    },
    [unshiftSingle]
  );

  const pop = useCallback(() => {
    'worklet';
    cancelAnimations(current[current.length - 1]);
    return current.pop();
  }, [current]);

  const slice = useCallback(
    (start: number, end?: number) => {
      'worklet';
      return current.slice(start, end);
    },
    [current]
  );

  const splice = useCallback(
    (start: number, end?: number) => {
      'worklet';
      const removed = current.splice(start, end);
      cancelAnimations(removed);
      return removed;
    },
    [current]
  );

  const clear = useCallback(() => {
    'worklet';
    splice(0);
  }, [splice]);

  const remove = useCallback(
    (...indexes: Array<number>) => {
      'worklet';
      if (indexes.length === 1) {
        return splice(indexes[0]!, 1)[0];
      }

      const removed = indexes.map(index => {
        const value = current[index];
        cancelAnimations(value);
        delete current[index];
        return value;
      });
      // Move all items to fill empty spaces after removing
      // items from specified indexes
      let firstEmptyIndex = -1;
      let remainingEmpty = indexes.length;
      for (let i = 0; i < current.length; i++) {
        if (remainingEmpty === 0) {
          break;
        }
        if (firstEmptyIndex === -1) {
          if (current[i] === undefined) {
            firstEmptyIndex = i;
          }
          continue;
        }
        if (current[i] !== undefined) {
          current[firstEmptyIndex] = current[i];
          remainingEmpty--;
          delete current[i];
          firstEmptyIndex++;
        }
      }
      // Remove empty spaces at the end
      current.splice(current.length - indexes.length);
      return removed;
    },
    [current, splice]
  );

  const reset = useCallback(
    (...indexes: Array<number>) => {
      'worklet';
      indexes.forEach(index => {
        resetFromSchema(schema, current[index]);
      });
    },
    [current, schema]
  );

  return useMemo<{ current: Record<string, any> } & ArrayMethods<V>>(
    () => ({
      clear,
      current,
      get,
      pop,
      push,
      remove,
      reset,
      set,
      slice,
      splice,
      unshift
    }),
    [current, clear, get, remove, reset, set, slice, splice, pop, push, unshift]
  ) as unknown as ComplexSharedValuesReturnType<V>;
}
