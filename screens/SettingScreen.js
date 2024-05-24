import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../provider/AuthProvider";
import * as ImagePicker from "expo-image-picker";

const SettingsScreen = ({ navigation }) => {
  const { userVerified, setUserVerified, updateUserProfilePic } = useAuth();
  const [hasGalleryPermission, setHasGalleryPermission] = useState(null);

  useEffect(() => {
    (async () => {
      const galleryStatus =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      setHasGalleryPermission(galleryStatus.status === "granted");
    })();
  }, []);

  const handleLogout = async () => {
    setUserVerified(null);
    navigation.navigate("Login");
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const newProfilePic = result.assets[0].uri;
      updateUserProfilePic(newProfilePic);
      Alert.alert("Success", "Avatar updated successfully!");
    }
  };

  if (hasGalleryPermission === false) {
    return <Text>No Access to Gallery</Text>;
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backButton}
      >
        <Ionicons name="arrow-back" size={24} color="#333" />
      </TouchableOpacity>
      <TouchableOpacity onPress={pickImage}>
        <Image
          source={
            userVerified?.profilePic
              ? { uri: userVerified.profilePic }
              : {
                  uri: `https://ui-avatars.com/api/?name=${userVerified?.username[0]}&background=random&size=120&bold=true`,
                }
          }
          style={styles.avatar}
        />
      </TouchableOpacity>
      <Text style={styles.username}>{userVerified?.username}</Text>
      <TouchableOpacity
        onPress={() => navigation.navigate("RechangePassword")}
        style={styles.button}
      >
        <Text style={styles.buttonText}>Change Password</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleLogout} style={styles.button}>
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    paddingTop: 50,
  },
  backButton: {
    position: "absolute",
    top: 20,
    left: 20,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 20,
  },
  username: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#007bff",
    paddingVertical: 12,
    paddingHorizontal: 50,
    borderRadius: 25,
    marginBottom: 20,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
});

export default SettingsScreen;
