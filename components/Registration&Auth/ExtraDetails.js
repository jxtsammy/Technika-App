import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  StatusBar,
  ImageBackground,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Sparkles, ChevronDown, Check } from 'lucide-react-native';
import ProcessingBottomSheet from './ProcessingScreen';

export default function ExtraDetailsScreen({ navigation, route }) {
  const [gender, setGender] = useState('');
  const [isGenderDropdownOpen, setIsGenderDropdownOpen] = useState(false);
  const [nationality, setNationality] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [stateRegion, setStateRegion] = useState('');
  const [country, setCountry] = useState('');
  const [accountType] = useState('Field Technician');
  const [isLoading, setIsLoading] = useState(false);

  const genderOptions = ['Male', 'Female', 'Other', 'Prefer not to say'];
  const previousData = route?.params || {};

  const handleBack = () => {
    if (navigation?.goBack) {
      navigation.goBack();
    }
  };

  const handleSubmit = () => {
    if (!gender || !nationality.trim() || !address.trim() || !city.trim() || !stateRegion.trim() || !country.trim()) {
      Alert.alert('Missing Fields', 'Please fill in all required fields before completing your registration.');
      return;
    }

    setIsLoading(true);
  };

  const handleLoadingFinish = () => {
    setIsLoading(false);
    
    const completeRegistrationData = {
      ...previousData,
      gender,
      nationality,
      address,
      city,
      stateRegion,
      country,
      accountType,
    };

    navigation.navigate('accountCreated', completeRegistrationData);
  };

  return (
    <ImageBackground
      source={require('../../assets/regBg.jpg')}
      style={styles.backgroundImage}
    >
      <View style={styles.darkOverlay}>
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
          <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
          
          {/* Top Bar */}
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

          {/* KeyboardAvoidingView prevents keyboard from blocking inputs */}
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardView}
          >
            <ScrollView 
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              bounces={false}
            >
              <View style={styles.headerArea}>
                <Text style={styles.title}>Complete you Profile</Text>
                <Text style={styles.subtitle}>
                  Please provide your remaining personal and location details to complete your profile setup.
                </Text>
              </View>

              {/* White Bottom Form Container */}
              <View style={styles.bottomContainer}>
                
                {/* Gender Dropdown */}
                <View style={[styles.inputGroup, { zIndex: 20 }]}>
                  <Text style={styles.label}>Gender</Text>
                  <TouchableOpacity
                    style={styles.dropdownSelector}
                    activeOpacity={0.8}
                    onPress={() => setIsGenderDropdownOpen(!isGenderDropdownOpen)}
                  >
                    <Text style={[styles.dropdownSelectorText, !gender && { color: '#9ca3af' }]}>
                      {gender || 'Select gender'}
                    </Text>
                    <ChevronDown size={20} color="#6b7280" />
                  </TouchableOpacity>

                  {/* Dropdown Options List */}
                  {isGenderDropdownOpen && (
                    <View style={styles.dropdownList}>
                      {genderOptions.map((option, index) => (
                        <TouchableOpacity
                          key={index}
                          style={styles.dropdownItem}
                          onPress={() => {
                            setGender(option);
                            setIsGenderDropdownOpen(false);
                          }}
                        >
                          <Text style={[styles.dropdownItemText, gender === option && styles.selectedDropdownText]}>
                            {option}
                          </Text>
                          {gender === option && <Check size={16} color="#007a3f" />}
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>

                {/* Nationality */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Nationality</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g., Ghanaian, French"
                    placeholderTextColor="#9ca3af"
                    value={nationality}
                    onChangeText={setNationality}
                  />
                </View>

                {/* Address */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Street Address</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g., 123 Main Street"
                    placeholderTextColor="#9ca3af"
                    value={address}
                    onChangeText={setAddress}
                  />
                </View>

                {/* City / Town and State / Region (Row layout) */}
                <View style={styles.rowGroup}>
                  <View style={[styles.inputGroup, styles.halfInput]}>
                    <Text style={styles.label}>City / Town</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="City"
                      placeholderTextColor="#9ca3af"
                      value={city}
                      onChangeText={setCity}
                    />
                  </View>
                  <View style={[styles.inputGroup, styles.halfInput]}>
                    <Text style={styles.label}>State / Region</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="State or Region"
                      placeholderTextColor="#9ca3af"
                      value={stateRegion}
                      onChangeText={setStateRegion}
                    />
                  </View>
                </View>

                {/* Country */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Country</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g., Ghana"
                    placeholderTextColor="#9ca3af"
                    value={country}
                    onChangeText={setCountry}
                  />
                </View>

                {/* Account Type (Locked / Non-editable) */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Account Type</Text>
                  <View style={[styles.input, styles.disabledInput]}>
                    <Text style={styles.disabledInputText}>{accountType}</Text>
                  </View>
                </View>

                {/* Submit Button */}
                <TouchableOpacity 
                  style={styles.primaryButton} 
                  onPress={handleSubmit}
                  activeOpacity={0.8}
                >
                  <Text style={styles.primaryButtonText}>Complete Registration</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>

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
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
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
    marginTop: 10,
  },
  sparkleContainer: {
    marginTop: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'flex-end',
    paddingTop: 20,
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
  inputGroup: {
    marginBottom: 16,
    position: 'relative',
  },
  rowGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    width: '48%',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 15,
    color: '#111111',
    justifyContent: 'center',
  },
  dropdownSelector: {
    height: 50,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownSelectorText: {
    fontSize: 15,
    color: '#111111',
  },
  dropdownList: {
    position: 'absolute',
    top: 80,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    zIndex: 100,
    overflow: 'hidden',
  },
  dropdownItem: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  dropdownItemText: {
    fontSize: 15,
    color: '#374151',
  },
  selectedDropdownText: {
    color: '#007a3f',
    fontWeight: '600',
  },
  disabledInput: {
    backgroundColor: '#f3f4f6',
    borderColor: '#e5e7eb',
  },
  disabledInputText: {
    color: '#6b7280',
    fontSize: 15,
    fontWeight: '500',
  },
  primaryButton: {
    backgroundColor: '#007a3f',
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#007a3f',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});