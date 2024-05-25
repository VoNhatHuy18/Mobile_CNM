import React, { createContext, useContext, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [userForVerified, setUserForVerified] = useState(null);
  const [userVerified, setUserVerifiedState] = useState(null);

  const setUserVerified = (user) => {
    setUserVerifiedState(user);
    // localStorage.setItem("user", JSON.stringify(user));
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
        userForVerified,
        setUserForVerified,
        userVerified,
        setUserVerified,
        updateUserProfilePic,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
