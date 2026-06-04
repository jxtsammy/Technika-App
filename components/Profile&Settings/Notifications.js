import React, { useState } from "react";
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    Image,
    StyleSheet,
    Alert,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useEffect } from "react";
import api from "../../api";

// const allNotifications = [
//   {
//     id: "1",
//     category: "Today",
//     icon: "star-outline",
//     iconBg: "#FFDADA",
//     title: "Performance Milestone Unlocked!",
//     description: "Congrats! You completed 10 tasks this week with a 4.8-star rating. Keep it up!",
//     time: "2 mins ago",
//     date: "Feb 11, 2025",
//     isUnread: true,
//   },
//   {
//     id: "2",
//     category: "Today",
//     icon: "trophy-outline",
//     iconBg: "#FFDADA",
//     title: "Bonus Earned!",
//     description: "Congratulations! You’ve received a performance bonus.",
//     time: "55 mins ago",
//     date: "Feb 11, 2025",
//     isUnread: true,
//   },
//   {
//     id: "3",
//     category: "Today",
//     icon: "refresh",
//     iconBg: "#FFDADA",
//     title: "Task Reassigned.",
//     description: "Your task at Sokomono has been reassigned to another technician.",
//     time: "02:46 PM",
//     date: "Feb 11, 2025",
//     isUnread: false,
//   },
//   {
//     id: "4",
//     category: "This Week",
//     icon: "check-circle-outline",
//     iconBg: "#FFDADA",
//     title: "Weekly Work Summary Ready",
//     description: "You completed 15 tasks this week. View full report now!",
//     time: "12:32 PM",
//     date: "Jan 7, 2025",
//     isUnread: true,
//   },
//   {
//     id: "5",
//     category: "This Week",
//     image: "https://randomuser.me/api/portraits/men/45.jpg",
//     title: "⭐⭐⭐⭐⭐ New Client Review!",
//     description: "Reliable and efficient! The technician handled the task with expertise and professionalism.",
//     time: "02:52 PM",
//     date: "Jan 6, 2025",
//     isUnread: false,
//   },
//   {
//     id: "6",
//     category: "This Week",
//     image: "https://randomuser.me/api/portraits/men/46.jpg",
//     title: "⭐⭐⭐⭐⭐ New Client Review!",
//     description: "Would highly recommend! Great service, well-trained staff, and a job well done.",
//     time: "12:56 PM",
//     date: "Jan 5, 2025",
//     isUnread: false,
//   },
// ];

