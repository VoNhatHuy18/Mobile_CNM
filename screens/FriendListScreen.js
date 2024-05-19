import React, { useEffect } from "react";
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
import socket from "../config/socket";

const FriendRequestItem = ({ user, onAccept, onReject }) => {
  return (
    <View style={styles.container}>
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
        <View style={{ flexDirection: "column" }}>
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
    </View>
  );
};

const FriendListScreen = ({}) => {
  const { userVerified, setUserVerified } = useAuth();

  useEffect(() => {
    socket.on("received-friend-request", async (response) => {
      console.log("Received friend request:", response);
      const updatedUser = await userService.getUserById(userVerified._id);
      setUserVerified(updatedUser);
    });

    socket.on("accepted-friend-request", async (response) => {
      console.log("Accepted friend request:", response);
      const updatedUser = await userService.getUserById(userVerified._id);
      setUserVerified(updatedUser);
    });

    return () => {
      socket.off("received-friend-request");
      socket.off("accepted-friend-request");
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket]);

  const handleAcceptFriendRequest = async (requester) => {
    Alert.alert("Bạn đã đồng ý kết bạn với " + requester.username);
    console.log("Accept friend request");
    try {
      const response = await userService.acceptFriendRequest({
        requesterId: requester._id,
        userId: userVerified._id,
      });

      const userUpdated = await userService.getUserById(userVerified._id);
      setUserVerified(userUpdated);

      socket.emit("accept-friend-request", response);
    } catch (error) {
      console.error("Error accepting friend request:", error);
    }
  };

  const handleReject = async (requester) => {
    Alert.alert("Bạn đã từ chối lời mời kết bạn của " + requester.username);
    console.log("Reject friend request");
    try {
      const response = await userService.rejectedFriendRequest({
        requesterId: requester._id,
        userId: userVerified._id,
      });

      // After rejecting the request, you may want to update the user's friend requests received list
      const userUpdated = await userService.getUserById(userVerified._id);
      setUserVerified(userUpdated);

      // Optionally emit an event to notify other parts of the application about the rejection
      socket.emit("reject-friend-request", response);
    } catch (error) {
      console.error("Error rejecting friend request:", error);
    }
  };

  const FriendRequestItem = ({ user, onAccept, onReject }) => {
    return (
      <View style={styles.container}>
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
          <View style={{ flexDirection: "column" }}>
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
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {userVerified.friendRequestsReceived.map((request) => (
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
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
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
  userInfo: {
    flex: 1,
    flexDirection: "row",
    marginVertical: 10,
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
    marginLeft: 15,
  },
  acceptButton: {
    backgroundColor: "green",
    padding: 10,
    borderRadius: 5,

    height: 40,
    width: 70,
    alignItems: "center",
  },
  rejectButton: {
    backgroundColor: "red",
    padding: 10,
    borderRadius: 5,
    marginLeft: 5,
    height: 40,
    width: 70,
    alignItems: "center",
  },
  buttonText: {
    color: "#ffffff",
    fontWeight: "bold",
  },
});

export default FriendListScreen;
