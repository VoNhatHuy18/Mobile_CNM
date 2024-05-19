import React from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from '@expo/vector-icons';
const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = React.useState("");

  const handleResetPassword = () => {
    // Xử lý logic để gửi email reset mật khẩu
    // Điều hướng người dùng đến màn hình xác nhận email đã gửi
     navigation.navigate("ChangePassword");
  };

  return (
    <LinearGradient
      colors={["#A44C89", "#4F4F4F", "#545AC8", "#00BCD4"]}
      style={styles.gradient}
    >
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
      <Ionicons name="arrow-back" size={24} color="#3498db" />
      </TouchableOpacity>
      <View style={styles.container}>
        <Text style={styles.title}>Quên mật khẩu?</Text>
        <Text style={styles.subtitle}>Nhập email của bạn để đặt lại mật khẩu</Text>
        <TextInput
          placeholder="Email"
          onChangeText={setEmail}
          value={email}
          style={styles.input}
        />
        <TouchableOpacity style={styles.button} onPress={handleResetPassword}>
          <Text style={styles.buttonText}>Gửi Email</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 1,
  },
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#fff",
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#fff",
    borderRadius: 25,
    padding: 12,
    paddingHorizontal: 20,
    marginVertical: 10,
    width: 300,
    color: "#fff",
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  button: {
    backgroundColor: "#fff",
    paddingVertical: 12,
    paddingHorizontal: 50,
    borderRadius: 25,
    marginTop: 20,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#3498db",
    textAlign: "center",
  },
});

export default ForgotPasswordScreen;
