// src/composables/useWebRTC.ts
import { ref, onUnmounted } from "vue";
import Peer, { type DataConnection } from "peerjs";
import { useQRCode } from "@vueuse/integrations/useQRCode";
import type { ChatMessage, InfoMessage, PeerMessage } from "@/types/webrtc";
import { useWebRTCStore } from "@/stores/webrtcStore";

/**
 * A composable that provides WebRTC peer-to-peer communication functionality.
 * This handles the network connections, message handling, and peer management
 * while delegating state management to the WebRTC store.
 */
export function useWebRTC() {
  // Store the Peer instance that manages WebRTC connections
  const peer = ref<Peer | null>(null);
  const store = useWebRTCStore();

  // Configuration for PeerJS server and ICE (connection negotiation) servers
  const peerConfig = {
    host: "0.peerjs.com",
    port: 443,
    secure: true,
    debug: 3,
    config: {
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:global.stun.twilio.com:3478" },
      ],
    },
  };

  /**
   * Initializes the WebRTC peer connection.
   * This creates a new Peer instance and sets up all necessary event handlers.
   */
  const initialize = () => {
    if (!store.username) {
      console.error("Username is required to initialize peer");
      return;
    }

    console.log("Initializing peer with username:", store.username);
    peer.value = new Peer("", peerConfig);

    // Handle successful peer creation
    peer.value.on("open", (id: string) => {
      store.myPeerId = id;
      // Generate QR code for easy peer ID sharing
      const qr = useQRCode(id);
      // Small delay to ensure QR code generation
      setTimeout(() => (store.qrcode = qr.value), 250);
      store.isInitialized = true;
      console.log("Connected with peer ID:", id);
    });

    // Handle incoming connections
    peer.value.on("connection", (conn: DataConnection) => {
      console.log("Received connection from:", conn.peer);
      handleConnection(conn);
    });

    // Handle any peer errors
    peer.value.on("error", (err: Error) => {
      console.error("Peer error:", err);
      store.connectionError = err.message;
    });
  };

  /**
   * Establishes a connection to another peer using their peer ID.
   * @param targetPeerId - The ID of the peer to connect to
   */
  const connectToPeer = (targetPeerId: string) => {
    if (!peer.value || store.connections.has(targetPeerId)) return;

    console.log("Connecting to peer:", targetPeerId);
    const conn = peer.value.connect(targetPeerId);
    return handleConnection(conn);
  };

  /**
   * Sets up handlers for a peer connection and manages connection lifecycle.
   * @param conn - The DataConnection object representing the peer connection
   */
  const handleConnection = (conn: DataConnection) => {
    return new Promise<void>((resolve, reject) => {
      // Handle successful connection establishment
      conn.on("open", () => {
        console.log("Connection opened with:", conn.peer);

        // Store initial connection info
        store.updateConnection(conn.peer, {
          connection: conn,
          username: "Unknown",
          peerId: conn.peer,
        });

        // Send our info to the connected peer
        conn.send({
          type: "info",
          username: store.username,
          peerId: store.myPeerId,
        } as InfoMessage);

        resolve();
      });

      // Handle incoming data
      conn.on("data", (data: unknown) => {
        console.log("Received data:", data);

        if (!isPeerMessage(data)) return;

        if (data.type === "info") {
          // Update connection info with peer's username
          store.updateConnection(conn.peer, {
            connection: conn,
            username: data.username,
            peerId: data.peerId,
          });
        } else if (data.type === "chat") {
          // Add received message to chat history
          store.addMessage({
            from: store.connections.get(conn.peer)?.username || "Unknown",
            content: data.content,
            timestamp: new Date().toISOString(),
          });
        }

        resolve();
      });

      // Handle connection closure
      conn.on("close", () => {
        console.log("Connection closed:", conn.peer);
        store.removeConnection(conn.peer);
        resolve();
      });

      // Handle connection errors
      conn.on("error", (err) => {
        console.error("Connection error:", err);
        reject(err);
      });
    });
  };

  /**
   * Sends a chat message to all connected peers.
   * @param content - The message content to send
   */
  const sendMessage = (content: string) => {
    const messageContent = content.trim();
    if (!messageContent) return;

    const message: ChatMessage = {
      type: "chat",
      content: messageContent,
    };

    // Send message to all connected peers
    store.connections.forEach(({ connection }) => {
      if (connection.open) {
        console.log("Sending message to:", connection.peer);
        connection.send(message);
      }
    });

    // Add our own message to the chat history
    store.addMessage({
      from: `${store.username} (me)`,
      content: messageContent,
      timestamp: new Date().toISOString(),
    });
  };

  /**
   * Cleans up WebRTC connections and resets the store state.
   */
  const disconnect = () => {
    if (peer.value) {
      peer.value.destroy();
      peer.value = null;
    }
    store.reset();
  };

  // Ensure cleanup when the component is unmounted
  onUnmounted(() => {
    // disconnect();
  });

  // Return only the methods needed by components
  return {
    initialize,
    sendMessage,
    disconnect,
    connectToPeer,
  };
}

// Type guard function moved from types file for direct usage
const isPeerMessage = (data: unknown): data is PeerMessage => {
  if (typeof data !== "object" || data === null) return false;

  const msg = data as Partial<PeerMessage>;
  if (typeof msg.type !== "string") return false;

  if (msg.type === "chat") {
    return typeof (msg as ChatMessage).content === "string";
  }

  if (msg.type === "info") {
    const infoMsg = msg as InfoMessage;
    return (
      typeof infoMsg.username === "string" && typeof infoMsg.peerId === "string"
    );
  }

  return false;
};
