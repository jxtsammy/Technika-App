import React, { useRef, useCallback, useEffect } from "react";
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    Animated,
    Dimensions,
    StyleSheet,
    Alert,
    StatusBar, // ✅ 1. Import StatusBar
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import * as LocalAuthentication from "expo-local-authentication";
import api from "../../api";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { height } = Dimensions.get("window");

const DeleteAccountScreen = ({ navigation }) => {
    const anim = useRef({
        imageOpacity: new Animated.Value(0),
        containerSlideY: new Animated.Value(height * 0.5),
        containerOpacity: new Animated.Value(0),
        contentOpacity: new Animated.Value(0),
        hoverValue: new Animated.Value(0),
    }).current;

    useEffect(() => {
        const startHover = () => {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(anim.hoverValue, {
                        toValue: -15,
                        duration: 2000,
                        useNativeDriver: true,
                    }),
                    Animated.timing(anim.hoverValue, {
                        toValue: 0,
                        duration: 2000,
                        useNativeDriver: true,
                    }),
                ]),
            ).start();
        };

        startHover();
    }, [anim.hoverValue]);

    useFocusEffect(
        useCallback(() => {
            Animated.stagger(150, [
                Animated.parallel([
                    Animated.timing(anim.containerSlideY, {
                        toValue: 0,
                        duration: 600,
                        useNativeDriver: true,
                    }),
                    Animated.timing(anim.containerOpacity, {
                        toValue: 1,
                        duration: 600,
                        useNativeDriver: true,
                    }),
                ]),
                Animated.timing(anim.imageOpacity, {
                    toValue: 1,
                    duration: 500,
                    useNativeDriver: true,
                }),
                Animated.timing(anim.contentOpacity, {
                    toValue: 1,
                    duration: 500,
                    useNativeDriver: true,
                }),
            ]).start();

            return () => {
                anim.imageOpacity.setValue(0);
                anim.containerSlideY.setValue(height * 0.5);
                anim.containerOpacity.setValue(0);
                anim.contentOpacity.setValue(0);
            };
        }, [anim]),
    );

    const handleDeleteRequest = async () => {
        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        const isEnrolled = await LocalAuthentication.isEnrolledAsync();

        if (!hasHardware || !isEnrolled) {
            triggerFinalConfirmation();
            return;
        }

        const result = await LocalAuthentication.authenticateAsync({
            promptMessage: "Verify your identity to delete your account",
            disableDeviceFallback: false,
        });

        if (result.success) {
            triggerFinalConfirmation();
        }
    };

    const triggerFinalConfirmation = () => {
        Alert.alert(
            "Are you absolutely sure?",
            "All your data will be permanently wiped. This cannot be undone.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete Permanently",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await api.delete("/users/account");
                            await AsyncStorage.clear();
                            navigation.replace("login");
                        } catch (error) {
                            Alert.alert(
                                "Error",
                                "Could not delete account. Please try again.",
                            );
                        }
                    },
                },
            ],
        );
    };

    return (
        <View style={styles.container}>
            {/* ✅ 2. Placed StatusBar here. "light-content" makes the icons/text WHITE (Dark Theme mode) */}
            <StatusBar barStyle="light-content" backgroundColor="#000000" />

            <Animated.View
                style={[
                    styles.imageContainer,
                    {
                        opacity: anim.imageOpacity,
                        transform: [{ translateY: anim.hoverValue }],
                    },
                ]}
            >
                <Image
                    source={require("../../assets/binIcon.png")}
                    style={styles.characterImage}
                    resizeMode="contain"
                />
            </Animated.View>

            <Animated.View
                style={[
                    styles.bottomContainer,
                    {
                        transform: [{ translateY: anim.containerSlideY }],
                        opacity: anim.containerOpacity,
                    },
                ]}
            >
                <View style={styles.accentLine} />

                <Animated.View style={{ opacity: anim.contentOpacity }}>
                    <Text style={styles.title}>Delete Account?</Text>
                    <Text style={styles.description}>
                        This will permanently erase your profile, task
                        histories, and chat records. You cannot recover this
                        data.
                    </Text>

                    <TouchableOpacity
                        activeOpacity={0.8}
                        style={styles.deleteButton}
                        onPress={handleDeleteRequest}
                    >
                        <Text style={styles.deleteButtonText}>
                            Permanently Erase Everything
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Text style={styles.cancelButtonText}>
                            Nevermind, keep my account
                        </Text>
                    </TouchableOpacity>
                </Animated.View>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#111", // ✅ 3. Darkened background slightly to match dark status bar
        paddingTop: 40,
    },
    imageContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    characterImage: {
        width: 400,
        height: 350,
    },
    bottomContainer: {
        backgroundColor: "#ffff",
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        padding: 24,
        paddingBottom: 50,
        minHeight: height * 0.4,
    },
    accentLine: {
        width: 40,
        height: 4,
        backgroundColor: "#007a3f",
        borderRadius: 2,
        alignSelf: "center",
        marginBottom: 40,
    },
    title: {
        fontSize: 28,
        fontWeight: "700",
        color: "#007a3f",
        textAlign: "center",
        marginBottom: 12,
    },
    description: {
        fontSize: 15,
        color: "#a0a0a0",
        textAlign: "center",
        marginBottom: 32,
        lineHeight: 22,
    },
    deleteButton: {
        backgroundColor: "#007a3f",
        paddingVertical: 18,
        borderRadius: 12,
        alignItems: "center",
        marginBottom: 16,
    },
    deleteButtonText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "600",
    },
    cancelButton: {
        paddingVertical: 12,
        alignItems: "center",
    },
    cancelButtonText: {
        color: "#a0a0a0",
        fontSize: 15,
        fontWeight: "500",
        textDecorationLine: "underline",
    },
});

export default DeleteAccountScreen;
