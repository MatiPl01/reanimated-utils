import { useEffect } from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedReaction,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming
} from 'react-native-reanimated';
import {
  clearAnimatedTimeout,
  setAnimatedTimeout
} from 'reanimated-utils';

export default function AnimatedTimeoutExample() {
  const counter = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    const interval = setInterval(() => {
      counter.value++;
    }, 3000);

    return () => {
      clearInterval(interval);
    };
  }, [counter]);

  useAnimatedReaction(
    () => counter.value,
    cnt => {
      const timeout = setAnimatedTimeout(() => {
        scale.value = withSequence(
          withSpring(2),
          withDelay(300, withTiming(1, { duration: 1000 }))
        );
      }, 1000);

      if (cnt % 2 === 1) {
        clearAnimatedTimeout(timeout);
      }
    }
  );

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.box, { transform: [{ scale }] }]} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  box: {
    backgroundColor: 'blue',
    borderRadius: 20,
    height: 100,
    width: 100
  },
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center'
  }
});
