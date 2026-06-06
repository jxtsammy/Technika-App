import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const CallingScreen = ({navigation, route}) => {
  const { name, image, number,  } = route.params;
  const [callDuration, setCallDuration] = useState(0);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleSpeaker = () => {
    setIsSpeakerOn(!isSpeakerOn);
    // Here you would add actual speaker functionality
  };

  const toggleMic = () => {
    setIsMuted(!isMuted);
    // Here you would add actual mic muting functionality
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={()=> navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.callingText}>Calling ...</Text>
      </View>

      {/* Profile Section */}
      <View style={styles.profileSection}>
        <Image
          source={{uri: image}}
          style={styles.profileImage}
        />
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.phone}>{number}</Text>
        <Text style={styles.timer}>{formatTime(callDuration)}</Text>
      </View>

      {/* Call Controls */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.controlButton, isMuted && styles.activeButton]}
          onPress={toggleMic}>
          <Ionicons
            name={isMuted ? "mic-off" : "mic"}
            size={24}
            color={isMuted ? "#000" : "#fff"}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.controlButton, isSpeakerOn && styles.activeButton]}
          onPress={toggleSpeaker}>
          <Ionicons
            name="volume-high"
            size={24}
            color={isSpeakerOn ? "#000" : "#fff"}
          />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.controlButton, styles.endCallButton]} >
          <Ionicons name="call" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  backButton: {
    padding: 8,
  },
  callingText: {
    color: '#fff',
    fontSize: 20,
    marginLeft: 110,
  },
  profileSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 100,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 20,
  },
  name: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 8,
  },
  phone: {
    color: '#999',
    fontSize: 16,
    marginBottom: 20,
  },
  timer: {
    color: '#fff',
    fontSize: 16,
    opacity: 0.8,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 40,
    gap: 20,
  },
  controlButton: {
    width: 60,
    height: 60,
    borderRadius: 40,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeButton: {
    backgroundColor: '#fff',
  },
  endCallButton: {
    backgroundColor: '#E53935',
    transform: [{ rotate: '135deg' }],
  },
});

export default CallingScreen;