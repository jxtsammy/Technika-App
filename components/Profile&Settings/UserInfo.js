import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    Image,
    TouchableOpacity,
    Alert,
    KeyboardAvoidingView,
    ScrollView,
    Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import CountryPicker from "react-native-country-picker-modal";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useEffect } from "react";
import api from "../../api";

export default function PersonalInfoScreen({ navigation }) {
    const [profileImage, setProfileImage] = useState(null);
    const [selectedCountry, setSelectedCountry] = useState("GH");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [birthDate, setBirthDate] = useState("");

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const res = await api.get("/users/profile");
            const u = res.data;
            setFullName(`${u.firstName} ${u.lastName}`);
            setEmail(u.email);
            setPhoneNumber(u.phoneNumber || "");
            setBirthDate(
                u.birthDate
                    ? new Date(u.birthDate).toLocaleDateString("en-US")
                    : "",
            );
            if (u.profilePicture) setProfileImage(u.profilePicture);
        } catch (error) {
            console.error("Failed to load profile:", error);
        }
    };

    // Open gallery to select a new profile picture
    const openGallery = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });

        if (!result.canceled) {
            setProfileImage(result.assets[0].uri);
        }
    };

    // Open camera to take a new profile picture
    const openCamera = async () => {
        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });

        if (!result.canceled) {
            setProfileImage(result.assets[0].uri);
        }
    };

    // Save Changes
    const saveChanges = async () => {
        try {
            // Split fullName back into firstName / lastName
            const parts = fullName.trim().split(" ");
            const firstName = parts[0] || "";
            const lastName = parts.slice(1).join(" ") || "";

            await api.put("/users/profile", {
                firstName,
                lastName,
                phoneNumber,
                birthDate: birthDate || undefined,
                profilePicture: profileImage || undefined,
            });

            Alert.alert(
                "Success",
                "Your changes have been saved successfully!",
            );
        } catch (error) {
            Alert.alert(
                "Error",
                error.response?.data?.message || "Could not save changes.",
            );
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Header Section */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Icon name="arrow-back" size={30} color="black" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Personal Info</Text>
                    <View style={styles.headerIcons}>
                        <TouchableOpacity>
                            <Icon
                                name="notifications"
                                size={30}
                                color="black"
                            />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Profile Section */}
                <View style={styles.profileContainer}>
                    <Image
                        style={styles.profileImage}
                        source={
                            profileImage
                                ? { uri: profileImage }
                                : require("../../assets/ProfileImage.png")
                        }
                    />
                    <TouchableOpacity
                        style={styles.cameraButton}
                        onPress={openCamera}
                    >
                        <Icon name="camera-alt" size={24} color="white" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.editButton}
                        onPress={openGallery}
                    >
                        <Icon name="edit" size={24} color="white" />
                    </TouchableOpacity>
                </View>

                {/* Input Fields */}
                <View style={styles.inputContainer}>
                    <Text style={styles.inputTitle}>Full Name</Text>
                    <TextInput
                        style={styles.textInput}
                        placeholder="Full Name"
                        value={fullName}
                        onChangeText={setFullName}
                        placeholderTextColor="#ccc"
                    />

                    <Text style={styles.inputTitle}>Email</Text>
                    <TextInput
                        style={styles.textInput}
                        placeholder="Email"
                        value={email}
                        onChangeText={setEmail}
                        placeholderTextColor="#ccc"
                    />

                    <Text style={styles.inputTitle}>Birth Date</Text>
                    <View style={styles.dateInputContainer}>
                        <TextInput
                            style={styles.dateInput}
                            placeholder="MM/DD/YYYY"
                            value={birthDate}
                            onChangeText={setBirthDate}
                            placeholderTextColor="#ccc"
                        />
                        <Icon name="calendar-today" size={20} color="gray" />
                    </View>

                    <Text style={styles.inputTitle}>Phone Number</Text>
                    <View style={styles.phoneInputContainer}>
                        <View style={styles.countryPickerContainer}>
                            <CountryPicker
                                withFilter
                                withFlag
                                withCallingCode
                                countryCode={selectedCountry}
                                onSelect={(country) =>
                                    setSelectedCountry(country.cca2)
                                }
                            />
                        </View>
                        <TextInput
                            style={styles.phoneInput}
                            placeholder="Phone Number"
                            value={phoneNumber}
                            onChangeText={setPhoneNumber}
                            placeholderTextColor="#ccc"
                        />
                    </View>
                </View>

                {/* Confirm Button */}
                <TouchableOpacity
                    style={styles.confirmButton}
                    onPress={saveChanges}
                >
                    <Text style={styles.confirmText}>Confirm</Text>
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "white",
    },
    scrollContent: {
        padding: 20,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 30,
        paddingTop: 50,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#000",
    },
    headerIcons: {
        flexDirection: "row",
        alignItems: "center",
    },
    profileContainer: {
        alignItems: "center",
        marginBottom: 30,
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    cameraButton: {
        position: "absolute",
        bottom: 20,
        left: 80,
        backgroundColor: "#007a3f",
        borderRadius: 10,
        padding: 5,
    },
    editButton: {
        position: "absolute",
        bottom: 20,
        right: 80,
        backgroundColor: "#007a3f",
        borderRadius: 10,
        padding: 5,
    },
    inputContainer: {
        marginBottom: 20,
    },
    inputTitle: {
        marginBottom: 10,
        fontSize: 16,
        color: "#6C7278",
    },
    textInput: {
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 12,
        paddingHorizontal: 15,
        paddingVertical: 20,
        marginBottom: 30,
        fontSize: 16,
    },
    dateInputContainer: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 12,
        paddingHorizontal: 10,
        paddingVertical: 20,
        marginBottom: 20,
    },
    dateInput: {
        flex: 1,
        marginRight: 10,
        fontSize: 16,
    },
    phoneInputContainer: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 12,
        paddingHorizontal: 10,
        paddingVertical: 10,
        marginBottom: 20,
    },
    countryPickerContainer: {
        flex: 0.15,
        borderRightWidth: 1,
        borderRightColor: "#ccc",
    },
    phoneInput: {
        flex: 0.65,
        marginLeft: 10,
        fontSize: 16,
    },
    confirmButton: {
        backgroundColor: "#007a3f",
        paddingVertical: 15,
        alignItems: "center",
        borderRadius: 10,
        marginBottom: 20,
    },
    confirmText: {
        color: "white",
        fontSize: 16,
        fontWeight: "bold",
    },
});
