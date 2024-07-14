/* eslint-disable @typescript-eslint/no-explicit-any */

import type { ComplexSharedValuesReturnType, SingletonSchema } from './types';

export function useComplexSharedValuesSingleton<V>(
  schema: SingletonSchema
): ComplexSharedValuesReturnType<V> {
  // TODO - think how to best handle this
}
