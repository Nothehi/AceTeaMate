// src/composables/useWebRTC.js
import { ref, computed, onUnmounted } from 'vue'
import Peer from 'peerjs'

export function useWebRTC() {
  const username = ref('')
  const messages = ref([])
  const connections = ref(new Map())
  const myPeerId = ref('')
  const messageText = ref('')
  const peer = ref(null)
  const isInitialized = ref(false)
  const connectionError = ref('')
  let discoveryInterval = null

  const PEERS_REGISTRY_KEY = 'webrtc_peers_registry'

  const onlinePeers = computed(() => {
    return Array.from(connections.value.values()).map(({ username, peerId }) => ({
      username,
      peerId
    }))
  })

  // Registry functions
  const registerPeer = (peerId, username) => {
    try {
      const registry = JSON.parse(localStorage.getItem(PEERS_REGISTRY_KEY) || '{}')
      registry[peerId] = {
        username,
        lastSeen: Date.now()
      }
      localStorage.setItem(PEERS_REGISTRY_KEY, JSON.stringify(registry))
      console.log('Registered peer:', peerId, username)
    } catch (error) {
      console.error('Error registering peer:', error)
    }
  }

  const updatePeerLastSeen = () => {
    if (!myPeerId.value) return
    try {
      const registry = JSON.parse(localStorage.getItem(PEERS_REGISTRY_KEY) || '{}')
      if (registry[myPeerId.value]) {
        registry[myPeerId.value].lastSeen = Date.now()
        localStorage.setItem(PEERS_REGISTRY_KEY, JSON.stringify(registry))
      }
    } catch (error) {
      console.error('Error updating last seen:', error)
    }
  }

  const cleanupRegistry = () => {
    try {
      const registry = JSON.parse(localStorage.getItem(PEERS_REGISTRY_KEY) || '{}')
      const now = Date.now()
      const TIMEOUT = 10000 // 10 seconds timeout
      
      Object.entries(registry).forEach(([peerId, data]) => {
        if (now - data.lastSeen > TIMEOUT) {
          delete registry[peerId]
        }
      })
      
      localStorage.setItem(PEERS_REGISTRY_KEY, JSON.stringify(registry))
    } catch (error) {
      console.error('Error cleaning registry:', error)
    }
  }

  const getActivePeers = () => {
    try {
      const registry = JSON.parse(localStorage.getItem(PEERS_REGISTRY_KEY) || '{}')
      return Object.entries(registry)
        .filter(([peerId]) => peerId !== myPeerId.value)
        .map(([peerId, data]) => ({
          peerId,
          username: data.username
        }))
    } catch (error) {
      console.error('Error getting active peers:', error)
      return []
    }
  }

  const startDiscovery = () => {
    // Update our last seen timestamp periodically
    setInterval(updatePeerLastSeen, 5000)

    // Clean up old peers and try connecting to new ones
    discoveryInterval = setInterval(() => {
      cleanupRegistry()
      const peers = getActivePeers()
      peers.forEach(({ peerId }) => {
        if (!connections.value.has(peerId)) {
          connectToPeer(peerId)
        }
      })
    }, 5000)
  }

  const peerConfig = {
    host: '0.peerjs.com',
    port: 443,
    secure: true,
    debug: 3,
    config: {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:global.stun.twilio.com:3478' }
      ]
    }
  }

  const initialize = (name) => {
    if (!name) return
    
    username.value = name
    console.log('Initializing peer with username:', name)

    peer.value = new Peer(undefined, peerConfig)
    
    peer.value.on('open', (id) => {
      myPeerId.value = id
      isInitialized.value = true
      console.log('Connected with peer ID:', id)
      
      // Register ourselves and start discovery
      registerPeer(id, name)
      startDiscovery()
    })

    peer.value.on('connection', (conn) => {
      console.log('Received connection from:', conn.peer)
      handleConnection(conn)
    })

    peer.value.on('error', (err) => {
      console.error('Peer error:', err)
      connectionError.value = err.message
    })
  }

  const connectToPeer = (peerId) => {
    if (!peer.value || connections.value.has(peerId)) return

    console.log('Connecting to peer:', peerId)
    const conn = peer.value.connect(peerId)
    handleConnection(conn)
  }

  const handleConnection = (conn) => {
    conn.on('open', () => {
      console.log('Connection opened with:', conn.peer)
      
      connections.value.set(conn.peer, {
        connection: conn,
        username: 'Unknown',
        peerId: conn.peer
      })

      conn.send({
        type: 'info',
        username: username.value,
        peerId: myPeerId.value
      })
    })

    conn.on('data', (data) => {
      console.log('Received data:', data)
      
      if (data.type === 'info') {
        connections.value.set(conn.peer, {
          connection: conn,
          username: data.username,
          peerId: data.peerId
        })
      } else if (data.type === 'chat') {
        messages.value.push({
          from: connections.value.get(conn.peer)?.username || 'Unknown',
          content: data.content,
          timestamp: new Date().toISOString()
        })
      }
    })

    conn.on('close', () => {
      console.log('Connection closed:', conn.peer)
      connections.value.delete(conn.peer)
    })
  }

  const sendMessage = () => {
    if (!messageText.value.trim()) return

    const message = {
      type: 'chat',
      content: messageText.value.trim()
    }

    connections.value.forEach(({ connection }) => {
      if (connection.open) {
        console.log('Sending message to:', connection.peer)
        connection.send(message)
      }
    })

    messages.value.push({
      from: username.value + ' (me)',
      content: messageText.value.trim(),
      timestamp: new Date().toISOString()
    })

    messageText.value = ''
  }

  const disconnect = () => {
    if (discoveryInterval) {
      clearInterval(discoveryInterval)
    }
    
    if (peer.value) {
      peer.value.destroy()
      peer.value = null
    }
    
    // Remove ourselves from registry
    try {
      const registry = JSON.parse(localStorage.getItem(PEERS_REGISTRY_KEY) || '{}')
      delete registry[myPeerId.value]
      localStorage.setItem(PEERS_REGISTRY_KEY, JSON.stringify(registry))
    } catch (error) {
      console.error('Error removing from registry:', error)
    }
    
    connections.value.clear()
    messages.value = []
    isInitialized.value = false
    myPeerId.value = ''
  }

  // Clean up on component unmount
  onUnmounted(() => {
    disconnect()
  })

  return {
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
  }
}