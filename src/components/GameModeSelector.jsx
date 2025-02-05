import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { FaGlobe, FaUsers, FaRobot, FaPuzzlePiece, FaDice } from "react-icons/fa"
import bg from "../assets/images/bgprofile.jpg"

const gameModes = [
  { path: "/global-multiplayer", label: "Global Multiplayer", icon: FaGlobe, color: "from-blue-500 to-purple-600" },
  { path: "/local-multiplayer", label: "Local Multiplayer", icon: FaUsers, color: "from-green-500 to-teal-600" },
  { path: "/against-stockfish", label: "Against Stockfish", icon: FaRobot, color: "from-red-500 to-pink-600" },
  { path: "/puzzle", label: "Puzzles", icon: FaPuzzlePiece, color: "from-yellow-500 to-orange-600" },
  { path: "/random-play", label: "Random Play", icon: FaDice, color: "from-indigo-500 to-blue-600" },
]

function GameModeSelector() {
  const [animate, setAnimate] = useState(false)

  useEffect(() => {
    setAnimate(true)
  }, [])

  return (
      <div
        className="w-screen min-h-screen flex items-center justify-center bg-gray-900 py-16r"
        style={{ backgroundImage: `url(${bg})` }}
      >
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h1
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-4xl md:text-6xl font-extrabold text-center text-white mb-12 tracking-tight"
        >
          Choose Your{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">Game Mode</span>
        </motion.h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {gameModes.map(({ path, label, icon: Icon, color }, index) => (
            <motion.div
              key={path}
              initial={{ y: 50, opacity: 0 }}
              animate={animate ? { y: 0, opacity: 1 } : {}}
              transition={{ duration: 0.6, delay: index * 0.1 + 0.4 }}
            >
              <Link to={path} className="block">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`bg-gradient-to-br ${color} p-1 rounded-2xl shadow-lg`}
                >
                  <div className="bg-gray-900 bg-opacity-80 backdrop-filter backdrop-blur-xl rounded-xl p-6 h-full flex flex-col items-center justify-center transition duration-300 hover:bg-opacity-70">
                    <Icon className="text-5xl mb-4 text-white" />
                    <h2 className="text-xl md:text-2xl font-bold text-white text-center">{label}</h2>
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

