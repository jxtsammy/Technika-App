import React from "react";

import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import * as Location from "expo-location";

import api from "../../api";

const LocationPermissionScreen = ({ navigation }) => {
    const enableLocation = async () => {
        let { status } = await Location.requestForegroundPermissionsAsync();

        if (status == "granted") {
            let location = await Location.getCurrentPositionAsync({});

            try {
                await api.put("/users/location", {
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                });
            } catch (error) {
                // Don't block onboarding on a failed location push — log and continue.
                console.error("Failed to push location to backend:", error);
            }

            navigation.replace("welcome");
        } else {
            alert("Please turn on location or skip");
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.illustrationContainer}>
                <Image
                    source={require("../../assets/locationPin.png")} // Replace with your actual iage path
                    style={styles.illustration}
                    resizeMode="contain"
                />

                <Text style={styles.title}>
                    To give you the best experience, we use your location to
                    find nearby tasks, provide accurate directions, and connect
                    you with local clients. You can update this anytime in your
                    device settings.
                </Text>
            </View>

            <TouchableOpacity
                style={styles.getStartedButton}
                onPress={enableLocation}
            >
                <Text style={styles.getStartedText}>Allow Location</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.replace("welcome")}>
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
        fontSize: 20,

        fontWrap: 1,

        textAlign: "center",

        color: "#333",

        marginBottom: 20,

        marginTop: 20,

        fontWeight: "light",
    },

    illustrationContainer: {
        flex: 1,

        justifyContent: "center",

        alignItems: "center",
    },

    illustration: {
        width: 1000,

        height: 450,
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
    },

    skip: {
        marginTop: 10,

        marginBottom: 30,

        fontSize: 18,

        color: "#007a3f",

        fontWeight: "bold",
    },
});

export default LocationPermissionScreen;
