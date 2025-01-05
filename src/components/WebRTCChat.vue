<!-- src/components/WebRTCChat.vue -->
<script setup>
import { useWebRTC } from '../composables/useWebRTC'
import { ref } from 'vue'

const {
    username,
    messages,
    myPeerId,
    messageText,
    isInitialized,
    connectionError,
    onlinePeers,
    initialize,
    sendMessage,
    disconnect,
    connectToPeer
} = useWebRTC()

const newUsername = ref('')
const connectId = ref('')

const startChat = () => {
    if (newUsername.value.trim()) {
        initialize(newUsername.value.trim())
    }
}

const connect = () => {
    if (connectId.value.trim()) {
        connectToPeer(connectId.value.trim())
        connectId.value = ''
    }
}
</script>

<template>
    <div class="p-4 max-w-4xl mx-auto">
        <!-- Login Screen -->
        <div v-if="!isInitialized" class="text-center">
            <h2 class="text-xl font-bold mb-4">Join Chat</h2>
            <div class="flex gap-2 justify-center">
                <input v-model="newUsername" placeholder="Enter your name" class="border p-2 rounded"
                    @keyup.enter="startChat" />
                <button @click="startChat" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
                    Join
                </button>
            </div>
        </div>

        <!-- Chat Interface -->
        <div v-else>
            <!-- Connection Info -->
            <div class="mb-4 p-4 bg-gray-100 rounded">
                <p>Your ID: <span class="font-mono">{{ myPeerId }}</span></p>
                <div class="mt-2 flex gap-2">
                    <input v-model="connectId" placeholder="Enter peer ID to connect"
                        class="border p-2 rounded flex-grow" @keyup.enter="connect" />
                    <button @click="connect" class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded">
                        Connect
                    </button>
                </div>
            </div>

            <!-- Error Message -->
            <div v-if="connectionError" class="mb-4 p-4 bg-red-100 text-red-700 rounded">
                {{ connectionError }}
            </div>

            <div class="grid grid-cols-4 gap-4">
                <!-- Online Users -->
                <div class="col-span-1">
                    <div class="bg-gray-50 p-4 rounded">
                        <div class="flex justify-between items-center mb-4">
                            <h3 class="font-bold">Online Users</h3>
                            <button @click="disconnect" class="text-red-500 hover:text-red-600">
                                Leave
                            </button>
                        </div>
                        <div class="space-y-2">
                            <div class="p-2 bg-blue-100 rounded">
                                {{ username }} (you)
                            </div>
                            <div v-for="peer in onlinePeers" :key="peer.peerId" class="p-2 bg-white rounded">
                                {{ peer.username }}
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Chat Area -->
                <div class="col-span-3">
                    <div class="border rounded p-4 h-[60vh] flex flex-col">
                        <!-- Messages -->
                        <div class="flex-grow overflow-y-auto space-y-2">
                            <div v-for="(msg, index) in messages" :key="index" class="p-2 rounded max-w-[80%]"
                                :class="msg.from.includes('(me)') ? 'bg-blue-100 ml-auto' : 'bg-gray-100'">
                                <div class="flex justify-between items-baseline">
                                    <strong class="text-sm">{{ msg.from }}</strong>
                                    <span class="text-xs text-gray-500">
                                        {{ new Date(msg.timestamp).toLocaleTimeString() }}
                                    </span>
                                </div>
                                <p class="mt-1">{{ msg.content }}</p>
                            </div>
                        </div>

                        <!-- Message Input -->
                        <div class="mt-4 flex gap-2">
                            <input v-model="messageText" placeholder="Type your message"
                                class="border p-2 rounded flex-grow" @keyup.enter="sendMessage" />
                            <button @click="sendMessage"
                                class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                                :disabled="!messageText">
                                Send
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>