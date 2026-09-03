import React, { useState } from "react";
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    TouchableOpacity,
    StatusBar,
    Alert,
    ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronLeft, Mail } from "lucide-react-native";
import api from "../../api";

export default function ForgotPasswordScreen({ navigation }) {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleVerify = async () => {
        if (!email.trim()) {
            Alert.alert("Error", "Please enter your email address.");
            return;
        }

        setIsLoading(true);
        try {
            // Backend always returns a generic success message whether or not the
            // email exists (avoids leaking which emails are registered), so this
            // call effectively always "succeeds" from the UI's point of view as
            // long as the request itself goes through.
            await api.post("/auth/forgot-password", { email: email.trim() });
            setIsLoading(false);
            navigation.navigate("forgotEmailVerification", {
                email: email.trim(),
            });
        } catch (error) {
            setIsLoading(false);
            Alert.alert(
                "Error",
                error?.response?.data?.message ||
                    "Could not send reset code. Please check your connection and try again.",
            );
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

            <View style={styles.content}>
                {/* Back Button */}
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <ChevronLeft color="#111827" size={20} />
                    <Text style={styles.backText}>Back</Text>
                </TouchableOpacity>

                {/* Header Text */}
                <View style={styles.headerContainer}>
                    <Text style={styles.title}>Forget Password?</Text>
                    <Text style={styles.subtitle}>
                        Enter your email address
                    </Text>
                </View>

                {/* Input Field */}
                <View style={styles.inputContainer}>
                    <Mail color="#9CA3AF" size={20} style={styles.icon} />
                    <TextInput
                        style={styles.input}
                        placeholder="Email"
                        placeholderTextColor="#9CA3AF"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        editable={!isLoading}
                    />
                </View>

                {/* Action Button */}
                <TouchableOpacity
                    style={[
                        styles.sendButton,
                        isLoading && styles.sendButtonDisabled,
                    ]}
                    onPress={handleVerify}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                        <Text style={styles.sendButtonText}>Send</Text>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
    },
    backButton: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 10,
        marginBottom: 20,
        marginLeft: -4,
    },
    backText: {
        color: "#111827",
        fontSize: 16,
        fontWeight: "400",
        marginLeft: 2,
    },
    headerContainer: {
        marginBottom: 32,
    },
    title: {
        color: "#111827",
        fontSize: 35,
        fontWeight: "700",
        lineHeight: 40,
        marginBottom: 12,
    },
    subtitle: {
        color: "#6B7280",
        fontSize: 18,
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F3F4F6",
        borderRadius: 12,
        paddingHorizontal: 16,
        height: 65,
        marginBottom: 24,
    },
    icon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        color: "#111827",
        fontSize: 16,
    },
    sendButton: {
        backgroundColor: "#007a3f",
        borderRadius: 26,
        height: 52,
        justifyContent: "center",
        alignItems: "center",
    },
    sendButtonDisabled: {
        opacity: 0.7,
    },
    sendButtonText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "600",
    },
});
