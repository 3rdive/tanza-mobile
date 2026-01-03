import { io, Socket } from "socket.io-client";
import { BASE_URL } from "./api";

// Extract the host from BASE_URL and use port 3006 for socket connection
const getSocketUrl = () => {
  try {
    const url = new URL(BASE_URL);
    const finalurl = `${url.hostname}:3006`;
    // const finalurl = `0.tcp.eu.ngrok.io:19106`;
    console.log({ finalurl });
    return finalurl;
  } catch {
    // Fallback if BASE_URL is malformed
    return "http://localhost:3006";
  }
};

export const SOCKET_URL = getSocketUrl();

class SocketManager {
  private socket: Socket | null = null;
  private token: string | null = null;
  private userId: string | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  /**
   * Initialize and connect the socket
   */
  connect(accessToken: string, userId: string) {
    if (this.socket?.connected) {
      console.log("Socket already connected");
      return this.socket;
    }

    this.token = accessToken;
    this.userId = userId;

    this.socket = io(SOCKET_URL, {
      auth: { token: accessToken },
      transports: ["websocket"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: this.maxReconnectAttempts,
    });

    this.setupListeners();
    return this.socket;
  }

  /**
   * Setup socket event listeners
   */
  private setupListeners() {
    if (!this.socket) return;

    this.socket.on("connect", () => {
      console.log("✅ Socket connected:", this.socket?.id);
      this.reconnectAttempts = 0;

      // Auto-join user's task channel
      if (this.userId) {
        const channel = `user.${this.userId}.pending.task`;
        this.joinChannel(channel);
      }
    });

    this.socket.on("disconnect", (reason) => {
      console.log("🔌 Socket disconnected:", reason);
    });

    this.socket.on("connect_error", (error) => {
      console.error("❌ Socket connection error:", error.message);
      this.reconnectAttempts++;

      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.log("Max reconnection attempts reached");
        this.disconnect();
      }
    });

    function handleJoined(data: any) {
      console.log("👥 Successfully joined channel:", data.channel);
    }
    this.socket.on("joined", handleJoined);
  }

  /**
   * Join a specific channel
   */
  joinChannel(channel: string) {
    if (!this.socket?.connected) {
      console.warn("Cannot join channel: socket not connected");
      return;
    }

    this.socket.emit("join", channel);
  }

  /**
   * Subscribe to new pending tasks
   */
  onNewTask(callback: (task: any) => void) {
    if (!this.socket || !this.userId) {
      console.warn("Cannot subscribe to tasks: socket not initialized");
      return () => {};
    }

    const channel = `user.${this.userId}.pending.task`;

    const handler = (task: any) => {
      console.log("📦 Received new task:", task);
      callback(task);
    };

    this.socket.on(channel, handler);

    // Return cleanup function
    return () => {
      this.socket?.off(channel, handler);
    };
  }

  /**
   * Get the socket instance
   */
  getSocket() {
    return this.socket;
  }

  /**
   * Check if socket is connected
   */
  isConnected() {
    return this.socket?.connected ?? false;
  }

  /**
   * Disconnect the socket
   */
  disconnect() {
    if (this.socket) {
      console.log("Disconnecting socket...");
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
      this.token = null;
      this.userId = null;
      this.reconnectAttempts = 0;
    }
  }
}

// Export singleton instance
export const socketManager = new SocketManager();
