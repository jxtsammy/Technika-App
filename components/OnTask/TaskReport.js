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
    Alert,
    Modal,
    ActivityIndicator,
} from "react-native";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as FileSystem from "expo-file-system/legacy";
import api from "../../api";

const ReportScreen = ({ navigation, route }) => {
    const [selectedImages, setSelectedImages] = useState([]);
    const [comments, setComments] = useState("");
    const [isCameraVisible, setIsCameraVisible] = useState(false);
    const [cameraRef, setCameraRef] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [permission, requestPermission] = useCameraPermissions();

    const handleOpenLiveCamera = async () => {
        if (selectedImages.length >= 5) {
            Alert.alert(
                "Limit Reached",
                "You can upload a maximum of 5 images.",
            );
            return;
        }

        if (!permission?.granted) {
            const permissionResult = await requestPermission();
            if (!permissionResult.granted) {
                Alert.alert(
                    "Permission Required",
                    "Camera access is strictly required to capture live evidence.",
                );
                return;
            }
        }

        setIsCameraVisible(true);
    };

    const handleTakePicture = async () => {
        if (cameraRef) {
            const photo = await cameraRef.takePictureAsync({ quality: 0.8 });
            setSelectedImages((prevImages) => [...prevImages, photo.uri]);
            setIsCameraVisible(false);
        }
    };

    const handleRemoveImage = (indexToRemove) => {
        setSelectedImages((prevImages) =>
            prevImages.filter((_, index) => index !== indexToRemove),
        );
    };

    const handleDone = async () => {
        if (selectedImages.length < 2) {
            Alert.alert(
                "Live Media Required",
                "Please capture at least 2 live photos as evidence before submitting.",
            );
            return;
        }

        const taskId = route?.params?.task?._id;
        if (!taskId) {
            Alert.alert(
                "Error",
                "Missing task reference — cannot submit report.",
            );
            return;
        }

        setIsSubmitting(true);

        try {
            // 1. Get a signed upload signature scoped to this task
            const { data: sig } = await api.post(
                `/tasks/${taskId}/upload-signature`,
            );

            // 2. Upload each captured photo straight to Cloudinary.
            // Using expo-file-system's uploadAsync instead of fetch+FormData —
            // RN's built-in FormData implementation on this version rejects the
            // { uri, type, name } file-part shape with "Unsupported FormDataPart
            // implementation". uploadAsync sidesteps that entirely. Note: this
            // package's default export dropped uploadAsync in favor of a new
            // File/Directory API — the classic API now lives under the
            // '/legacy' import path, which is what's imported above.
            const uploadedUrls = [];
            for (const uri of selectedImages) {
                const result = await FileSystem.uploadAsync(
                    `https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`,
                    uri,
                    {
                        httpMethod: "POST",
                        uploadType: FileSystem.FileSystemUploadType.MULTIPART,
                        fieldName: "file",
                        parameters: {
                            api_key: String(sig.apiKey),
                            timestamp: String(sig.timestamp),
                            signature: sig.signature,
                            folder: sig.folder,
                        },
                    },
                );

                if (result.status < 200 || result.status >= 300) {
                    throw new Error(
                        `Image upload failed (status ${result.status})`,
                    );
                }

                const cloudData = JSON.parse(result.body);
                if (!cloudData.secure_url) {
                    throw new Error(
                        cloudData?.error?.message || "Image upload failed",
                    );
                }
                uploadedUrls.push(cloudData.secure_url);
            }

            // 3. Save the resulting URLs on the task
            await api.put(`/tasks/${taskId}/attachments`, {
                urls: uploadedUrls,
            });

            // 4. Save the comment, same as before
            if (comments.trim()) {
                await api.put(`/tasks/${taskId}/note`, {
                    completionNote: comments.trim(),
                });
            }
        } catch (error) {
            console.error("Report submission failed:", error);
            Alert.alert(
                "Upload Failed",
                "Could not submit your report. Please check your connection and try again.",
            );
            setIsSubmitting(false);
            return;
        }

        setIsSubmitting(false);
        // Verification already happened before this screen (in DeliveryTrackingApp,
        // via the token modal) — the task is already "completed" on the backend
        // by this point. Navigating to "acknowledgmentToken" here was leftover
        // wiring from before that reorder, and sent technicians through a second,
        // disconnected instance of the token screen with no taskId — hence
        // "missing task reference" on re-entry. Go straight to success instead.
        navigation.reset({
            index: 0,
            routes: [{ name: "taskSuccessMsg" }],
        });
    };

    const renderImage = ({ item, index }) => (
        <View style={styles.imageWrapper}>
            <Image source={{ uri: item }} style={styles.uploadedImage} />
            <TouchableOpacity
                style={styles.deleteBadge}
                onPress={() => handleRemoveImage(index)}
            >
                <Ionicons name="close-circle" size={24} color="#FF3B30" />
            </TouchableOpacity>
        </View>
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
                <Text style={styles.sectionTitle}>Live Media Evidence</Text>
                <Text style={styles.sectionDescription}>
                    Capture live photos via camera (Min: 2, Max: 5) | Captured:{" "}
                    {selectedImages.length}
                </Text>
                <View style={styles.mediaUploadBox}>
                    {selectedImages.length === 0 ? (
                        <>
                            <FontAwesome
                                name="camera"
                                size={44}
                                color="#007a3f"
                            />
                            <Text style={styles.uploadText}>
                                Take live photos of the work for verification
                            </Text>
                        </>
                    ) : (
                        <FlatList
                            data={selectedImages}
                            renderItem={renderImage}
                            keyExtractor={(item, index) => index.toString()}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            style={styles.imageList}
                        />
                    )}
                    <TouchableOpacity
                        style={styles.browseButton}
                        onPress={handleOpenLiveCamera}
                    >
                        <Text style={styles.browseButtonText}>
                            {selectedImages.length > 0
                                ? "Capture another"
                                : "Open Camera"}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Done Button */}
                <TouchableOpacity
                    style={[
                        styles.doneButton,
                        isSubmitting && { opacity: 0.6 },
                    ]}
                    onPress={handleDone}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                        <Text style={styles.doneButtonText}>Done</Text>
                    )}
                </TouchableOpacity>
            </ScrollView>

            {/* Full-Screen Camera View Modal */}
            <Modal visible={isCameraVisible} animationType="slide">
                <View style={styles.cameraContainer}>
                    <CameraView
                        style={styles.camera}
                        facing="back"
                        ref={(ref) => setCameraRef(ref)}
                    >
                        <View style={styles.cameraControls}>
                            <TouchableOpacity
                                style={styles.closeCameraButton}
                                onPress={() => setIsCameraVisible(false)}
                            >
                                <Ionicons
                                    name="close"
                                    size={30}
                                    color="#FFFFFF"
                                />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.captureButton}
                                onPress={handleTakePicture}
                            >
                                <View style={styles.captureInnerCircle} />
                            </TouchableOpacity>
                        </View>
                    </CameraView>
                </View>
            </Modal>
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
    imageList: {
        marginBottom: 16,
    },
    imageWrapper: {
        position: "relative",
        marginRight: 10,
    },
    uploadedImage: {
        width: 90,
        height: 90,
        borderRadius: 8,
    },
    deleteBadge: {
        position: "absolute",
        top: -6,
        right: -6,
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
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
    cameraContainer: {
        flex: 1,
    },
    camera: {
        flex: 1,
        justifyContent: "space-between",
    },
    cameraControls: {
        flex: 1,
        backgroundColor: "transparent",
        justifyContent: "space-between",
        padding: 24,
    },
    closeCameraButton: {
        alignSelf: "flex-end",
        marginTop: 20,
    },
    captureButton: {
        width: 70,
        height: 70,
        borderRadius: 35,
        borderWidth: 4,
        borderColor: "#FFFFFF",
        justifyContent: "center",
        alignItems: "center",
        alignSelf: "center",
        marginBottom: 20,
    },
    captureInnerCircle: {
        width: 54,
        height: 54,
        borderRadius: 27,
        backgroundColor: "#FFFFFF",
    },
});

export default ReportScreen;
