import { io } from "socket.io-client";

const SOCKET_URL = "https://project-management-1-1.onrender.com";

const socket = io(SOCKET_URL, {
    withCredentials: true,
    autoConnect: false, // Don't connect until we have a user
});

export default socket;
