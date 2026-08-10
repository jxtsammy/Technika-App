import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
// Import BlurView from expo-blur
import { BlurView } from 'expo-blur';

const CODE_LENGTH = 5;

const TokenModalScreen = ({ navigation, visible = true, onClose }) => {
  const [code, setCode] = useState(Array(CODE_LENGTH).fill(''));
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef([]);

  const handleChangeText = (text, index) => {
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    if (text && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace') {
      const newCode = [...code];

      if (code[index]) {
        // Clear current box digit
        newCode[index] = '';
        setCode(newCode);
      }

      // Move focus to previous box
      if (index > 0) {
        if (!code[index]) {
          newCode[index - 1] = '';
          setCode(newCode);
        }
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const handleClose = () => {
    setCode(Array(CODE_LENGTH).fill(''));
    if (onClose) onClose();
  };

  const handleVerifyButton = () => {
    setLoading(true);
    const enteredToken = code.join('');

    setTimeout(() => {
      setLoading(false);
      navigation.reset({
        index: 0,
        routes: [
          {
            name: 'taskSuccessMsg',
          },
        ],
      });
    }, 1500);
  };

  const isComplete = code.every((digit) => digit !== '');

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Bottom Sheet Modal Container */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={visible}
        onRequestClose={handleClose}
      >
        {/* Replace dark overlay view with highly blurred BlurView */}
        <BlurView intensity={90} tint="dark" style={StyleSheet.absoluteFill}>
          <TouchableWithoutFeedback onPress={handleClose}>
            <View style={styles.modalOverlay} />
          </TouchableWithoutFeedback>
        </BlurView>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.bottomSheetContainer}
        >
          <SafeAreaView style={styles.bottomSheetContent} edges={['bottom', 'left', 'right']}>
            {/*
               Header Section
               Removed topBar, closeButton, dragHandle
            */}
            <Text style={styles.headerTitle}>Enter Acknowledgment Token</Text>
            <Text style={styles.subtitle}>
              Please see the field operation supervisor to get the Acknowledgment token to verify that the work is completed.
            </Text>

            {/* Input Boxes */}
            <View style={styles.codeContainer}>
              {code.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => (inputRefs.current[index] = ref)}
                  style={[
                    styles.codeBox,
                    digit ? styles.codeBoxFilled : null,
                  ]}
                  keyboardType="number-pad"
                  maxLength={1}
                  value={digit}
                  onChangeText={(text) => handleChangeText(text, index)}
                  onKeyPress={(e) => handleKeyPress(e, index)}
                  selectTextOnFocus
                  editable={!loading}
                />
              ))}
            </View>

            {/* Verify Button */}
            <TouchableOpacity
              style={[
                styles.verifyButton,
                (!isComplete || loading) && styles.verifyButtonDisabled,
              ]}
              onPress={handleVerifyButton}
              disabled={!isComplete || loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.verifyButtonText}>Verify Token</Text>
              )}
            </TouchableOpacity>
          </SafeAreaView>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    // Overlay now handled by the blurry BlurView parent
  },
  bottomSheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    // Added elevation for Android depth
    elevation: 10,
    // Added shadow for iOS depth
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  bottomSheetContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    // Adjust paddingTop for clean look without drag bar
    paddingTop: 32,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 8,
    marginTop: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
    marginBottom: 28,
    textAlign: 'center',
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 32,
  },
  codeBox: {
    width: 52,
    height: 60,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '600',
    color: '#000000',
  },
  codeBoxFilled: {
    borderColor: '#007a3f',
    backgroundColor: '#FFFFFF',
  },
  verifyButton: {
    backgroundColor: '#007a3f',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    height: 52,
    justifyContent: 'center',
  },
  verifyButtonDisabled: {
    backgroundColor: '#007a3f',
  },
  verifyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default TokenModalScreen;