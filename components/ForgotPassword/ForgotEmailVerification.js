import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Pressable,
} from 'react-native';

const CODE_LENGTH = 5;
const INITIAL_TIMER = 60;

export default function ConfirmationCodeScreen({ navigation }) {
  const [code, setCode] = useState('');
  const [timer, setTimer] = useState(INITIAL_TIMER);
  const [isResendActive, setIsResendActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const inputRef = useRef(null);

  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setIsResendActive(true);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };


  const handleCodeChange = (text) => {
    const cleanedText = text.replace(/[^0-9]/g, '');
    if (cleanedText.length <= CODE_LENGTH) {
      setCode(cleanedText);
      if (cleanedText.length === CODE_LENGTH) {
        verifyCode();
      }
    }
  };

  const verifyCode = () => {
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      navigation.reset({
        index: 0,
        routes: [{ name: 'updateNewPassword' }],
      });
    }, 1200);
  };

  // Handle Resend Request
  const handleResend = () => {
    if (!isResendActive) return;
    setTimer(INITIAL_TIMER);
    setIsResendActive(false);
    setCode('');
    Alert.alert('Code Sent', 'A new verification code has been sent to your phone.');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.inner}>
        {/* Header Section */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation?.goBack()} style={styles.backButton}>
            <Text style={styles.backArrow}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Confirmation code</Text>
          <Text style={styles.subtitle}>
            We have sent you a code to +46 123-4567-890.{'\n'}Please enter the code below.
          </Text>
        </View>

        {/* Hidden TextInput for native keyboard interaction */}
        <TextInput
          ref={inputRef}
          value={code}
          onChangeText={handleCodeChange}
          keyboardType="number-pad"
          maxLength={CODE_LENGTH}
          style={styles.hiddenInput}
          caretHidden
        />

        {/* Code Boxes Display */}
        <Pressable style={styles.codeContainer} onPress={() => inputRef.current?.focus()}>
          {Array.from({ length: CODE_LENGTH }).map((_, index) => {
            const digit = code[index] || '';
            const isFocused = index === code.length;

            return (
              <View
                key={index}
                style={[
                  styles.codeBox,
                  isFocused && styles.codeBoxFocused,
                ]}
              >
                <Text style={styles.codeText}>{digit}</Text>
              </View>
            );
          })}
        </Pressable>

        {/* Loading Indicator */}
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007a3f" />
            <Text style={styles.loadingText}>Verifying code...</Text>
          </View>
        )}

        <View style={styles.spacer} />

        {/* Bottom Resend Area */}
        <View style={styles.bottomContainer}>
          {isResendActive ? (
            <TouchableOpacity onPress={handleResend}>
              <Text style={styles.resendTextActive}>Send code again</Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.resendTextDisabled}>
              Send again in {formatTimer(timer)}
            </Text>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  inner: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
    justifyContent: 'space-between',
  },
  header: {
    marginBottom: 32,
  },
  backButton: {
    marginBottom: 16,
    width: 40,
  },
  backArrow: {
    fontSize: 32,
    color: '#000000',
    fontWeight: '300',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    color: '#666666',
    lineHeight: 22,
  },
  hiddenInput: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginVertical: 10,
  },
  codeBox: {
    width: 56,
    height: 64,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  codeBoxFocused: {
    borderColor: '#007a3f',
    borderWidth: 2,
    backgroundColor: '#FFFFFF',
  },
  codeText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000000',
  },
  loadingContainer: {
    marginTop: 24,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    color: '#666666',
  },
  spacer: {
    flex: 1,
  },
  bottomContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  resendTextDisabled: {
    fontSize: 15,
    color: '#8E8E93',
  },
  resendTextActive: {
    fontSize: 15,
    color: '#007a3f',
    fontWeight: '600',
  },
});