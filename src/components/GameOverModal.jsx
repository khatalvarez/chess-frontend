import { useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import confetti from "canvas-confetti"
import { Trophy, X, RotateCcw, Home, Sparkles, ChevronRight } from "lucide-react"
import { Link } from "react-router-dom"
import bg from "../assets/images/bgprofile.webp"


const GameOverModal = ({ isOpen, message, onRestart }) => {
  useEffect(() => {
    if (isOpen && message.toLowerCase().includes("win")) {
      // Trigger confetti celebration for wins
      const duration = 3 * 1000
      const animationEnd = Date.now() + duration
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }

      function randomInRange(min, max) {
        return Math.random() * (max - min) + min
      }

      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now()

        if (timeLeft <= 0) {
          return clearInterval(interval)
        }

        const particleCount = 50 * (timeLeft / duration)

        // Since particles fall down, start a bit higher than random
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
          colors: ["#FFD700", "#FFC107", "#FFEB3B"],
        })
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
          colors: ["#4CAF50", "#8BC34A", "#CDDC39"],
        })
      }, 250)
    }
  }, [isOpen, message])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backdropFilter: "blur(8px)" }}
        >
          <div className="absolute inset-0 bg-black opacity-70" onClick={onRestart} />

          <motion.div
            initial={{ scale: 0.8, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.8, y: 20, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 border border-gray-700 overflow-hidden"
          >
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `url(${bg})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  filter: "grayscale(1)",
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20" />
            </div>

            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden opacity-30 pointer-events-none">
              {[...Array(4)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute rounded-full"
                  style={{
                    background:
                      i % 2 === 0
                        ? `radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, rgba(0, 0, 0, 0) 70%)`
                        : `radial-gradient(circle, rgba(139, 92, 246, 0.3) 0%, rgba(0, 0, 0, 0) 70%)`,
                    width: `${100 + Math.random() * 100}px`,
                    height: `${100 + Math.random() * 100}px`,
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    filter: "blur(20px)",
                  }}
                  animate={{
                    x: [0, Math.random() * 50 - 25, 0],
                    y: [0, Math.random() * 50 - 25, 0],
                    scale: [1, 1.2, 1],
                    opacity: [0.2, 0.4, 0.2],
                  }}
                  transition={{
                    duration: 8 + Math.random() * 5,
                    repeat: Number.POSITIVE_INFINITY,
                    repeatType: "reverse",
                  }}
                />
              ))}
            </div>

            {/* Close button */}
            <button
              onClick={onRestart}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors duration-200"
            >
              <X size={24} />
            </button>

            <div className="relative flex flex-col items-center text-center">
              {/* Trophy icon with glow effect */}
              <div className="relative mb-6">
                <motion.div
                  className="absolute inset-0 rounded-full blur-xl opacity-30"
                  animate={{
                    opacity: [0.3, 0.6, 0.3],
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Number.POSITIVE_INFINITY,
                    repeatType: "reverse",
                  }}
                  style={{
                    background: message.toLowerCase().includes("win")
                      ? "rgba(234, 179, 8, 0.5)"
                      : message.toLowerCase().includes("draw")
                        ? "rgba(59, 130, 246, 0.5)"
                        : "rgba(239, 68, 68, 0.5)",
                  }}
                />
                <div
                  className={`w-20 h-20 rounded-full flex items-center justify-center ${
                    message.toLowerCase().includes("win")
                      ? "bg-gradient-to-br from-yellow-400 to-yellow-600"
                      : message.toLowerCase().includes("draw")
                        ? "bg-gradient-to-br from-blue-400 to-blue-600"
                        : "bg-gradient-to-br from-red-400 to-red-600"
                  }`}
                >
                  {message.toLowerCase().includes("win") ? (
                    <Trophy className="w-10 h-10 text-white" />
                  ) : message.toLowerCase().includes("draw") ? (
                    <motion.div
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                    >
                      <Sparkles className="w-10 h-10 text-white" />
                    </motion.div>
                  ) : (
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
                    >
                      <X className="w-10 h-10 text-white" />
                    </motion.div>
                  )}
                </div>
              </div>

              <h2
                className={`text-3xl font-extrabold mb-4 uppercase tracking-wider ${
                  message.toLowerCase().includes("win")
                    ? "text-yellow-400"
                    : message.toLowerCase().includes("draw")
                      ? "text-blue-400"
                      : "text-red-400"
                }`}
              >
                {message}
              </h2>

              <p className="text-lg text-gray-300 mb-8">
                {message.toLowerCase().includes("win")
                  ? "Congratulations on your victory! Your strategy and skill have paid off."
                  : message.toLowerCase().includes("draw")
                    ? "A balanced match! Both players showed great skill and determination."
                    : "Don't worry, every loss is a learning opportunity. Try again!"}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 w-full">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onRestart}
                  className="flex-1 py-3 px-6 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg text-white font-semibold flex items-center justify-center group relative overflow-hidden"
                >
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

                  <RotateCcw className="mr-2" size={18} />
                  <span>Play Again</span>
                  <ChevronRight className="ml-2 h-5 w-5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
                </motion.button>

                <Link to="/modeselector" className="flex-1">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full py-3 px-6 bg-gray-700 hover:bg-gray-600 rounded-lg text-white font-semibold flex items-center justify-center transition-colors duration-200 group relative overflow-hidden"
                  >
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
                        delay: 0.5,
                      }}
                    >
                      <div className="w-1/3 h-full bg-gradient-to-r from-transparent via-white/10 to-transparent transform rotate-30 blur-md" />
                    </motion.div>

                    <Home className="mr-2" size={18} />
                    <span>Game Modes</span>
                    <ChevronRight className="ml-2 h-5 w-5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
                  </motion.button>
                </Link>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default GameOverModal

