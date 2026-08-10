import React, { useState, useRef, useEffect } from "react";
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import api from "../../api";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ChatScreen = ({ navigation, route }) => {
    const { name, image, number, text, time, chatId } = route.params;
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [currentUserId, setCurrentUserId] = useState(
        route.params?.currentUserId ?? null,
    );
    const scrollViewRef = useRef();

    useEffect(() => {
        (async () => {
            // Source of truth is AsyncStorage, not route params — nothing upstream
            // reliably passes currentUserId, so we look it up here instead.
            let uid = route.params?.currentUserId ?? null;
            if (!uid) {
                try {
                    const userStr = await AsyncStorage.getItem("user");
                    const userData = userStr ? JSON.parse(userStr) : null;
                    uid = userData?._id ?? null;
                } catch (error) {
                    console.error("Failed to load current user:", error);
                }
            }
            setCurrentUserId(uid);

            if (chatId) {
                loadMessages(uid);
            } else {
                // Fallback: show the preview message passed from chat list
                setMessages([{ id: 1, text, sender: "other", time }]);
            }
        })();
    }, []);

    const loadMessages = async (uid) => {
        try {
            const res = await api.get(`/chats/${chatId}/messages`);
            const mapped = res.data.map((msg) => ({
                id: msg._id,
                text: msg.content,
                sender: msg.sender?._id === uid ? "user" : "other",
                time: new Date(msg.createdAt).toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                }),
            }));
            setMessages(mapped);
        } catch (error) {
            console.error("Failed to load messages:", error);
        }
    };

    const handleSendMessage = async () => {
        if (!message.trim()) return;

        const newMessage = {
            id: Date.now(),
            text: message.trim(),
            sender: "user",
            time: new Date().toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
            }),
        };

        // Optimistically add to UI immediately
        setMessages((prev) => [...prev, newMessage]);
        setMessage("");

        try {
            await api.post(`/chats/${chatId}/messages`, {
                content: newMessage.text,
            });
        } catch (error) {
            console.error("Failed to send message:", error);
        }
    };

    const Header = () => (
        <View style={styles.header}>
            <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
            >
                <Ionicons name="chevron-back" size={30} color="#000" />
            </TouchableOpacity>
            <View style={styles.profileContainer}>
                <Image source={{ uri: image }} style={styles.avatar} />
                <View>
                    <Text style={styles.name}>{name}</Text>
                    <Text style={styles.phone}>{number}</Text>
                </View>
            </View>
            <View style={styles.headerIcons}>
                <TouchableOpacity style={styles.iconButton}>
                    <Ionicons name="videocam" size={24} color="#000" />
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.iconButton}
                    onPress={() =>
                        navigation.navigate("callScreen", {
                            name,
                            image,
                            number,
                        })
                    }
                >
                    <Ionicons name="call" size={24} color="#000" />
                </TouchableOpacity>
            </View>
        </View>
    );

    const MessageBubble = ({ text, sender, time }) => (
        <View
            style={[
                styles.messageBubble,
                sender === "other" ? styles.otherMessage : styles.userMessage,
            ]}
        >
            <Text
                style={[
                    styles.messageText,
                    sender === "other"
                        ? styles.otherMessageText
                        : styles.userMessageText,
                ]}
            >
                {text}
            </Text>
            <Text style={styles.messageTime}>{time}</Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <Header />
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.container}
                keyboardVerticalOffset={Platform.OS === "ios" ? 5 : 0}
            >
                <ScrollView
                    ref={scrollViewRef}
                    style={styles.messagesContainer}
                    onContentSizeChange={() =>
                        scrollViewRef.current.scrollToEnd({ animated: true })
                    }
                >
                    {messages.map((msg) => (
                        <MessageBubble
                            key={msg.id}
                            text={msg.text}
                            sender={msg.sender}
                            time={msg.time}
                        />
                    ))}
                </ScrollView>
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Type a message..."
                        value={message}
                        onChangeText={setMessage}
                        multiline
                        maxHeight={55}
                        placeholderTextColor="#ccc"
                        onFocus={() => {
                            setTimeout(() => {
                                scrollViewRef.current.scrollToEnd({
                                    animated: true,
                                });
                            }, 100);
                        }}
                    />
                    <TouchableOpacity style={styles.attachButton}>
                        <Ionicons name="attach" size={30} color="#666" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.sendButton}
                        onPress={handleSendMessage}
                    >
                        <Ionicons
                            name={message.trim() ? "paper-plane" : "mic"}
                            size={26}
                            color="#fff"
                        />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
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
        padding: 5,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },
    backButton: {
        padding: 5,
    },
    profileContainer: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        marginLeft: 10,
    },
    avatar: {
        width: 45,
        height: 45,
        borderRadius: 30,
        marginRight: 10,
        marginBottom: 5,
    },
    name: {
        fontSize: 15,
        fontWeight: "500",
        marginBottom: 2,
    },
    phone: {
        fontSize: 12,
        color: "#666",
    },
    headerIcons: {
        flexDirection: "row",
    },
    iconButton: {
        padding: 5,
        marginLeft: 10,
    },
    messagesContainer: {
        flex: 1,
        padding: 10,
        backgroundColor: "#eed",
    },
    messageBubble: {
        maxWidth: "80%",
        marginVertical: 5,
        padding: 10,
    },
    userMessage: {
        alignSelf: "flex-end",
        backgroundColor: "#007a3f",
        borderRadius: 20,
        borderTopRightRadius: 0,
    },
    otherMessage: {
        alignSelf: "flex-start",
        backgroundColor: "#ffff",
        borderRadius: 20,
        borderTopLeftRadius: 0,
    },
    messageText: {
        fontSize: 16,
    },
    userMessageText: {
        color: "#fff",
    },
    otherMessageText: {
        color: "#000",
    },
    messageTime: {
        fontSize: 10,
        color: "#bbb",
        alignSelf: "flex-end",
        marginTop: 5,
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        padding: 10,
        borderTopWidth: 1,
        borderTopColor: "#eee",
    },
    input: {
        flex: 1,
        backgroundColor: "#f0f0f0",
        borderRadius: 30,
        paddingHorizontal: 15,
        paddingVertical: 15,
        marginHorizontal: 5,
        fontSize: 16,
        maxHeight: 55,
    },
    attachButton: {
        padding: 5,
    },
    sendButton: {
        backgroundColor: "#E53935",
        width: 45,
        height: 45,
        borderRadius: 30,
        justifyContent: "center",
        alignItems: "center",
    },
});

export default ChatScreen;
