import { useEffect, useState, useRef } from "react"
import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { Sparkles, ChevronRight } from "lucide-react"

const gameModes = [
  {
    path: "/global-multiplayer",
    title: "Global Multiplayer",
    description: "Challenge players from around the world in real-time matches",
    icon: "🌍",
    color: "from-blue-500 to-purple-600",
    highlight: "border-blue-400",
  },
  {
    path: "/random-play",
    title: "Random Play",
    description: "Quick casual games with random moves for fun practice.",
    icon: "🎲",
    color: "from-indigo-500 to-blue-600",
    highlight: "border-indigo-400",
  },
  {
    path: "/against-stockfish",
    title: "AI Opponents",
    description: "Test your skills against Stockfish, one of the strongest chess engines",
    icon: "🤖",
    color: "from-red-500 to-pink-600",
    highlight: "border-red-400",
  },
  {
    path: "/puzzle",
    title: "Tactical Puzzles",
    description: "Improve your chess vision with challenging puzzles for all skill levels",
    icon: "🧩",
    color: "from-yellow-500 to-orange-600",
    highlight: "border-yellow-400",
  },
  {
    path: "/local-multiplayer",
    title: "Local Multiplayer",
    description: "Play face-to-face with a friend on the same device",
    icon: "👥",
    color: "from-green-500 to-teal-600",
    highlight: "border-green-400",
  },
]

