import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    FlatList,
    Image,
    TouchableOpacity,
    StyleSheet,
    Alert,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import api from "../../api";

const AvailableTaskScreen = () => {
    const navigation = useNavigation();
    const [tasks, setTasks] = useState([]);

    useEffect(() => {
        loadTasks();
    }, []);

    const loadTasks = async () => {
        try {
            const res = await api.get("/tasks/available");
            const available = res.data.map((t) => ({
                ...t,
                jobDecription: t.title,
                client: t.description || "N/A",
                location: t.location?.address || "N/A",
                profileImage: `https://i.pravatar.cc/100?img=${Math.floor(Math.random() * 10) + 1}`,
            }));
            setTasks(available);
        } catch (error) {
            console.error("Failed to load tasks:", error);
        }
    };

    const handleAccept = async (item) => {
        try {
            await api.put(`/tasks/${item._id}/status`, { status: "pending" });
            navigation.replace("currentTask", { task: item });
        } catch (error) {
            if (error.response?.status === 409) {
                Alert.alert(
                    "Already Claimed",
                    "Another technician just accepted this task.",
                );
                // Drop it from the list so it can't be tapped again
                setTasks((prev) => prev.filter((t) => t._id !== item._id));
            } else {
                Alert.alert("Error", "Could not accept task");
            }
        }
    };

    const renderTask = ({ item }) => (
        <View style={styles.taskContainer}>
            <View style={styles.row}>
                <Image
                    source={{ uri: item.profileImage }}
                    style={styles.profileImage}
                />
                <View style={styles.detailsContainer}>
                    <Text style={styles.taskTitle}>{item.jobDecription}</Text>
                    <Text style={styles.clientText}>Client: {item.client}</Text>
                    <View style={styles.locationRow}>
                        <MaterialIcons
                            name="location-pin"
                            size={26}
                            color="#007a3f"
                        />
                        <View>
                            <Text style={styles.locationText}>Location</Text>
                            <Text style={styles.locationText}>
                                {item.location}
                            </Text>
                        </View>
                    </View>
                </View>
                <View style={styles.actionIcons}>
                    <TouchableOpacity style={styles.iconButton}>
                        <Ionicons name="call" size={22} color="#007a3f" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconButton}>
                        <MaterialIcons
                            name="message"
                            size={22}
                            color="#007a3f"
                        />
                    </TouchableOpacity>
                </View>
            </View>
            <TouchableOpacity
                style={styles.acceptButton}
                onPress={() => handleAccept(item)}
            >
                <Text style={styles.acceptButtonText}>Accept</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={tasks}
                keyExtractor={(item) => item._id}
                renderItem={renderTask}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
};

export default AvailableTaskScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    taskContainer: {
        backgroundColor: "#fff",
        borderRadius: 8,
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#ccc",
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
    },
    profileImage: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 12,
    },
    detailsContainer: {
        flex: 1,
    },
    taskTitle: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#000",
        marginBottom: 4,
    },
    clientText: {
        fontSize: 14,
        color: "#666",
        marginBottom: 4,
    },
    locationRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    locationText: {
        fontSize: 14,
        color: "#666",
        marginLeft: 4,
    },
    actionIcons: {
        flexDirection: "row",
    },
    iconButton: {
        marginLeft: 12,
        padding: 8,
        borderRadius: 4,
        backgroundColor: "#f7f7f7",
    },
    acceptButton: {
        marginTop: 16,
        backgroundColor: "#007a3f",
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: "center",
    },
    acceptButtonText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 16,
    },
    separator: {
        height: 16,
    },
});
