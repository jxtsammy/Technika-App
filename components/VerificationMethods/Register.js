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
} from "react-native";
import CountryPicker from "react-native-country-picker-modal";
import { Eye, EyeOff, ArrowLeft } from "lucide-react-native";
import api from "../../api";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width, height } = Dimensions.get("window");

const SignUpScreen = ({ navigation }) => {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [focusedInput, setFocusedInput] = useState(null);

    const [countryCode, setCountryCode] = useState("GH");
    const [callingCode, setCallingCode] = useState("233");
    const [showCountryPicker, setShowCountryPicker] = useState(false);

    const onSelectCountry = (country) => {
        setCountryCode(country.cca2);
        setCallingCode(country.callingCode[0]);
    };

    const validatePassword = (pass) => {
        const hasUpperCase = /[A-Z]/.test(pass);
        const hasLowerCase = /[a-z]/.test(pass);
        const hasNumbers = /\d/.test(pass);
        return hasUpperCase && hasLowerCase && hasNumbers;
    };

    const handleRegister = async () => {
        if (
            !firstName.trim() ||
            !lastName.trim() ||
            !email.trim() ||
            !phoneNumber.trim() ||
            !password ||
            !confirmPassword
        ) {
            Alert.alert("Error", "Please fill in all fields");
            return;
        }
        if (!validatePassword(password)) {
            Alert.alert(
                "Error",
                "Password must contain uppercase letters, lowercase letters, and numbers",
            );
            return;
        }
        if (password !== confirmPassword) {
            Alert.alert("Error", "Passwords do not match");
            return;
        }

        const completePhoneNumber = `+${callingCode}${phoneNumber}`;

        try {
            const response = await api.post("/auth/register", {
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                email: email.trim(),
                phoneNumber: completePhoneNumber,
                password,
            });

            const {
                token,
                firstName: fName,
                lastName: lName,
                role,
            } = response.data;
            await AsyncStorage.setItem("token", token);
            await AsyncStorage.setItem(
                "user",
                JSON.stringify({ firstName: fName, lastName: lName, role }),
            );

            // Keep your existing verification flow — just pass userData as you already do
            const userData = {
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                email: email.trim(),
                phoneNumber: completePhoneNumber,
            };
            navigation.navigate("verification", { userData });
        } catch (error) {
            Alert.alert(
                "Error",
                error.response?.data?.message ||
                    "Registration failed. Try again.",
            );
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

                {/* Outer ScrollView containing both Header AND Form */}
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

                        <Text style={styles.title}>Register</Text>
                        <View style={styles.signInContainer}>
                            <Text style={styles.signInText}>
                                Already have an account?{" "}
                            </Text>
                            <TouchableOpacity
                                onPress={() => navigation.navigate("Login")}
                            >
                                <Text style={styles.signInLink}>Log In</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Form Content */}
                    <View style={styles.formContainer}>
                        {/* Name Fields Row */}
                        <View style={styles.nameRow}>
                            <View style={styles.nameFieldContainer}>
                                <Text style={styles.label}>First Name</Text>
                                <TextInput
                                    style={[
                                        styles.input,
                                        focusedInput === "firstName" &&
                                            styles.inputFocused,
                                    ]}
                                    placeholder="First name"
                                    placeholderTextColor="#999"
                                    value={firstName}
                                    onChangeText={setFirstName}
                                    onFocus={() => setFocusedInput("firstName")}
                                    onBlur={() => setFocusedInput(null)}
                                />
                            </View>

                            <View style={styles.nameFieldContainer}>
                                <Text style={styles.label}>Last Name</Text>
                                <TextInput
                                    style={[
                                        styles.input,
                                        focusedInput === "lastName" &&
                                            styles.inputFocused,
                                    ]}
                                    placeholder="Last name"
                                    placeholderTextColor="#999"
                                    value={lastName}
                                    onChangeText={setLastName}
                                    onFocus={() => setFocusedInput("lastName")}
                                    onBlur={() => setFocusedInput(null)}
                                />
                            </View>
                        </View>

                        {/* Email Field */}
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
                            />
                        </View>

                        {/* Phone Number Field */}
                        <View style={styles.fieldContainer}>
                            <Text style={styles.label}>Phone Number</Text>
                            <View
                                style={[
                                    styles.phoneContainer,
                                    focusedInput === "phone" &&
                                        styles.inputFocused,
                                ]}
                            >
                                <TouchableOpacity
                                    style={styles.countryPickerButton}
                                    onPress={() => setShowCountryPicker(true)}
                                >
                                    <CountryPicker
                                        countryCode={countryCode}
                                        withFilter
                                        withFlag
                                        withCallingCode
                                        withEmoji
                                        onSelect={onSelectCountry}
                                        visible={showCountryPicker}
                                        onClose={() =>
                                            setShowCountryPicker(false)
                                        }
                                    />
                                    <Text style={styles.callingCode}>
                                        +{callingCode}
                                    </Text>
                                </TouchableOpacity>

                                <TextInput
                                    style={styles.phoneInput}
                                    placeholder="Type phone number"
                                    placeholderTextColor="#999"
                                    value={phoneNumber}
                                    onChangeText={setPhoneNumber}
                                    onFocus={() => setFocusedInput("phone")}
                                    onBlur={() => setFocusedInput(null)}
                                    keyboardType="phone-pad"
                                />
                            </View>
                        </View>

                        {/* Password Field */}
                        <View style={styles.fieldContainer}>
                            <Text style={styles.label}>Create Password</Text>
                            <View
                                style={[
                                    styles.passwordContainer,
                                    focusedInput === "password" &&
                                        styles.inputFocused,
                                ]}
                            >
                                <TextInput
                                    style={styles.passwordInput}
                                    placeholder="Type your password"
                                    placeholderTextColor="#999"
                                    value={password}
                                    onChangeText={setPassword}
                                    onFocus={() => setFocusedInput("password")}
                                    onBlur={() => setFocusedInput(null)}
                                    secureTextEntry={!showPassword}
                                />
                                <TouchableOpacity
                                    style={styles.eyeIcon}
                                    onPress={() =>
                                        setShowPassword(!showPassword)
                                    }
                                >
                                    {showPassword ? (
                                        <EyeOff color="#999" size={22} />
                                    ) : (
                                        <Eye color="#999" size={22} />
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Confirm Password Field */}
                        <View style={styles.fieldContainer}>
                            <Text style={styles.label}>Confirm Password</Text>
                            <View
                                style={[
                                    styles.passwordContainer,
                                    focusedInput === "confirmPassword" &&
                                        styles.inputFocused,
                                ]}
                            >
                                <TextInput
                                    style={styles.passwordInput}
                                    placeholder="Confirm your password"
                                    placeholderTextColor="#999"
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    onFocus={() =>
                                        setFocusedInput("confirmPassword")
                                    }
                                    onBlur={() => setFocusedInput(null)}
                                    secureTextEntry={!showConfirmPassword}
                                />
                                <TouchableOpacity
                                    style={styles.eyeIcon}
                                    onPress={() =>
                                        setShowConfirmPassword(
                                            !showConfirmPassword,
                                        )
                                    }
                                >
                                    {showConfirmPassword ? (
                                        <EyeOff color="#999" size={22} />
                                    ) : (
                                        <Eye color="#999" size={22} />
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Register Button */}
                        <TouchableOpacity
                            style={styles.registerButton}
                            onPress={handleRegister}
                        >
                            <Text style={styles.registerButtonText}>
                                Register
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
        justifyContent: "flex-end", // Force push the white sheet to the bottom
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
    signInContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    signInText: {
        fontSize: width * 0.04,
        color: "#FFFFFF",
    },
    signInLink: {
        fontSize: width * 0.045,
        color: "#FFFFFF",
        fontWeight: "bold",
        textDecorationLine: "underline",
    },
    formContainer: {
        backgroundColor: "#FFFFFF",
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        paddingHorizontal: width * 0.06,
        paddingTop: height * 0.04,
        paddingBottom: height * 0.05, // Added bottom padding inside scroll
    },
    nameRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: height * 0.025,
    },
    nameFieldContainer: {
        flex: 0.47, // Equal side-by-side spacing
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
    phoneContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
        borderWidth: 1.5,
        borderColor: "#E0E0E0",
        borderRadius: 12,
        paddingHorizontal: width * 0.04,
    },
    countryPickerButton: {
        flexDirection: "row",
        alignItems: "center",
        paddingRight: width * 0.03,
        borderRightWidth: 1,
        borderRightColor: "#E0E0E0",
    },
    callingCode: {
        fontSize: width * 0.04,
        color: "#1a1a1a",
        marginLeft: width * 0.02,
    },
    phoneInput: {
        flex: 1,
        paddingVertical: height * 0.018,
        paddingHorizontal: width * 0.03,
        fontSize: width * 0.04,
        color: "#1a1a1a",
    },
    passwordContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
        borderWidth: 1.5,
        borderColor: "#E0E0E0",
        borderRadius: 12,
        paddingHorizontal: width * 0.04,
    },
    passwordInput: {
        flex: 1,
        paddingVertical: height * 0.018,
        fontSize: width * 0.04,
        color: "#1a1a1a",
    },
    eyeIcon: {
        padding: width * 0.02,
    },
    registerButton: {
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
    registerButtonText: {
        color: "#FFFFFF",
        fontSize: width * 0.045,
        fontWeight: "bold",
    },
});

export default SignUpScreen;
