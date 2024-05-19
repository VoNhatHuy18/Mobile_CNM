import React, { useState, useEffect } from "react";

import { View, Text, StyleSheet, Image } from "react-native";

import { useAuth } from "../provider/AuthProvider";
import userService from "../services/userService";

const InfoScreen = () => {
  const { userVerified } = useAuth();

  const [friends, setFriends] = useState(userVerified.friends || []);

  // friendDetailScreen
  return (
    <View style={styles.container}>
      <View style={styles.avatarContainer}>
        <Image source={userVerified} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  avatarContainer: {
    marginBottom: 20,
    width: 150,
    height: 150,
    borderRadius: 75,
  },
  avatar: {
    width: 150,
    height: 150,
    borderRadius: 75,
  },
  username: {
    fontSize: 24,
    fontWeight: "bold",
  },
  avatarFallback: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarFallbackText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },
  // Add more styles as needed
});

export default InfoScreen;
