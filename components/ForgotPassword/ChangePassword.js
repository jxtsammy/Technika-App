import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { ChevronLeft, Eye, EyeOff } from 'lucide-react-native';

export default function NewPasswordScreen({ navigation }) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null);

  // Validation Rules (> 6 chars, contains letter, number, and symbol)
  const isMinLength = password.length > 6;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const isMatching = password !== '' && password === confirmPassword;

  // Gather missing password rules
  const missingPasswordRules = [];
  if (!isMinLength) missingPasswordRules.push('More than 6 characters');
  if (!hasLetter) missingPasswordRules.push('At least one letter');
  if (!hasNumber) missingPasswordRules.push('At least one number');
  if (!hasSymbol) missingPasswordRules.push('At least one symbol (!@#$%^&*)');

  const isFormValid = missingPasswordRules.length === 0 && isMatching;

  const handleSubmit = () => {
    if (missingPasswordRules.length > 0) {
      Alert.alert(
        'Invalid Password',
        `Your password must meet all requirements:\n\n• ${missingPasswordRules.join('\n• ')}`
      );
      return;
    }

    if (!isMatching) {
      Alert.alert('Password Mismatch', 'New password and confirm password do not match.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      Alert.alert('Success', 'Password updated successfully!', [
        {
          text: 'OK',
          onPress: () =>
            navigation?.reset({
              index: 0,
              routes: [{ name: 'passwordUpdateSuccess' }],
            }),
        },
      ]);
    }, 1200);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Header Area */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation?.goBack()} style={styles.backButton}>
            <ChevronLeft size={28} color="#000000" />
          </TouchableOpacity>
          <Text style={styles.title}>Update Password</Text>
          <Text style={styles.subtitle}>
            Please enter and confirm your new password below.
          </Text>
        </View>

        {/* Form Inputs */}
        <View style={styles.form}>
          {/* New Password Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>New Password</Text>
            <View
              style={[
                styles.inputContainer,
                focusedInput === 'password' && styles.inputFocused,
              ]}
            >
              <TextInput
                style={styles.input}
                placeholder="Enter new password"
                placeholderTextColor="#94A3B8"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
                onFocus={() => setFocusedInput('password')}
                onBlur={() => setFocusedInput(null)}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                {showPassword ? (
                  <EyeOff size={20} color="#007a3f" />
                ) : (
                  <Eye size={20} color="#94A3B8" />
                )}
              </TouchableOpacity>
            </View>

            {/* Dynamic Missing Rules Under Active Password Input */}
            {focusedInput === 'password' && missingPasswordRules.length > 0 && (
              <View style={styles.helperBox}>
                <Text style={styles.helperHeader}>Still needed:</Text>
                {missingPasswordRules.map((rule, idx) => (
                  <Text key={idx} style={styles.helperText}>
                    • {rule}
                  </Text>
                ))}
              </View>
            )}
          </View>

          {/* Confirm Password Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirm New Password</Text>
            <View
              style={[
                styles.inputContainer,
                focusedInput === 'confirmPassword' && styles.inputFocused,
              ]}
            >
              <TextInput
                style={styles.input}
                placeholder="Re-enter new password"
                placeholderTextColor="#94A3B8"
                secureTextEntry={!showConfirmPassword}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                onFocus={() => setFocusedInput('confirmPassword')}
                onBlur={() => setFocusedInput(null)}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                {showConfirmPassword ? (
                  <EyeOff size={20} color="#007a3f" />
                ) : (
                  <Eye size={20} color="#94A3B8" />
                )}
              </TouchableOpacity>
            </View>

            {/* Dynamic Mismatch Helper Under Active Confirm Input */}
            {focusedInput === 'confirmPassword' && confirmPassword.length > 0 && !isMatching && (
              <View style={styles.helperBox}>
                <Text style={styles.helperTextError}>
                  • Passwords do not match
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Continue Button */}
        <TouchableOpacity
          style={[styles.button, !isFormValid && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>Continue</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 24,
    justifyContent: 'space-between',
  },
  header: {
    marginBottom: 32,
  },
  backButton: {
    marginBottom: 12,
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#666666',
    lineHeight: 22,
  },
  form: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 65,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 16,
  },
  inputFocused: {
    borderColor: '#007a3f',
    borderWidth: 1.5,
    backgroundColor: '#FFFFFF',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#000000',
  },
  helperBox: {
    marginTop: 8,
    paddingHorizontal: 4,
  },
  helperHeader: {
    fontSize: 12,
    fontWeight: '600',
    color: '#D97706',
    marginBottom: 2,
  },
  helperText: {
    fontSize: 12,
    color: '#D97706',
    lineHeight: 18,
  },
  helperTextError: {
    fontSize: 12,
    color: '#DC2626',
  },
  button: {
    height: 65,
    backgroundColor: '#007a3f',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 13,
  },
  buttonDisabled: {
    backgroundColor: '#007a3f',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});