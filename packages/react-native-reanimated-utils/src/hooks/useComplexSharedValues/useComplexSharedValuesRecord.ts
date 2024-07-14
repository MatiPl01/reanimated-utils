/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useMemo } from 'react';

import { useCurrentValue } from './hooks';
import type {
  ComplexSharedValuesReturnType,
  Patch,
  RecordMethods,
  RecordSchema
} from './types';
import { cancelAnimations, createFromSchema, updateFromSchema } from './utils';

export function useComplexSharedValuesRecord<V>(
  schema: RecordSchema
): ComplexSharedValuesReturnType<V> {
  const current = useCurrentValue<Record<string, any>>({});

  /**
   * Internal functions
   */

  const setSingle = useCallback(
    (key: string, value?: Patch<V>, patch?: boolean) => {
      'worklet';
      if (!patch || current[key] === undefined) {
        cancelAnimations(current[key]);
        current[key] = createFromSchema(schema, value);
      } else if (value) {
        current[key] = updateFromSchema(schema, current[key], value);
      } else {
        console.warn(
          '[react-native-reanimated-utils] Called set without value on non-existing key'
        );
      }
      return current[key];
    },
    [schema, current]
  );

  const removeSingle = useCallback(
    (key: string) => {
      'worklet';
      cancelAnimations(current[key]);
      const removed = current[key];
      delete current[key];
      return removed;
    },
    [current]
  );

  /**
   * Exposed functions as methods
   */
  const set = useCallback(
    (keys: Array<string> | string, value?: Patch<V>, patch = true) => {
      'worklet';
      if (Array.isArray(keys)) {
        return keys.map(key => setSingle(key, value, patch));
      }
      return setSingle(keys, value, patch);
    },
    [setSingle]
  );

  const get = useCallback(
    (key: string, fallbackToDefault = false) => {
      'worklet';
      if (current[key] === undefined && fallbackToDefault) {
        return setSingle(key);
      }
      return current[key];
    },
    [current, setSingle]
  );

  const has = useCallback(
    (key: string) => {
      'worklet';
      return current[key] !== undefined;
    },
    [current]
  );

  const remove = useCallback(
    (...keys: Array<string>) => {
      'worklet';
      if (keys.length === 1) {
        return removeSingle(keys[0]!);
      }
      return Object.fromEntries(keys.map(key => [key, removeSingle(key)]));
    },
    [removeSingle]
  );

  const clear = useCallback(() => {
    'worklet';
    return remove(...Object.keys(current));
  }, [current, remove]);

  const reset = useCallback(
    (...keys: Array<string>) => {
      'worklet';
      if (keys.length === 1) {
        return setSingle(keys[0]!);
      }
      return Object.fromEntries(
        keys.map(key => [key, setSingle(key, undefined, false)])
      );
    },
    [setSingle]
  );

  return useMemo<{ current: Record<string, any> } & RecordMethods<V>>(
    () => ({
      clear,
      current,
      get,
      has,
      remove,
      reset,
      set
    }),
    [current, clear, get, has, set, remove, reset]
  ) as unknown as ComplexSharedValuesReturnType<V>;
}
