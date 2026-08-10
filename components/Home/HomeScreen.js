import React, { useState, useEffect } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Image,
    Switch,
    Dimensions,
    StatusBar,
    Alert,
} from "react-native";
import AiButton from "../AiTechnician/Icon";
import {
    Home,
    ClipboardList,
    MessageSquare,
    User,
    Bell,
} from "lucide-react-native";
import MapView, { Marker } from "react-native-maps";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { LineChart } from "react-native-chart-kit";
import Chats from "../../components/Chat/ChatList";
import Tasks from "./Task";
import Profile from "../Profile&Settings/ProfileScreen";
import api from "../../api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";

const Tab = createBottomTabNavigator();
const { width } = Dimensions.get("window");

// Home Screen
const HomeScreen = ({ navigation }) => {
    const [activeTab, setActiveTab] = useState("quickstats");
    const [stats, setStats] = useState({
        available: 0,
        completed: 0,
        pending: 0,
        averageCompletionMinutes: 0,
    });
    const [monthlyData, setMonthlyData] = useState([]);
    const [currentTask, setCurrentTask] = useState(null);

    useEffect(() => {
        loadHomeData();
    }, []);

    const loadHomeData = async () => {
        try {
            const [statsRes, monthlyRes, currentRes] = await Promise.all([
                api.get("/tasks/stats"),
                api.get("/tasks/stats/monthly"),
                api.get("/tasks/current"),
            ]);
            setStats(statsRes.data);
            setMonthlyData(monthlyRes.data);
            setCurrentTask(currentRes.data);
        } catch (error) {
            console.error("Failed to load home data:", error);
        }
    };

    const chartData = {
        labels: monthlyData.length
            ? monthlyData.map((d) => d.month)
            : ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
        datasets: [
            {
                data: monthlyData.length
                    ? monthlyData.map((d) => d.completed)
                    : [0, 0, 0, 0, 0, 0],
                strokeWidth: 2,
                color: () => `#007a3f`,
            },
        ],
    };

    const chartConfig = {
        backgroundGradientFrom: "#ffff",
        backgroundGradientTo: "#ffff",
        color: (opacity = 1) => `rgba(50, 205, 50, ${opacity})`,
        labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        strokeWidth: 2,
        propsForDots: {
            r: "4",
            strokeWidth: "2",
            stroke: "#fffff",
        },
    };

    const statCards = [
        {
            title: "Task Available",
            value: String(stats.available),
            change: "",
            color: "#23C581",
            text: "",
            image: require("../../assets/TaskAvailable.png"),
        },
        {
            title: "Task Completed",
            value: String(stats.completed),
            change: "",
            color: "#23C581",
            text: "",
            image: require("../../assets/TaskAvailable.png"),
        },
        {
            title: "Task In Progress",
            value: String(stats.pending),
            change: "",
            color: "",
            text: "",
            image: require("../../assets/TaskInProgress.png"),
        },
        {
            title: "Avg\nCompletion Time",
            value: `${stats.averageCompletionMinutes}m`,
            change: "",
            color: "#007a3f",
            text: "",
            image: require("../../assets/AvgCompletion.png"),
        },
    ];

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

            {/* Tabs */}
            <View style={styles.tabs}>
                <TouchableOpacity
                    style={[
                        styles.tabButton,
                        activeTab === "quickstats" && {
                            backgroundColor: "#007a3f",
                        },
                    ]}
                    onPress={() => setActiveTab("quickstats")}
                >
                    <Text
                        style={[
                            styles.tabText,
                            activeTab === "quickstats" && { color: "#fff" },
                        ]}
                    >
                        Quick Stats
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[
                        styles.tabButton,
                        activeTab === "map" && { backgroundColor: "#007a3f" },
                    ]}
                    onPress={() => setActiveTab("map")}
                >
                    <Text
                        style={[
                            styles.tabText,
                            activeTab === "map" && { color: "#fff" },
                        ]}
                    >
                        Map
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Tab Content */}
            {activeTab === "map" ? (
                <View style={styles.mapContainer}>
                    <MapView
                        style={styles.map}
                        initialRegion={{
                            latitude: 6.307,
                            longitude: 0.0541,
                            latitudeDelta: 0.009,
                            longitudeDelta: 0.009,
                        }}
                    >
                        {[
                            {
                                id: 1,
                                lat: 6.31,
                                lng: 0.0565,
                                title: "Nearby Job 1",
                            },
                            {
                                id: 2,
                                lat: 6.312,
                                lng: 0.0525,
                                title: "Nearby Job 2",
                            },
                            {
                                id: 3,
                                lat: 6.305,
                                lng: 0.057,
                                title: "GCB Bank",
                            },
                            {
                                id: 4,
                                lat: 6.3085,
                                lng: 0.059,
                                title: "Retail Store",
                            },
                            {
                                id: 5,
                                lat: 6.306,
                                lng: 0.051,
                                title: "Construction Site",
                            },
                            { id: 6, lat: 6.3115, lng: 0.049, title: "School" },
                            {
                                id: 7,
                                lat: 6.313,
                                lng: 0.054,
                                title: "Hospital",
                            },
                        ].map((marker) => (
                            <Marker
                                key={marker.id}
                                coordinate={{
                                    latitude: marker.lat,
                                    longitude: marker.lng,
                                }}
                                title={marker.title}
                            >
                                <View style={styles.jobMarker}>
                                    <MaterialIcons
                                        name="engineering"
                                        size={24}
                                        color="white"
                                    />
                                </View>
                            </Marker>
                        ))}
                    </MapView>
                    <TouchableOpacity
                        style={styles.floatingButton}
                        onPress={() => navigation.navigate("Tasks")}
                    >
                        <Text style={styles.taskNote}>{stats.available}</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <ScrollView showsVerticalScrollIndicator={false}>
                    <Text style={styles.quickStatsTitle}>Current Task</Text>
                    <View style={styles.taskCard}>
                        <View style={styles.taskCardContent}>
                            <View>
                                <Text style={styles.taskId}>
                                    {currentTask
                                        ? `#${currentTask._id.slice(-8).toUpperCase()}`
                                        : "No active task"}
                                </Text>
                                <Text style={styles.taskTitle}>
                                    {currentTask ? currentTask.title : "—"}
                                </Text>
                                {currentTask && (
                                    <TouchableOpacity
                                        style={styles.viewProgressButton}
                                    >
                                        <Text style={styles.viewProgressText}>
                                            View Progress
                                        </Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                            <Image
                                source={require("../../assets/Scooter.png")}
                                style={styles.taskImage}
                            />
                        </View>
                    </View>

                    <Text style={styles.quickStatsTitle}>Quick Job Stats</Text>
                    <View style={styles.statsContainer}>
                        {statCards.map((stat, index) => (
                            <View key={index} style={styles.statBox}>
                                <View style={styles.statHeader}>
                                    <Image
                                        source={stat.image}
                                        style={styles.statImage}
                                    />
                                    <Text style={styles.statTitle}>
                                        {stat.title}
                                    </Text>
                                </View>
                                <View style={styles.statRow}>
                                    <View
                                        style={{
                                            flexDirection: "row",
                                            alignItems: "center",
                                        }}
                                    >
                                        {stat.change !== "" && (
                                            <>
                                                <Text
                                                    style={[
                                                        styles.statChange,
                                                        { color: stat.color },
                                                    ]}
                                                >
                                                    {stat.change}
                                                </Text>
                                                <Text
                                                    style={
                                                        styles.statChangeText
                                                    }
                                                >
                                                    {" "}
                                                    {stat.text}
                                                </Text>
                                            </>
                                        )}
                                    </View>
                                    <Text style={styles.statValue}>
                                        {stat.value}
                                    </Text>
                                </View>
                            </View>
                        ))}
                    </View>

                    <Text style={styles.title}>Task Progress</Text>
                    <LineChart
                        data={chartData}
                        width={400}
                        height={220}
                        chartConfig={chartConfig}
                        bezier
                        style={styles.chart}
                        verticalLabelRotation={0}
                        fromZero
                    />
                </ScrollView>
            )}
            <AiButton />
        </View>
    );
};

