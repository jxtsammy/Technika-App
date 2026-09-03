import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  StatusBar,
  ImageBackground,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Sparkles, Delete } from 'lucide-react-native';
import ProcessingBottomSheet from './ProcessingScreen';

export default function VerificationScreen({ navigation, route }) {
  const [code, setCode] = useState(['', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState(60);

  const userEmail = route?.params?.email || 'username@gmail.com';

  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleBack = () => {
    if (navigation?.goBack) {
      navigation.goBack();
    }
  };

  const handleKeyPress = (digit) => {
    const firstEmptyIndex = code.findIndex((c) => c === '');
    if (firstEmptyIndex !== -1) {
      const newCode = [...code];
      newCode[firstEmptyIndex] = digit;
      setCode(newCode);

      
      if (firstEmptyIndex === 4) {
        setIsLoading(true);
      }
    }
  };

  const handleDeletePress = () => {
    
    for (let i = 4; i >= 0; i--) {
      if (code[i] !== '') {
        const newCode = [...code];
        newCode[i] = '';
        setCode(newCode);
        break;
      }
    }
  };

  const handleResendCode = () => {
    if (timer === 0) {
      setTimer(60);
      setCode(['', '', '', '', '']);
      Alert.alert('Code Resent', 'A new verification code has been sent.');
    }
  };

  const handleLoadingFinish = () => {
    setIsLoading(false);
    setCode(['', '', '', '', '']);

    navigation.navigate('idProcessing')
  };

  return (
    <ImageBackground
      source={require('../../assets/regBg.jpg')}
      style={styles.backgroundImage}
    >
      <View style={styles.darkOverlay}>
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
          <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
          
          <View style={styles.topBar}>
            <TouchableOpacity 
              style={styles.backButton} 
              onPress={handleBack}
              activeOpacity={0.7}
            >
              <ArrowLeft size={22} color="#ffffff" />
            </TouchableOpacity>
            <View style={styles.sparkleContainer}>
              <Sparkles size={20} color="#ffffff" />
            </View>
          </View>

          <View style={styles.contentContainer}>
            <View style={styles.headerArea}>
              <Text style={styles.title}>Verify your Account</Text>
              <Text style={styles.subtitle}>
                We've sent an SMS with an activation code to your email <Text style={styles.boldText}>{userEmail}</Text>
              </Text>
            </View>

            {/* Bottom Card housing OTP boxes + Custom Keypad */}
            <View style={styles.bottomContainer}>
              <View style={styles.otpContainer}>
                {code.map((digit, index) => (
                  <View
                    key={index}
                    style={[
                      styles.otpBox,
                      digit ? styles.otpBoxFilled : null,
                    ]}
                  >
                    <Text style={styles.otpText}>{digit}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.resendContainer}>
                {timer > 0 ? (
                  <Text style={styles.resendText}>
                    Send code again{' '}
                    <Text style={styles.timerText}>
                      00:{timer < 10 ? `0${timer}` : timer}
                    </Text>
                  </Text>
                ) : (
                  <TouchableOpacity onPress={handleResendCode} activeOpacity={0.7}>
                    <Text style={styles.activeResendText}>Send code again</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Custom Keypad Layout */}
              <View style={styles.keypad}>
                {[['1', '2', '3'], ['4', '5', '6'], ['7', '8', '9']].map((row, rowIndex) => (
                  <View key={rowIndex} style={styles.keyRow}>
                    {row.map((num) => (
                      <TouchableOpacity
                        key={num}
                        style={styles.key}
                        activeOpacity={0.6}
                        onPress={() => handleKeyPress(num)}
                      >
                        <Text style={styles.keyText}>{num}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                ))}
                
                {/* Bottom Row: Empty space / 0 / Delete */}
                <View style={styles.keyRow}>
                  <View style={styles.keyEmpty} />
                  <TouchableOpacity
                    style={styles.key}
                    activeOpacity={0.6}
                    onPress={() => handleKeyPress('0')}
                  >
                    <Text style={styles.keyText}>0</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.key}
                    activeOpacity={0.6}
                    onPress={handleDeletePress}
                  >
                    <Delete size={22} color="#111111" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>

          <ProcessingBottomSheet 
            visible={isLoading} 
            onClose={handleLoadingFinish} 
          />
        </SafeAreaView>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  darkOverlay: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 8,
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    marginTop: 30,
  },
  sparkleContainer: {
    marginTop: 30,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  headerArea: {
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.75)',
    lineHeight: 20,
  },
  boldText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  bottomContainer: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 20,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 10,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  otpBox: {
    width: 52,
    height: 58,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  otpBoxFilled: {
    borderColor: '#007a3f', // Green border when filled
    backgroundColor: '#f0fdf4',
  },
  otpText: {
    fontSize: 22,
    fontWeight: '600',
    color: '#111111',
  },
  resendContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  resendText: {
    fontSize: 14,
    color: '#6b7280',
  },
  timerText: {
    fontWeight: '600',
    color: '#111111',
  },
  activeResendText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007a3f',
  },
  keypad: {
    width: '100%',
    paddingBottom: 10,
  },
  keyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  key: {
    flex: 1,
    height: 50,
    marginHorizontal: 6,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyEmpty: {
    flex: 1,
    height: 50,
    marginHorizontal: 6,
  },
  keyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111111',
  },
});