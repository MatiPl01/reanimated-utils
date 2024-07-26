/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable no-redeclare */

import { isEqual } from 'lodash-es';
import { useRef } from 'react';

import type {
  ComplexSharedValuesReturnType,
  ComplexSharedValuesSchema,
  DepsType,
  SingletonSchema
} from './types';
import { useComplexSharedValuesArray } from './useComplexSharedValuesArray';
import { useComplexSharedValuesRecord } from './useComplexSharedValuesRecord';
import { useComplexSharedValuesSingleton } from './useComplexSharedValuesSingleton';
import {
  getSchema,
  isArraySchema,
  isRecordSchema,
  type SchemaFactory
} from './utils';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useComplexSharedValues<F extends SchemaFactory>(
  schema: F,
  deps?: DepsType<ReturnType<F>>
): ComplexSharedValuesReturnType<ReturnType<F>>;

export function useComplexSharedValues<V>(
  schema: ComplexSharedValuesSchema<V> | SchemaFactory<V>,
  deps?: DepsType<V>
): ComplexSharedValuesReturnType<V>;

export function useComplexSharedValues<V>(
  schema: ComplexSharedValuesSchema<V> | SchemaFactory<V>,
  deps?: DepsType<V>
): ComplexSharedValuesReturnType<V> {
  const schemaRef = useRef<ComplexSharedValuesSchema<V>>();

  if (schema !== schemaRef.current) {
    const newSchema = getSchema(schema);
    if (schemaRef.current === undefined) {
      schemaRef.current = newSchema;
    } else if (!isEqual(schemaRef.current, newSchema)) {
      throw new Error(
        '[reanimated-utils] Changing schema on the fly is not supported'
      );
    }
  }

  const currentSchema = schemaRef.current;

  // TODO - add schema validation via JS (not only TS types validation)
  if (currentSchema === undefined) {
    throw new Error('[reanimated-utils] Invalid schema provided');
  }

  if (isArraySchema(currentSchema)) {
    return useComplexSharedValuesArray(
      currentSchema,
      deps as number | undefined
    );
  }
  if (isRecordSchema(currentSchema)) {
    return useComplexSharedValuesRecord(
      currentSchema,
      deps as Array<string> | undefined
    );
  }
  return useComplexSharedValuesSingleton(currentSchema as SingletonSchema);
}
