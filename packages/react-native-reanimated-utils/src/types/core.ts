/* eslint-disable @typescript-eslint/no-explicit-any */
import type { SharedValue } from 'react-native-reanimated';

export type Animatable<V> = SharedValue<V> | V;

export type UnAnimatable<V> = V extends SharedValue<infer U> ? U : V;

export type AnyFunction = (...args: Array<any>) => any;

export type NonEmptyArray<T> = [T, ...Array<T>];
