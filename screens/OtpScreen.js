import React, { useState } from "react";
import OTP from "react-native-otp-form";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "../provider/AuthProvider";
import authService from "../services/authService";

const OtpScreen = ({ navigation }) => {
  const [otp, setOtp] = useState("");
  const { userForVerified, setUserForVerified } = useAuth();

  const handleSubmit = async () => {
    try {
      const result = await authService.verifyOtp(userForVerified.userId, otp);
      console.log(result);
      setUserForVerified(null);
      navigation.navigate("Login");
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
        <Text style={styles.title}>Nhập mã xác thực</Text>
        {/* <OTP
          value={otp}
          onChangeText={setOtp}
          codeCount={6}
          containerStyle={{ marginTop: 50 }}
          otpStyles={{ backgroundColor: "#eee" }}
        /> */}
        <TextInput
          style={styles.input}
          placeholder="Nhập mã OTP"
          value={otp}
          onChangeText={setOtp}
          keyboardType="numeric"
        />
        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Xác thực</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#fff",
  },
  input: {
    width: "80%",
    height: 40,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    marginBottom: 10,
    paddingHorizontal: 10,
    backgroundColor: "#fff", // Input field background color
  },
  button: {
    width: "80%",
    backgroundColor: "#007bff",
    paddingVertical: 12,
    borderRadius: 5,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default OtpScreen;
