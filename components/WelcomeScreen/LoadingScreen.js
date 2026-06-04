import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";

const LoadingScreen = ({ navigation }) => {
    const [activeDot, setActiveDot] = useState(0);

    useEffect(() => {
        // Change active dot every 300ms
        const dotInterval = setInterval(() => {
            setActiveDot((prev) => (prev + 1) % 4); // Cycle through 0, 1, 2
        }, 350);

        const timer = setTimeout(() => {
            clearInterval(dotInterval);
            navigation.navigate("intro");
        }, 4500);

        return () => {
            clearInterval(dotInterval);
            clearTimeout(timer);
        };
    }, [navigation]);

    return (
        <View style={styles.container}>
            <Text style={styles.text}>GENAU</Text>
            <View style={styles.dotsContainer}>
                {Array.from({ length: 4 }).map((_, index) => (
                    <Animated.View
                        key={index}
                        style={[
                            styles.dot,
                            {
                                backgroundColor:
                                    index === activeDot ? "#D32F2F" : "#ccc",
                            },
                        ]}
                    />
                ))}
            </View>
        </View>
    );
};

export default LoadingScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff",
    },
    text: {
        fontSize: 60,
        fontWeight: "bold",
        color: "#D32F2F",
    },
    dotsContainer: {
        position: "absolute",
        bottom: 40,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },
    dot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginHorizontal: 6,
    },
});
