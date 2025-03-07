class SocketManager {
  constructor(baseURL, maxReconnectAttempts = 5, reconnectDelay = 2000) {
    this.baseURL = baseURL
    this.maxReconnectAttempts = maxReconnectAttempts
    this.reconnectDelay = reconnectDelay
    this.reconnectAttempts = 0
    this.socket = null
    this.listeners = new Map()
  }

  addListener(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event).push(callback)
  }

  removeListener(event, callback) {
    if (this.listeners.has(event)) {
      this.listeners.set(
        event,
        this.listeners.get(event).filter((cb) => cb !== callback),
      )
    }
  }

  emit(event, data, options = {}) {
    if (!this.socket) {
      console.error("Cannot emit event: Socket not connected")
      return false
    }

    const { retries = 3, retryDelay = 1000, acknowledgement = false } = options
    let attempts = 0

    return new Promise((resolve, reject) => {
      const tryEmit = () => {
        if (attempts >= retries) {
          const error = `Failed to emit ${event} after ${retries} attempts`
          console.error(error)
          reject(new Error(error))
          return
        }

        if (!this.socket.connected) {
          console.log(`Socket not connected, retrying ${event} in ${retryDelay}ms`)
          attempts++
          setTimeout(tryEmit, retryDelay)
          return
        }

        if (acknowledgement) {
          this.socket.emit(event, data, (response) => {
            console.log(`Received acknowledgement for ${event}:`, response)
            resolve(response)
          })
        } else {
          this.socket.emit(event, data)
          resolve(true)
        }
      }

      tryEmit()
    })
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
    const socketUrl = this.baseURL.startsWith("http") ? this.baseURL : `http://${this.baseURL}`
    console.log("Connecting to socket server at:", socketUrl)

    // Create socket connection with improved options
    this.socket = io(socketUrl, {
      query: { user: JSON.stringify(user) },
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.reconnectDelay,
      timeout: 20000, // Increase connection timeout
      transports: ["websocket", "polling"],
    })

    // Set up basic event handlers with improved logging
    this.socket.on("connect", () => {
      console.log("Socket connected with ID:", this.socket.id)
      this.reconnectAttempts = 0

      // Notify any listeners that we've connected
      if (this.listeners.has("connect")) {
        this.listeners.get("connect").forEach((callback) => callback())
      }
    })

    this.socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error)
      this.reconnectAttempts++

      if (this.reconnectAttempts > this.maxReconnectAttempts) {
        console.error("Max reconnect attempts reached, giving up")

        // Notify any listeners of the connection failure
        if (this.listeners.has("connect_error")) {
          this.listeners.get("connect_error").forEach((callback) => callback(error))
        }
      }
    })

    this.socket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason)

      // Auto-reconnect for certain disconnect reasons
      if (reason === "io server disconnect") {
        // the disconnection was initiated by the server, reconnect manually
        this.socket.connect()
      }

      // Notify any listeners that we've disconnected
      if (this.listeners.has("disconnect")) {
        this.listeners.get("disconnect").forEach((callback) => callback(reason))
      }
    })

    this.socket.on("error", (error) => {
      console.error("Socket error:", error)

      // Notify any listeners of the error
      if (this.listeners.has("error")) {
        this.listeners.get("error").forEach((callback) => callback(error))
      }
    })

    return this.socket
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
  }
}

const BASE_URL = "https://chess-backend-43nq.onrender.com" // Replace with your actual base URL

export default SocketManager

