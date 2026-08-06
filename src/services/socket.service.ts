import { io, Socket } from "socket.io-client";
import { usePersistentSession } from "@/plugins/usePersistentSession";

export class SocketService {
  private persistentSession = usePersistentSession();
  private socket: Socket;
  private connected = false;

  constructor() {
    this.socket = io(import.meta.env.VITE_API_BACKEND, {
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      auth: { token: "" }
    });

    this.socket.on("connect", () => {
      console.debug("✅ Connected to socket!");
      this.connected = true;
    });

    this.socket.on("connect_error", (error) => {
      console.debug("❌ Error in connection:", error);
      this.connected = false;
    });

    this.socket.on("disconnect", (reason, details) => {
      console.debug("❌ Disconnected from socket:", reason, details);
      this.connected = false;
    });
  };

  async init() {
    this.socket.auth = {
      token: (await this.persistentSession.get("token")) || "",
    };

    if (this.socket.connected) {
      this.socket.disconnect();
    }

    this.socket.connect();
  };

  isConnected() {
    return this.connected;
  };

  disconnect() {
    if (!this.connected) return;
    this.socket.disconnect();
  };

  emit(event: string, args: Record<string, any>) {
    this.socket.emit(event, args);
  };

  on(event: string, callback: (...args: any[]) => void) {
    this.socket.on(event, callback);
  };

  off(event: string, callback: (...args: any[]) => void) {
    this.socket.off(event, callback);
  };
};