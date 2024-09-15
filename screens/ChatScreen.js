import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Modal,
  TouchableWithoutFeedback,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useChat } from "../provider/ChatProvider";
import chatService from "../services/chatService";
import { useAuth } from "../provider/AuthProvider";
import * as ImagePicker from "expo-image-picker";
import socket from "../config/socket";

const ChatScreen = ({ route, navigation }) => {
  const { selectedRoom, fetchUpdatedRooms } = useChat();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isReplying, setIsReplying] = useState(false);
  const [replyingMessage, setReplyingMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [image, setImage] = useState(null);
  const [hasGellery, setHasGallery] = useState(null);
  const { userVerified } = useAuth();
  const scrollViewRef = useRef();

  useEffect(() => {
    const fetchMessages = async () => {
      if (selectedRoom) {
        const response = await chatService.getAllMessagesInRoom(
          selectedRoom._id
        );
        setMessages(response);
      }
    };
    fetchMessages();
  }, [selectedRoom]);

  useEffect(() => {
    socket.on("receive-message", (data) => {
      setMessages((prevMessages) => [...prevMessages, data.savedMessage]);
    });
    return () => {
      socket.off("receive-message");
    };
  }, [socket]);

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  useEffect(() => {
    (async () => {
      const GalleryStatus =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      setHasGallery(GalleryStatus.status === "granted");
    })();
  }, []);

  useEffect(() => {
    socket.on("deleted-message", (data) => {
      console.log("Received deleted message:", data);
      setMessages((prevMessages) =>
        prevMessages.filter((msg) => msg._id !== data.messageId)
      );
    });

    return () => {
      socket.off("deleted-message");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket]);

  const handleSendMessage = async () => {
    setLoading(true);
    try {
      if (newMessage.trim() === "" && !image) {
        return;
      }

      let images = [];
      if (image) {
        // Upload the image and get the URL
        const formData = new FormData();
        formData.append("image", {
          uri: image,
          name: "chat-image.jpg",
          type: "image/jpeg",
        });

        const uploadResponse = await chatService.uploadImage(formData);
        images.push(uploadResponse.url);
      }

      const messageData = {
        senderId: userVerified._id,
        content: newMessage,
        images: images,
        roomId: selectedRoom._id,
        replyMessageId: replyingMessage ? replyingMessage._id : null,
      };

      if (selectedRoom.type === "1v1") {
        const receiverId = selectedRoom.members.find(
          (member) => member._id !== userVerified._id
        )._id;
        messageData.receiverId = receiverId;
      }

      const response = await chatService.sendMessage(messageData);

      setMessages([...messages, response]);
      setNewMessage("");
      setImage("");

      socket.emit("send-message", { savedMessage: response });
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setLoading(false);
      fetchUpdatedRooms();
      setReplyingMessage("");
      setIsReplying(false);
      socket.emit("sort-room", { userId: userVerified._id });
    }
  };

  const handleLongPressMessage = (message) => {
    setSelectedMessage(message);
    setShowPopup(true);
  };

  const handleReply = () => {
    setIsReplying(true);
    setReplyingMessage(selectedMessage);
    setShowPopup(false);
  };

  const handleDelete = async (message) => {
    if (selectedMessage) {
      try {
        if (selectedMessage.sender._id === userVerified._id) {
          await chatService.deleteMessage(selectedMessage._id);
          setMessages(
            messages.filter((msg) => msg._id !== selectedMessage._id)
          );
        } else {
          // Handle error
        }
        setShowPopup(false);
        socket.emit("delete-message", {
          messageId: message._id,
        });
      } catch (error) {
        console.error("Error deleting message:", error);
        // Handle error
      }
    }
  };

  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return `${hours}:${minutes < 10 ? "0" : ""}${minutes}`;
  };

  const getInitials = (name) => {
    return name ? name.charAt(0).toUpperCase() : "?";
  };

  const getUserName = (members) => {
    const otherMember = members.find(
      (member) => member._id !== userVerified._id
    );
    return otherMember ? otherMember.username : "Unknown";
  };

  const getUserProfilePic = (members) => {
    const otherMember = members.find(
      (member) => member._id !== userVerified._id
    );
    return otherMember ? otherMember.profilePic : null;
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    console.log(result);

    if (!result.cancelled) {
      setImage(result.uri);
    }
  };

  if (hasGellery === false) {
    return <Text>No Access</Text>;
  }

  const chatTitle =
    selectedRoom.type === "group"
      ? selectedRoom.name
      : getUserName(selectedRoom.members);

  const chatProfilePic =
    selectedRoom.type === "group"
      ? selectedRoom.profilePic
      : getUserProfilePic(selectedRoom.members);

  const handleNavigate = async () => {
    try {
      if (selectedRoom.type === "group") {
        navigation.navigate("GroupInfo", { selectedRoom });
      }
      if (selectedRoom.type === "1v1") {
        // navigation.navigate("Info", {
        //   friendId: selectedRoom.members.find(
        //     (member) => member._id !== userVerified._id
        //   )._id,
        // });
        return;
      }
    } catch (error) {
      console.error("Error navigating to info screen:", error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          {chatProfilePic ? (
            <Image source={{ uri: chatProfilePic }} style={styles.avatar} />
          ) : (
            <View style={styles.fallbackAvatar}>
              <Text style={styles.fallbackAvatarText}>
                {getInitials(chatTitle)}
              </Text>
            </View>
          )}
          <Text style={styles.headerText}>{chatTitle}</Text>
        </View>
        <View style={styles.info}>
          <TouchableOpacity style={styles.infoButton}>
            <Ionicons name="call" size={24} color="#ffffff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.infoButton}>
            <Ionicons name="videocam" size={24} color="#ffffff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.infoButton} onPress={handleNavigate}>
            <Ionicons name="information-circle" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.chatContainer}
      >
        {messages.map((message, index) => {
          const isSentMessage = message.sender._id === userVerified._id;
          const senderProfilePic = message.sender.profilePic;
          const senderInitials = getInitials(message.sender.username);
          return (
            <>
              {showPopup && (
                <Modal
                  transparent={true}
                  animationType="slide"
                  visible={showPopup}
                  onRequestClose={() => setShowPopup(false)}
                >
                  <TouchableWithoutFeedback onPress={() => setShowPopup(false)}>
                    <View style={styles.modalOverlay}>
                      <View style={styles.popupContainer}>
                        <TouchableOpacity
                          style={styles.popupButton}
                          onPress={handleReply}
                        >
                          <Text style={styles.popupButtonText}>Reply</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.popupButton}
                          onPress={() => handleDelete(message)}
                        >
                          <Text style={styles.popupButtonText}>Delete</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </TouchableWithoutFeedback>
                </Modal>
              )}

              <TouchableWithoutFeedback
                key={index}
                onLongPress={() => handleLongPressMessage(message)}
              >
                <View
                  style={[
                    styles.messageContainer,
                    isSentMessage
                      ? styles.messageContainerRight
                      : styles.messageContainerLeft,
                  ]}
                >
                  {!isSentMessage &&
                    (senderProfilePic ? (
                      <Image
                        source={{ uri: senderProfilePic }}
                        style={styles.avatarSmallLeft}
                      />
                    ) : (
                      <View style={styles.fallbackAvatar}>
                        <Text style={styles.fallbackAvatarText}>
                          {senderInitials}
                        </Text>
                      </View>
                    ))}
                  <View
                    style={[
                      styles.messageBubble,
                      isSentMessage
                        ? styles.sentMessage
                        : styles.receivedMessage,
                    ]}
                  >
                    <Text style={styles.username}>
                      {message.sender.username}
                    </Text>
                    {message.replyTo && (
                      <View style={styles.replyContainer}>
                        <Text style={styles.replyText}>
                          {message.replyTo.content}
                        </Text>
                      </View>
                    )}
                    {message.images.length > 0 && (
                      <Image
                        source={{ uri: message.images[0] }}
                        style={styles.messageImage}
                      />
                    )}
                    <Text style={styles.messageText}>{message.content}</Text>
                    <Text style={styles.messageTime}>
                      {formatMessageTime(message.timestamp)}
                    </Text>
                  </View>
                  {isSentMessage &&
                    (senderProfilePic ? (
                      <Image
                        source={{ uri: senderProfilePic }}
                        style={styles.avatarSmallRight}
                      />
                    ) : (
                      <View style={styles.fallbackAvatar}>
                        <Text style={styles.fallbackAvatarText}>
                          {senderInitials}
                        </Text>
                      </View>
                    ))}
                </View>
              </TouchableWithoutFeedback>
            </>
          );
        })}
      </ScrollView>
      {isReplying && (
        <View style={styles.replyingContainer}>
          <Text style={styles.replyingText}>
            Replying to: {replyingMessage.content}
          </Text>
          <TouchableOpacity onPress={() => setIsReplying(false)}>
            <Ionicons name="close" size={24} color="#ff0000" />
          </TouchableOpacity>
        </View>
      )}
      <View style={styles.inputContainer}>
        <TouchableOpacity style={styles.iconButton}>
          <Ionicons name="folder-outline" size={24} color="#333333" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => pickImage()} style={styles.iconButton}>
          <Ionicons name="image-outline" size={24} color="#333333" />
        </TouchableOpacity>
        {image && <Image source={{ uri: image }} />}
        <TextInput
          style={styles.input}
          placeholder="Type a message"
          value={newMessage}
          onChangeText={setNewMessage}
        />
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => setShowEmojiPicker(!showEmojiPicker)}
        >
          <Ionicons name="happy-outline" size={24} color="#333333" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.sendButton, loading && { backgroundColor: "#ccc" }]}
          onPress={handleSendMessage}
          disabled={loading}
        >
          <Ionicons name="send" size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    backgroundColor: "#1A1A74",
    paddingVertical: 10,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    padding: 5,
  },
  headerInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  headerText: {
    fontSize: 20,
    color: "#ffffff",
    fontWeight: "bold",
    marginLeft: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  info: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingRight: 10,
  },
  infoButton: {
    padding: 10,
  },
  chatContainer: {
    flexGrow: 1,
    paddingHorizontal: 15,
    paddingBottom: 10,
  },
  messageContainer: {
    flexDirection: "row",
    marginBottom: 10,
    marginTop: 10,
  },
  messageContainerRight: {
    alignSelf: "flex-end",
    alignItems: "flex-end",
  },
  messageContainerLeft: {
    alignSelf: "flex-start",
    alignItems: "flex-start",
  },
  messageBubble: {
    maxWidth: "50%",
    borderRadius: 20,
    padding: 15,
    paddingVertical: 10,
  },
  sentMessage: {
    backgroundColor: "#B8E1FF",
    alignSelf: "flex-end",
    textAlign: "right",
  },
  receivedMessage: {
    backgroundColor: "#ECEFF1",
    borderWidth: 1,
    borderColor: "#ccc",
    alignSelf: "flex-start",
    textAlign: "left",
  },
  messageText: {
    fontSize: 18,
    color: "black",
    textAlign: "right",
  },
  messageTime: {
    fontSize: 12,
    color: "#333333",
    marginTop: 5,
    textAlign: "left",
  },
  avatarSmallLeft: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
  },
  avatarSmallRight: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginLeft: 10,
  },
  fallbackAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#4267B2",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
    marginRight: 10,
  },
  fallbackAvatarText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    borderTopWidth: 1,
    borderTopColor: "#ccc",
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: "#f0f0f0",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 30,
    marginRight: 5,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  sendButton: {
    backgroundColor: "#4267B2",
    borderRadius: 30,
    padding: 10,
  },
  iconButton: {
    paddingRight: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  popupContainer: {
    width: 200,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    overflow: "hidden",
  },
  popupButton: {
    padding: 15,
    alignItems: "center",
  },
  popupButtonText: {
    fontSize: 18,
    color: "#4267B2",
  },
  replyingContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: "#f0f0f0",
    borderTopWidth: 1,
    borderTopColor: "#ccc",
  },
  replyingText: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  replyContainer: {
    borderLeftWidth: 2,
    borderLeftColor: "#4267B2",
    paddingLeft: 10,
    marginBottom: 5,
  },
  replyText: {
    fontSize: 14,
    color: "#333",
  },
  username: {
    fontSize: 15,
    textAlign: "left",
  },
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: 10,
    marginVertical: 10,
  },
});

export default ChatScreen;
