/* eslint-disable @typescript-eslint/no-explicit-any */

import { useMemo } from 'react';

import { useCurrentValue } from './hooks';
import type {
  ArrayMethods,
  ArraySchema,
  ComplexSharedValuesReturnType
} from './types';

export function useComplexSharedValuesArray<V>(
  schema: ArraySchema
): ComplexSharedValuesReturnType<V> {
  const current = useCurrentValue<Array<any>>([]);

  /**
   * Internal functions
   */

  /**
   * Exposed functions as methods
   */

  return useMemo<{ current: Record<string, any> } & ArrayMethods<V>>(
    () => ({
      current
    }),
    [current]
  ) as unknown as ComplexSharedValuesReturnType<V>;
}
