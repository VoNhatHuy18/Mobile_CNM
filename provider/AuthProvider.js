import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [userVerified, setUserVerifiedState] = useState(null);

  useEffect(() => {
    const loadUserFromStorage = async () => {
      try {
        const user = await AsyncStorage.getItem("user");
        if (user) {
          setUserVerifiedState(JSON.parse(user));
        }
      } catch (error) {
        console.error("Failed to load user from storage", error);
      }
    };

    loadUserFromStorage();
  }, []);

  const setUserVerified = async (user) => {
    setUserVerifiedState(user);
    try {
      await AsyncStorage.setItem("user", JSON.stringify(user));
    } catch (error) {
      console.error("Failed to save user to storage", error);
    }
  };

  const updateUserProfilePic = async (newProfilePic) => {
    setUserVerifiedState((prevUser) => {
      const updatedUser = { ...prevUser, profilePic: newProfilePic };
      AsyncStorage.setItem("user", JSON.stringify(updatedUser));
      return updatedUser;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        userVerified,
        setUserVerified,
        updateUserProfilePic,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
