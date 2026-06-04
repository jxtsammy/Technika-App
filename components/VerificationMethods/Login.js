"use client";
import { useState, useEffect } from "react";
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    TouchableOpacity,
    StatusBar,
    Dimensions,
    Platform,
    KeyboardAvoidingView,
    TouchableWithoutFeedback,
    Keyboard,
    ActivityIndicator,
    ImageBackground,
    Alert, // ✅ Added Alert
} from "react-native";
import { BlurView } from "expo-blur";
import { Eye, EyeOff } from "lucide-react-native";
import * as LocalAuthentication from "expo-local-authentication"; // ✅ Added Auth
import api from "../../api";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get("window");

const SignInScreen = ({ navigation }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const dismissKeyboard = () => {
        Keyboard.dismiss();
    };

    useEffect(() => {
        triggerBiometricAuth();
        AsyncStorage.getItem("rememberedEmail").then((saved) => {
            if (saved) {
                setEmail(saved);
                setRememberMe(true);
            }
        });
    }, []);

    const triggerBiometricAuth = async () => {
        const savedToken = await AsyncStorage.getItem("token");
        if (!savedToken) return; // No previous session, show form

        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        const isEnrolled = await LocalAuthentication.isEnrolledAsync();
        if (!hasHardware || !isEnrolled) return;

        const result = await LocalAuthentication.authenticateAsync({
            promptMessage: "Sign in to your account",
            disableDeviceFallback: true,
            cancelLabel: "Use password",
        });

        if (result.success) {
            navigation.navigate("home"); // Token already exists, go straight in
        }
    };

    // 🔐 Biometric check before logging in
    const handleSignIn = async () => {
        if (!email.trim() || !password.trim()) {
            Alert.alert("Error", "Please enter both email and password.");
            return;
        }
        runLoginProcess(); // Straight to login, no biometric check

        // const hasHardware = await LocalAuthentication.hasHardwareAsync();
        // const isEnrolled = await LocalAuthentication.isEnrolledAsync();

        // if (!hasHardware || !isEnrolled) {
        //   // Fallback if the user has no FaceID/Fingerprint set up on their phone
        //   Alert.alert(
        //     "Secure Sign-In",
        //     "Biometrics aren't set up. Proceed with password?",
        //     [
        //       { text: "Cancel", style: "cancel" },
        //       { text: "Continue", onPress: () => runLoginProcess() }
        //     ]
        //   );
        //   return;
        // }

        // const result = await LocalAuthentication.authenticateAsync({
        //   promptMessage: 'Authenticate to Sign In',
        //   disableDeviceFallback: false, // Allows phone passcode pin fallback
        // });

        // if (result.success) {
        //   runLoginProcess();
        // }
    };

    // 🏃‍♀️ The actual API simulation
    const runLoginProcess = async () => {
        setIsLoading(true);
        try {
            const response = await api.post("/auth/login", { email, password });
            const { token, firstName, lastName, role } = response.data;

            await AsyncStorage.setItem("token", token);
            await AsyncStorage.setItem(
                "user",
                JSON.stringify({ firstName, lastName, role }),
            ); //reload

            if (rememberMe) {
                await AsyncStorage.setItem("rememberedEmail", email);
            }

            navigation.navigate("home");
        } catch (error) {
            Alert.alert(
                "Login failed",
                error.response?.data?.message ||
                    "Please check your credentials.",
            );
        } finally {
            setIsLoading(false);
        }
    };

    const isButtonDisabled = isLoading || !email.trim() || !password.trim();

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <StatusBar barStyle="light-content" />

            {/* Background Image and Blur Overlay */}
            <ImageBackground
                source={require("../../assets/road.jpg")} // Replace with your actual image path
                style={styles.backgroundImage}
            >
                <BlurView
                    intensity={100}
                    tint="dark"
                    style={StyleSheet.absoluteFill}
                />
            </ImageBackground>

            <TouchableWithoutFeedback onPress={dismissKeyboard}>
                <View style={styles.contentWrapper}>
                    {/* Header Section */}
                    <View style={styles.headerSection}>
                        <View style={styles.titleContainer}>
                            <Text style={styles.title}>
                                Sign in to your{"\n"}Account
                            </Text>
                            <View style={styles.signUpContainer}>
                                <Text style={styles.signUpText}>
                                    Don't have an account?{" "}
                                </Text>
                                <TouchableOpacity
                                    onPress={() =>
                                        navigation.navigate("signup")
                                    }
                                >
                                    <Text style={styles.signUpLink}>
                                        Sign Up
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>

                    {/* Form Section */}
                    <View style={styles.formSection}>
                        <View style={styles.formContentWrapper}>
                            {/* Email Input */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Email</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter your email"
                                    placeholderTextColor="#9CA3AF"
                                    value={email}
                                    onChangeText={setEmail}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                />
                            </View>

                            {/* Password Input */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Password</Text>
                                <View style={styles.passwordContainer}>
                                    <TextInput
                                        style={styles.passwordInput}
                                        placeholder="Enter your password"
                                        placeholderTextColor="#9CA3AF"
                                        value={password}
                                        onChangeText={setPassword}
                                        secureTextEntry={!showPassword}
                                    />
                                    <TouchableOpacity
                                        style={styles.eyeButton}
                                        onPress={() =>
                                            setShowPassword(!showPassword)
                                        }
                                    >
                                        {showPassword ? (
                                            <EyeOff size={20} color="#9CA3AF" />
                                        ) : (
                                            <Eye size={20} color="#9CA3AF" />
                                        )}
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* Remember Me & Forgot Password */}
                            <View style={styles.optionsContainer}>
                                <TouchableOpacity
                                    style={styles.rememberMeContainer}
                                    onPress={() => setRememberMe(!rememberMe)}
                                >
                                    <View
                                        style={[
                                            styles.checkbox,
                                            rememberMe &&
                                                styles.checkboxChecked,
                                        ]}
                                    >
                                        {rememberMe && (
                                            <Text style={styles.checkmark}>
                                                ✓
                                            </Text>
                                        )}
                                    </View>
                                    <Text style={styles.rememberMeText}>
                                        Remember me
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() =>
                                        navigation.navigate("ForgotPassword")
                                    }
                                >
                                    <Text style={styles.forgotPasswordText}>
                                        Forgot Password ?
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            {/* Sign In Button */}
                            <TouchableOpacity
                                style={[
                                    styles.signInButton,
                                    isButtonDisabled &&
                                        styles.signInButtonDisabled,
                                ]}
                                onPress={handleSignIn}
                                disabled={isButtonDisabled}
                            >
                                {isLoading ? (
                                    <ActivityIndicator
                                        size="small"
                                        color="#fff"
                                    />
                                ) : (
                                    <Text style={styles.signInButtonText}>
                                        Sign In
                                    </Text>
                                )}
                            </TouchableOpacity>

                            {/* Terms */}
                            <View style={styles.termsContainer}>
                                <Text style={styles.termsText}>
                                    By signing in, you agree to the{" "}
                                    <Text style={styles.termsLink}>
                                        Terms of Service
                                    </Text>{" "}
                                    and{" "}
                                    <Text style={styles.termsLink}>
                                        Data Processing Agreement
                                    </Text>
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#1a1a2e",
    },
    backgroundImage: {
        position: "absolute",
        width: "100%",
        height: "100%",
        resizeMode: "cover",
    },
    contentWrapper: {
        flexGrow: 1,
        justifyContent: "space-between",
    },
    headerSection: {
        paddingTop: Platform.OS === "ios" ? 230 : 220,
        paddingHorizontal: 24,
        paddingBottom: 5,
        flexGrow: 1,
    },
    titleContainer: {
        marginBottom: 30,
    },
    title: {
        fontSize: 36,
        fontWeight: "bold",
        color: "#fff",
        lineHeight: 44,
        marginBottom: 16,
    },
    signUpContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    signUpText: {
        fontSize: 16,
        color: "#9CA3AF",
    },
    signUpLink: {
        fontSize: 16,
        color: "#fff",
        fontWeight: "bold",
        textDecorationLine: "underline",
    },
    formSection: {
        backgroundColor: "#fff",
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingTop: 32,
        paddingBottom: 30,
    },
    formContentWrapper: {
        paddingHorizontal: 24,
    },
    inputGroup: {
        marginBottom: 24,
    },
    inputLabel: {
        fontSize: 16,
        fontWeight: "500",
        color: "#374151",
        marginBottom: 8,
    },
    input: {
        height: 56,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        borderRadius: 12,
        paddingHorizontal: 16,
        fontSize: 16,
        color: "#111827",
        backgroundColor: "#F9FAFB",
    },
    passwordContainer: {
        position: "relative",
    },
    passwordInput: {
        height: 56,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingRight: 50,
        fontSize: 16,
        color: "#111827",
        backgroundColor: "#F9FAFB",
    },
    eyeButton: {
        position: "absolute",
        right: 16,
        top: 18,
        padding: 4,
    },
    optionsContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 32,
    },
    rememberMeContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    checkbox: {
        width: 20,
        height: 20,
        borderWidth: 2,
        borderColor: "#D1D5DB",
        borderRadius: 4,
        marginRight: 8,
        justifyContent: "center",
        alignItems: "center",
    },
    checkboxChecked: {
        backgroundColor: "#007a3f", // Custom theme green
        borderColor: "#007a3f",
    },
    checkmark: {
        color: "#fff",
        fontSize: 12,
        fontWeight: "bold",
    },
    rememberMeText: {
        fontSize: 14,
        color: "#6B7280",
    },
    forgotPasswordText: {
        fontSize: 14,
        color: "#111",
        fontWeight: "500",
    },
    signInButton: {
        height: 56,
        borderRadius: 30,
        marginBottom: 32,
        backgroundColor: "#007a3f",
        alignItems: "center",
        justifyContent: "center",
        ...Platform.select({
            ios: {
                shadowColor: "#007a3f",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
            },
            android: {
                elevation: 3,
            },
        }),
    },
    signInButtonDisabled: {
        backgroundColor: "grey",
    },
    signInButtonText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "600",
    },
    termsContainer: {
        alignItems: "center",
    },
    termsText: {
        fontSize: 12,
        color: "#6B7280",
        textAlign: "center",
        lineHeight: 18,
        paddingBottom: Platform.OS === "ios" ? 0 : 40,
    },
    termsLink: {
        color: "#007a3f",
        fontWeight: "600",
    },
});

export default SignInScreen;
