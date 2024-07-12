import { useMemo } from 'react';

import type {
  ComplexSharedValuesReturnType,
  ComplexSharedValuesSchema,
  ObjectSchema
} from '../../types';

export function isObjectSchema(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  schema: ComplexSharedValuesSchema<any>
): schema is ObjectSchema {
  return (
    typeof schema === 'object' && Object.keys(schema as object).includes('$key')
  );
}

export function useComplexSharedValuesObject<V>(
  schema: ObjectSchema
): ComplexSharedValuesReturnType<V> {
  const current = useMemo(() => ({}), []);

  return useMemo(
    () => ({
      current
    }),
    [current]
  );
}
