import React, { useState, useRef } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Modal,
    KeyboardAvoidingView,
    Platform,
    TouchableWithoutFeedback,
    ActivityIndicator,
    StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";
import api from "../../api";

const CODE_LENGTH = 6;

const TokenModalScreen = ({
    navigation,
    visible = true,
    onClose,
    taskId,
    onVerifySuccess,
}) => {
    const [code, setCode] = useState(Array(CODE_LENGTH).fill(""));
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const inputRefs = useRef([]);

    // 'verify' -> normal code entry, 'dispute' -> "can't get code" reason form, 'disputed' -> confirmation
    const [mode, setMode] = useState("verify");
    const [disputeReason, setDisputeReason] = useState("");
    const [disputeLoading, setDisputeLoading] = useState(false);
    const [disputeError, setDisputeError] = useState("");

    const handleChangeText = (text, index) => {
        const newCode = [...code];
        newCode[index] = text;
        setCode(newCode);
        setErrorMsg("");

        if (text && index < CODE_LENGTH - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyPress = (e, index) => {
        if (e.nativeEvent.key === "Backspace") {
            const newCode = [...code];
            if (code[index]) {
                newCode[index] = "";
                setCode(newCode);
            }
            if (index > 0) {
                if (!code[index]) {
                    newCode[index - 1] = "";
                    setCode(newCode);
                }
                inputRefs.current[index - 1]?.focus();
            }
        }
    };

    const resetAndClose = () => {
        setCode(Array(CODE_LENGTH).fill(""));
        setErrorMsg("");
        setMode("verify");
        setDisputeReason("");
        setDisputeError("");
        if (onClose) onClose();
    };

    const handleVerifyButton = async () => {
        if (!taskId) {
            setErrorMsg("Missing task reference — cannot verify.");
            return;
        }
        setLoading(true);
        setErrorMsg("");
        const enteredCode = code.join("");

        try {
            const res = await api.put(`/tasks/${taskId}/verify`, {
                code: enteredCode,
            });
            setLoading(false);
            resetAndClose();
            if (onVerifySuccess) {
                onVerifySuccess(res.data);
            } else {
                navigation.reset({
                    index: 0,
                    routes: [{ name: "taskSuccessMsg" }],
                });
            }
        } catch (err) {
            setLoading(false);
            const data = err.response?.data;
            const message =
                data?.message || "Verification failed. Please try again.";
            const remaining =
                typeof data?.attemptsRemaining === "number"
                    ? ` (${data.attemptsRemaining} attempt${data.attemptsRemaining === 1 ? "" : "s"} left)`
                    : "";
            setErrorMsg(message + remaining);
            setCode(Array(CODE_LENGTH).fill(""));
            inputRefs.current[0]?.focus();
        }
    };

    const handleSubmitDispute = async () => {
        if (!taskId) {
            setDisputeError("Missing task reference — cannot flag this task.");
            return;
        }
        if (!disputeReason.trim()) {
            setDisputeError("Please describe why you could not get the code.");
            return;
        }
        setDisputeLoading(true);
        setDisputeError("");

        try {
            await api.put(`/tasks/${taskId}/dispute`, {
                disputeReason: disputeReason.trim(),
            });
            setDisputeLoading(false);
            setMode("disputed");
        } catch (err) {
            setDisputeLoading(false);
            setDisputeError(
                err.response?.data?.message || "Could not submit — try again.",
            );
        }
    };

    const isComplete = code.every((digit) => digit !== "");

    return (
        <>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
            <Modal
                animationType="slide"
                transparent
                visible={visible}
                onRequestClose={resetAndClose}
            >
                <BlurView
                    intensity={90}
                    tint="dark"
                    style={StyleSheet.absoluteFill}
                >
                    <TouchableWithoutFeedback onPress={resetAndClose}>
                        <View style={styles.modalOverlay} />
                    </TouchableWithoutFeedback>
                </BlurView>

                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={styles.bottomSheetContainer}
                >
                    <SafeAreaView
                        style={styles.bottomSheetContent}
                        edges={["bottom", "left", "right"]}
                    >
                        {mode === "verify" && (
                            <>
                                <Text style={styles.headerTitle}>
                                    Enter Acknowledgment Token
                                </Text>
                                <Text style={styles.subtitle}>
                                    Please see the field operation supervisor to
                                    get the Acknowledgment token to verify that
                                    the work is completed.
                                </Text>

                                <View style={styles.codeContainer}>
                                    {code.map((digit, index) => (
                                        <TextInput
                                            key={index}
                                            ref={(ref) =>
                                                (inputRefs.current[index] = ref)
                                            }
                                            style={[
                                                styles.codeBox,
                                                digit
                                                    ? styles.codeBoxFilled
                                                    : null,
                                            ]}
                                            keyboardType="number-pad"
                                            maxLength={1}
                                            value={digit}
                                            onChangeText={(text) =>
                                                handleChangeText(text, index)
                                            }
                                            onKeyPress={(e) =>
                                                handleKeyPress(e, index)
                                            }
                                            selectTextOnFocus
                                            editable={!loading}
                                        />
                                    ))}
                                </View>

                                {!!errorMsg && (
                                    <Text style={styles.errorText}>
                                        {errorMsg}
                                    </Text>
                                )}

                                <TouchableOpacity
                                    style={[
                                        styles.verifyButton,
                                        (!isComplete || loading) &&
                                            styles.verifyButtonDisabled,
                                    ]}
                                    onPress={handleVerifyButton}
                                    disabled={!isComplete || loading}
                                >
                                    {loading ? (
                                        <ActivityIndicator
                                            size="small"
                                            color="#FFFFFF"
                                        />
                                    ) : (
                                        <Text style={styles.verifyButtonText}>
                                            Verify Token
                                        </Text>
                                    )}
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.disputeLink}
                                    onPress={() => setMode("dispute")}
                                    disabled={loading}
                                >
                                    <Text style={styles.disputeLinkText}>
                                        Can't get the code?
                                    </Text>
                                </TouchableOpacity>
                            </>
                        )}

                        {mode === "dispute" && (
                            <>
                                <Text style={styles.headerTitle}>
                                    Flag This Task
                                </Text>
                                <Text style={styles.subtitle}>
                                    Let us know why you couldn't get the code —
                                    an admin will review and can mark this
                                    complete manually.
                                </Text>

                                <TextInput
                                    style={styles.reasonInput}
                                    placeholder="e.g. Customer unreachable, customer refused to give code..."
                                    placeholderTextColor="#9CA3AF"
                                    value={disputeReason}
                                    onChangeText={(t) => {
                                        setDisputeReason(t);
                                        setDisputeError("");
                                    }}
                                    multiline
                                    numberOfLines={4}
                                    editable={!disputeLoading}
                                />

                                {!!disputeError && (
                                    <Text style={styles.errorText}>
                                        {disputeError}
                                    </Text>
                                )}

                                <TouchableOpacity
                                    style={[
                                        styles.verifyButton,
                                        (!disputeReason.trim() ||
                                            disputeLoading) &&
                                            styles.verifyButtonDisabled,
                                    ]}
                                    onPress={handleSubmitDispute}
                                    disabled={
                                        !disputeReason.trim() || disputeLoading
                                    }
                                >
                                    {disputeLoading ? (
                                        <ActivityIndicator
                                            size="small"
                                            color="#FFFFFF"
                                        />
                                    ) : (
                                        <Text style={styles.verifyButtonText}>
                                            Submit
                                        </Text>
                                    )}
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.disputeLink}
                                    onPress={() => setMode("verify")}
                                    disabled={disputeLoading}
                                >
                                    <Text style={styles.disputeLinkText}>
                                        Back to code entry
                                    </Text>
                                </TouchableOpacity>
                            </>
                        )}

                        {mode === "disputed" && (
                            <>
                                <Text style={styles.headerTitle}>
                                    Flagged for Review
                                </Text>
                                <Text style={styles.subtitle}>
                                    This task has been sent to an admin for
                                    manual review. You'll be notified once it's
                                    resolved.
                                </Text>

                                <TouchableOpacity
                                    style={styles.verifyButton}
                                    onPress={resetAndClose}
                                >
                                    <Text style={styles.verifyButtonText}>
                                        Done
                                    </Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </SafeAreaView>
                </KeyboardAvoidingView>
            </Modal>
        </>
    );
};

const styles = StyleSheet.create({
    modalOverlay: { flex: 1 },
    bottomSheetContainer: {
        backgroundColor: "#FFFFFF",
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        elevation: 10,
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
    },
    bottomSheetContent: {
        paddingHorizontal: 24,
        paddingBottom: 24,
        paddingTop: 32,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: "700",
        color: "#000000",
        marginBottom: 8,
        marginTop: 8,
        textAlign: "center",
    },
    subtitle: {
        fontSize: 14,
        color: "#666666",
        lineHeight: 20,
        marginBottom: 28,
        textAlign: "center",
    },
    codeContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
        marginBottom: 16,
    },
    codeBox: {
        width: 44,
        height: 60,
        borderRadius: 12,
        backgroundColor: "#F3F4F6",
        borderWidth: 1.5,
        borderColor: "#E5E7EB",
        textAlign: "center",
        fontSize: 22,
        fontWeight: "600",
        color: "#000000",
    },
    codeBoxFilled: { borderColor: "#007a3f", backgroundColor: "#FFFFFF" },
    errorText: {
        color: "#dc2626",
        fontSize: 13,
        textAlign: "center",
        marginBottom: 16,
    },
    verifyButton: {
        backgroundColor: "#007a3f",
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: "center",
        height: 52,
        justifyContent: "center",
    },
    verifyButtonDisabled: { backgroundColor: "#a3c9b5" },
    verifyButtonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "600" },
    disputeLink: { marginTop: 16, alignItems: "center" },
    disputeLinkText: {
        color: "#6B7280",
        fontSize: 14,
        textDecorationLine: "underline",
    },
    reasonInput: {
        backgroundColor: "#F3F4F6",
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: "#E5E7EB",
        padding: 16,
        fontSize: 15,
        color: "#000000",
        minHeight: 100,
        textAlignVertical: "top",
        marginBottom: 16,
    },
});

export default TokenModalScreen;
