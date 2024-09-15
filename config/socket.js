import io from "socket.io-client";

const socket =
  process.env.NODE_ENV === "production"
    ? io("https://cong-nghe-moi-backend.onrender.com")
    : io("https://cong-nghe-moi-backend.onrender.com");

export default socket;
