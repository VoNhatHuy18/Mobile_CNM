import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from "react-native";

import { useAuth } from "../provider/AuthProvider";
import userService from "../services/userService";

const FriendsScreen = () => {
  const { userVerified, setUserVerified } = useAuth();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const handleUnfriend = async (friendId) => {
    Alert.alert("Unfriend", "Are you sure you want to unfriend this user?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Unfriend",
        onPress: async () => {
          try {
            setLoading(true);
            if (!friendId) return;

            await userService.unfriend({
              userId: userVerified._id,
              friendId: friendId,
            });

            const userUpdated = await userService.getUserById(userVerified._id);
            setUserVerified(userUpdated);
          } catch (error) {
            console.error("Error unfriending:", error);
            Alert.alert("Error", "Failed to unfriend user. Please try again.");
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const userUpdated = await userService.getUserById(userVerified._id);
      setUserVerified(userUpdated);
    } catch (error) {
      console.error("Error refreshing friends list:", error);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Friends</Text>
      {loading && <ActivityIndicator size="large" color="#0000ff" />}
      <FlatList
        data={userVerified.friends}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.friendItem}>
            <Text style={{ fontSize: 25 }}>{item.username}</Text>
            <TouchableOpacity
              onPress={() => handleUnfriend(item._id)}
              style={styles.unfriendButton}
            >
              <Text style={styles.unfriendButtonText}>Unfriend</Text>
            </TouchableOpacity>
          </View>
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 16,
    fontSize: 30,
    fontWeight: "600",
  },
  friendItem: {
    marginBottom: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  unfriendButton: {
    borderRadius: 4,
    backgroundColor: "#f56565",
    paddingVertical: 4,
    paddingHorizontal: 8,
    transitionDuration: "75ms",
  },
  unfriendButtonText: {
    color: "white",
  },
});

export default FriendsScreen;
