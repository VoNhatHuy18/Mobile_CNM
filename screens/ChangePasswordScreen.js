import React, { useState } from "react";
import {
  View,
  Text,
  Button,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../provider/AuthProvider";
import authService from "../services/authService";

const ChangePasswordScreen = ({ navigation }) => {
  const [otp, setOTP] = useState("");
  const [password, setPassword] = useState("");
  const { userForVerified, setUserForVerified } = useAuth();

  const handleChangePassword = async () => {
    try {
      const result = await authService.verifyOtp(userForVerified.userId, otp);
      console.log("result", result);
      if (result) {
        const resetPasswordResult = await authService.resetPassword(
          userForVerified.userId,
          password
        );
        console.log("reset", resetPasswordResult);
        setUserForVerified(null);
        navigation.navigate("Login");
      }
    } catch (error) {
      console.log(error);
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
          placeholder="Mã OTP"
          onChangeText={setOTP}
          value={otp}
          keyboardType="numeric"
        />
        <TextInput
          style={styles.input}
          placeholder="Mật khẩu mới"
          onChangeText={setPassword}
          value={password}
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

export default ChangePasswordScreen;
