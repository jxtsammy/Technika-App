"use client"
import { useState, useRef, useEffect } from "react"
import api from "../../api"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Image,
  ImageBackground,
  Platform,
  KeyboardAvoidingView,
  StatusBar,
  Animated, // Import Animated
  ScrollView, // Import ScrollView
} from "react-native"
import { BlurView } from "expo-blur"
import * as ImagePicker from "expo-image-picker"
import { ArrowLeft, CheckCircle, Paperclip, Camera, Send, ShieldCheck } from "lucide-react-native"

// Typing Indicator Component
const TypingIndicator = () => {
  const dot1 = useRef(new Animated.Value(0)).current
  const dot2 = useRef(new Animated.Value(0)).current
  const dot3 = useRef(new Animated.Value(0)).current

  useEffect(() => {
    const animateDot = (dot, delay) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(dot, {
            toValue: 1,
            duration: 300,
            delay: delay,
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
      ).start()
    }

    animateDot(dot1, 0)
    animateDot(dot2, 150)
    animateDot(dot3, 300)
  }, [dot1, dot2, dot3])

  return (
    <View style={[styles.messageContainer, styles.receivedMessageContainer, { marginBottom: 15 }]}>
      <Image source={require("../../assets/ProfileImage.png")} style={styles.profilePicture} />
      <View style={[styles.messageBubble, styles.receivedMessage, styles.typingBubble]}>
        <Animated.Text style={[styles.typingDot, { opacity: dot1 }]}>•</Animated.Text>
        <Animated.Text style={[styles.typingDot, { opacity: dot2 }]}>•</Animated.Text>
        <Animated.Text style={[styles.typingDot, { opacity: dot3 }]}>•</Animated.Text>
      </View>
    </View>
  )
}

