import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
  FlatList,
  Alert,
  ScrollView,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useChat } from "../provider/ChatProvider";
import { useAuth } from "../provider/AuthProvider";
import chatService from "../services/chatService";
import socket from "../config/socket";
import { Ionicons } from "@expo/vector-icons"; // Import Ionicons for checkmark

const GroupInfoScreen = ({ navigation }) => {
  const [searchText, setSearchText] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const { selectedRoom, setSelectedRoom, setRoomList } = useChat();
  const [loading, setLoading] = useState(false);
  const [groupName, setGroupName] = useState(selectedRoom?.name);
  const [members, setMembers] = useState(selectedRoom?.members);
  const [newAdmin, setNewAdmin] = useState("");
  const { userVerified } = useAuth();
  const isAdmin = userVerified?._id === selectedRoom?.admin?._id;
  const [groupImage, setGroupImage] = useState(selectedRoom?.image);
  const [hasGalleryPermission, setHasGalleryPermission] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]); // New state to track selected users

  useEffect(() => {
    (async () => {
      const galleryStatus =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      setHasGalleryPermission(galleryStatus.status === "granted");
    })();
  }, []);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const newProfilePic = result.uri;
      setGroupImage(newProfilePic);
      Alert.alert("Success", "Avatar updated successfully!");
    }
  };

  if (hasGalleryPermission === false) {
    return <Text>No Access to Gallery</Text>;
  }

  useEffect(() => {
    const fetchUsers = async () => {
      if (searchText.trim() !== "") {
        try {
          const result = userVerified.friends.filter((friend) =>
            friend.username.includes(searchText.trim())
          );
          const filteredList = result.filter(
            (user) =>
              !selectedRoom.members.some((member) => member._id === user._id)
          );
          setFilteredUsers(filteredList);
        } catch (error) {
          console.error("Error fetching users:", error);
        }
      } else {
        setFilteredUsers([]);
      }
    };

    fetchUsers();
  }, [searchText, userVerified._id]);

  const handleSearch = (text) => {
    setSearchText(text);
  };

  const handleUserSelect = (user) => {
    if (selectedUsers.some((selectedUser) => selectedUser._id === user._id)) {
      setSelectedUsers((prevSelectedUsers) =>
        prevSelectedUsers.filter(
          (selectedUser) => selectedUser._id !== user._id
        )
      );
      setMembers((prevMembers) =>
        prevMembers.filter((member) => member._id !== user._id)
      );
    } else {
      setSelectedUsers((prevSelectedUsers) => [...prevSelectedUsers, user]);
      setMembers((prevMembers) => [...prevMembers, user]);
    }
  };

  const handleSave = async () => {
    Alert.alert("Bạn đã thay đổi tên nhóm thành " + groupName);
    setLoading(true);
    try {
      const updatedRoom = await chatService.updateChatGroup({
        chatroomId: selectedRoom._id,
        members,
        name: groupName,
        image: groupImage,
        adminId: selectedRoom.admin._id,
        newAdminId: newAdmin || selectedRoom.admin._id,
      });
      setSelectedRoom(updatedRoom);
      setRoomList((prevRooms) =>
        prevRooms.map((room) =>
          room._id === updatedRoom._id ? updatedRoom : room
        )
      );
      socket.emit("update-group", updatedRoom);
    } catch (error) {
      console.error("Error updating group:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteMember = async (memberId) => {
    setLoading(true);
    Alert.alert(
      "Bạn đã xóa thành viên " +
        members.find((member) => member._id === memberId).username
    );
    const updatedMembers = members.filter((member) => member._id !== memberId);
    try {
      const updatedRoom = await chatService.updateChatGroup({
        chatroomId: selectedRoom._id,
        members: updatedMembers,
        name: groupName,
        image: groupImage,
        adminId: selectedRoom.admin._id,
        newAdminId: newAdmin || selectedRoom.admin._id,
      });
      setSelectedRoom(updatedRoom);
      setRoomList((prevRooms) =>
        prevRooms.map((room) =>
          room._id === updatedRoom._id ? updatedRoom : room
        )
      );
      socket.emit("update-group", updatedRoom);
      navigation.navigate("GroupInfo");
    } catch (error) {
      console.error("Error updating group:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMembers = async () => {
    try {
      const updatedRoom = await chatService.updateChatGroup({
        chatroomId: selectedRoom._id,
        name: selectedRoom.name,
        image: selectedRoom.image,
        members: [
          ...selectedRoom.members.map((member) => member._id),
          ...selectedUsers.map((user) => user._id),
        ],
        adminId: selectedRoom.admin._id,
      });

      setSelectedRoom(updatedRoom);
      socket.emit("update-group", updatedRoom);
      Alert.alert("Thêm thành viên thành công!");
    } catch (error) {
      console.error("Error adding members:", error);
    } finally {
      setSelectedUsers([]);
    }
  };

  const handleLeaveGroup = async () => {
    setLoading(true);
    try {
      const updatedRoom = await chatService.updateChatGroup({
        chatroomId: selectedRoom._id,
        members: members.filter((member) => member._id !== userVerified._id),
        name: groupName,
        image: selectedRoom.image || "",
        adminId: selectedRoom.admin._id,
        newAdminId: selectedRoom.admin._id,
      });
      setSelectedRoom(updatedRoom);
      setRoomList((prevRooms) =>
        prevRooms.filter((room) => room._id !== selectedRoom._id)
      );

      socket.emit("update-group", updatedRoom);
      socket.emit("leave-group", updatedRoom);
      Alert.alert("Bạn đã rời nhóm " + selectedRoom.name);
      navigation.navigate("ChatList");
    } catch (error) {
      console.error("Error leaving group:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveGroup = async () => {
    setLoading(true);
    try {
      await chatService.removeChatroom({
        chatroomId: selectedRoom._id,
        admin: selectedRoom.admin._id,
      });
      setRoomList((prevRooms) =>
        prevRooms.filter((room) => room._id !== selectedRoom._id)
      );
      setSelectedRoom(selectedRoom);

      // Emit event to remove group from other clients
      socket.emit("update-group", {
        _id: selectedRoom._id,
      });

      Alert.alert("Xóa nhóm thành công!");
      navigation.navigate("ChatList");
    } catch (error) {
      console.error("Error removing group:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView>
      <View style={styles.container}>
        <Text style={styles.title}>Group Info</Text>
        <TouchableOpacity
          style={styles.groupImageContainer}
          onPress={pickImage}
        >
          {groupImage ? (
            <Image
              source={{ uri: groupImage }}
              style={styles.groupImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.groupImageFallback}>
              <Text style={styles.groupImageFallbackText}>
                {selectedRoom.name.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        <Text style={styles.subtitle}>Group Name:</Text>
        {isAdmin ? (
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={groupName}
              onChangeText={(text) => setGroupName(text)}
              placeholder="Enter new group name"
            />
            <TouchableOpacity style={styles.button} onPress={handleSave}>
              <Text style={styles.buttonText}>Change</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <Text style={styles.infoText}>{selectedRoom.name}</Text>
        )}

        {isAdmin && (
          <View style={styles.search}>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={searchText}
                onChangeText={handleSearch}
                placeholder="Enter username to add member"
                editable={isAdmin}
                selectTextOnFocus={isAdmin}
              />
            </View>

            <FlatList
              data={filteredUsers}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => handleUserSelect(item)}>
                  <View style={styles.item}>
                    {item.profilePic ? (
                      <Image
                        source={{ uri: item.profilePic }}
                        style={styles.profilePic}
                      />
                    ) : (
                      <View style={styles.profilePicFallback}>
                        <Text style={styles.profilePicFallbackText}>
                          {item.username.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                    )}
                    <Text style={styles.username}>
                      {selectedUsers.some(
                        (selectedUser) => selectedUser._id === item._id
                      )
                        ? ""
                        : item.username}
                    </Text>
                    {selectedUsers.some(
                      (selectedUser) => selectedUser._id === item._id
                    ) && (
                      <Ionicons
                        name="checkmark-circle"
                        size={24}
                        color="green"
                      />
                    )}
                  </View>
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item._id}
            />
          </View>
        )}

        {isAdmin && (
          <TouchableOpacity style={styles.button} onPress={handleAddMembers}>
            <Text style={styles.buttonText}>Add Selected Members</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.subtitle}>Admin:</Text>
        <Text style={styles.infoText}>
          {selectedRoom?.admin?.username || "N/A"}
        </Text>

        <Text style={styles.subtitle}>Members:</Text>
        {members.map((member) => (
          <View style={styles.memberContainer} key={member._id}>
            {member.profilePic ? (
              <Image
                source={{ uri: member.profilePic }}
                style={styles.profilePic}
              />
            ) : (
              <View style={styles.profilePicFallback}>
                <Text style={styles.profilePicFallbackText}>
                  {member.username.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            <Text style={styles.memberName}>{member.username}</Text>
            {isAdmin && member._id !== selectedRoom?.admin?._id && (
              <TouchableOpacity onPress={() => deleteMember(member._id)}>
                <Text style={styles.deleteButton}>Delete</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
        {isAdmin ? (
          <TouchableOpacity
            style={styles.leaveGroupButton}
            onPress={handleRemoveGroup}
          >
            <Text style={styles.leaveGroupButtonText}>Delete Group</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.leaveGroupButton}
            onPress={handleLeaveGroup}
          >
            <Text style={styles.leaveGroupButtonText}>Leave Group</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 10,
  },
  groupImageContainer: {
    alignSelf: "center",
    marginBottom: 20,
  },
  groupImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  groupImageFallback: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#e0e0e0",
    justifyContent: "center",
    alignItems: "center",
  },
  groupImageFallbackText: {
    fontSize: 36,
    color: "#fff",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginRight: 10,
  },
  button: {
    backgroundColor: "#007bff",
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  search: {
    marginVertical: 10,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  profilePic: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  profilePicFallback: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#e0e0e0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  profilePicFallbackText: {
    fontSize: 18,
    color: "#fff",
  },
  username: {
    flex: 1,
    fontSize: 16,
  },
  memberContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 5,
  },
  memberName: {
    flex: 1,
    fontSize: 16,
  },
  deleteButton: {
    color: "red",
    fontSize: 16,
    marginLeft: 10,
  },
  leaveGroupButton: {
    marginTop: 20,
    backgroundColor: "#dc3545",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  leaveGroupButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default GroupInfoScreen;
