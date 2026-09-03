import React, { useState } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Location from "expo-location";
import api from "../../api";

const LocationPermissionScreen = ({ navigation }) => {
    const [loading, setLoading] = useState(false);

    const enableLocation = async () => {
        setLoading(true);
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();

            if (status === "granted") {
                const location = await Location.getCurrentPositionAsync({
                    accuracy: Location.Accuracy.Balanced,
                });

                try {
                    await api.put("/users/location", {
                        latitude: location.coords.latitude,
                        longitude: location.coords.longitude,
                    });
                } catch (error) {
                    console.error("Failed to push location to backend:", error);
                }

                navigation.replace("welcome");
            } else {
                Alert.alert(
                    "Permission Denied",
                    "We need location permission to find nearby tasks. You can skip for now or try enabling it again.",
                    [
                        { text: "Skip", onPress: () => navigation.replace("welcome") },
                        { text: "Try Again", style: "cancel" },
                    ]
                );
            }
        } catch (error) {
            console.error("Error requesting location:", error);
            Alert.alert("Error", "Could not fetch location. Proceeding to main app.", [
                { text: "OK", onPress: () => navigation.replace("welcome") },
            ]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.illustrationContainer}>
                <Image
                    source={require("../../assets/locationPin.png")}
                    style={styles.illustration}
                    resizeMode="contain"
                />

                <Text style={styles.title}>
                    To give you the best experience, we use your location to find nearby tasks, provide accurate directions, and connect you with local clients. You can update this anytime in your device settings.
                </Text>
            </View>

            <TouchableOpacity
                style={styles.getStartedButton}
                onPress={enableLocation}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.getStartedText}>Allow Location</Text>
                )}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.replace("welcome")} disabled={loading}>
                <Text style={styles.skip}>Skip for now</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f3f4f6",
        paddingHorizontal: 20,
        paddingTop: 40,
        alignItems: "center",
        justifyContent: "space-between",
    },
    title: {
        fontSize: 16,
        textAlign: "center",
        color: "#333",
        marginBottom: 20,
        marginTop: 20,
        fontWeight: "300",
        lineHeight: 22,
    },
    illustrationContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    illustration: {
        width: 250,
        height: 250,
    },
    getStartedButton: {
        width: "90%",
        backgroundColor: "#007a3f",
        paddingVertical: 15,
        borderRadius: 15,
        alignItems: "center",
    },
    getStartedText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "600",
    },
    skip: {
        marginTop: 15,
        marginBottom: 30,
        fontSize: 16,
        color: "#007a3f",
        fontWeight: "bold",
    },
});

export default LocationPermissionScreen;