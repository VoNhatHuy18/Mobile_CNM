import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import authService from "../services/authService";
import { useAuth } from "../provider/AuthProvider";

const SignupScreen = ({ navigation }) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmpassword, setComfirmpassword] = useState("");
  const [errorMessage, setErrorMessage] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const { setUserForVerified } = useAuth();

  const handleRegister = async () => {
    if (!username) {
      setErrorMessage(" Username không được để trống.");
      return;
    }

    if (!validateUsername(username)) {
      setErrorMessage("Username có ký tự không hợp lệ.");
      return;
    }

    if (!email) {
      setErrorMessage(" Email không được để trống.");
      return;
    }

    if (!validateEmail(email)) {
      setErrorMessage("Email không đúng định dạng.");
      return;
    }

    if (!password) {
      setErrorMessage(" Mật khẩu không được để trống.");
      return;
    }

    if (!validatePassword(password)) {
      setErrorMessage("Mật khẩu phải trên 8 ký tự.");
      return;
    }

    if (!confirmpassword) {
      setErrorMessage(" Xác nhận mật khẩu không được để trống.");
      return;
    }

    if (password !== confirmpassword) {
      setErrorMessage("Mật khẩu và xác nhận mật khẩu không khớp.");
      return;
    }

    setLoading(true);
    try {
      const result = await authService.register(username, email, password);

      console.log("result", result);

      if (result.data) {
        setUserForVerified(result.data);
        navigation.navigate("OtpScreen");
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const validateUsername = (username) => {
    const usernameRegex = /^[a-zA-Z1-9]+$/;
    return usernameRegex.test(username);
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    const passwordRegex = /.{8,}/;
    return passwordRegex.test(password);
  };

  return (
    <LinearGradient
      colors={["#A44C89", "#4F4F4F", "#545AC8", "#00BCD4"]}
      style={styles.gradient}
    >
      <View style={styles.container}>
        <Text style={styles.title}>Đăng ký</Text>
        <TextInput
          style={styles.input}
          placeholder="Tên người dùng"
          value={username}
          onChangeText={setUsername}
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Mật khẩu"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <TextInput
          style={styles.input}
          placeholder="Nhập lại mật khẩu"
          secureTextEntry
          value={confirmpassword}
          onChangeText={setComfirmpassword}
        />

        {errorMessage && (
          <Text style={styles.errorMessage}>{errorMessage}</Text>
        )}
        <TouchableOpacity
          style={styles.button}
          onPress={() => handleRegister()}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.buttonText}>Đăng Ký</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.link}>Quay lại đăng nhập</Text>
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
    backgroundColor: "#fff",
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
  link: {
    marginTop: 20,
    color: "white",
  },
  errorMessage: {
    color: "red",
    marginBottom: 10,
  },
});

export default SignupScreen;
