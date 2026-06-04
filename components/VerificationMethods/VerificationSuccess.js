import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const VerificationSuccessScreen = ({ navigation }) => {
    return (
        <SafeAreaView style={styles.container}>
            {/* Illustration */}
            <View style={styles.imageContainer}>
                <Image
                    source={require("../../assets/VerificationSuccessful.png")} // Replace with your actual image path
                    style={styles.image}
                />
            </View>

            {/* Verification Message */}
            <Text style={styles.title}>Verification Successful</Text>
            <Text style={styles.subtitle}>
                Your phone number has been verified!{"\n"}You're all set to
                continue.
            </Text>

            {/* Continue Button */}
            <TouchableOpacity
                style={styles.continueButton}
                onPress={() => navigation.replace("login")}
            >
                <Text style={styles.continueButtonText}>Continue</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        padding: 16,
    },
    imageContainer: {
        alignItems: "center",
        marginTop: 80,
    },
    image: {
        width: 400,
        height: 400,
        resizeMode: "contain",
    },
    title: {
        fontSize: 30,
        fontWeight: "bold",
        textAlign: "center",
        color: "#007a3f",
        marginTop: 20,
    },
    subtitle: {
        fontSize: 18,
        textAlign: "center",
        color: "#757575", // Grey color
        marginVertical: 12,
    },
    continueButton: {
        backgroundColor: "#007a3f",
        paddingVertical: 15,
        borderRadius: 15,
        marginHorizontal: 20,
        marginTop: 20,
        alignItems: "center",
    },
    continueButtonText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "bold",
    },
});

export default VerificationSuccessScreen;
