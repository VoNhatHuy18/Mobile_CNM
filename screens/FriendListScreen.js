import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { useAuth } from "../provider/AuthProvider";
import userService from "../services/userService";
import socket from "../config/socket"; // Ensure socket is initialized correctly

const FriendRequestItem = ({ user, onAccept, onReject }) => {
  return (
    <View style={styles.userInfo}>
      {user.profilePic ? (
        <Image source={{ uri: user.profilePic }} style={styles.avatar} />
      ) : (
        <View style={styles.avatarFallback}>
          <Text style={styles.avatarFallbackText}>
            {user.username.charAt(0).toUpperCase()}
          </Text>
        </View>
      )}
      <View style={{ flexDirection: "column", flex: 1 }}>
        <Text style={styles.username}>{user.username}</Text>
        <Text style={styles.message}>sent you a friend request</Text>
      </View>
      <View style={styles.buttons}>
        <TouchableOpacity onPress={onAccept} style={styles.acceptButton}>
          <Text style={styles.buttonText}>Accept</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onReject} style={styles.rejectButton}>
          <Text style={styles.buttonText}>Reject</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const FriendListScreen = () => {
  const { userVerified, setUserVerified } = useAuth();
  const [friendRequests, setFriendRequests] = useState(
    userVerified.friendRequestsReceived || []
  );

  useEffect(() => {
    const handleReceivedFriendRequest = async (response) => {
      console.log("Received friend request:", response);
      const updatedUser = await userService.getUserById(userVerified._id);
      setUserVerified(updatedUser);
      setFriendRequests(updatedUser.friendRequestsReceived); // Update state with new friend requests
    };

    const handleAcceptedFriendRequest = async (response) => {
      console.log("Accepted friend request:", response);
      const updatedUser = await userService.getUserById(userVerified._id);
      setUserVerified(updatedUser);
    };

    socket.on("received-friend-request", handleReceivedFriendRequest);
    socket.on("accepted-friend-request", handleAcceptedFriendRequest);

    return () => {
      socket.off("received-friend-request", handleReceivedFriendRequest);
      socket.off("accepted-friend-request", handleAcceptedFriendRequest);
    };
  }, [userVerified._id, setUserVerified]);

  const handleAcceptFriendRequest = async (requester) => {
    Alert.alert(
      "You have accepted the friend request from " + requester.username
    );
    console.log("Accept friend request");
    try {
      const response = await userService.acceptFriendRequest({
        requesterId: requester._id,
        userId: userVerified._id,
      });

      const userUpdated = await userService.getUserById(userVerified._id);
      setUserVerified(userUpdated);
      setFriendRequests(userUpdated.friendRequestsReceived); // Update state with new friend requests

      socket.emit("accept-friend-request", {
        requesterId: requester._id,
        userId: userVerified._id,
      });
    } catch (error) {
      console.error("Error accepting friend request:", error);
    }
  };

  const handleReject = async (requester) => {
    Alert.alert(
      "You have rejected the friend request from " + requester.username
    );
    console.log("Reject friend request");
    try {
      const response = await userService.rejectedFriendRequest({
        requesterId: requester._id,
        userId: userVerified._id,
      });

      const userUpdated = await userService.getUserById(userVerified._id);
      setUserVerified(userUpdated);
      setFriendRequests(userUpdated.friendRequestsReceived); // Update state with new friend requests

      socket.emit("reject-friend-request", {
        requesterId: requester._id,
        userId: userVerified._id,
      });
    } catch (error) {
      console.error("Error rejecting friend request:", error);
    }
  };

  return (
    <View style={styles.container}>
      {friendRequests.map((request) => (
        <FriendRequestItem
          key={request._id}
          user={request}
          onAccept={() => handleAcceptFriendRequest(request)}
          onReject={() => handleReject(request)}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#ffffff",
  },
  userInfo: {
    flexDirection: "row",
    marginVertical: 10,
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
    borderRadius: 25,
    backgroundColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  avatarFallbackText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },
  username: {
    fontWeight: "bold",
    fontSize: 16,
  },
  message: {
    color: "#666",
  },
  buttons: {
    flexDirection: "row",
    marginLeft: "auto",
  },
  acceptButton: {
    backgroundColor: "green",
    padding: 10,
    borderRadius: 5,
    height: 40,
    width: 70,
    alignItems: "center",
    justifyContent: "center",
  },
  rejectButton: {
    backgroundColor: "red",
    padding: 10,
    borderRadius: 5,
    marginLeft: 5,
    height: 40,
    width: 70,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#ffffff",
    fontWeight: "bold",
  },
});

export default FriendListScreen;
