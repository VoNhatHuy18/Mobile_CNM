import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  SafeAreaView,
  ScrollView,
  TouchableWithoutFeedback,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import userService from "../services/userService";
import { useAuth } from "../provider/AuthProvider";
import { useChat } from "../provider/ChatProvider";
import chatService from "../services/chatService";
import socket from "../config/socket";
import Modal from "react-native-modal";

const ChatList = ({ chats, navigation }) => {
  const [searchText, setSearchText] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [popupVisible, setPopupVisible] = useState(false);
  const [selectedRoomForPopup, setSelectedRoomForPopup] = useState(null);
  const [changeNicknameVisible, setChangeNicknameVisible] = useState(false);
  const [pendingFriendRequests, setPendingFriendRequests] = useState([]);

  const { userVerified } = useAuth();
  const {
    selectedRoom,
    setSidebarVisibility,
    isSidebarVisible,
    setSelectedRoom,
    roomList,
    setRoomList,
    fetchUpdatedRooms,
  } = useChat();

  const getRoomName = (room) => {
    const members = room.members;
    const receiver = members.find((member) => member._id !== userVerified._id);
    const groupName = room.type === "group" ? room.name : null;
    return groupName || receiver.username;
  };

  useEffect(() => {
    if (selectedRoom) {
      navigation.navigate("ChatScreen");
    }
  }, [selectedRoom]);

  useEffect(() => {
    const fetchUsers = async () => {
      if (searchText.trim() !== "") {
        try {
          const result = await userService.getUsersBySearchTerms(searchText);
          const filteredResult = result.filter(
            (user) => user._id !== userVerified._id
          );
          setFilteredUsers(filteredResult);
        } catch (error) {
          console.error("Error fetching users:", error);
        }
      } else {
        setFilteredUsers([]);
      }
    };

    fetchUsers();
  }, [searchText, userVerified._id]);

  useEffect(() => {
    socket.on("created-room", (data) => {
      console.log("Received created room event:", data);
      setRoomList((prevRoomList) => [...prevRoomList, data.createdRoom]);
    });

    socket.on("sorted-room", (data) => {
      fetchUpdatedRooms();
    });

    return () => {
      socket.off("created-room");
      socket.off("sorted-room");
    };
  }, [socket]);

  const handleSearch = (text) => {
    setSearchText(text);
  };

  const isFriend = (user) => {
    return userVerified.friends.some((friend) => friend._id === user._id);
  };

  const handleAddFriend = async (user) => {
    Alert.alert("Bạn đã gửi lời mời kết bạn đến với " + user.username);
    console.log("Adding friend:", user);
    try {
      const response = await userService.sendFriendRequest({
        senderId: userVerified._id,
        receiverId: user._id,
      });
      console.log("Friend request sent:", response);
      // Add the user to pending friend requests
      setPendingFriendRequests([...pendingFriendRequests, user._id]);
      socket.emit("send-friend-request", response);
    } catch (error) {
      console.error("Error sending friend request:", error);
    }
  };

  const handleUserSelect = async (user) => {
    try {
      const members = [userVerified._id, user._id];
      const response = await chatService.createChatRoom({
        members,
        type: "1v1",
      });
      console.log("Created chat room:", response);

      const existingChatroom = roomList.find(
        (room) => room._id === response._id
      );

      if (existingChatroom) {
        setSelectedRoom(existingChatroom);
        return;
      } else {
        setRoomList([...roomList, response]);
        setSelectedRoom(response);
      }
    } catch (error) {
      console.error("Error creating chat room:", error);
    }
  };

  const renderAvatar = (profilePic, username) => {
    return profilePic ? (
      <Image source={{ uri: profilePic }} style={styles.avatar} />
    ) : (
      <View style={styles.avatarFallback}>
        <Text style={styles.avatarText}>{username.charAt(0)}</Text>
      </View>
    );
  };

  // const handleLongPressRoom = (room) => {
  //   if (room.type === "group") return; // Don't show popup for group rooms
  //   setSelectedRoomForPopup(room);
  //   setPopupVisible(true);
  // };

  // const handleUnfriend = async (userId) => {
  //   try {
  //     const response = await userService.unfriend({
  //       userId: userVerified._id,
  //       friendId: userId,
  //     });
  //     console.log("Unfriend response:", response);

  //     // setFilteredUsers((prevUsers) =>
  //     //   prevUsers.filter((user) => user._id !== userId)
  //     // );
  //   } catch (error) {
  //     console.error("Error unfriending user:", error);
  //   }
  // };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.containerSearch}>
          <View style={styles.search}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search..."
              value={searchText}
              onChangeText={handleSearch}
            />
            <Ionicons name="search" size={24} color="black" />
          </View>
          <FlatList
            data={filteredUsers}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={async () => {
                  const friend = isFriend(item);
                  if (friend) {
                    await handleUserSelect(item);
                  } else {
                    await handleAddFriend(item);
                  }
                }}
              >
                <View style={styles.chat}>
                  {renderAvatar(item.profilePic, item.username)}
                  <View style={styles.chatContent}>
                    <Text style={styles.sender}>{item.username}</Text>
                  </View>
                  {!isFriend(item) && (
                    <Ionicons
                      name="person-add"
                      size={24}
                      color={
                        pendingFriendRequests.includes(item._id)
                          ? "red"
                          : "blue"
                      }
                    />
                  )}
                </View>
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item._id.toString()}
          />
        </View>
        <FlatList
          data={roomList}
          renderItem={({ item }) => (
            <>
              <TouchableOpacity
                style={styles.chatroom}
                onPress={() => {
                  setSelectedRoom(item);
                  navigation.navigate("ChatScreen");
                }}
                // onLongPress={() => handleLongPressRoom(item)}
              >
                {renderAvatar(item.profilePic, getRoomName(item))}
                <Text style={styles.sender}>{getRoomName(item)}</Text>
              </TouchableOpacity>
              {/* <Modal
                isVisible={popupVisible}
                onBackdropPress={() => setPopupVisible(false)}
                backdropOpacity={0.5}
                animationIn="fadeIn"
                animationOut="fadeOut"
              >
                <View style={styles.popupContainer}>
                  <View style={styles.popup}>
                    <TouchableOpacity onPress={() => handleUnfriend(item._id)}>
                      <Text style={styles.popupButton}>Unfriend</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => navigation.navigate("ChatList")}
                    >
                      <Text style={styles.popupButton}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Modal> */}
            </>
          )}
          keyExtractor={(item) => item._id.toString()}
        />
      </ScrollView>

      <View style={styles.settingsButton}>
        <TouchableOpacity onPress={() => navigation.navigate("FriendList")}>
          <Ionicons
            name="person-add-outline"
            size={24}
            color={pendingFriendRequests.length > 0 ? "red" : "black"}
          />
          {pendingFriendRequests.length > 0 && (
            <View style={styles.notificationBadge} />
          )}
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("AddMembers")}>
          <Ionicons name="people-outline" size={24} color="black" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("Friend")}>
          <Ionicons name="person-outline" size={24} color="black" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("Setting")}>
          <Ionicons name="settings-outline" size={24} color="black" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  searchInput: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    flex: 1,
  },
  chat: {
    flexDirection: "row",
    padding: 10,
    paddingLeft: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    alignItems: "center",
  },
  chatroom: {
    flex: 1,
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    alignItems: "center",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  avatarFallback: {
    width: 50,
    height: 50,
    borderRadius: 50,
    marginRight: 10,
    backgroundColor: "#4267B2",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  chatContent: {
    flex: 1,
    justifyContent: "center",
  },
  sender: {
    fontWeight: "bold",
    fontSize: 16,
  },
  time: {
    fontSize: 12,
    color: "#666",
  },
  containerSearch: {
    flexDirection: "column",
    backgroundColor: "#EEDCCE",
  },
  search: {
    alignItems: "center",
    flexDirection: "row",
  },
  settingsButton: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    padding: 5,
  },
  popupContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  popup: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    elevation: 5,
  },
  popupButton: {
    fontSize: 18,
    marginVertical: 10,
    alignSelf: "center",
  },
  input: {
    height: 40,
    width: "100%",
    borderColor: "gray",
    borderWidth: 1,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  notificationBadge: {
    position: "absolute",
    backgroundColor: "red",
    width: 10,
    height: 10,
    borderRadius: 5,
    top: 0,
    left: 18,
  },
});

export default ChatList;
