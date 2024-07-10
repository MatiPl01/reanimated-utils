import { renderHook } from '@testing-library/react-hooks';
import { waitFor } from '@testing-library/react-native';
import { isSharedValue, makeMutable } from 'react-native-reanimated';

import { useAnimatableValue } from './useAnimatableValue';

describe(useAnimatableValue, () => {
  const cases = [
    { text: 'plain value', value: (v: number) => v },
    { text: 'shared value', value: (v: number) => makeMutable(v) }
  ];

  describe.each(cases)('with %s', ({ value }) => {
    it('returns a shared value', () => {
      const { result } = renderHook(() => useAnimatableValue(value(42)));

      expect(isSharedValue(result.current)).toBe(true);
    });

    it('returns the same shared value object when input changes', () => {
      const { rerender, result } = renderHook(useAnimatableValue, {
        initialProps: value(42)
      });

      const firstResult = result.current;
      rerender(value(43));

      expect(result.current).toBe(firstResult);
    });

    it('updates the .value property of the shared value when input changes', async () => {
      const { rerender, result } = renderHook(useAnimatableValue, {
        initialProps: value(42)
      });

      rerender(value(43));

      await waitFor(() => {
        expect(result.current.value).toBe(43);
      });
    });
  });
});
