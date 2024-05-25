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

const InfoScreen = ({ navigation, route }) => {
  const { userVerified } = useAuth();
  const [hasGalleryPermission, setHasGalleryPermission] = useState(null);
  const { friends } = route.params;

  console.log(friend);
  useEffect(() => {
    (async () => {
      const galleryStatus =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      setHasGalleryPermission(galleryStatus.status === "granted");
    })();
  }, []);

  const pickImage = async () => {
    if (hasGalleryPermission === false) {
      Alert.alert("Permission Denied", "No access to the gallery");
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.cancelled) {
      const newProfilePic = result.assets[0].uri;
      // Assuming there's a method to update the friend's profile pic
      updateUserProfilePic(newProfilePic);
      Alert.alert("Success", "Avatar updated successfully!");
    }
  };

  const updateUserProfilePic = (newProfilePic) => {
    // Implement the logic to update the friend's profile picture here
    // This might involve calling an API endpoint and updating the state
    // Example:
    // await api.updateProfilePicture(friend.id, newProfilePic);
    // setFriend({ ...friend, profilePic: newProfilePic });
  };

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
            friends.profilePic
              ? { uri: friend.profilePic }
              : {
                  uri: `https://ui-avatars.com/api/?name=${friend.username[0]}&background=random&size=120&bold=true`,
                }
          }
          style={styles.avatar}
        />
      </TouchableOpacity>
      <Text style={styles.username}>{friend.username}</Text>
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
    width: 150,
    height: 150,
    borderRadius: 75,
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

export default InfoScreen;
