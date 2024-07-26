/* eslint-disable import/no-unused-modules */
import { useEffect } from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import Animated, {
  runOnUI,
  useSharedValue,
  withSequence,
  withSpring
} from 'react-native-reanimated';
import type { AnimatedIntervalID } from 'reanimated-utils';
import {
  clearAnimatedInterval,
  setAnimatedInterval
} from 'reanimated-utils';

export default function AnimatedIntervalExample() {
  const scale = useSharedValue(1);
  const animatedInterval = useSharedValue<AnimatedIntervalID>(-1);

  useEffect(() => {
    runOnUI(() => {
      animatedInterval.value = setAnimatedInterval(() => {
        scale.value = withSequence(withSpring(2), withSpring(1));
      }, 2000);
    })();

    return () => {
      clearAnimatedInterval(animatedInterval.value);
    };
  }, [scale, animatedInterval]);

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