export default function GameModeSelector() {
  const navigate = useNavigate()
  const [typedText, setTypedText] = useState("")
  const [animate, setAnimate] = useState(false)
  const [bgLoaded, setBgLoaded] = useState(false)
  const [selectedMode, setSelectedMode] = useState(null)
  const [hoverEffect, setHoverEffect] = useState({ active: false, x: 0, y: 0 })
  const [hoveredMode, setHoveredMode] = useState(null)
  const containerRef = useRef(null)
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 })
  const [parallaxItems, setParallaxItems] = useState([])

  const fullText = "Choose Your Chess Experience"

  useEffect(() => {
    // Set window size for responsive calculations
    setWindowSize({
      width: window.innerWidth,
      height: window.innerHeight,
    })

    // Window resize listener
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    window.addEventListener("resize", handleResize)

    // Generate parallax chess pieces
    const generateParallaxItems = () => {
      const pieces = ["♟️", "♞", "♝", "♜", "♛", "♚", "♔", "♕", "♖", "♗", "♘", "♙"]
      return Array.from({ length: 20 }, (_, i) => ({
        id: i,
        piece: pieces[Math.floor(Math.random() * pieces.length)],
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 1.5 + 1,
        speed: Math.random() * 0.8 + 0.2,
        opacity: Math.random() * 0.5 + 0.1,
        rotation: Math.random() * 360,
      }))
    }

    setParallaxItems(generateParallaxItems())

    // Trigger animations after component mounts
    setTimeout(() => setAnimate(true), 300)

    // Load background image with higher quality
    const bgImage = new Image()
    bgImage.src =
      "https://images.unsplash.com/photo-1529699211952-734e80c4d42b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2942&q=90"
    bgImage.onload = () => setBgLoaded(true)

    // Text typing effect with more natural rhythm
    let index = 0
    let currentText = ""
    let speed = 0

    const interval = setInterval(() => {
      if (index < fullText.length) {
        // Random typing speed variations for natural effect
        speed = Math.random() * 30 + 40
        currentText += fullText[index]
        setTypedText(currentText)
        index++
      } else {
        clearInterval(interval)
      }
    }, 60)

    return () => {
      clearInterval(interval)
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  // Mouse move parallax effect
  const handleMouseMove = (e) => {
    if (!containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    setHoverEffect({
      active: true,
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
    })
  }

  const handleMouseLeave = () => {
    setHoverEffect({ active: false, x: 0, y: 0 })
  }

  const handleModeSelect = (path, index) => {
    setSelectedMode(index)

    // Navigation with stylish delay
    setTimeout(() => {
      navigate(path)
    }, 700)
  }

  return (
    <div
      ref={containerRef}
      className="relative w-screen min-h-screen bg-gray-900 overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Advanced Background with parallax and lighting effects */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: bgLoaded ? 1 : 0 }}
        transition={{ duration: 2 }}
        className="absolute inset-0 w-full h-full"
      >
        <div
          className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1529699211952-734e80c4d42b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2942&q=90')] bg-cover bg-center brightness-50"
          style={{
            transform: hoverEffect.active
              ? `scale(1.05) translate(${(hoverEffect.x - 50) * -0.02}%, ${(hoverEffect.y - 50) * -0.02}%)`
              : "scale(1)",
            transition: "transform 0.8s cubic-bezier(0.33, 1, 0.68, 1)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/70 via-gray-900/80 to-gray-900/90" />

        {/* Dynamic lighting effect */}
        {hoverEffect.active && (
          <div
            className="absolute inset-0 bg-gradient-radial from-purple-500/10 to-transparent opacity-50 pointer-events-none"
            style={{
              background: `radial-gradient(circle at ${hoverEffect.x}% ${hoverEffect.y}%, rgba(109, 40, 217, 0.15) 0%, transparent 70%)`,
              mixBlendMode: "overlay",
            }}
          />
        )}
      </motion.div>

      {/* Animated chess piece background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {parallaxItems.map((item) => (
          <motion.div
            key={item.id}
            initial={{
              x: `${item.x}%`,
              y: `${item.y}%`,
              scale: item.size,
              opacity: 0,
              rotate: item.rotation,
            }}
            animate={{
              y: [`${item.y}%`, `${(item.y + item.speed * 20) % 100}%`],
              opacity: item.opacity,
              rotate: [item.rotation, item.rotation + 360],
            }}
            transition={{
              y: {
                repeat: Number.POSITIVE_INFINITY,
                duration: 40 / item.speed,
                ease: "linear",
              },
              opacity: { duration: 2 },
              rotate: {
                repeat: Number.POSITIVE_INFINITY,
                duration: 80 / item.speed,
                ease: "linear",
              },
            }}
            style={{
              x: `${item.x}%`,
              position: "absolute",
              fontSize: `${item.size * 2}rem`,
              color: "rgba(255, 255, 255, 0.1)",
              filter: "blur(1px)",
              transform: hoverEffect.active
                ? `translate(${(hoverEffect.x - 50) * item.speed * -0.1}px, ${(hoverEffect.y - 50) * item.speed * -0.1}px) rotate(${item.rotation}deg) scale(${item.size})`
                : `rotate(${item.rotation}deg) scale(${item.size})`,
            }}
          >
            {item.piece}
          </motion.div>
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        {/* Enhanced heading with typing effect and glowing accent */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12 sm:mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-6">
          Choose Your Chess Experience
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
          Select your preferred way to play and embark on your chess journey.
          </p>
        </motion.div>

        {/* Enhanced Game Mode Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {gameModes.map((mode, index) => (
            <motion.div
              key={index}
              initial={{ y: 50, opacity: 0 }}
              animate={animate ? { y: 0, opacity: 1 } : {}}
              transition={{ duration: 0.4, delay: index * 0.15 + 0.6 }}
              whileHover={{
                y: -8,
                scale: 1.03,
                transition: { duration: 0.2, ease: "easeOut" },
              }}
              className={`${selectedMode === index ? "ring-4 ring-white/20" : ""}`}
              onClick={() => handleModeSelect(mode.path, index)}
              onMouseEnter={() => setHoveredMode(index)}
              onMouseLeave={() => setHoveredMode(null)}
            >
              <div
                className={`bg-gradient-to-br ${mode.color} p-0.5 rounded-2xl shadow-lg h-full cursor-pointer overflow-hidden group`}
                style={{
                  boxShadow: `0 10px 25px -5px rgba(0, 0, 0, 0.2), 0 0 20px -5px ${mode.color.includes("blue") ? "rgba(59, 130, 246, 0.3)" : mode.color.includes("red") ? "rgba(239, 68, 68, 0.3)" : mode.color.includes("green") ? "rgba(16, 185, 129, 0.3)" : mode.color.includes("yellow") ? "rgba(245, 158, 11, 0.3)" : "rgba(139, 92, 246, 0.3)"}`,
                }}
              >
                <div className="relative bg-gray-800/90 backdrop-blur-sm rounded-2xl p-6 sm:p-8 h-full flex flex-col items-center justify-center transition-all duration-300 group-hover:bg-gray-700/90">
                  {/* Glowing background effect on hover */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className={`absolute inset-0 bg-gradient-to-br ${mode.color} opacity-10 blur-xl`}></div>
                  </div>

                  {/* Sparkle effects on hover */}
                  {hoveredMode === index && (
                    <>
                      <motion.div
                        className="absolute top-4 right-4 text-yellow-300"
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Sparkles className="h-5 w-5" />
                      </motion.div>
                      <motion.div
                        className="absolute bottom-4 left-4 text-yellow-300"
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                      >
                        <Sparkles className="h-4 w-4" />
                      </motion.div>
                    </>
                  )}

                  {/* Mode icon with enhanced animations */}
                  <motion.div
                    whileHover={{
                      rotate: [0, -10, 10, -5, 0],
                      scale: [1, 1.2, 1.1],
                      transition: { duration: 0.5 },
                    }}
                    className="relative mb-6 text-5xl sm:text-6xl"
                  >
                    <div className="absolute inset-0 text-5xl sm:text-6xl blur-md opacity-50">{mode.icon}</div>
                    {mode.icon}
                  </motion.div>

                  <h2 className="text-xl sm:text-2xl font-bold text-white text-center mb-3 relative">
                    {mode.title}
                    <motion.div
                      className={`h-0.5 ${mode.highlight} w-0 group-hover:w-full absolute bottom-0 left-0 right-0 mx-auto`}
                      transition={{ duration: 0.3 }}
                    />
                  </h2>

                  <p className="text-gray-300 text-center text-sm sm:text-base">{mode.description}</p>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileHover={{ opacity: 1, y: 0, scale: 1.05 }}
                    className="mt-6 relative overflow-hidden"
                  >
                    <span
                      className={`inline-flex items-center justify-center px-4 py-2 rounded-full text-sm font-medium text-white bg-white/10 group-hover:bg-gradient-to-r ${mode.color} transition-all duration-300 transform group-hover:scale-105`}
                    >
                      Play Now
                      <ChevronRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                    </span>

                    {/* Button shine effect */}
                    <motion.div
                      className="absolute inset-0 w-full h-full"
                      initial={{ x: "-100%" }}
                      animate={{ x: ["100%", "100%", "-100%"] }}
                      transition={{
                        repeat: Number.POSITIVE_INFINITY,
                        repeatDelay: 3,
                        duration: 1.5,
                        ease: "easeInOut",
                      }}
                    >
                      <div className="w-1/3 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent transform rotate-30 blur-md" />
                    </motion.div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Enhanced Back Button with animations */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.5 }}
          className="text-center mt-16 sm:mt-20"
        >
          <motion.button
            onClick={() => navigate("/profile")}
            className="inline-block px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-gray-600 to-gray-800 text-white rounded-full text-lg sm:text-xl font-semibold hover:from-gray-700 hover:to-gray-900 transition duration-300 transform hover:scale-105 shadow-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 relative overflow-hidden group"
            whileHover={{
              boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.2)",
            }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="relative z-10 flex items-center">
              <svg
                className="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform duration-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                ></path>
              </svg>
              Back to Profile
            </span>

            {/* Button shine effect */}
            <motion.div
              className="absolute inset-0 w-full h-full"
              initial={{ x: "-100%" }}
              animate={{ x: ["100%", "100%", "-100%"] }}
              transition={{
                repeat: Number.POSITIVE_INFINITY,
                repeatDelay: 4,
                duration: 1.5,
                ease: "easeInOut",
              }}
            >
              <div className="w-1/3 h-full bg-gradient-to-r from-transparent via-white/10 to-transparent transform rotate-30 blur-sm" />
            </motion.div>
          </motion.button>
        </motion.div>

        {/* Subtle footer signature */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          transition={{ duration: 0.8, delay: 2 }}
          className="text-center mt-12 text-sm text-gray-500"
        >
          <p>Experience the art of chess</p>
        </motion.div>
      </div>
    </div>
  )
}
