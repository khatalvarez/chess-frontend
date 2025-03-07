import { io } from "socket.io-client"
import { BASE_URL } from "../url"

class SocketManager {
  constructor() {
    this.socket = null
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 5
    this.reconnectDelay = 1000
    this.listeners = new Map()
  }

  connect(user) {
    if (!user || !user.userId) {
      console.error("Cannot connect socket: Invalid user data")
      return null
    }

    if (this.socket && this.socket.connected) {
      console.log("Socket already connected")
      return this.socket
    }

    // Format URL correctly
    const socketUrl = BASE_URL.startsWith("http") ? BASE_URL : `http://${BASE_URL}`
    console.log("Connecting to socket server at:", socketUrl)

    // Create socket connection
    this.socket = io(socketUrl, {
      query: { user: JSON.stringify(user) },
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.reconnectDelay,
      transports: ["websocket", "polling"],
    })

    // Set up basic event handlers
    this.socket.on("connect", () => {
      console.log("Socket connected with ID:", this.socket.id)
      this.reconnectAttempts = 0
    })

    this.socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error)
      this.reconnectAttempts++

      if (this.reconnectAttempts > this.maxReconnectAttempts) {
        console.error("Max reconnect attempts reached, giving up")
      }
    })

    this.socket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason)
    })

    this.socket.on("error", (error) => {
      console.error("Socket error:", error)
    })

    return this.socket
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
      console.log("Socket disconnected")
    }
  }

  // Add an event listener with automatic reconnection handling
  on(event, callback) {
    if (!this.socket) {
      console.error("Cannot add listener: Socket not connected")
      return
    }

    // Store the callback in our listeners map
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event).push(callback)

    // Add the listener to the socket
    this.socket.on(event, callback)
  }

  // Remove an event listener
  off(event, callback) {
    if (!this.socket) {
      return
    }

    if (callback) {
      // Remove specific callback
      this.socket.off(event, callback)

      // Update our listeners map
      const callbacks = this.listeners.get(event)
      if (callbacks) {
        const index = callbacks.indexOf(callback)
        if (index !== -1) {
          callbacks.splice(index, 1)
        }
      }
    } else {
      // Remove all callbacks for this event
      this.socket.off(event)
      this.listeners.delete(event)
    }
  }

  // Emit an event with retry logic
  emit(event, data, options = {}) {
    if (!this.socket) {
      console.error("Cannot emit event: Socket not connected")
      return false
    }

    const { retries = 3, retryDelay = 1000 } = options
    let attempts = 0

    const tryEmit = () => {
      if (attempts >= retries) {
        console.error(`Failed to emit ${event} after ${retries} attempts`)
        return
      }

      if (!this.socket.connected) {
        console.log(`Socket not connected, retrying ${event} in ${retryDelay}ms`)
        attempts++
        setTimeout(tryEmit, retryDelay)
        return
      }

      this.socket.emit(event, data)
    }

    tryEmit()
    return true
  }

  // Get the current socket instance
  getSocket() {
    return this.socket
  }

  // Check if socket is connected
  isConnected() {
    return this.socket && this.socket.connected
  }
}

// Create a singleton instance
const socketManager = new SocketManager()
export default socketManager

