import React, { useState } from "react";
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    StatusBar,
    Image,
    ActivityIndicator,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

export default function ResetSuccessScreen({ navigation }) {
    const [isLoading, setIsLoading] = useState(false);

    const handleBackToLogin = () => {
        setIsLoading(true);

        setTimeout(() => {
            setIsLoading(false);

            navigation.reset({
                index: 0,
                routes: [{ name: "Login" }],
            });
        }, 1500);
    };

    return (
        <SafeAreaProvider>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.container}>
                    {/* Centered Graphic Asset Illustration */}
                    <View style={styles.imageContainer}>
                        <Image
                            source={require("../../assets/successIcon.png")}
                            style={styles.successImage}
                            resizeMode="contain"
                        />
                    </View>

                    {/* Heading Content */}
                    <View style={styles.textContainer}>
                        <Text style={styles.title}>Password Updated</Text>
                        <Text style={styles.subtitle}>
                            Your password has been updated successfully
                        </Text>
                    </View>

                    {/* Footer Interactive Trigger Button */}
                    <TouchableOpacity
                        style={styles.loginButton}
                        onPress={handleBackToLogin}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                            <Text style={styles.loginButtonText}>
                                Continue to Login
                            </Text>
                        )}
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },
    container: {
        flex: 1,
        justifyContent: "center",
        paddingHorizontal: 24,
    },
    imageContainer: {
        alignItems: "center",
        marginBottom: 32,
    },
    successImage: {
        width: 300,
        height: 350,
    },
    textContainer: {
        alignItems: "center",
        marginBottom: 40,
    },
    title: {
        fontSize: 32,
        fontWeight: "bold",
        color: "#000000",
        marginBottom: 12,
        textAlign: "center",
    },
    subtitle: {
        fontSize: 16,
        color: "#666666",
        textAlign: "center",
        lineHeight: 24,
        paddingHorizontal: 20,
    },
    loginButton: {
        backgroundColor: "#007a3f",
        height: 65,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
    },
    loginButtonText: {
        color: "#FFFFFF",
        fontSize: 18,
        fontWeight: "600",
    },
});
