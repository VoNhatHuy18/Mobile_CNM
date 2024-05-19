import React, { useEffect } from "react";
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

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState(null); // Thêm state mới để lưu trạng thái của thông báo
  const { setUserVerified, userVerified } = useAuth();

  console.log("user", userVerified);

  useEffect(() => {
    if (userVerified) {
      navigation.navigate("ChatList");
    } else {
      navigation.navigate("Login");
    }
  }, [userVerified]);

  const handleForgotPassword = () => {
    navigation.navigate("ForgotPassword");
  };

  const handleSignUp = () => {
    navigation.navigate("Signup");
  };

  const handleSignIn = async () => {
    if (!email) {
      setErrorMessage("Email không được để trống.");
      return;
    }

    if (!validateEmail(email)) {
      setErrorMessage("Email không đúng định dạng.");
      return;
    }

    if (!password) {
      setErrorMessage("Mật khẩu không được để trống.");
      return;
    }

    if (!validatePassword(password)) {
      setErrorMessage("Mật khẩu phải trên 8 ký tự.");
      return;
    }

    setLoading(true);
    try {
      const result = await authService.login(email, password);

      if (result.user.verify) {
        setUserVerified(result.user);
      } else {
        console.log(result.message);
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        setErrorMessage("Email hoặc mật khẩu không đúng.");
      } else {
        setErrorMessage("Email hoặc mật khẩu không đúng.");
        console.log(error);
      }
    } finally {
      setLoading(false);
    }
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
      style={styles.container}
    >
      <View style={styles.formContainer}>
        <Text style={styles.title}>Đăng nhập</Text>
        <TextInput
          placeholder="Email"
          placeholderTextColor="black"
          style={styles.input}
          onChangeText={(text) => setEmail(text)}
        />
        <TextInput
          placeholder="Mật khẩu"
          placeholderTextColor="black"
          secureTextEntry={true}
          style={styles.input}
          onChangeText={(text) => setPassword(text)}
        />
        {errorMessage && (
          <Text style={styles.errorMessage}>{errorMessage}</Text>
        )}
        <TouchableOpacity style={styles.button} onPress={handleSignIn}>
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.buttonText}>Đăng nhập</Text>
          )}
        </TouchableOpacity>
        <View style={styles.linkContainer}>
          <TouchableOpacity onPress={handleForgotPassword}>
            <Text style={styles.link}>Quên mật khẩu?</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleSignUp}>
            <Text style={styles.link}>Chưa có tài khoản? Đăng ký ngay</Text>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  formContainer: {
    width: "80%",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  button: {
    backgroundColor: "#00BCD4",
    padding: 10,
    borderRadius: 5,
    width: "100%",
    alignItems: "center",
    marginBottom: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
  link: {
    color: "black",
    fontSize: 16,
  },
  errorMessage: {
    color: "red",
    marginBottom: 10,
  },
});

export default LoginScreen;
