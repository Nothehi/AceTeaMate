import { type DataConnection } from "peerjs";

/**
 * Represents an active connection to a peer, combining the WebRTC DataConnection
 * with user-specific information for identification in the chat system
 */
export interface Connection {
  connection: DataConnection; // The actual WebRTC data connection
  username: string; // Display name of the connected peer
  peerId: string; // Unique identifier for the peer connection
}

/**
 * Represents a chat message in the application, storing both content
 * and metadata about the message
 */
export interface Message {
  from: string; // Username of the message sender
  content: string; // The actual message content
  timestamp: string; // ISO string of when the message was sent
}

/**
 * Represents a standard chat message sent between peers
 * Used for regular message communication
 */
export interface ChatMessage {
  type: "chat"; // Discriminator for message type
  content: string; // The actual message content
}

/**
 * Represents an information message sent between peers
 * Used for sharing connection metadata and user information
 */
export interface InfoMessage {
  type: "info"; // Discriminator for message type
  username: string; // Username of the peer sending the info
  peerId: string; // Unique identifier of the sending peer
}

/**
 * Union type combining all possible message types that can be
 * sent between peers in the system
 */
export type PeerMessage = ChatMessage | InfoMessage;

/**
 * Type guard function to ensure incoming data matches our expected
 * message format. This helps maintain type safety when receiving
 * data from the network.
 *
 * @param data - The unknown data received from a peer
 * @returns A type predicate indicating if the data is a valid PeerMessage
 */
export const isPeerMessage = (data: unknown): data is PeerMessage => {
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

/**
 * Re-export PeerJS types that are used throughout the application
 * This centralizes our WebRTC-related type definitions
 */
export type { DataConnection } from "peerjs";

/**
 * Represents a simplified peer information object,
 * used for displaying online users and managing connections
 */
export interface PeerInfo {
  username: string;
  peerId: string;
}
