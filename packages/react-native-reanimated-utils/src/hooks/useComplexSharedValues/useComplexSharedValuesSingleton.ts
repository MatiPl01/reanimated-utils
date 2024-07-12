import type {
  ComplexSharedValuesReturnType,
  SingletonSchema
} from '../../types';

export function useComplexSharedValuesSingleton<V>(
  schema: SingletonSchema
): ComplexSharedValuesReturnType<V> {}
