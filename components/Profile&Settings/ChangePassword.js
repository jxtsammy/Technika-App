import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons"; // For icons
import { SafeAreaView } from "react-native-safe-area-context";
import api from "../../api";

const ChangePasswordScreen = ({ navigation }) => {
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isOldPasswordVisible, setIsOldPasswordVisible] = useState(false);
    const [isNewPasswordVisible, setIsNewPasswordVisible] = useState(false);
    const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
        useState(false);

    const [newPasswordError, setNewPasswordError] = useState("");
    const [confirmPasswordError, setConfirmPasswordError] = useState("");

    const validateInputs = () => {
        let isValid = true;

        // Reset errors
        setNewPasswordError("");
        setConfirmPasswordError("");

        // Validate new password
        if (newPassword.length < 6) {
            setNewPasswordError("New password must be at least 6 characters.");
            isValid = false;
        }

        // Validate confirm password
        if (newPassword !== confirmPassword) {
            setConfirmPasswordError("Passwords do not match.");
            isValid = false;
        }

        return isValid;
    };

    const handleConfirm = async () => {
        if (!validateInputs()) return;

        try {
            await api.put("/users/password", {
                currentPassword: oldPassword,
                newPassword,
            });

            Alert.alert("Success", "Password has been updated successfully.", [
                { text: "OK", onPress: () => navigation.goBack() },
            ]);
        } catch (error) {
            Alert.alert(
                "Error",
                error.response?.data?.message || "Could not update password.",
            );
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color="black" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Change Password</Text>
                <View style={styles.notificationContainer}>
                    <TouchableOpacity
                        onPress={() => navigation.navigate("notification")}
                    >
                        <Ionicons
                            name="notifications"
                            size={24}
                            color="#007a3f"
                        />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.form}>
                <View style={styles.fieldContainer}>
                    <Text style={styles.label}>Old Password</Text>
                    <View>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter old password"
                            secureTextEntry={!isOldPasswordVisible}
                            value={oldPassword}
                            onChangeText={setOldPassword}
                            placeholderTextColor="grey"
                        />
                        <TouchableOpacity
                            style={styles.eyeIcon}
                            onPress={() =>
                                setIsOldPasswordVisible(!isOldPasswordVisible)
                            }
                        >
                            <Ionicons
                                name={isOldPasswordVisible ? "eye" : "eye-off"}
                                size={20}
                                color="#007a3f"
                            />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.fieldContainer}>
                    <Text style={styles.label}>New Password</Text>
                    <View>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter new password"
                            secureTextEntry={!isNewPasswordVisible}
                            value={newPassword}
                            onChangeText={setNewPassword}
                            placeholderTextColor="grey"
                        />
                        <TouchableOpacity
                            style={styles.eyeIcon}
                            onPress={() =>
                                setIsNewPasswordVisible(!isNewPasswordVisible)
                            }
                        >
                            <Ionicons
                                name={isNewPasswordVisible ? "eye" : "eye-off"}
                                size={20}
                                color="#007a3f"
                            />
                        </TouchableOpacity>
                    </View>
                    {newPasswordError ? (
                        <Text style={styles.errorText}>{newPasswordError}</Text>
                    ) : null}
                </View>

                <View style={styles.fieldContainer}>
                    <Text style={styles.label}>Confirm Password</Text>
                    <View>
                        <TextInput
                            style={styles.input}
                            placeholder="Confirm new password"
                            secureTextEntry={!isConfirmPasswordVisible}
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            placeholderTextColor="grey"
                        />
                        <TouchableOpacity
                            style={styles.eyeIcon}
                            onPress={() =>
                                setIsConfirmPasswordVisible(
                                    !isConfirmPasswordVisible,
                                )
                            }
                        >
                            <Ionicons
                                name={
                                    isConfirmPasswordVisible ? "eye" : "eye-off"
                                }
                                size={20}
                                color="#007a3f"
                            />
                        </TouchableOpacity>
                    </View>
                    {confirmPasswordError ? (
                        <Text style={styles.errorText}>
                            {confirmPasswordError}
                        </Text>
                    ) : null}
                </View>
            </View>

            <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleConfirm}
            >
                <Text style={styles.confirmButtonText}>Confirm</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: "#fff",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 40,
    },
    headerTitle: {
        flex: 1,
        fontSize: 20,
        fontWeight: "bold",
        textAlign: "center",
    },
    notificationContainer: {
        position: "relative",
    },
    form: {
        marginBottom: 32,
    },
    fieldContainer: {
        marginBottom: 16,
    },
    label: {
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 8,
        color: "grey",
    },
    input: {
        height: 60,
        borderColor: "#ddd",
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 10,
        marginBottom: 10,
        fontSize: 16,
    },
    eyeIcon: {
        position: "absolute",
        right: 20,
        top: 16,
    },
    confirmButton: {
        backgroundColor: "#007a3f",
        borderRadius: 8,
        paddingVertical: 14,
        alignItems: "center",
    },
    confirmButtonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "bold",
    },
    errorText: {
        color: "red",
        fontSize: 14,
        marginTop: 4,
    },
});

export default ChangePasswordScreen;
