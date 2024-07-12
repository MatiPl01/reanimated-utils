/* eslint-disable import/no-unused-modules */
import { type SharedValue } from 'react-native-reanimated';
import {
  array,
  mutable,
  object,
  record,
  tuple,
  useComplexSharedValues
} from 'react-native-reanimated-utils';

const schema1 = { $key: mutable({ height: 0, width: 0 }) };

const schema2 = record(mutable(0));

type KeyToIndex = Record<string, SharedValue<number>>;

type ItemPositions = Record<
  string,
  { x: SharedValue<number>; y: SharedValue<number> }
>;

export default function ComplexSharedValues() {
  // Variant 1:
  //  - with schema defined outside of the hook
  //  - without explicit type annotations
  const dimensions = useComplexSharedValues(schema1);

  // Variant 2:
  //  - with schema defined inside of the hook
  //  - with explicit type annotations
  const keyToIndex = useComplexSharedValues<KeyToIndex>(schema2);

  // Variant 3:
  //  - with schema defined inside of the hook
  //  - without explicit type annotations
  const a = tuple(mutable(0), mutable(1));
  const rowOffsets = useComplexSharedValues(tuple(mutable(0), mutable('1')));

  // Variant 4:
  //  - with schema defined inside of the hook
  //  - with explicit type annotations
  const itemPositions = useComplexSharedValues<ItemPositions>(() =>
    record({
      x: mutable(0),
      y: mutable(0)
    })
  );

  const test1 = useComplexSharedValues({ a: mutable(0) });
  const test2 = useComplexSharedValues([mutable(0)]);
  const test3 = useComplexSharedValues(tuple(mutable(0), mutable('1')));
  const test4 = useComplexSharedValues(array(mutable(0)));
  const test5 = useComplexSharedValues(array(record(mutable(0))));
  const test6 = useComplexSharedValues(
    array(
      tuple(
        record(mutable(0)),
        { a: mutable(tuple(0, 0)) },
        object({ a: 0, b: 0, c: mutable('1') })
      )
    )
  );
  const test7 = useComplexSharedValues(mutable(tuple(0, 1)));

  // Alternative syntax (record)
  // all return: Record<string, SharedValue<number>>
  const test_1_1 = useComplexSharedValues(() => ({ $key: mutable(0) }));
  const test_1_2 = useComplexSharedValues(() => record(mutable(0)));
  const test_1_3 = useComplexSharedValues({ $key: mutable(0) });
  const test_1_4 = useComplexSharedValues(record(mutable(0)));

  // Alternative syntax (array)
  // all return: SharedValue<number>[]
  const test_2_1 = useComplexSharedValues(() => [mutable(0)]);
  const test_2_2 = useComplexSharedValues(() => array(mutable(0)));
  const test_2_3 = useComplexSharedValues([mutable(0)]);
  const test_2_4 = useComplexSharedValues(array(mutable(0)));

  // ALternative syntax (object) - object is optional and can be used for clarity
  // all return: { a: SharedValue<number> }
  const test_3_1 = useComplexSharedValues(() => ({ a: mutable(0) }));
  const test_3_2 = useComplexSharedValues(() => object({ a: mutable(0) }));
  const test_3_3 = useComplexSharedValues({ a: mutable(0) });
  const test_3_4 = useComplexSharedValues(object({ a: mutable(0) }));

  // Explicit tuple syntax (tuple call is required)
  // all return: [SharedValue<number>, SharedValue<string>]
  const test_4_1 = useComplexSharedValues(() =>
    tuple(mutable(0), mutable('1'))
  );
  const test_4_2 = useComplexSharedValues(tuple(mutable(0), mutable('1')));

  // Explicit mutable syntax (mutable call is required)
  // all return: SharedValue<[number, number]>
  const test_5_1 = useComplexSharedValues(() => mutable(tuple(0, 1)));
  const test_5_2 = useComplexSharedValues(mutable(tuple(0, 1)));
}
