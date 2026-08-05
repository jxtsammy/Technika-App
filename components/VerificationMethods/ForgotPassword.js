"use client";

import { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    ImageBackground,
    StatusBar,
    Platform,
    KeyboardAvoidingView,
    ScrollView,
    Alert,
    ActivityIndicator,
} from "react-native";
import { ArrowLeft } from "lucide-react-native";
import api from "../../api";

const { width, height } = Dimensions.get("window");

const ForgotPasswordScreen = ({ navigation }) => {
    const [email, setEmail] = useState("");
    const [focusedInput, setFocusedInput] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleReset = async () => {
        if (!email.trim()) {
            Alert.alert("Error", "Please enter your email address.");
            return;
        }

        setIsLoading(true);
        try {
            await api.post("/auth/forgot-password", {
                email: email.trim(),
            });
            Alert.alert(
                "Check your email",
                "If an account exists for that email, a password reset link has been sent.",
            );
            navigation.navigate("login");
        } catch (error) {
            Alert.alert(
                "Reset failed",
                error.response?.data?.message ||
                    "Could not send reset link. Please try again.",
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.container}
        >
            <StatusBar barStyle="light-content" backgroundColor="#1a4d2e" />

            <ImageBackground
                source={require("../../assets/road.jpg")}
                style={styles.backgroundImage}
                resizeMode="cover"
            >
                <View style={styles.overlay} />

                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={() => navigation.goBack()}
                        >
                            <ArrowLeft color="#FFFFFF" size={28} />
                        </TouchableOpacity>

                        <Text style={styles.title}>Forgot Password</Text>
                        <Text style={styles.subtitle}>
                            Enter the email linked to your account and we'll
                            send you a link to reset your password.
                        </Text>
                    </View>

                    {/* Form Content */}
                    <View style={styles.formContainer}>
                        <View style={styles.fieldContainer}>
                            <Text style={styles.label}>Email</Text>
                            <TextInput
                                style={[
                                    styles.input,
                                    focusedInput === "email" &&
                                        styles.inputFocused,
                                ]}
                                placeholder="Type your email"
                                placeholderTextColor="#999"
                                value={email}
                                onChangeText={setEmail}
                                onFocus={() => setFocusedInput("email")}
                                onBlur={() => setFocusedInput(null)}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoCorrect={false}
                            />
                        </View>

                        <TouchableOpacity
                            style={[
                                styles.resetButton,
                                (isLoading || !email.trim()) &&
                                    styles.resetButtonDisabled,
                            ]}
                            onPress={handleReset}
                            disabled={isLoading || !email.trim()}
                        >
                            {isLoading ? (
                                <ActivityIndicator
                                    size="small"
                                    color="#FFFFFF"
                                />
                            ) : (
                                <Text style={styles.resetButtonText}>
                                    Send Reset Link
                                </Text>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.backToLogin}
                            onPress={() => navigation.navigate("login")}
                        >
                            <Text style={styles.backToLoginText}>
                                Back to Sign In
                            </Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </ImageBackground>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    backgroundImage: {
        flex: 1,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0, 0, 0, 0.2)",
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: "flex-end",
    },
    header: {
        paddingHorizontal: width * 0.06,
        paddingTop: Platform.OS === "ios" ? height * 0.08 : height * 0.05,
        paddingBottom: height * 0.04,
    },
    backButton: {
        marginBottom: height * 0.02,
    },
    title: {
        fontSize: width * 0.09,
        fontWeight: "bold",
        color: "#FFFFFF",
        marginBottom: height * 0.015,
    },
    subtitle: {
        fontSize: width * 0.04,
        color: "#E8F0EB",
        lineHeight: 22,
        paddingRight: width * 0.04,
    },
    formContainer: {
        backgroundColor: "#FFFFFF",
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        paddingHorizontal: width * 0.06,
        paddingTop: height * 0.04,
        paddingBottom: height * 0.05,
    },
    fieldContainer: {
        marginBottom: height * 0.025,
    },
    label: {
        fontSize: width * 0.04,
        fontWeight: "600",
        color: "#1a1a1a",
        marginBottom: height * 0.01,
    },
    input: {
        backgroundColor: "#FFFFFF",
        borderWidth: 1.5,
        borderColor: "#E0E0E0",
        borderRadius: 12,
        paddingHorizontal: width * 0.04,
        paddingVertical: height * 0.018,
        fontSize: width * 0.04,
        color: "#1a1a1a",
    },
    inputFocused: {
        borderColor: "#2d7a4f",
    },
    resetButton: {
        backgroundColor: "#2d7a4f",
        borderRadius: 12,
        paddingVertical: height * 0.02,
        alignItems: "center",
        marginTop: height * 0.01,
        shadowColor: "#2d7a4f",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    resetButtonDisabled: {
        backgroundColor: "#9fc0ad",
        shadowOpacity: 0,
        elevation: 0,
    },
    resetButtonText: {
        color: "#FFFFFF",
        fontSize: width * 0.045,
        fontWeight: "bold",
    },
    backToLogin: {
        alignItems: "center",
        paddingVertical: height * 0.02,
    },
    backToLoginText: {
        color: "#2d7a4f",
        fontSize: width * 0.04,
        fontWeight: "600",
        textDecorationLine: "underline",
    },
});

export default ForgotPasswordScreen;
