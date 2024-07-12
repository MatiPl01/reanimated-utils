import type { SharedValue } from 'react-native-reanimated';

export type Animatable<V> = SharedValue<V> | V;

export type UnAnimatable<V> = V extends SharedValue<infer U> ? U : V;
