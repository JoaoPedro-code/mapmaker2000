import { io, Socket } from "socket.io-client";

// URL of the backend
const SOCKET_URL = "http://localhost:3000";

// Singleton socket instance
let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(SOCKET_URL);

    // Debug logging
    socket.on("connect", () => {
      console.log("Connected to server with ID:", socket?.id);
    });
  }
  return socket;
};