const NotificationScreen = ({ navigation }) => {
    const [selectedTab, setSelectedTab] = useState("All");
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadNotifications();
    }, [selectedTab]);

    const loadNotifications = async () => {
        try {
            const endpoint =
                selectedTab === "Unread"
                    ? "/notifications/unread"
                    : "/notifications";
            const res = await api.get(endpoint);
            let data = res.data;

            if (selectedTab === "Read") {
                data = data.filter((n) => n.isRead);
            }

            // Map API fields to what your renderNotification expects
            const mapped = data.map((n) => ({
                id: n._id,
                title: n.title,
                description: n.message,
                time: new Date(n.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                }),
                date: new Date(n.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                }),
                isUnread: !n.isRead,
                category: isToday(n.createdAt) ? "Today" : "This Week",
                icon:
                    n.type === "task_assigned"
                        ? "check-circle-outline"
                        : "bell-outline",
                iconBg: "#FFDADA",
            }));

            setNotifications(mapped);
        } catch (error) {
            console.error("Failed to load notifications:", error);
        } finally {
            setLoading(false);
        }
    };

    // Helper to categorize notifications
    const isToday = (dateStr) => {
        const d = new Date(dateStr);
        const today = new Date();
        return d.toDateString() === today.toDateString();
    };

    // Filter notifications based on the selected tab
    const filterNotifications = () => {
        if (selectedTab === "Unread")
            return notifications.filter((n) => n.isUnread);
        if (selectedTab === "Read")
            return notifications.filter((n) => !n.isUnread);
        return notifications;
    };

    // Group notifications by their category
    const groupNotificationsByCategory = (notifications) => {
        return notifications.reduce((acc, notification) => {
            const category = notification.category;
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push(notification);
            return acc;
        }, {});
    };

    // Render a single notification item
    const renderNotification = ({ item }) => (
        <View style={styles.notificationContainer}>
            {item.isUnread && <View style={styles.redDot} />}
            {item.image ? (
                <Image
                    source={{ uri: item.image }}
                    style={styles.profileImage}
                />
            ) : (
                <View
                    style={[
                        styles.iconContainer,
                        { backgroundColor: item.iconBg },
                    ]}
                >
                    <MaterialCommunityIcons
                        name={item.icon}
                        size={34}
                        color="#730000"
                    />
                </View>
            )}
            <View style={styles.textContainer}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.description}>{item.description}</Text>
                <View style={styles.dateTimeContainer}>
                    <Text style={styles.date}>{item.date}</Text>
                    <Text style={styles.time}>{item.time}</Text>
                </View>
            </View>
        </View>
    );

    // Render a section with its title and notifications
    const renderSection = (category, notifications) => (
        <View key={category}>
            <Text style={styles.sectionTitle}>{category}</Text>
            {notifications.map((item) => (
                <View key={item.id}>{renderNotification({ item })}</View>
            ))}
        </View>
    );

    // Render all sections with their respective notifications
    const renderNotificationsByCategory = () => {
        const filteredNotifications = filterNotifications();
        const groupedNotifications = groupNotificationsByCategory(
            filteredNotifications,
        );

        return Object.keys(groupedNotifications).map((category) =>
            renderSection(category, groupedNotifications[category]),
        );
    };

    // Render the "No Notifications" screen
    const renderNoNotifications = () => (
        <View style={styles.noNotificationsContainer}>
            <Image
                source={require("../../assets/NotificationIcon.png")} // Replace with your image path
                style={styles.noNotificationsImage}
            />
            <Text style={styles.noNotificationsText}>No Notifications</Text>
            <Text style={styles.noNotificationsSubtext}>
                You're all caught up! Stay tuned for updates on tasks, alerts,
                and important announcements.
            </Text>
        </View>
    );

    // Clear all notifications
    const clearAllNotifications = () => {
        Alert.alert(
            "Clear Notifications",
            "Are you sure you want to clear all notifications?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Clear",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await api.put("/notifications/read-all");
                            setNotifications([]);
                        } catch (error) {
                            console.error(
                                "Failed to clear notifications:",
                                error,
                            );
                        }
                    },
                },
            ],
        );
    };

    // Check if there are no notifications to display
    const filteredNotifications = filterNotifications();
    const hasNotifications = filteredNotifications.length > 0;

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={26} color="black" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Notifications</Text>
                <TouchableOpacity onPress={clearAllNotifications}>
                    <Text style={styles.clearText}>Clear</Text>
                </TouchableOpacity>
            </View>

            {/* Tabs */}
            <View style={styles.tabs}>
                {["All", "Read", "Unread"].map((tab) => (
                    <TouchableOpacity
                        key={tab}
                        style={[
                            styles.tab,
                            selectedTab === tab && styles.activeTab,
                        ]}
                        onPress={() => setSelectedTab(tab)}
                    >
                        <Text
                            style={[
                                styles.tabText,
                                selectedTab === tab && styles.activeTabText,
                            ]}
                        >
                            {tab}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Notification List or No Notifications Screen */}
            {hasNotifications ? (
                <FlatList
                    data={[]} // Empty data array since we're rendering manually
                    keyExtractor={(item) => item.id}
                    renderItem={null} // No renderItem since we're rendering manually
                    ListHeaderComponent={renderNotificationsByCategory}
                />
            ) : (
                renderNoNotifications()
            )}
        </View>
    );
};

export default NotificationScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        padding: 15,
    },

    /** HEADER **/
    header: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 20,
        paddingTop: 50,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "bold",
        flex: 1,
        marginLeft: 5,
    },
    clearText: {
        fontSize: 16,
        color: "#007a3f",
        fontWeight: "bold",
    },

    /** TABS **/
    tabs: {
        flexDirection: "row",
        justifyContent: "space-evenly",
        marginBottom: 10,
    },
    tab: {
        width: 80,
        borderRadius: 20,
        backgroundColor: "#FFF0F0",
        height: 30,
        alignItems: "center",
        justifyContent: "center",
    },
    activeTab: {
        backgroundColor: "#007a3f",
    },
    tabText: {
        fontSize: 14,
        color: "#007a3f",
        fontWeight: "bold",
    },
    activeTabText: {
        color: "#fff",
        fontWeight: "bold",
    },

    /** SECTION HEADERS **/
    sectionTitle: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#730000",
        marginVertical: 10,
    },

    /** NOTIFICATION ITEM **/
    notificationContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 15,
        backgroundColor: "#fff",
        padding: 10,
        position: "relative",
        paddingHorizontal: 20,
    },
    iconContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: "center",
        alignItems: "center",
    },
    profileImage: {
        width: 60,
        height: 60,
        borderRadius: 30,
    },

    /** TEXT **/
    textContainer: {
        flex: 1,
        marginLeft: 10,
    },
    title: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#007a3f",
    },
    description: {
        fontSize: 12,
        color: "#555",
    },
    dateTimeContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 5,
    },
    date: {
        fontSize: 12,
        color: "#007a3f",
        fontWeight: "bold",
    },
    time: {
        fontSize: 12,
        color: "#999",
    },

    /** RED DOT FOR UNREAD **/
    redDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: "#007a3f",
        position: "absolute",
        left: 3,
        top: "65%",
        transform: [{ translateY: -6 }],
    },

    /** NO NOTIFICATIONS **/
    noNotificationsContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 100,
    },
    noNotificationsImage: {
        width: 350,
        height: 300,
    },
    noNotificationsText: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#007a3f",
        marginBottom: 5,
    },
    noNotificationsSubtext: {
        fontSize: 14,
        color: "#555",
        textAlign: "center",
        paddingHorizontal: 40,
    },
});
