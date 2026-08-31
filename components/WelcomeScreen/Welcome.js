import React from "react";
import {
    StyleSheet,
    Text,
    View,
    ImageBackground,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const WelcomeScreen = ({ navigation }) => {
    return (
        <ImageBackground
            source={require("../../assets/road.jpg")} // Ensure path is correct
            style={styles.background}
        >
            <StatusBar
                barStyle="light-content" // Dark icons
            />
            {/* Linear Gradient Overlay */}
            <LinearGradient
                colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.5)", "rgba(0,0,0,1)"]}
                style={styles.overlay}
            >
                <SafeAreaView style={styles.container}>
                    <View style={styles.content}>
                        <Text style={styles.title}>Welcome to Technika</Text>

                        <Text style={styles.description}>
                            Join over 1,000 technicians over the Ghana and enjoy
                            a digital network of easy-made work execution,
                            tracking and coordination!
                        </Text>

                        <TouchableOpacity
                            style={styles.button}
                            onPress={() => navigation.navigate("login")}
                        >
                            <Text style={styles.buttonText}>
                                Login an account
                            </Text>
                        </TouchableOpacity>

                        <View style={styles.loginContainer}>
                            <Text style={styles.footerText}>
                                Don't have an account?{" "}
                            </Text>
                            <TouchableOpacity
                                onPress={() => navigation.navigate("basicDetails")}
                            >
                                <Text
                                    style={[
                                        styles.footerText,
                                        styles.loginText,
                                    ]}
                                >
                                    Register
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </SafeAreaView>
            </LinearGradient>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    background: {
        flex: 1,
        width: "100%",
    },
    overlay: {
        flex: 1,
    },
    container: {
        flex: 1,
        justifyContent: "flex-end",
        paddingBottom: 40,
    },
    content: {
        alignItems: "center",
        paddingHorizontal: 25,
    },
    title: {
        fontSize: 32,
        fontWeight: "bold",
        color: "#fff",
        textAlign: "center",
        marginBottom: 15,
    },
    description: {
        fontSize: 16,
        color: "#E0E0E0",
        textAlign: "center",
        lineHeight: 24,
        marginBottom: 40,
    },
    button: {
        backgroundColor: "#fff",
        width: "100%",
        paddingVertical: 15,
        borderRadius: 12,
        alignItems: "center",
        marginBottom: 20,
    },
    buttonText: {
        color: "#000",
        fontSize: 18,
        fontWeight: "600",
    },
    loginContainer: {
        flexDirection: "row",
    },
    footerText: {
        color: "#fff",
        fontSize: 16,
    },
    loginText: {
        fontWeight: "bold",
    },
});

export default WelcomeScreen;
