/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useCallback, useMemo } from 'react';

import { useCurrentValue } from './hooks';
import type {
  ComplexSharedValuesReturnType,
  Patch,
  SingletonMethods,
  SingletonSchema
} from './types';
import { createFromSchema, resetFromSchema, updateFromSchema } from './utils';

export function useComplexSharedValuesSingleton<V>(
  schema: SingletonSchema
): ComplexSharedValuesReturnType<V> {
  const current = useCurrentValue<V>(() => createFromSchema(schema));

  /**
   * Exposed functions as methods
   */

  const reset = useCallback(() => {
    'worklet';
    resetFromSchema(schema, current);
  }, [schema, current]);

  const update = useCallback(
    (value: Patch<V>) => {
      'worklet';
      return updateFromSchema(schema, current, value);
    },
    [schema, current]
  );

  return useMemo<{ current: V } & SingletonMethods<V>>(
    () => ({ current, reset, update }),
    [current, reset, update]
  ) as unknown as ComplexSharedValuesReturnType<V>;
}
