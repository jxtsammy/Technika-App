import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    ScrollView,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../../api";

const ProfileScreen = ({ navigation }) => {
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [profileImage, setProfileImage] = useState(null);

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const res = await api.get("/users/profile");
            const u = res.data;
            setFullName(`${u.firstName} ${u.lastName}`);
            setEmail(u.email);
            if (u.profilePicture) setProfileImage(u.profilePicture);
        } catch (error) {
            console.error("Failed to load profile:", error);
        }
    };

    const handleLogout = async () => {
        await AsyncStorage.removeItem("token");
        await AsyncStorage.removeItem("user");
        navigation.replace("login");
    };

    return (
        <ScrollView
            style={styles.container}
            showsVerticalScrollIndicator={false}
        >
            {/* Profile Picture Section */}
            <View style={styles.profileSection}>
                <View style={styles.profilePictureContainer}>
                    <Image
                        source={
                            profileImage
                                ? { uri: profileImage }
                                : require("../../assets/ProfileImage.png")
                        }
                        style={styles.profilePicture}
                    />
                </View>
                <Text style={styles.profileName}>{fullName}</Text>
                <Text style={styles.profileEmail}>{email}</Text>
            </View>

            <View style={styles.delailsContainer}>
                {/* Profile Details */}
                <TouchableOpacity
                    style={styles.profileDetails}
                    onPress={() => navigation.navigate("userInfo")}
                >
                    <Icon name="person" size={30} color="white" />
                    <View style={styles.detailText}>
                        <Text style={styles.detailTitle}>{fullName}</Text>
                        <Text style={styles.detailSubtitle}>View Profile</Text>
                    </View>
                    <Icon name="chevron-right" size={30} color="white" />
                </TouchableOpacity>

                {/* Options */}
                <TouchableOpacity
                    style={styles.option}
                    onPress={() => navigation.navigate("security")}
                >
                    <Icon name="lock" size={30} color="gray" />
                    <Text style={styles.optionText}>Account Security</Text>
                    <Icon name="chevron-right" size={30} color="gray" />
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.option}
                    onPress={() => navigation.navigate("notification")}
                >
                    <Icon name="notifications" size={30} color="gray" />
                    <Text style={styles.optionText}>Notifications</Text>
                    <Icon name="chevron-right" size={30} color="gray" />
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.option}
                    onPress={() => navigation.navigate("help")}
                >
                    <Icon name="help" size={30} color="gray" />
                    <Text style={styles.optionText}>Help & Support</Text>
                    <Icon name="chevron-right" size={30} color="gray" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.option} onPress={handleLogout}>
                    <Icon name="logout" size={30} color="red" />
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    profileSection: {
        alignItems: "center",
        marginVertical: 30,
    },
    profilePictureContainer: {
        position: "relative",
    },
    profilePicture: {
        width: 89,
        height: 89,
        borderRadius: 50,
    },
    profileName: {
        marginTop: 10,
        fontSize: 22,
        fontWeight: "bold",
    },
    profileEmail: {
        marginTop: 2,
        fontSize: 18,
    },
    delailsContainer: {
        marginBottom: 30,
    },
    profileDetails: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#007a3f",
        padding: 15,
        marginHorizontal: 20,
        borderRadius: 10,
        marginBottom: 25,
    },
    detailText: {
        flex: 1,
        marginLeft: 10,
    },
    detailTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "white",
    },
    detailSubtitle: {
        fontSize: 14,
        color: "white",
    },
    option: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#f4f4f4",
        padding: 15,
        marginHorizontal: 20,
        borderRadius: 10,
        marginBottom: 30,
        paddingVertical: 20,
    },
    optionText: {
        flex: 1,
        marginLeft: 10,
        fontSize: 18,
        color: "gray",
    },
    logoutText: {
        flex: 1,
        marginLeft: 10,
        fontSize: 18,
        color: "red",
    },
});

export default ProfileScreen;
