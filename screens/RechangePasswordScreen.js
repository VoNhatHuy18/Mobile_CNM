import React, { useState } from "react";
import {
  View,
  Text,
  Button,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import userService from "../services/userService";
import { useAuth } from "../provider/AuthProvider";

const RechangePasswordScreen = ({ navigation }) => {
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const { userVerified } = useAuth();
  console.log(userVerified);
  const handleChangePassword = async () => {
    try {
      if (!password || !newPassword || !confirmNewPassword) {
        Alert.alert("Error", "Không được để trống thông tin");
        console.log("Error: Empty fields");
        return;
      }

      if (newPassword !== confirmNewPassword) {
        Alert.alert("Error", "Nhập lại mật khẩu không khớp");
        console.log("Error: Passwords do not match");
        return;
      }
      if (password === newPassword) {
        Alert.alert("Error", "Mật khẩu mới không được trùng với mật khẩu cũ");
        console.log("Error: New password is the same as the old password");
        return;
      }
      if (newPassword.length < 8) {
        Alert.alert("Error", "Mật khẩu mới phải có ít nhất 8 ký tự");
        console.log("Error: New password must be at least 8 characters");
        return;
      }

      const result = await userService.changePassword(userVerified._id, {
        oldPassword: password,
        newPassword: newPassword,
      });
      console.log(result);
      Alert.alert("Success", "Đổi mật khẩu thành công");
      console.log("Success: Password changed");
      setPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      navigation.goBack();
    } catch (error) {
      Alert.alert("Error", "Nhập sai mật khẩu cũ ");
      console.log("Error: Password change failed");
    }
  };

  return (
    <LinearGradient
      colors={["#A44C89", "#4F4F4F", "#545AC8", "#00BCD4"]}
      style={styles.gradient}
    >
      <View style={styles.container}>
        <Text style={styles.title}>Thay đổi mật khẩu</Text>
        <TextInput
          style={styles.input}
          placeholder="Mật khẩu hiện tại"
          onChangeText={setPassword}
          value={password}
          secureTextEntry={true}
        />
        <TextInput
          style={styles.input}
          placeholder="Mật khẩu mới"
          onChangeText={setNewPassword}
          value={newPassword}
          secureTextEntry={true}
        />
        <TextInput
          style={styles.input}
          placeholder="Xác nhận mật khẩu"
          onChangeText={setConfirmNewPassword}
          value={confirmNewPassword}
          secureTextEntry={true}
        />
        <TouchableOpacity style={styles.button} onPress={handleChangePassword}>
          <Text style={styles.buttonText}>Thay đổi mật khẩu</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#3498db" />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  gradient: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 12,
    marginVertical: 10,
    width: "100%",
  },
  button: {
    backgroundColor: "#3498db",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginTop: 20,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
  },
  backButton: {
    position: "absolute",
    top: 40,
    left: 20,
  },
});

export default RechangePasswordScreen;
