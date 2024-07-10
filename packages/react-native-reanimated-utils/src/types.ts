import type { SharedValue } from 'react-native-reanimated';

export type Animatable<V> = SharedValue<V> | V;
