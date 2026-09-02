import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    StatusBar,
    Alert,
} from "react-native";
import MapView, { Polyline, Marker } from "react-native-maps";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import api from "../../api";
import TokenModalScreen from "./AcknowledgmentToken";

const DeliveryTrackingApp = ({ navigation, route }) => {
    const { task } = route.params;

    const [hasArrived, setHasArrived] = useState(false);
    const [arrivalTime, setArrivalTime] = useState(null);
    const [showTokenModal, setShowTokenModal] = useState(false);

    const routeCoordinates = [
        { latitude: 6.6715, longitude: -1.5694 },
        { latitude: 6.6488, longitude: -1.6518 },
    ];

    const handleMainAction = async () => {
        if (!hasArrived) {
            const now = new Date();
            const formattedTime = now.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
            });
            setArrivalTime(formattedTime);
            setHasArrived(true);

            try {
                await api.put(`/tasks/${task._id}/status`, {
                    status: "pending",
                });
            } catch (error) {
                console.error("Could not update task status:", error);
            }

            Alert.alert(
                "Status Updated",
                "You have arrived at the destination.",
            );
        } else {
            // Completion now requires the customer's verification code (or a
            // disputed/admin-override path) — technicians can no longer mark
            // a task completed directly. Open the token modal instead of
            // calling the status endpoint.
            setShowTokenModal(true);
        }
    };

    // Called by the token modal once the backend confirms the code was
    // correct and the task is genuinely marked completed.
    const handleVerifySuccess = (updatedTask) => {
        setShowTokenModal(false);
        navigation.replace("taskReport", {
            task: updatedTask || task,
            arrivalTime,
        });
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <View style={styles.header}>
                <Text style={styles.title}>On Task</Text>
                <View style={styles.headerRight}>
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

            <MapView
                style={styles.map}
                initialRegion={{
                    latitude: 6.6602,
                    longitude: -1.6106,
                    latitudeDelta: 0.1,
                    longitudeDelta: 0.1,
                }}
            >
                <Marker coordinate={routeCoordinates[1]}>
                    <View style={styles.markerContainer}>
                        <Ionicons name="location" size={40} color="#007a3f" />
                    </View>
                </Marker>
                <Polyline
                    coordinates={routeCoordinates}
                    strokeColor="#007a3f"
                    strokeWidth={3}
                />
                <Marker coordinate={routeCoordinates[0]}>
                    <View style={styles.markerContainer}>
                        <Image
                            source={{ uri: task.profileImage }}
                            style={styles.markerImage}
                        />
                    </View>
                </Marker>
            </MapView>

            {/* Floating Task Card */}
            <View style={styles.taskCard}>
                <View style={styles.taskHeader}>
                    <Text style={styles.taskTitle}>Current Task</Text>
                    <View style={styles.statusContainer}>
                        <Text style={styles.status}>
                            {hasArrived ? "Task Ongoing" : "On Route"}
                        </Text>
                    </View>
                </View>

                <View style={styles.taskDetails}>
                    <Image
                        source={{ uri: task.profileImage }}
                        style={styles.clientImage}
                    />
                    <View style={styles.taskInfo}>
                        <View style={styles.taskIdRow}>
                            <Text style={styles.taskId}>
                                {task.jobDecription || task.title}
                            </Text>
                        </View>
                        <View style={styles.clientRow}>
                            <Text style={styles.clientName}>
                                Client:{" "}
                                {task.client || task.description || "N/A"}
                            </Text>
                            <View style={styles.communicationContainer}>
                                <TouchableOpacity style={styles.callButton}>
                                    <Ionicons
                                        name="call"
                                        size={24}
                                        color="#007a3f"
                                    />
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.messageButton}>
                                    <MaterialIcons
                                        name="message"
                                        size={24}
                                        color="#007a3f"
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>
                        <View style={styles.locationContainer}>
                            <Ionicons
                                name="location"
                                size={24}
                                color="#007a3f"
                            />
                            <Text style={styles.location}>
                                Location:{"\n"}
                                {task.location?.address ||
                                    task.location ||
                                    "N/A"}
                            </Text>
                        </View>
                    </View>
                </View>

                <TouchableOpacity
                    style={styles.completeButton}
                    onPress={handleMainAction}
                >
                    <Text style={styles.completeButtonText}>
                        {hasArrived ? "Mark as Completed" : "Arrived"}
                    </Text>
                </TouchableOpacity>
            </View>

            <TokenModalScreen
                visible={showTokenModal}
                taskId={task._id}
                navigation={navigation}
                onClose={() => setShowTokenModal(false)}
                onVerifySuccess={handleVerifySuccess}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 15,
        backgroundColor: "white",
        paddingTop: 55,
    },
    headerRight: { flexDirection: "row", alignItems: "center" },
    title: { fontSize: 24, fontWeight: "bold" },
    map: { flex: 1 },
    markerContainer: {
        backgroundColor: "white",
        borderRadius: 60,
        padding: 2,
        borderWidth: 2,
        borderColor: "#007a3f",
    },
    markerImage: { width: 36, height: 36, borderRadius: 18 },
    taskCard: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "white",
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        padding: 15,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        paddingVertical: 35,
    },
    taskHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
    },
    taskTitle: { fontSize: 16, fontWeight: "bold" },
    taskDetails: { flexDirection: "row", marginBottom: 16 },
    clientImage: { width: 50, height: 50, borderRadius: 25, marginRight: 12 },
    taskInfo: { flex: 1 },
    taskIdRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    taskId: { fontSize: 18, fontWeight: "bold" },
    clientRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    clientName: { color: "#666" },
    locationContainer: { flexDirection: "row", alignItems: "center", top: -5 },
    location: { color: "#666", marginLeft: 4 },
    statusContainer: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 16,
        backgroundColor: "#007a3f",
    },
    status: { color: "white", fontSize: 13 },
    communicationContainer: { flexDirection: "row", gap: 8, top: 15 },
    messageButton: {
        backgroundColor: "#EEE8E8",
        padding: 6,
        borderRadius: 6,
        width: 35,
        height: 35,
        justifyContent: "center",
        alignItems: "center",
    },
    callButton: {
        backgroundColor: "#EEE8E8",
        padding: 6,
        borderRadius: 6,
        width: 35,
        height: 35,
        justifyContent: "center",
        alignItems: "center",
    },
    completeButton: {
        backgroundColor: "#007a3f",
        padding: 16,
        borderRadius: 8,
        alignItems: "center",
    },
    completeButtonText: { color: "white", fontWeight: "500" },
});

export default DeliveryTrackingApp;
