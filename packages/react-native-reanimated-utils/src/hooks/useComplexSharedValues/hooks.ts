import { useEffect, useState } from 'react';

import { cancelAnimations } from './utils';

function useCancelAnimations<V>(current: V): void {
  useEffect(() => {
    // Cancel all animations on unmount
    return () => {
      cancelAnimations(current);
    };
  }, [current]);
}

export function useCurrentValue<V>(initialValue: (() => V) | V): V {
  const [current] = useState<V>(initialValue);
  useCancelAnimations(current);
  return current;
}
