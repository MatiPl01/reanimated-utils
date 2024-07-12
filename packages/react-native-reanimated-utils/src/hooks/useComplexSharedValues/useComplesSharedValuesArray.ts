import type {
  ArraySchema,
  ComplexSharedValuesReturnType,
  ComplexSharedValuesSchema
} from '../../types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isArraySchema(
  schema: ComplexSharedValuesSchema<any>
): schema is ArraySchema {
  return Array.isArray(schema);
}

export function useComplexSharedValuesArray<V>(
  schema: ArraySchema
): ComplexSharedValuesReturnType<V> {}
