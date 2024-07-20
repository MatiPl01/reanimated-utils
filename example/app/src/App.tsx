import { SafeAreaView, StyleSheet } from 'react-native';
import { Greeting } from 'react-native-reanimated-utils';

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <Greeting />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});
