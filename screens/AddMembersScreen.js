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
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../provider/AuthProvider";
import { useChat } from "../provider/ChatProvider";
import chatService from "../services/chatService";

import socket from "../config/socket";

const AddMembersScreen = ({ navigation }) => {
  const { userVerified } = useAuth();
  const [friends, setFriends] = useState(userVerified.friends || []);
  const [searchText, setSearchText] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [groupName, setGroupName] = useState("");

  const { setRoomList } = useChat();

  useEffect(() => {
    const filteredFriends = userVerified.friends.filter((friend) =>
      friend.username.includes(searchText.trim())
    );
    setFriends(filteredFriends);
  }, [searchText, userVerified.friends]);

  const toggleFriendSelection = (friend) => {
    const isSelected = selectedUsers.some((user) => user._id === friend._id);

    if (isSelected) {
      const updatedUsers = selectedUsers.filter(
        (user) => user._id !== friend._id
      );
      setSelectedUsers(updatedUsers);
    } else {
      setSelectedUsers([...selectedUsers, friend]);
    }
  };

  const handleCreateGroup = async () => {
    console.log("Creating group...");
    try {
      const members = selectedUsers.map((user) => user._id);
      members.push(userVerified._id);

      if (members.length < 3) {
        Alert.alert("Lỗi", "Nhóm phải có ít nhất 3 thành viên");
        return;
      } else {
        const response = await chatService.createChatRoom({
          members,
          type: "group",
          name: groupName || "New Group",
          image: "",
          adminId: userVerified._id,
        });

        setRoomList((prev) => [...prev, response]);

        // Emit a socket event to the server to notify the other user
        socket.emit("create-room", {
          createdRoom: response,
        });
      }
    } catch (error) {
      console.error("Error creating group:", error);
    } finally {
      navigation.goBack();
      Alert.alert("Tạo thành công", "Nhóm đã được tạo");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.search}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search..."
          value={searchText}
          onChangeText={(text) => setSearchText(text)}
        />
        <Ionicons name="search" size={24} color="black" />
      </View>
      <FlatList
        data={friends}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.friendItem}
            onPress={() => toggleFriendSelection(item)}
          >
            <View style={styles.avatarFallback}>
              <Image
                source={item.profilePic ? { uri: item.profilePic } : null}
              />
              <Text style={styles.avatarFallbackText}>{item.username[0]}</Text>
            </View>

            <Text style={styles.name}>{item.username}</Text>

            {selectedUsers.some((user) => user._id === item._id) && (
              <Ionicons name="checkmark" size={24} color="green" />
            )}
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item._id.toString()}
      />
      {/* Button to create group */}
      <TouchableOpacity
        style={styles.createGroupButton}
        onPress={handleCreateGroup}
      >
        <Text style={styles.createGroupButtonText}>Create Group</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  search: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  searchInput: {
    padding: 10,
    flex: 1,
  },
  friendItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  createGroupButton: {
    backgroundColor: "blue",
    padding: 15,
    alignItems: "center",
  },
  createGroupButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  avatarFallback: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
    backgroundColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarFallbackText: {
    color: "#fff",
    fontSize: 20,
  },
  name: {
    fontSize: 16,
    fontWeight: "bold",
    //text lies on the right
  },
});

export default AddMembersScreen;
