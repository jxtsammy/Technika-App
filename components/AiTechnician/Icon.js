import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { Bot } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

const BotFab = () => {
  const navigation = useNavigation(); // 👈 Access navigation safely

  return (
    <TouchableOpacity
      style={styles.fab}
      onPress={() => navigation.navigate("technicalAssist")}
    >
      <Bot size={24} color="#ffffff" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    bottom: 30,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#007a3f",
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});

export default BotFab;