export default function App({ navigation }) {
    const [isOnline, setIsOnline] = useState(true);
    const [userName, setUserName] = useState("");
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        AsyncStorage.getItem("user").then((saved) => {
            if (saved) setUserName(JSON.parse(saved).firstName);
        });
        loadUnreadCount();
    }, []);

    // Push location to the backend on an interval while the technician is
    // online. This is what actually feeds the admin's live map — previously
    // nothing in the app ever called PUT /users/location after onboarding.
    useEffect(() => {
        if (!isOnline) return;

        let cancelled = false;

        const pushLocation = async () => {
            try {
                const { status } =
                    await Location.getForegroundPermissionsAsync();
                if (status !== "granted") {
                    const req =
                        await Location.requestForegroundPermissionsAsync();
                    if (req.status !== "granted") return;
                }
                const position = await Location.getCurrentPositionAsync({});
                if (cancelled) return;
                await api.put("/users/location", {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                });
            } catch (error) {
                console.error("Failed to push location:", error);
            }
        };

        pushLocation(); // push immediately on going online, then on an interval
        const intervalId = setInterval(pushLocation, 60000); // every 60s

        return () => {
            cancelled = true;
            clearInterval(intervalId);
        };
    }, [isOnline]);

    const loadUnreadCount = async () => {
        try {
            const res = await api.get("/notifications/unread");
            setUnreadCount(res.data.length);
        } catch (error) {
            console.error("Failed to load unread count:", error);
        }
    };

    const handleToggleOnline = async (value) => {
        try {
            await api.put("/users/online-status", { isOnline: value });
            setIsOnline(value);
        } catch (error) {
            Alert.alert("Error", "Could not update online status");
        }
    };

    return (
        <>
            <StatusBar
                translucent
                backgroundColor="transparent"
                barStyle="dark-content"
            />

            <View style={styles.header}>
                <Text style={styles.headerTitle}>Hi {userName},</Text>
                <View style={styles.headerIcons}>
                    <Switch
                        value={isOnline}
                        onValueChange={handleToggleOnline}
                        thumbColor={isOnline ? "#ffff" : "#007a3f"}
                        trackColor={{ false: "#ffff", true: "#007a3f" }}
                        style={{
                            transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }],
                        }}
                    />
                    <TouchableOpacity
                        style={styles.notificationIcon}
                        onPress={() => navigation.navigate("notification")}
                    >
                        <Bell size={30} color="#333" />
                        {unreadCount > 0 && (
                            <View style={styles.notificationBadge}>
                                <Text style={styles.notificationBadgeText}>
                                    {unreadCount}
                                </Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>
            </View>

            <Tab.Navigator
                screenOptions={({ route }) => ({
                    tabBarIcon: ({ color }) => {
                        if (route.name === "Home")
                            return <Home size={30} color={color} />;
                        if (route.name === "Tasks")
                            return <ClipboardList size={30} color={color} />;
                        if (route.name === "Chats")
                            return <MessageSquare size={30} color={color} />;
                        if (route.name === "Profile")
                            return <User size={30} color={color} />;
                    },
                    tabBarActiveTintColor: "#007a3f",
                    tabBarInactiveTintColor: "gray",
                })}
            >
                <Tab.Screen
                    name="Home"
                    component={HomeScreen}
                    options={{ headerShown: false }}
                />
                <Tab.Screen
                    name="Tasks"
                    component={Tasks}
                    options={{ headerShown: false }}
                />
                <Tab.Screen
                    name="Chats"
                    component={Chats}
                    options={{ headerShown: false }}
                />
                <Tab.Screen
                    name="Profile"
                    component={Profile}
                    options={{ headerShown: false }}
                />
            </Tab.Navigator>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: "#fff",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingTop: 60,
        backgroundColor: "#ffff",
        paddingHorizontal: 15,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: "bold",
    },
    headerIcons: {
        flexDirection: "row",
        alignItems: "center",
    },
    notificationIcon: {
        marginLeft: 5,
    },
    notificationBadge: {
        position: "absolute",
        top: -5,
        right: -5,
        backgroundColor: "#007a3f",
        borderRadius: 10,
        paddingHorizontal: 6,
        paddingVertical: 2,
    },
    notificationBadgeText: {
        color: "#fff",
        fontSize: 10,
    },
    tabs: {
        flexDirection: "row",
        marginBottom: 25,
    },
    tabButton: {
        flex: 1,
        paddingVertical: 10,
        borderWidth: 1,
        borderColor: "#007a3f",
        borderRadius: 20,
        alignItems: "center",
        marginHorizontal: 5,
    },
    tabText: {
        fontSize: 14,
        color: "#007a3f",
    },
    taskCard: {
        backgroundColor: "#007a3f",
        borderRadius: 18,
        padding: 20,
        marginBottom: 30,
    },
    taskCardContent: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    taskId: {
        color: "#fff",
        fontSize: 14,
    },
    taskTitle: {
        color: "#fff",
        fontSize: 20,
        fontWeight: "bold",
        marginVertical: 10,
    },
    viewProgressButton: {
        backgroundColor: "#fff",
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 5,
    },
    viewProgressText: {
        color: "#007a3f",
        fontSize: 14,
        fontWeight: "bold",
        textAlign: "center",
    },
    taskImage: {
        width: 200,
        height: 150,
    },
    quickStatsTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 10,
        color: "#007a3f",
    },
    statsContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
    },
    statBox: {
        width: "49%",
        backgroundColor: "#F4F4F4",
        borderRadius: 8,
        padding: 10,
        marginBottom: 10,
    },
    statTitle: {
        color: "#6C7278",
        fontSize: 14,
    },
    statValue: {
        fontSize: 23,
        fontWeight: "bold",
        color: "#007a3f",
    },
    statChange: {
        fontSize: 12,
        color: "#23C581",
    },
    statHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-start",
        marginBottom: 5,
    },
    statRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    statImage: {
        width: 45,
        height: 50,
        resizeMode: "contain",
        marginRight: 10,
    },
    statChangeText: {
        fontSize: 12,
        color: "#6C7278",
        marginLeft: 4,
    },
    mapContainer: {
        width: "110%",
        height: "100%",
        right: 20,
        alignItems: "center",
        justifyContent: "center",
    },
    map: {
        width: "100%",
        height: "100%",
    },
    jobMarker: {
        backgroundColor: "#0056D2",
        borderRadius: 20,
        padding: 5,
        justifyContent: "center",
        alignItems: "center",
    },
    floatingButton: {
        position: "absolute",
        bottom: 80,
        right: 20,
        width: 45,
        height: 45,
        backgroundColor: "#007a3f",
        borderRadius: 30,
        justifyContent: "center",
        alignItems: "center",
    },
    taskNote: {
        color: "#fff",
        fontSize: 20,
        fontWeight: "bold",
    },
    title: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 10,
        color: "#007a3f",
        marginTop: 20,
    },
    chart: {
        borderRadius: 10,
        paddingHorizontal: 5,
    },
});
