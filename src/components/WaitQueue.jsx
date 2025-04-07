"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Users, Clock, CastleIcon as ChessKnight, Wifi, WifiOff, Sparkles } from "lucide-react"
import bg from "../assets/images/bgprofile.webp"

function WaitQueue({ socket = null, length = 2 }) {
  const [dots, setDots] = useState("")
  const [elapsed, setElapsed] = useState(0)
  const [playersWaiting, setPlayersWaiting] = useState(1)
  const [connectionStatus, setConnectionStatus] = useState(socket ? "connected" : "disconnected")
  const [retryCount, setRetryCount] = useState(0)
  const [tips, setTips] = useState([
    "You can change the board theme in the settings",
    "Use mobile mode on touch devices for easier play",
    "Visual hints show you possible moves",
    "Choose your promotion piece before reaching the 8th rank",
    "Leaving a game counts as a loss",
    "Your match history is saved to your profile",
    "You can mute game sounds with the volume button",
  ])
  const [currentTip, setCurrentTip] = useState(0)

  useEffect(() => {
    // Animated dots
    const dotsInterval = setInterval(() => {
      setDots((prev) => {
        if (prev.length >= 3) return ""
        return prev + "."
      })
    }, 500)

    // Elapsed time counter
    const elapsedInterval = setInterval(() => {
      setElapsed((prev) => prev + 1)
    }, 1000)

    // Rotate tips every 5 seconds
    const tipsInterval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % tips.length)
    }, 5000)

    // Listen for waiting players count if socket is available
    if (socket) {
      console.log("WaitQueue: Socket connected, listening for updates")
      setConnectionStatus("connected")

      // Request current waiting count
      socket.emit("getWaitingCount")

      socket.on("waitingCount", (count) => {
        console.log("Players waiting:", count)
        setPlayersWaiting(count)
      })

      socket.on("connect", () => {
        console.log("Socket connected")
        setConnectionStatus("connected")
        setRetryCount(0)
        socket.emit("getWaitingCount")
      })

      socket.on("disconnect", () => {
        console.log("Socket disconnected")
        setConnectionStatus("disconnected")
      })

      socket.on("connect_error", (error) => {
        console.error("Connection error:", error)
        setConnectionStatus("error")

        // Implement retry logic with backoff
        if (retryCount < 5) {
          const timeout = Math.min(1000 * 2 ** retryCount, 30000)
          console.log(`Retrying connection in ${timeout / 1000} seconds...`)

          setTimeout(() => {
            console.log("Attempting to reconnect...")
            socket.connect()
            setRetryCount((prev) => prev + 1)
          }, timeout)
        }
      })

      // Request updates every 5 seconds
      const waitingInterval = setInterval(() => {
        if (socket.connected) {
          socket.emit("getWaitingCount")
        }
      }, 5000)

      return () => {
        clearInterval(dotsInterval)
        clearInterval(elapsedInterval)
        clearInterval(waitingInterval)
        clearInterval(tipsInterval)
        socket.off("waitingCount")
        socket.off("connect")
        socket.off("disconnect")
        socket.off("connect_error")
      }
    }

    return () => {
      clearInterval(dotsInterval)
      clearInterval(elapsedInterval)
      clearInterval(tipsInterval)
    }
  }, [socket, retryCount, tips])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs < 10 ? "0" + secs : secs}`
  }

  // Calculate remaining players needed
  const playersNeeded = Math.max(0, length - playersWaiting)

  return (
    <div className="w-screen min-h-screen flex flex-col items-center justify-center relative">
      {/* Background with overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={bg || "/placeholder.svg?height=1080&width=1920"}
          alt="Chess background"
          className="absolute inset-0 w-full h-full object-cover brightness-[0.3]"
        />
        <div className="absolute inset-0 bg-black opacity-70"></div>
      </div>

      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden opacity-30 pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              background:
                i % 2 === 0
                  ? `radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, rgba(0, 0, 0, 0) 70%)`
                  : `radial-gradient(circle, rgba(139, 92, 246, 0.3) 0%, rgba(0, 0, 0, 0) 70%)`,
              width: `${150 + Math.random() * 150}px`,
              height: `${150 + Math.random() * 150}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              filter: "blur(30px)",
            }}
            animate={{
              x: [0, Math.random() * 100 - 50, 0],
              y: [0, Math.random() * 100 - 50, 0],
              scale: [1, 1.2, 1],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: 10 + Math.random() * 10,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "reverse",
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-md w-full mx-4 bg-gray-900 bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-gray-700">
        <div className="text-center">
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 2,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "reverse",
            }}
            className="w-24 h-24 mx-auto mb-6 relative"
          >
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500/50 to-purple-600/50 blur-xl" />
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center relative">
              <ChessKnight className="w-12 h-12 text-white" />

              {/* Orbiting sparkles */}
              <motion.div
                className="absolute"
                animate={{
                  rotate: [0, 360],
                }}
                transition={{
                  duration: 8,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "linear",
                }}
                style={{ transformOrigin: "center center" }}
              >
                <motion.div
                  className="absolute"
                  style={{ left: 0, top: -30 }}
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Number.POSITIVE_INFINITY,
                    repeatType: "reverse",
                  }}
                >
                  <Sparkles className="text-blue-300 w-4 h-4" />
                </motion.div>
              </motion.div>

              <motion.div
                className="absolute"
                animate={{
                  rotate: [0, -360],
                }}
                transition={{
                  duration: 10,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "linear",
                }}
                style={{ transformOrigin: "center center" }}
              >
                <motion.div
                  className="absolute"
                  style={{ right: -30, top: 0 }}
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Number.POSITIVE_INFINITY,
                    repeatType: "reverse",
                    delay: 0.5,
                  }}
                >
                  <Sparkles className="text-purple-300 w-4 h-4" />
                </motion.div>
              </motion.div>
            </div>
          </motion.div>

          <h2 className="text-3xl font-bold text-white mb-2">Finding Opponent</h2>
          <p className="text-xl text-gray-300 mb-8">
            Waiting for {playersNeeded} more player{playersNeeded !== 1 ? "s" : ""} to join{dots}
          </p>

          <div className="flex items-center justify-center space-x-8 mb-8">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-2">
                <Users className="w-6 h-6 text-blue-400" />
              </div>
              <p className="text-sm text-gray-400">Players Needed</p>
              <p className="text-2xl font-bold text-white">{playersNeeded}</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-2">
                <Clock className="w-6 h-6 text-green-400" />
              </div>
              <p className="text-sm text-gray-400">Wait Time</p>
              <p className="text-2xl font-bold text-white">{formatTime(elapsed)}</p>
            </div>

            <div className="text-center">
              <div
                className={`w-12 h-12 rounded-full ${connectionStatus === "connected" ? "bg-green-500/20" : "bg-red-500/20"} flex items-center justify-center mx-auto mb-2`}
              >
                {connectionStatus === "connected" ? (
                  <Wifi className="w-6 h-6 text-green-400" />
                ) : (
                  <WifiOff className="w-6 h-6 text-red-400" />
                )}
              </div>
              <p className="text-sm text-gray-400">Connection</p>
              <p className="text-2xl font-bold text-white capitalize">
                {connectionStatus === "connected" ? "Online" : "Offline"}
              </p>
            </div>
          </div>

          <div className="relative h-2 bg-gray-700 rounded-full overflow-hidden mb-6">
            <motion.div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-purple-600"
              animate={{
                width: ["0%", "100%", "0%"],
                x: ["0%", "0%", "100%"],
              }}
              transition={{
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "loop",
                ease: "easeInOut",
              }}
            />
          </div>

          {/* Tips section */}
          <div className="bg-gray-800/50 p-4 rounded-lg mb-4">
            <h3 className="text-blue-400 font-medium mb-2">Chess Tip:</h3>
            <motion.p
              key={currentTip}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-gray-300"
            >
              {tips[currentTip]}
            </motion.p>
          </div>

          <p className="mt-2 text-gray-400 text-sm">
            You'll be automatically matched with an opponent as soon as one becomes available.
          </p>

          {connectionStatus !== "connected" && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="mt-4 text-red-400 text-sm flex items-center justify-center"
            >
              <WifiOff className="w-4 h-4 mr-2" />
              Connection issue detected. Please check your internet connection or try refreshing the page.
            </motion.p>
          )}
        </div>
      </div>
    </div>
  )
}

export default WaitQueue

