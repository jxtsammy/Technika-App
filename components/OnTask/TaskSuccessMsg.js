import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const OperationSuccessScreen = ({ navigation }) => {
  const handleContinue = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'home' }],
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Main Content Area */}
      <View style={styles.content}>
        {/* Illustration from Local Assets */}
        <View style={styles.imageContainer}>
          <Image
            source={require('../../assets/noComment.png')}
            style={styles.illustration}
            resizeMode="contain"
          />
        </View>

        {/* Text Container */}
        <View style={styles.textContainer}>
          <Text style={styles.headerTitle}>
            Field Operation Completed!
          </Text>
          <Text style={styles.subtitle}>
            The acknowledgment token has been verified and the field operation completed, and you can continue to carry out other operations.
          </Text>
        </View>
      </View>

      {/* Action Button Container */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinue}
          activeOpacity={0.8}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    width: '100%',
    height: 280,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  illustration: {
    width: '130%',
    height: '130%',
    marginBottom: 50
  },
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  headerTitle: {
    fontSize: 27,
    fontWeight: '700',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 32,
    marginTop: 20
  },
  subtitle: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 22,
  },
  buttonContainer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    width: '100%',
  },
  continueButton: {
    backgroundColor: '#007a3f',
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default OperationSuccessScreen;