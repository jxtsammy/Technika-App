import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    Dimensions,
    Image,
    StatusBar,
} from "react-native";
import { ArrowLeft, Alert } from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../../api";

const { height, width } = Dimensions.get("window");

const PhoneVerification = ({ navigation, route }) => {
    const [otp, setOtp] = useState(["", "", "", ""]);
    const [timer, setTimer] = useState(30); //30-second countdown tracker
    const [canResend, setCanResend] = useState(false);

    // Reused for two flows:
    //  - signup verification (default): hits /auth/verify-otp, then -> 'success'
    //  - login 2FA: hits /auth/verify-login-otp with the preAuthToken from
    //    Login.js, then completes the session and -> 'home'
    const {
        mode = "signup",
        preAuthToken,
        rememberMe,
        email,
    } = route?.params || {};

    // Start countdown effect when screen loads
    useEffect(() => {
        let interval = null;
        if (timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        } else {
            setCanResend(true);
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [timer]);

    const handleVerify = async () => {
        const code = otp.join("");

        if (code.length !== 4) {
            Alert.alert("Error", "Please enter the complete 4-digit code");
            return;
        }

        try {
            if (mode === "login") {
                const response = await api.post("/auth/verify-login-otp", {
                    preAuthToken,
                    otp: code,
                });
                const { token, _id, firstName, lastName, role } = response.data;

                await AsyncStorage.setItem("token", token);
                await AsyncStorage.setItem(
                    "user",
                    JSON.stringify({ _id, firstName, lastName, role }),
                );
                if (rememberMe && email) {
                    await AsyncStorage.setItem("rememberedEmail", email);
                }

                navigation.replace("home");
                return;
            }

            await api.post("/auth/verify-otp", { otp: code });
            navigation.replace("success");
        } catch (error) {
            Alert.alert(
                "Error",
                error.response?.data?.message || "Verification failed",
            );
        }
    };

    const handleChangeText = (text, index) => {
        const newOtp = [...otp];
        newOtp[index] = text;
        setOtp(newOtp);

        // Auto-focus the next input if typing a digit
        if (text && index < otp.length - 1) {
            inputs[index + 1].focus();
        }
    };

    const handleKeyPress = (key, index) => {
        if (key === "Backspace" && otp[index] === "" && index > 0) {
            inputs[index - 1].focus();
        }
    };

    let inputs = [];

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />

            {/* Back Arrow Button (Lucide React) */}
            <TouchableOpacity
                style={styles.backArrowContainer}
                onPress={() => navigation.goBack()}
            >
                <ArrowLeft color="#1a1a1a" size={28} />
            </TouchableOpacity>

            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.innerContainer}
            >
                {/* Top Section with Illustration Icon */}
                <View style={styles.topSection}>
                    <Image
                        source={require("../../assets/OTPIcon.png")} // Replace with your verification icon path
                        style={styles.illustration}
                        resizeMode="contain"
                    />
                </View>

                {/* Centered Bottom Container Sheet */}
                <View style={styles.bottomSheet}>
                    <Text style={styles.title}>Enter OTP</Text>
                    <Text style={styles.subtitle}>
                        Please enter the 4-digit OTP code that was sent to your
                        phone number. Do not share this code.
                    </Text>

                    {/* Centered OTP Inputs Grid */}
                    <View style={styles.otpContainer}>
                        {otp.map((digit, index) => (
                            <TextInput
                                key={index}
                                style={[
                                    styles.otpInput,
                                    digit ? styles.otpInputFilled : null,
                                ]}
                                keyboardType="numeric"
                                maxLength={1}
                                value={digit}
                                onChangeText={(text) =>
                                    handleChangeText(text, index)
                                }
                                onKeyPress={({ nativeEvent: { key } }) =>
                                    handleKeyPress(key, index)
                                }
                                ref={(ref) => (inputs[index] = ref)}
                            />
                        ))}
                    </View>

                    {/* Center-aligned Resend Timer Prompt */}
                    <View style={styles.resendContainer}>
                        <Text style={styles.resendText}>
                            Didn't receive code?{" "}
                        </Text>
                        <TouchableOpacity
                            onPress={handleVerify}
                            disabled={!canResend}
                        >
                            <Text
                                style={[
                                    styles.resendLink,
                                    !canResend && styles.resendLinkDisabled,
                                ]}
                            >
                                {canResend
                                    ? "Resend"
                                    : `Resend in 0:${timer < 10 ? `0${timer}` : timer}`}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Standard Submission Verification CTA */}
                    <TouchableOpacity
                        style={styles.verifyButton}
                        onPress={handleVerify}
                    >
                        <Text style={styles.verifyText}>Verify</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    innerContainer: {
        flex: 1,
        justifyContent: "flex-end",
    },
    backArrowContainer: {
        position: "absolute",
        top: 50,
        left: 20,
        zIndex: 10,
    },
    topSection: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingTop: 40,
    },
    illustration: {
        width: 300,
        height: 300,
    },
    bottomSheet: {
        backgroundColor: "#000",
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        paddingHorizontal: 24,
        paddingTop: 35,
        paddingBottom: 40,
        minHeight: height * 0.45,
        alignItems: "center", // 🎯 Center aligns children
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 10,
    },
    title: {
        fontSize: 26,
        fontWeight: "bold",
        color: "#ffffff",
        marginBottom: 10,
        textAlign: "center",
    },
    subtitle: {
        fontSize: 15,
        color: "#808080",
        marginBottom: 35,
        textAlign: "center",
    },
    otpContainer: {
        flexDirection: "row",
        justifyContent: "center", // 🎯 Centers inputs
        gap: 12,
        marginBottom: 30,
        width: "100%",
    },
    otpInput: {
        width: 50,
        height: 55,
        borderWidth: 1.5,
        borderRadius: 12,
        borderColor: "#E5E7EB",
        textAlign: "center",
        fontSize: 20,
        backgroundColor: "#F9FAFB",
        fontWeight: "bold",
        color: "#1a1a1a",
    },
    otpInputFilled: {
        borderColor: "#007a3f",
        backgroundColor: "#fff",
    },
    resendContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center", // 🎯 Centers timer row
        marginBottom: 35,
    },
    resendText: {
        fontSize: 14,
        color: "#808080",
    },
    resendLink: {
        fontSize: 14,
        color: "#007a3f",
        fontWeight: "bold",
        textDecorationLine: "underline",
    },
    resendLinkDisabled: {
        color: "#a0a0a0", // Greyed out color when timer is running
        textDecorationLine: "none",
    },
    verifyButton: {
        backgroundColor: "#007a3f",
        width: "100%",
        paddingVertical: 18,
        borderRadius: 30,
        alignItems: "center",
        shadowColor: "#007a3f",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    verifyText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
});

export default PhoneVerification;
