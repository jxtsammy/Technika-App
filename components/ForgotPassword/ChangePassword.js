import React, { useState } from "react";
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Alert,
    ActivityIndicator,
} from "react-native";
import { ChevronLeft, Eye, EyeOff, Check, X } from "lucide-react-native";
import api from "../../api";

export default function NewPasswordScreen({ navigation, route }) {
    const { token } = route.params;

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [focusedInput, setFocusedInput] = useState(null);

    // Validation Rules (> 6 chars, contains letter, number, and symbol)
    // Note: backend only actually enforces >= 6 characters — these extra
    // rules (letter/number/symbol) are a stricter client-side UX choice on
    // top of that, not a backend requirement.
    const isMinLength = password.length > 6;
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const isMatching = password !== "" && password === confirmPassword;

    const passwordRules = [
        { label: "More than 6 characters", met: isMinLength },
        { label: "At least one letter", met: hasLetter },
        { label: "At least one number", met: hasNumber },
        { label: "At least one symbol (!@#$%^&*)", met: hasSymbol },
    ];

    const isFormValid = passwordRules.every((r) => r.met) && isMatching;

    const handleSubmit = async () => {
        const unmet = passwordRules.filter((r) => !r.met);
        if (unmet.length > 0) {
            Alert.alert(
                "Invalid Password",
                `Your password must meet all requirements:\n\n• ${unmet.map((r) => r.label).join("\n• ")}`,
            );
            return;
        }

        if (!isMatching) {
            Alert.alert(
                "Password Mismatch",
                "New password and confirm password do not match.",
            );
            return;
        }

        setIsLoading(true);
        try {
            // This is where the code actually gets checked against the backend —
            // there's no separate "verify code" step, it's validated together
            // with the new password here.
            await api.post("/auth/reset-password", { token, password });
            setIsLoading(false);
            navigation.reset({
                index: 0,
                routes: [{ name: "passwordUpdateSuccess" }],
            });
        } catch (error) {
            setIsLoading(false);
            const message =
                error?.response?.data?.message ||
                "Could not reset password. Please check your connection and try again.";

            // A wrong/expired code surfaces here (not on the code-entry screen),
            // since that's when the backend actually checks it — send them back
            // to re-enter or request a fresh code.
            Alert.alert("Reset Failed", message, [
                { text: "Try Again" },
                { text: "Go Back", onPress: () => navigation.goBack() },
            ]);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
            >
                {/* Header Area */}
                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={() => navigation?.goBack()}
                        style={styles.backButton}
                    >
                        <ChevronLeft size={28} color="#000000" />
                    </TouchableOpacity>
                    <Text style={styles.title}>Update Password</Text>
                    <Text style={styles.subtitle}>
                        Please enter and confirm your new password below.
                    </Text>
                </View>

                {/* Form Inputs */}
                <View style={styles.form}>
                    {/* New Password Input */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>New Password</Text>
                        <View
                            style={[
                                styles.inputContainer,
                                focusedInput === "password" &&
                                    styles.inputFocused,
                            ]}
                        >
                            <TextInput
                                style={styles.input}
                                placeholder="Enter new password"
                                placeholderTextColor="#94A3B8"
                                secureTextEntry={!showPassword}
                                value={password}
                                onChangeText={setPassword}
                                onFocus={() => setFocusedInput("password")}
                                onBlur={() => setFocusedInput(null)}
                                autoCapitalize="none"
                                editable={!isLoading}
                            />
                            <TouchableOpacity
                                onPress={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? (
                                    <EyeOff size={20} color="#007a3f" />
                                ) : (
                                    <Eye size={20} color="#94A3B8" />
                                )}
                            </TouchableOpacity>
                        </View>

                        {/* Persistent Live Checklist — visible once typing starts,
                stays visible after tapping away (e.g. to Confirm Password)
                instead of disappearing on blur, so progress isn't lost from view */}
                        {password.length > 0 && (
                            <View style={styles.checklistBox}>
                                {passwordRules.map((rule, idx) => (
                                    <View key={idx} style={styles.checklistRow}>
                                        {rule.met ? (
                                            <Check size={14} color="#16A34A" />
                                        ) : (
                                            <X size={14} color="#94A3B8" />
                                        )}
                                        <Text
                                            style={[
                                                styles.checklistText,
                                                rule.met &&
                                                    styles.checklistTextMet,
                                            ]}
                                        >
                                            {rule.label}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        )}
                    </View>

                    {/* Confirm Password Input */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Confirm New Password</Text>
                        <View
                            style={[
                                styles.inputContainer,
                                focusedInput === "confirmPassword" &&
                                    styles.inputFocused,
                            ]}
                        >
                            <TextInput
                                style={styles.input}
                                placeholder="Re-enter new password"
                                placeholderTextColor="#94A3B8"
                                secureTextEntry={!showConfirmPassword}
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                onFocus={() =>
                                    setFocusedInput("confirmPassword")
                                }
                                onBlur={() => setFocusedInput(null)}
                                autoCapitalize="none"
                                editable={!isLoading}
                            />
                            <TouchableOpacity
                                onPress={() =>
                                    setShowConfirmPassword(!showConfirmPassword)
                                }
                            >
                                {showConfirmPassword ? (
                                    <EyeOff size={20} color="#007a3f" />
                                ) : (
                                    <Eye size={20} color="#94A3B8" />
                                )}
                            </TouchableOpacity>
                        </View>

                        {/* Mismatch warning — stays visible regardless of focus, same
                reasoning as the checklist above */}
                        {confirmPassword.length > 0 && !isMatching && (
                            <View style={styles.checklistBox}>
                                <View style={styles.checklistRow}>
                                    <X size={14} color="#DC2626" />
                                    <Text style={styles.checklistTextError}>
                                        Passwords do not match
                                    </Text>
                                </View>
                            </View>
                        )}
                    </View>
                </View>

                {/* Continue Button */}
                <TouchableOpacity
                    style={[
                        styles.button,
                        (!isFormValid || isLoading) && styles.buttonDisabled,
                    ]}
                    onPress={handleSubmit}
                    disabled={!isFormValid || isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator color="#FFFFFF" />
                    ) : (
                        <Text style={styles.buttonText}>Continue</Text>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingTop: 60,
        paddingBottom: 24,
        justifyContent: "space-between",
    },
    header: {
        marginBottom: 32,
    },
    backButton: {
        marginBottom: 12,
        width: 40,
        height: 40,
        justifyContent: "center",
    },
    title: {
        fontSize: 28,
        fontWeight: "700",
        color: "#000000",
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 15,
        color: "#666666",
        lineHeight: 22,
    },
    form: {
        flex: 1,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: "600",
        color: "#1E293B",
        marginBottom: 8,
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        height: 65,
        borderRadius: 16,
        backgroundColor: "#F8FAFC",
        borderWidth: 1,
        borderColor: "#E2E8F0",
        paddingHorizontal: 16,
    },
    inputFocused: {
        borderColor: "#007a3f",
        borderWidth: 1.5,
        backgroundColor: "#FFFFFF",
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: "#000000",
    },
    checklistBox: {
        marginTop: 10,
        paddingHorizontal: 4,
    },
    checklistRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 4,
        gap: 6,
    },
    checklistText: {
        fontSize: 12,
        color: "#94A3B8",
    },
    checklistTextMet: {
        color: "#16A34A",
        textDecorationLine: "line-through",
    },
    checklistTextError: {
        fontSize: 12,
        color: "#DC2626",
    },
    button: {
        height: 65,
        backgroundColor: "#007a3f",
        borderRadius: 16,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 13,
    },
    buttonDisabled: {
        backgroundColor: "#007a3f",
        opacity: 0.6,
    },
    buttonText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "600",
    },
});
