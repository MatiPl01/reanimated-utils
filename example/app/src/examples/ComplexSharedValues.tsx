/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable camelcase */
/* eslint-disable import/no-unused-modules */

import { useEffect, useState } from 'react';
import { runOnUI, type SharedValue } from 'react-native-reanimated';
import {
  array,
  mutable,
  object,
  record,
  tuple,
  useComplexSharedValues
} from 'reanimated-utils';

const schema1 = { $key: mutable({ height: 0, width: 0 }) };

const schema2 = record(mutable(0));

type KeyToIndex = Record<string, SharedValue<number>>;

type ItemPositions = Record<
  string,
  { x: SharedValue<number>; y: SharedValue<number> }
>;

export default function ComplexSharedValues() {
  const dimensions = useComplexSharedValues(schema1);
  console.log('dimensions', dimensions.current);

  const keyToIndex = useComplexSharedValues<KeyToIndex>(schema2);
  console.log('keyToIndex', keyToIndex.current);

  const itemPositions = useComplexSharedValues<ItemPositions>(() =>
    record({
      x: mutable(0),
      y: mutable(0)
    })
  );
  console.log('itemPositions', itemPositions.current);

  const test1 = useComplexSharedValues({ a: mutable(0) });
  console.log('test1.a.value', test1.current.a.value);
  const test2 = useComplexSharedValues([mutable(0)], 4);
  console.log('test2', test2.current);
  const test3 = useComplexSharedValues(tuple(mutable(0), mutable('1')));
  console.log(
    'test3',
    test3.current.map(value => value.value)
  );
  const test4 = useComplexSharedValues(array(mutable(0)), 4);
  console.log('test4', test4.current);
  const test5 = useComplexSharedValues<
    Array<Record<string, SharedValue<number>>>
  >(array(record(mutable(0))), 10);
  console.log('test5', test5.current);
  const test6 = useComplexSharedValues(
    array(
      tuple(
        record(mutable(0)),
        { a: mutable(tuple(0, 0)) },
        object({ a: 0, b: 0, c: mutable('1') })
      )
    ),
    4
  );
  test6.push(3);
  // console.log('test6', test6.current[0]?.[2].c.value);
  // const test7 = useComplexSharedValues(mutable(tuple(0, 1)));
  // console.log('test7', test7.current.value);

  runOnUI(() => {
    const test6_set_1 = test6.set(2, [
      { a: 1, b: 2, c: 3, d: 4 },
      { a: [0, 1] },
      { a: 0, b: 1, c: '2' }
    ]);
    console.log('test6_set_1', test6_set_1[2].c.value);
  })();

  // const overrideItemDimensions = useComplexSharedValues<
  //   Record<string, SharedValue<Partial<{ width: number; height: number }>>>
  // >({ $key: mutable({ height: 0, width: 0 }) });

  // // Alternative syntax (record)
  // // all return: Record<string, SharedValue<number>>
  // const test_1_1 = useComplexSharedValues(() => ({ $key: mutable(0) }));
  // const test_1_2 = useComplexSharedValues(() => record(mutable(0)));
  // const test_1_3 = useComplexSharedValues({ $key: mutable(0) });
  // const test_1_4 = useComplexSharedValues(record(mutable(0)));

  // const test_1_1_current = test_1_1.current;
  // const test_1_1_get_1 = test_1_1.get('key1');
  // const test_1_1_get_2 = test_1_1.get('key1', true);

  // runOnUI(() => {
  //   const test_1_1_set_1 = test_1_1.set('key1', 1);
  //   console.log('test_1_1_set_1', test_1_1_set_1.value);
  // })();

  // const test_1_1_set_2 = test_1_1.set(['key1', 'key2'], 1);
  // const test_1_1_push = test_1_1.has('key1');
  // const test_1_1_clear = test_1_1.clear();
  // const test_1_1_remove_1 = test_1_1.remove('key1');
  // const test_1_1_remove_2 = test_1_1.remove('key1', 'key2');
  // const test_1_1_reset_1 = test_1_1.reset('key1');
  // const test_1_1_reset_2 = test_1_1.reset('key1', 'key2');

  // // Alternative syntax (array)
  // // all return: SharedValue<number>[]
  // const test_2_1 = useComplexSharedValues(() => [mutable(0)]);
  // const test_2_2 = useComplexSharedValues(() => array(mutable(0)));
  // const test_2_3 = useComplexSharedValues([mutable(0)]);
  // const test_2_4 = useComplexSharedValues(array(mutable(0)));

  // // ALternative syntax (object) - object is optional and can be used for clarity
  // // all return: { a: SharedValue<number> }
  // const test_3_1 = useComplexSharedValues(() => ({ a: mutable(0) }));
  // const test_3_2 = useComplexSharedValues(() => object({ a: mutable(0) }));
  // const test_3_3 = useComplexSharedValues({ a: mutable(0) });
  // const test_3_4 = useComplexSharedValues(object({ a: mutable(0) }));
  // // Useful if $key must not be considered as a record key wildcard
  // // and instead be treated as a regular key
  // const test_3_5 = useComplexSharedValues(() => ({ $key: mutable(0) })); // record
  // const test_3_6 = useComplexSharedValues(() => object({ $key: mutable(0) })); // object

  // // Explicit tuple syntax (tuple call is required)
  // // all return: [SharedValue<number>, SharedValue<string>]
  // const test_4_1 = useComplexSharedValues(() =>
  //   tuple(mutable(0), mutable('1'))
  // );
  // const test_4_2 = useComplexSharedValues(tuple(mutable(0), mutable('1')));

  // // Explicit mutable syntax (mutable call is required)
  // // all return: SharedValue<[number, number]>
  // const test_5_1 = useComplexSharedValues(() => mutable(tuple(0, 1)));
  // const test_5_2 = useComplexSharedValues(mutable(tuple(0, 1)));

  dimensions.set('key1');
  console.log('?', dimensions.current.key1?.value);

  const [keys, setKeys] = useState<Array<string>>([]);
  const overrideItemDimensions = useComplexSharedValues(
    s => s.record(s.mutable({ height: 0, width: 0 })),
    keys
  );

  useEffect(() => {
    console.log('effect');
    const interval = setInterval(() => {
      setKeys(prevKeys => {
        const newKeys = [...prevKeys];
        newKeys.push(`key${newKeys.length + 1}`);
        return newKeys;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [overrideItemDimensions]);

  console.log('body', keys);
  console.log(
    'current',
    Object.values(overrideItemDimensions.current).map(value => value.value)
  );

  const [rowCount, setRowCount] = useState(0);
  const rowOffsets = useComplexSharedValues(
    s => s.array(s.mutable(0)),
    rowCount
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setRowCount(count => count + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [rowOffsets]);

  console.log(
    'rowOffsets',
    rowOffsets.current.map(value => value.value)
  );

  return null;
}
