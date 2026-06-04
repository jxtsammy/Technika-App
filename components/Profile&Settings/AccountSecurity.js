import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Switch,
    Alert, // 👈 1. Added Alert
} from "react-native";
import CountryPicker from "react-native-country-picker-modal";
import Icon from "react-native-vector-icons/MaterialIcons";
import * as LocalAuthentication from "expo-local-authentication"; // 👈 2. Added Local Auth
import { useEffect } from "react";
import api from "../../api";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AccountSecurityScreen = ({ navigation }) => {
    const [countryCode, setCountryCode] = useState("GH");
    const [twoStepVerification, setTwoStepVerification] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState("");
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [deviceCount, setDeviceCount] = useState(0);

    useEffect(() => {
        loadSecurityData();
    }, []);

    const loadSecurityData = async () => {
        try {
            const [profileRes, devicesRes] = await Promise.all([
                api.get("/users/profile"),
                api.get("/users/devices"),
            ]);
            setTwoStepVerification(profileRes.data.twoStepVerification);
            setPhoneNumber(profileRes.data.phoneNumber || "");
            setDeviceCount(devicesRes.data.deviceTokens?.length || 0);
        } catch (error) {
            console.error("Failed to load security data:", error);
        }
    };

    // 🔐 3. Reusable Secure Action Handler
    const handleSecureAction = async (actionType) => {
        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        const isEnrolled = await LocalAuthentication.isEnrolledAsync();

        // Prompts change depending on what the user clicked
        const promptMessage =
            actionType === "delete"
                ? "Verify your identity to delete your account"
                : "Verify your identity to change password";

        if (!hasHardware || !isEnrolled) {
            // Fallback if the user has no FaceID/Fingerprint set up on their phone
            Alert.alert(
                "Secure Check",
                "Biometrics aren't set up on this device.",
                [
                    { text: "Cancel", style: "cancel" },
                    {
                        text: "Proceed Anyway",
                        onPress: () => {
                            if (actionType === "delete") {
                                handleDeleteAccountFlow();
                            } else {
                                navigation.navigate("changePassword");
                            }
                        },
                    },
                ],
            );
            return;
        }

        const result = await LocalAuthentication.authenticateAsync({
            promptMessage: promptMessage,
            disableDeviceFallback: false, // Let them use phone pin if biometrics fail
        });

        if (result.success) {
            if (actionType === "delete") {
                handleDeleteAccountFlow();
            } else {
                navigation.navigate("changePassword");
            }
        }
    };

    // 🗑️ Extra confirmation alert for deletions
    const handleDeleteAccountFlow = async () => {
        navigation.navigate("deleteAccountConfirmation");
    };

    const handleToggleTwoStep = async (value) => {
        try {
            const res = await api.put("/users/two-step");
            setTwoStepVerification(res.data.twoStepVerification);
        } catch (error) {
            Alert.alert("Error", "Could not update two-step verification");
        }
    };

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Icon name="arrow-back" size={30} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Account Security</Text>
                    <View style={styles.notificationContainer}>
                        <TouchableOpacity
                            onPress={() => navigation.navigate("notification")}
                        >
                            <Icon
                                name="notifications"
                                size={30}
                                color="#007a3f"
                            />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Phone Number Section */}
                <Text style={styles.label}>Phone Number</Text>
                <View style={styles.inputRow}>
                    <CountryPicker
                        withFlag
                        withCallingCode
                        countryCode={countryCode}
                        onSelect={(country) => setCountryCode(country.cca2)}
                    />
                    <TextInput
                        style={styles.phoneInput}
                        value={phoneNumber}
                        onChangeText={setPhoneNumber}
                    />
                </View>

                {/* Password Section */}
                <Text style={styles.label}>Password</Text>
                <View style={styles.inputRow}>
                    <TextInput
                        style={styles.textInput}
                        secureTextEntry={!passwordVisible}
                        value="**********"
                    />
                    <TouchableOpacity
                        onPress={() => setPasswordVisible(!passwordVisible)}
                    >
                        <Icon
                            name={
                                passwordVisible
                                    ? "visibility"
                                    : "visibility-off"
                            }
                            size={24}
                            color="#007a3f"
                        />
                    </TouchableOpacity>
                </View>

                {/* Change Password Text Press */}
                <TouchableOpacity
                    onPress={() => handleSecureAction("password")}
                >
                    <Text style={styles.resetPassword}>Change Password</Text>
                </TouchableOpacity>

                {/* Two-Step Verification */}
                <View style={[styles.row, styles.greyBackground]}>
                    <Text style={styles.buttonLabel}>
                        Two-step verification
                    </Text>
                    <Switch
                        value={twoStepVerification}
                        onValueChange={handleToggleTwoStep}
                        trackColor={{ false: "#fff", true: "#007a3f" }}
                        thumbColor={twoStepVerification ? "#ffffff" : "#007a3f"}
                    />
                </View>

                {/* Connected Devices */}
                <TouchableOpacity style={[styles.row, styles.greyBackground]}>
                    <View>
                        <Text style={styles.buttonLabel}>
                            Connected devices
                        </Text>
                        <Text style={styles.subText}>
                            {deviceCount} device{deviceCount !== 1 ? "s" : ""}
                        </Text>
                    </View>
                </TouchableOpacity>

                {/* 👈 4. Trigger safe action on delete here! */}
                <TouchableOpacity
                    style={styles.deleteAccount}
                    onPress={() => handleSecureAction("delete")}
                >
                    <Text style={styles.deleteText}>Delete my account</Text>
                    <Icon name="chevron-right" size={30} color="#000" />
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        paddingTop: 50,
    },
    content: {
        paddingHorizontal: 16,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 40,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "bold",
    },
    notificationContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    label: {
        fontSize: 15,
        fontWeight: "500",
        color: "grey",
        marginBottom: 8,
    },
    buttonLabel: {
        fontSize: 16,
        fontWeight: "500",
        color: "#000",
        marginBottom: 8,
    },
    textInput: {
        flex: 1,
        padding: 10,
        fontSize: 16,
        color: "#333",
    },
    phoneInput: {
        flex: 1,
        padding: 10,
        fontSize: 16,
        color: "#333",
        borderLeftWidth: 1,
        borderLeftColor: "#ccc",
        marginRight: 5,
    },
    inputRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 10,
    },
    resetPassword: {
        color: "red",
        marginTop: 3,
        marginBottom: 24,
        textDecorationLine: "underline",
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 16,
        paddingHorizontal: 12,
    },
    greyBackground: {
        backgroundColor: "#F1F1F1",
        marginVertical: 8,
        borderRadius: 8,
    },
    subText: {
        color: "#888",
        fontSize: 14,
    },
    deleteAccount: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 15,
        padding: 16,
        backgroundColor: "#f8f8f8",
        borderRadius: 8,
        paddingVertical: 20,
    },
    deleteText: {
        color: "red",
        fontWeight: "600",
        fontSize: 16,
    },
});

export default AccountSecurityScreen;
