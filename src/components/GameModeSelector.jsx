import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { Globe, Users, Bot, PuzzleIcon as PuzzlePiece, Dice1Icon as Dice } from "lucide-react"
import bg from "../assets/images/bgprofile.webp"

const gameModes = [
  {
    path: "/global-multiplayer",
    label: "Global Multiplayer",
    icon: Globe,
    color: "from-blue-500 to-purple-600",
    description: "Challenge players from around the world in real-time matches.",
  },
  {
    path: "/random-play",
    label: "Random Play",
    icon: Dice,
    color: "from-indigo-500 to-blue-600",
    description: "Quick casual games with random moves for fun practice.",
  },
  {
    path: "/local-multiplayer",
    label: "Local Multiplayer",
    icon: Users,
    color: "from-green-500 to-teal-600",
    description: "Play face-to-face with a friend on the same device.",
  },
  {
    path: "/against-stockfish",
    label: "Against Stockfish",
    icon: Bot,
    color: "from-red-500 to-pink-600",
    description: "Test your skills against one of the strongest chess engines.",
  },
  {
    path: "/puzzle",
    label: "Puzzles",
    icon: PuzzlePiece,
    color: "from-yellow-500 to-orange-600",
    description: "Improve your tactical vision with challenging puzzles.",
  },
]

function GameModeSelector() {
  const [animate, setAnimate] = useState(false)
  const [hoveredMode, setHoveredMode] = useState(null)

  useEffect(() => {
    setAnimate(true)
  }, [])

  return (
    <div className="w-screen min-h-screen bg-cover bg-no-repeat bg-center flex items-center justify-center">
      <img
        src={bg || "/placeholder.svg"}
        sizes="(max-width: 600px) 400px, 800px"
        loading="lazy"
        alt="Chess background"
        className="absolute inset-0 w-full h-full object-cover brightness-[0.4]"
      />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <motion.h1
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="text-4xl md:text-6xl font-extrabold text-center text-white mb-6 tracking-tight"
        >
          Choose Your{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">Game Mode</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-xl text-gray-300 text-center max-w-3xl mx-auto mb-12"
        >
          Select how you want to play and challenge yourself with different chess experiences
        </motion.p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {gameModes.map(({ path, label, icon: Icon, color, description }, index) => (
            <motion.div
              key={path}
              initial={{ y: 50, opacity: 0 }}
              animate={animate ? { y: 0, opacity: 1 } : {}}
              transition={{ duration: 0.6, delay: index * 0.1 + 0.4 }}
              onMouseEnter={() => setHoveredMode(index)}
              onMouseLeave={() => setHoveredMode(null)}
            >
              <Link to={path} className="block h-full">
                <motion.div
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  className={`bg-gradient-to-br ${color} p-1 rounded-2xl shadow-lg h-full`}
                >
                  <div className="bg-gray-900 bg-opacity-90 backdrop-filter backdrop-blur-xl rounded-xl p-6 h-full flex flex-col items-center justify-center transition duration-300 hover:bg-opacity-80">
                    <motion.div
                      animate={hoveredMode === index ? { y: [0, -10, 0], transition: { repeat: 0, duration: 1 } } : {}}
                    >
                      <Icon className="text-5xl mb-4 text-white" size={64} />
                    </motion.div>
                    <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-3">{label}</h2>
                    <p className="text-gray-300 text-center">{description}</p>
                  </div>
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default GameModeSelector

