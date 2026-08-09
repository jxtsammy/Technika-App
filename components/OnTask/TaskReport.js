import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Image,
    StyleSheet,
    ScrollView,
    FlatList,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { launchImageLibrary } from "react-native-image-picker";
import { SafeAreaView } from "react-native-safe-area-context";
import api from "../../api";

const ReportScreen = ({ navigation, route }) => {
    const [selectedImages, setSelectedImages] = useState([]);
    const [comments, setComments] = useState("");

    const openGallery = () => {
        const options = {
            selectionLimit: 5,
            mediaType: "photo",
        };

        launchImageLibrary(options, (response) => {
            if (response.didCancel) {
                console.log("User cancelled image picker");
            } else if (response.errorMessage) {
                console.log("ImagePicker Error:", response.errorMessage);
            } else {
                const images = response.assets.map((asset) => asset.uri);
                setSelectedImages((prevImages) => [...prevImages, ...images]);
            }
        });
    };

    const handleDone = async () => {
        try {
            if (comments.trim() && route?.params?.task?._id) {
                await api.put(`/tasks/${route.params.task._id}/note`, {
                    completionNote: comments.trim(),
                });
            }
        } catch (error) {
            console.error("Could not save note:", error);
        } finally {
            navigation.navigate("acknowledgmentToken");
        }
    };

    const renderImage = ({ item }) => (
        <Image source={{ uri: item }} style={styles.uploadedImage} />
    );

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.contentContainer}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Task Completed</Text>
                </View>

                {/* Task Card */}
                <View style={styles.taskCard}>
                    <View style={styles.taskCardContent}>
                        <View>
                            <Text style={styles.taskId}>
                                {route?.params?.task?._id
                                    ? `#${route.params.task._id.slice(-8).toUpperCase()}`
                                    : "TSK483-435"}
                            </Text>
                            <Text style={styles.congratulations}>
                                Congratulations
                            </Text>
                            <Text style={styles.taskDescription}>
                                Great work on finishing the job.{"\n"} Keep up
                                the excellent service!
                            </Text>
                            <TouchableOpacity
                                style={styles.newTaskButton}
                                onPress={() =>
                                    navigation.replace("home", {
                                        screen: "Task",
                                    })
                                }
                            >
                                <Text style={styles.newTaskButtonText}>
                                    New Task
                                </Text>
                            </TouchableOpacity>
                        </View>
                        <Image
                            source={require("../../assets/Scooter.png")}
                            style={styles.taskImage}
                            resizeMode="contain"
                        />
                    </View>
                </View>

                {/* Comments Section */}
                <Text style={styles.sectionTitle}>Add Your Comments</Text>
                <Text style={styles.sectionDescription}>
                    Add your comments here, and you can write up to 250 words
                    max
                </Text>
                <TextInput
                    style={styles.textArea}
                    placeholder="Add comments here ....."
                    multiline
                    numberOfLines={5}
                    placeholderTextColor="#777"
                    value={comments}
                    onChangeText={setComments}
                />

                {/* Media Upload Section */}
                <Text style={styles.sectionTitle}>Media Upload</Text>
                <Text style={styles.sectionDescription}>
                    Add your images here, and you can upload up to 5 files max
                </Text>
                <View style={styles.mediaUploadBox}>
                    {selectedImages.length === 0 ? (
                        <>
                            <FontAwesome
                                name="folder-open"
                                size={50}
                                color="#007a3f"
                            />
                            <Text style={styles.uploadText}>
                                Choose your images to start uploading
                            </Text>
                        </>
                    ) : (
                        <FlatList
                            data={selectedImages}
                            renderItem={renderImage}
                            keyExtractor={(item, index) => index.toString()}
                            horizontal
                        />
                    )}
                    <TouchableOpacity
                        style={styles.browseButton}
                        onPress={openGallery}
                    >
                        <Text style={styles.browseButtonText}>
                            Browse files
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Done Button */}
                <TouchableOpacity
                    style={styles.doneButton}
                    onPress={handleDone}
                >
                    <Text style={styles.doneButtonText}>Done</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },
    contentContainer: {
        padding: 16,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 16,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "bold",
    },
    taskCard: {
        backgroundColor: "#007a3f",
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
    },
    taskCardContent: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    taskId: {
        color: "white",
        fontWeight: "bold",
        marginBottom: 8,
    },
    congratulations: {
        color: "white",
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 8,
    },
    taskDescription: {
        color: "white",
        marginBottom: 16,
    },
    newTaskButton: {
        backgroundColor: "white",
        borderRadius: 8,
        paddingVertical: 8,
        paddingHorizontal: 16,
        alignSelf: "flex-start",
    },
    newTaskButtonText: {
        color: "#007a3f",
        fontWeight: "bold",
    },
    taskImage: {
        width: 200,
        height: 170,
        right: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#007a3f",
        marginBottom: 4,
    },
    sectionDescription: {
        fontSize: 12,
        color: "#777",
        marginBottom: 8,
    },
    textArea: {
        borderWidth: 1,
        borderColor: "#6C7278",
        borderRadius: 8,
        padding: 8,
        marginBottom: 16,
        textAlignVertical: "top",
        height: 120,
    },
    mediaUploadBox: {
        borderWidth: 2,
        borderColor: "#007a3f",
        borderRadius: 12,
        padding: 16,
        alignItems: "center",
        marginBottom: 20,
        borderStyle: "dashed",
        paddingVertical: 20,
    },
    uploadText: {
        textAlign: "center",
        color: "#777",
        marginBottom: 20,
        marginTop: 15,
    },
    uploadedImage: {
        width: 100,
        height: 100,
        borderRadius: 8,
        marginRight: 8,
    },
    browseButton: {
        borderRadius: 8,
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: "#007a3f",
    },
    browseButtonText: {
        color: "#007a3f",
        fontWeight: "bold",
    },
    doneButton: {
        backgroundColor: "#007a3f",
        borderRadius: 8,
        paddingVertical: 16,
        alignItems: "center",
        marginBottom: 16,
    },
    doneButtonText: {
        color: "white",
        fontWeight: "bold",
    },
});

export default ReportScreen;