const ChatScreen = ({ navigation }) => {
  const [messages, setMessages] = useState([])
  const [history, setHistory] = useState([])
  const [inputText, setInputText] = useState("")
  const [selectedMessages, setSelectedMessages] = useState([])
  const [isSelectionMode, setIsSelectionMode] = useState(false)
  const [isOnline, setIsOnline] = useState(true)
  const [showPredefinedMessages, setShowPredefinedMessages] = useState(true)
  const [pendingImage, setPendingImage] = useState(null) // { uri, base64, mimeType }

  // Predefined messages for the tabs
  const predefinedMessages = [
    "How do I contact my Admin?",
    "How do I send reports after every Trip?",
    "How do i change my Password?",
    "I have a question",
    "Why turn on my location?",
  ]

  const requestPermissions = async () => {
    if (Platform.OS !== "web") {
      const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync()
      const { status: mediaLibraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync()

      return cameraStatus === "granted" && mediaLibraryStatus === "granted"
    }
    return true
  }

  const pickImage = async () => {
    try {
      const hasPermission = await requestPermissions()
      if (!hasPermission) {
        alert("Sorry, we need camera roll permissions to make this work!")
        return
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.4,
        base64: true,
      })
      if (!result.canceled) {
        const asset = result.assets[0]
        setPendingImage({ uri: asset.uri, base64: asset.base64, mimeType: asset.mimeType || "image/jpeg" })
      }
    } catch (error) {
      console.log("Error picking image:", error)
    }
  }

  const takePhoto = async () => {
    try {
      const hasPermission = await requestPermissions()
      if (!hasPermission) {
        alert("Sorry, we need camera permissions to make this work!")
        return
      }
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.4,
        base64: true,
      })
      if (!result.canceled) {
        const asset = result.assets[0]
        setPendingImage({ uri: asset.uri, base64: asset.base64, mimeType: asset.mimeType || "image/jpeg" })
      }
    } catch (error) {
      console.log("Error taking photo:", error)
    }
  }

  const handleLongPress = (message) => {
    setIsSelectionMode(true)
    setSelectedMessages([message.id])
  }

  const toggleMessageSelection = (message) => {
    if (!isSelectionMode) return
    setSelectedMessages((prevSelected) =>
      prevSelected.includes(message.id)
        ? prevSelected.filter((id) => id !== message.id)
        : [...prevSelected, message.id],
    )
  }

  const deleteSelectedMessages = () => {
    setMessages((prevMessages) => prevMessages.filter((message) => !selectedMessages.includes(message.id)))
    clearSelection()
  }

  const clearSelection = () => {
    setSelectedMessages([])
    setIsSelectionMode(false)
  }

  const handleSend = async () => {
    const text = inputText.trim()
    if (!text && !pendingImage) return

    // Build API content — multipart if there's a staged image, plain string otherwise
    const apiContent = pendingImage
      ? [
          { type: "image_base64", data: pendingImage.base64, mimeType: pendingImage.mimeType },
          ...(text ? [{ type: "text", content: text }] : []),
        ]
      : text

    const userUiMessage = {
      id: Date.now().toString(),
      text: text || "",
      image: pendingImage ? pendingImage.uri : null,
      isSent: true,
      time: new Date().toLocaleTimeString(),
    }

    const nextHistory = [...history, { role: "user", content: apiContent }]

    setMessages((prev) => [...prev, userUiMessage, { id: "typing", type: "typing" }])
    setHistory(nextHistory)
    setInputText("")
    setPendingImage(null)
    setShowPredefinedMessages(false)

    try {
      const { data } = await api.post("/ai/chat", { messages: nextHistory.slice(-15) })

      const replyUiMessage = {
        id: Date.now().toString(),
        text: data.reply,
        isSent: false,
        time: new Date().toLocaleTimeString(),
      }

      setMessages((prev) => [
        ...prev.filter((m) => m.id !== "typing"),
        replyUiMessage,
      ])
      setHistory((prev) => [...prev, { role: "assistant", content: data.reply }])
    } catch (err) {
      const errorText =
        err.response?.data?.message || "Techi is unavailable right now. Try again."

      setMessages((prev) => [
        ...prev.filter((m) => m.id !== "typing"),
        {
          id: Date.now().toString(),
          text: errorText,
          isSent: false,
          isError: true,
          time: new Date().toLocaleTimeString(),
        },
      ])
    } finally {
      setShowPredefinedMessages(true)
    }
  }

  const renderMessage = ({ item }) => {
    if (item.type === "typing") {
      return <TypingIndicator />
    }

    return (
      <TouchableOpacity
        onLongPress={() => handleLongPress(item)}
        onPress={() => toggleMessageSelection(item)}
        style={[
          styles.messageContainer,
          item.isSent ? styles.sentMessageContainer : styles.receivedMessageContainer,
          selectedMessages.includes(item.id) && styles.selectedMessage,
        ]}
      >
        {isSelectionMode && (
          <View style={styles.selectionIndicator}>
            {selectedMessages.includes(item.id) ? (
              <CheckCircle size={24} color="#088a6a" />
            ) : (
              <View style={styles.unselectedCircle} />
            )}
          </View>
        )}
        {!item.isSent && (
          <Image source={require("../../assets/ProfileImage.png")} style={styles.profilePicture} />
        )}
        <View
          style={[
            styles.messageBubble,
            item.isSent ? styles.sentMessage : styles.receivedMessage,
            item.isError && styles.errorMessage,
            selectedMessages.includes(item.id) && styles.selectedMessageBubble,
          ]}
        >
          {item.image ? (
            <Image source={{ uri: item.image }} style={styles.sentImage} />
          ) : (
            <Text style={styles.messageText}>{item.text}</Text>
          )}
          <Text style={styles.messageTime}>{item.time}</Text>
        </View>
      </TouchableOpacity>
    )
  }

  return (
    <ImageBackground source={require("../../assets/AIBg.jpg")} style={styles.background}>
      <StatusBar barStyle="dark-content" />
      <BlurView intensity={60} tint="dark" style={styles.blurOverlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={isSelectionMode ? clearSelection : () => navigation.goBack()}>
              <ArrowLeft size={28} color="#000" />
            </TouchableOpacity>
            <View style={styles.headerContent}>
              {!isSelectionMode ? (
                <>
                  <View style={styles.avatarContainer}>
                    <Image
                      source={require("../../assets/ProfileImage.png")}
                      style={styles.headerImage}
                    />
                    <View
                      style={[
                        styles.onlineStatus,
                        {
                          backgroundColor: isOnline ? "#00C853" : "#888",
                          borderColor: isOnline ? "#000" : "#666",
                        },
                      ]}
                    />
                  </View>
                  <View>
                    <Text style={styles.headerTitle}>Technical Assist</Text>
                    <Text style={styles.headerSubtitle}>{isOnline ? "Online" : "Offline"}</Text>
                  </View>
                </>
              ) : (
                <Text style={styles.headerTitle}>{selectedMessages.length} selected</Text>
              )}
            </View>
          </View>

          <FlatList
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={renderMessage}
            style={styles.messageList}
            ListHeaderComponent={() => (
              // Info Box
              <View style={styles.infoBox}>
                <ShieldCheck size={16} color="#088a6a" style={styles.infoBoxIcon} />
                <Text style={styles.infoBoxText}>
                  Your Tchnical Assistant is here to answer all questions. Ask what's on your mind.
                </Text>
              </View>
            )}
          />

          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 5 : 10}
            style={styles.keyboardAvoidingContainer}
          >
            <View style={styles.inputAreaWrapper}>
              {showPredefinedMessages && (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.predefinedMessagesContainer}
                >
                  {predefinedMessages.map((msg, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.predefinedMessageTab}
                      onPress={() => {
                        setInputText(msg)
                        setShowPredefinedMessages(false)
                      }}
                    >
                      <Text style={styles.predefinedMessageText}>{msg}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}

              {pendingImage && (
                <View style={styles.pendingImageContainer}>
                  <Image source={{ uri: pendingImage.uri }} style={styles.pendingImageThumb} />
                  <TouchableOpacity onPress={() => setPendingImage(null)} style={styles.pendingImageRemove}>
                    <Text style={styles.pendingImageRemoveText}>✕</Text>
                  </TouchableOpacity>
                </View>
              )}

              <View style={styles.inputRow}>
                <View style={styles.inputFieldContainer}>
                  <TouchableOpacity onPress={pickImage}>
                    <Paperclip size={28} color="#888" />
                  </TouchableOpacity>
                  <TextInput
                    style={styles.input}
                    placeholder="Message"
                    placeholderTextColor="#888"
                    value={inputText}
                    onChangeText={(text) => {
                      setInputText(text)
                      setShowPredefinedMessages(text.length === 0)
                    }}
                  />
                </View>
                <TouchableOpacity
                  onPress={(inputText.trim() || pendingImage) ? handleSend : null}
                  style={styles.sendButton}
                >
                  <Send size={28} color="#ffffff" />
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </BlurView>
    </ImageBackground>
  )
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: "cover",
  },
  blurOverlay: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 60 : StatusBar.currentHeight + 10,
    backgroundColor: "#fff",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 10,
    flex: 1,
  },
  avatarContainer: {
    position: "relative",
    marginRight: 10,
  },
  headerImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  onlineStatus: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
  },
  headerTitle: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 16,
  },
  headerSubtitle: {
    color: "#555",
    fontSize: 12,
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 5,
    paddingHorizontal: 15,
    marginHorizontal: 0,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
    marginTop: 15
  },
  infoBoxIcon: {
    marginRight: 8,
  },
  infoBoxText: {
    flex: 1,
    color: "#555",
    fontSize: 13,
    lineHeight: 18,
  },
  messageList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  messageContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginVertical: 8,
  },
  sentMessageContainer: {
    justifyContent: "flex-end",
  },
  receivedMessageContainer: {
    justifyContent: "flex-start",
  },
  profilePicture: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
  },
  messageBubble: {
    maxWidth: "70%",
    padding: 10,
    borderRadius: 10,
  },
  sentMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#fff",
    borderTopRightRadius: 0,
  },
  receivedMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#E0E0E0",
    borderTopLeftRadius: 0,
  },
  errorMessage: {
    backgroundColor: "#fde8e8",
  },
  messageText: {
    color: "#000",
    fontSize: 14,
  },
  messageTime: {
    color: "#b1b1b1",
    fontSize: 10,
    textAlign: "right",
    marginTop: 4,
  },
  keyboardAvoidingContainer: {
    bottom: 0,
    left: 0,
    right: 0,
  },
  inputAreaWrapper: {
    flexDirection: "column",
    alignItems: "center",
    paddingBottom: Platform.OS === "ios" ? 20 : 15, // Apply overall padding here
  },
  inputRow: {

    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    width: "100%", // Ensure it spans full width
  },
  inputFieldContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 30,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 10,
  },
  input: {
    flexGrow: 1,
    color: "#000",
    marginHorizontal: 10,
    fontSize: 14,
  },
  sendButton: {
    backgroundColor: "#007a3f",
    borderRadius: 30,
    padding: 10,
  },
  sentImage: {
    width: 200,
    height: 200,
    borderRadius: 10,
    marginBottom: 5,
  },
  selectedMessage: {
    opacity: 0.8,
  },
  selectedMessageBubble: {
    borderWidth: 2,
    borderColor: "#056162",
  },
  selectionIndicator: {
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  unselectedCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#088a6a",
  },
  // New styles for TypingIndicator
  typingBubble: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    minWidth: 60,
  },
  typingDot: {
    fontSize: 24,
    color: "#000",
    marginHorizontal: 2,
  },
  // New styles for Pre-written Message Tabs
  predefinedMessagesContainer: {
    paddingHorizontal: 16,
    marginBottom: 13,
    width: "100%", // Ensure it spans full width
  },
  predefinedMessageTab: {
    backgroundColor: "#fff",
    borderRadius: 30,
    height: 36, // Adjusted height for smaller tabs
    paddingHorizontal: 12,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    justifyContent: "center",
    alignItems: "center",
  },
  predefinedMessageText: {
    color: "#000",
    fontSize: 13,
    fontWeight: "500",
  },
  pendingImageContainer: {
    alignSelf: "flex-start",
    marginHorizontal: 20,
    marginBottom: 8,
  },
  pendingImageThumb: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  pendingImageRemove: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: "#333",
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  pendingImageRemoveText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
})

export default ChatScreen