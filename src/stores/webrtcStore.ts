// stores/webrtcStore.ts
import { defineStore } from "pinia";
import type { Connection, Message, PeerInfo } from "@/types/webrtc.ts";

export const useWebRTCStore = defineStore("webrtc", {
  state: () => ({
    username: "",
    messages: [] as Message[],
    connections: new Map<string, Connection>(),
    myPeerId: "",
    isInitialized: false,
    connectionError: "",
    qrcode: "",
  }),

  getters: {
    onlinePeers: (state): PeerInfo[] => {
      return Array.from(state.connections.values()).map(
        ({ username, peerId }) => ({ username, peerId })
      );
    },
  },

  actions: {
    addMessage(message: Message) {
      this.messages.push(message);
    },

    updateConnection(peerId: string, connection: Connection) {
      this.connections.set(peerId, connection);
    },

    removeConnection(peerId: string) {
      this.connections.delete(peerId);
    },

    reset() {
      this.connections.clear();
      this.messages = [];
      this.isInitialized = false;
      this.myPeerId = "";
      this.qrcode = "";
    },
  },
});
