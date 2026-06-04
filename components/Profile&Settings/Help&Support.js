import React, { useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons"; // For icons
import { SafeAreaView } from "react-native-safe-area-context";

const HelpSupportScreen = ({ navigation }) => {
    const [isEnabled, setIsEnabled] = useState(false);

    const toggleSwitch = () => setIsEnabled((previousState) => !previousState);

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color="black" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Help & Support</Text>
                <View style={styles.rightIcons}>
                    <TouchableOpacity style={styles.notificationIcon}>
                        <Ionicons
                            name="notifications"
                            size={24}
                            color="black"
                        />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Content */}
            <ScrollView contentContainerStyle={styles.contentContainer}>
                <View style={styles.card}>
                    <Text style={styles.text}>
                        Lorem ipsum dolor sit amet consectetur. Proin semper
                        adipiscing blandit duis nunc semper fermentum. Integer
                        proin integer in diam vel. Adipiscing ornare nunc elit
                        proin et. Sit velit pellentesque id neque fames. Auctor
                        pellentesque non consectetur iaculis adipiscing nibh
                        commodo nulla quam. Vitae at sed eget commodo commodo at
                        fermentum. Sed sit est lectus ultrices sapien convallis
                        posuere cursus. Commodo molestie integer sed nisl tempor
                        in eget nunc lorem. Vel auctor venenatis lorem
                        scelerisque tempus.
                    </Text>
                    <Text style={styles.text}>
                        Lorem ipsum dolor sit amet consectetur. Proin semper
                        adipiscing blandit duis nunc semper fermentum. Integer
                        proin integer in diam vel. Adipiscing ornare nunc elit
                        proin et. Sit velit pellentesque id neque fames. Auctor
                        pellentesque non consectetur iaculis adipiscing nibh
                        commodo nulla quam. Vitae at sed eget commodo commodo at
                        fermentum. Sed sit est lectus ultrices sapien convallis
                        posuere cursus. Commodo molestie integer sed nisl tempor
                        in eget nunc lorem. Vel auctor venenatis lorem
                        scelerisque tempus.
                    </Text>
                    <Text style={styles.text}>
                        Lorem ipsum dolor sit amet consectetur. Proin semper
                        adipiscing blandit duis nunc semper fermentum. Integer
                        proin integer in diam vel. Adipiscing ornare nunc elit
                        proin et. Sit velit pellentesque id neque fames. Auctor
                        pellentesque non consectetur iaculis adipiscing nibh
                        commodo nulla quam. Vitae at sed eget commodo commodo at
                        fermentum. Sed sit est lectus ultrices sapien convallis
                        posuere cursus. Commodo molestie integer sed nisl tempor
                        in eget nunc lorem.
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 10,
        backgroundColor: "#fff",
    },
    headerTitle: {
        flex: 1,
        fontSize: 20,
        fontWeight: "600",
        textAlign: "center",
        color: "#000",
    },
    rightIcons: {
        flexDirection: "row",
        alignItems: "center",
    },
    notificationIcon: {
        marginLeft: 10,
        position: "relative",
    },
    contentContainer: {
        padding: 20,
    },
    card: {
        borderRadius: 10,
        padding: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    text: {
        fontSize: 14,
        lineHeight: 22,
        color: "#333",
        marginBottom: 20,
    },
});

export default HelpSupportScreen;
