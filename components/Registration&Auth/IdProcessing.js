import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  StatusBar,
  ImageBackground,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Sparkles, IdCard } from 'lucide-react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import ProcessingBottomSheet from './ProcessingScreen';

export default function IdVerificationScreen({ navigation, route }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const cameraRef = useRef(null);

  const email = route?.params?.email;

  const handleBack = () => {
    if (isCameraActive) {
      setIsCameraActive(false);
    } else if (navigation?.goBack) {
      navigation.goBack();
    }
  };

  const handleButtonPress = async () => {
    if (!permission || !permission.granted) {
      const permResult = await requestPermission();
      if (!permResult.granted) {
        return;
      }
    }

    if (!isCameraActive && !capturedImage) {
      setIsCameraActive(true);
    } else if (isCameraActive && cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({ quality: 0.8 });
        setCapturedImage(photo.uri);
        setIsCameraActive(false);
      } catch (error) {
        console.error('Failed to take picture:', error);
      }
    } else if (capturedImage) {
      setIsLoading(true);
    }
  };

  const handleLoadingFinish = () => {
    setIsLoading(false);
    navigation.navigate('extraDetails', { email, idUri: capturedImage });
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

          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            {/* Header moved above the bottom container */}
            <View style={styles.headerArea}>
              <Text style={styles.title}>Upload your National ID</Text>
              <Text style={styles.subtitle}>
                Please provide a clear image of your national identification document for verification purposes.
              </Text>
            </View>

            {/* White Bottom Container holding the taller ID media container & instructions */}
            <View style={styles.bottomContainer}>
              
              {/* Taller Media Container */}
              <View style={styles.mediaContainer}>
                {isCameraActive ? (
                  <View style={styles.cameraWrapper}>
                    <CameraView ref={cameraRef} style={styles.cameraView} facing="back" />
                  </View>
                ) : capturedImage ? (
                  <ImageBackground 
                    source={{ uri: capturedImage }} 
                    style={styles.capturedImageStyle} 
                  />
                ) : (
                  <View style={styles.illustrationPlaceholder}>
                    <IdCard size={200} color="#007a3f" strokeWidth={0.5} />
                  </View>
                )}
              </View>
              
              <View style={styles.instructionList}>
                <View style={styles.bulletRow}>
                  <Text style={styles.bulletDot}>•</Text>
                  <Text style={styles.bulletText}>Hold your document so that it fits neatly inside view</Text>
                </View>
                <View style={styles.bulletRow}>
                  <Text style={styles.bulletDot}>•</Text>
                  <Text style={styles.bulletText}>
                    Make a clear, front picture of the document. All information should be readable, avoid blurriness and flares
                  </Text>
                </View>
              </View>

              <TouchableOpacity 
                style={styles.primaryButton} 
                onPress={handleButtonPress}
                activeOpacity={0.8}
              >
                <Text style={styles.primaryButtonText}>
                  {capturedImage ? 'Continue' : isCameraActive ? 'Capture' : 'Take photo'}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

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
    paddingBottom: 40,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 10,
  },
  mediaContainer: {
    width: '100%',
    height: 240, // Increased height for capture background container
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  illustrationPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  capturedImageStyle: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  cameraWrapper: {
    width: '100%',
    height: '100%',
  },
  cameraView: {
    flex: 1,
  },
  instructionList: {
    marginBottom: 24,
  },
  bulletRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  bulletDot: {
    fontSize: 16,
    fontWeight: '700',
    color: '#007a3f',
    marginRight: 8,
  },
  bulletText: {
    fontSize: 13,
    color: '#4b5563',
    lineHeight: 18,
    flex: 1,
  },
  primaryButton: {
    backgroundColor: '#007a3f',
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
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