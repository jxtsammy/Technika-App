import React, { useRef, useCallback, useEffect } from "react";
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    Animated,
    Dimensions,
    StyleSheet,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";

const { height } = Dimensions.get("window");

const OnboardingScreen = ({ navigation }) => {
    // 1. Added hoverValue to the refs
    const anim = useRef({
        imageOpacity: new Animated.Value(0),
        containerSlideY: new Animated.Value(height * 0.5),
        containerOpacity: new Animated.Value(0),
        contentOpacity: new Animated.Value(0),
        hoverValue: new Animated.Value(0), // New hover value
    }).current;

    // 2. Separate useEffect for the infinite hover loop
    useEffect(() => {
        const startHover = () => {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(anim.hoverValue, {
                        toValue: -15, // Moves up 15 units
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
                // Reset entry animations but keep hover ready
                anim.imageOpacity.setValue(0);
                anim.containerSlideY.setValue(height * 0.5);
                anim.containerOpacity.setValue(0);
                anim.contentOpacity.setValue(0);
            };
        }, [anim]),
    );

    return (
        <View style={styles.container}>
            {/* 3. Apply the translateY hover effect here */}
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
                    source={require("../../assets/RTT.png")}
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
                    <Text style={styles.title}>Real-time Tracking</Text>
                    <Text style={styles.description}>
                        Easily monitor your location as you move between
                        locations. Stay updated and ensure efficient service
                        delivery with live tracking.
                    </Text>

                    <TouchableOpacity
                        activeOpacity={0.8}
                        style={styles.nextButton}
                        onPress={() => navigation.replace("stat")}
                    >
                        <Text style={styles.nextButtonText}>Next</Text>
                    </TouchableOpacity>
                </Animated.View>
            </Animated.View>
        </View>
    );
};

// ... styles remain the same as previous optimized version
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f5f5f5",
        paddingTop: 40,
    },

    imageContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },

    characterImage: {
        width: 420,
        height: 420,
    },

    bottomContainer: {
        backgroundColor: "#000",
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        padding: 24,
        paddingBottom: 50,
        minHeight: height * 0.3,
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
        color: "#fff",
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

    nextButton: {
        backgroundColor: "#007a3f",
        paddingVertical: 18,
        borderRadius: 12,
        alignItems: "center",
    },

    nextButtonText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "600",
    },
});

export default OnboardingScreen;
