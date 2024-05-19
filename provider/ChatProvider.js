import { createContext, useContext, useEffect, useState } from "react";
import chatService from "../services/chatService";
import { useAuth } from "./AuthProvider";

const ChatContext = createContext();

export const useChat = () => {
  return useContext(ChatContext);
};

export const ChatProvider = ({ children }) => {
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isSidebarVisible, setSidebarVisibility] = useState(true);
  const { userVerified } = useAuth();
  const [roomList, setRoomList] = useState([]);

  console.log("room list", roomList);

  const fetchUpdatedRooms = async () => {
    if (userVerified) {
      const response = await chatService.getAllRoomByUserId(userVerified._id);
      setRoomList(response);
    }
  };

  useEffect(() => {
    const fetchChatList = async () => {
      const response = await chatService.getAllRoomByUserId(userVerified._id);
      setRoomList(response);
    };

    if (userVerified) {
      fetchChatList();
    }
  }, [userVerified]);

  return (
    <ChatContext.Provider
      value={{
        selectedRoom,
        setSelectedRoom,
        isSidebarVisible,
        setSidebarVisibility,
        roomList,
        setRoomList,
        fetchUpdatedRooms,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
