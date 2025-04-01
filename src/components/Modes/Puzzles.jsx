import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { FaChessKnight, FaChessQueen, FaChessBoard } from "react-icons/fa"
import { Sparkles, ChevronRight } from "lucide-react"
import bg from "../../assets/images/bgprofile.webp"

const topPuzzles = [
  {
    path: "/puzzle1",
    title: "The Magician's Puzzle",
    description: "A complex puzzle that requires creative thinking and tactical vision",
    icon: <FaChessKnight className="text-4xl" />,
    color: "from-blue-500 to-indigo-600",
  },
  {
    path: "/puzzle2",
    title: "The Mighty Knight Puzzle",
    description: "Master the knight's unique movement to solve this challenging puzzle",
    icon: <FaChessQueen className="text-4xl" />,
    color: "from-red-500 to-orange-600",
  },
  {
    path: "/puzzle3",
    title: "The Enigmatic Puzzle",
    description: "An intricate puzzle that will test even the most skilled players",
    icon: <FaChessBoard className="text-4xl" />,
    color: "from-green-500 to-teal-600",
  },
]

const mateInOne = [
  {
    path: "/puzzle4",
    title: "Easy Mate-in-One",
    description: "Perfect for beginners looking to improve their checkmate vision",
    icon: <FaChessKnight className="text-4xl" />,
    color: "from-yellow-500 to-amber-600",
  },
  {
    path: "/puzzle5",
    title: "Normal Mate-in-One",
    description: "Standard difficulty checkmate puzzles for intermediate players",
    icon: <FaChessQueen className="text-4xl" />,
    color: "from-purple-500 to-pink-600",
  },
  {
    path: "/puzzle6",
    title: "Hard Mate-in-One",
    description: "Challenge yourself with these difficult mate-in-one positions",
    icon: <FaChessBoard className="text-4xl" />,
    color: "from-gray-500 to-gray-700",
  },
]

export default function Puzzles() {
  const navigate = useNavigate()
  const [animate, setAnimate] = useState(false)
  const [hoveredPuzzle, setHoveredPuzzle] = useState(null)
  const [hoveredMate, setHoveredMate] = useState(null)

  useEffect(() => {
    setAnimate(true)
  }, [])

  const handlePuzzleClick = () => {
    if (path) navigate(path)
  }

  return (
    <div className="w-screen min-h-screen flex items-center justify-center bg-gray-900 py-28 relative overflow-hidden">
      {/* Background with overlay */}
      <div className="absolute inset-0 z-0 w-screen">
        <img
          src={bg || "/placeholder.svg?height=1080&width=1920"}
          alt="Chess background"
          className="absolute inset-0 w-full h-full object-cover brightness-[0.3]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/80 via-gray-900/70 to-gray-900/90" />
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Title */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center justify-center mb-4">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-purple-400 mr-4"></div>
            <span className="text-purple-400 font-semibold tracking-wider uppercase text-sm">Train Your Mind</span>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-purple-400 ml-4"></div>
          </div>

          <h2 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-6">
            Challenge Your Mind with Puzzles
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Sharpen your tactical vision and improve your chess skills with our collection of handcrafted puzzles.
          </p>
        </motion.div>

        {/* The Big Three Section */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, margin: "-100px" }}
          className="mb-16"
        >
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-8 text-center flex items-center justify-center">
            <Sparkles className="mr-2 text-purple-400" size={24} />
            <span>The Big Three</span>
            <span className="text-purple-400 ml-2">(Hardest Puzzles)</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {topPuzzles.map((puzzle, index) => (
              <motion.div
                key={index}
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true, margin: "-100px" }}
                onClick={() => handlePuzzleClick(puzzle.path)}
                onMouseEnter={() => setHoveredPuzzle(index)}
                onMouseLeave={() => setHoveredPuzzle(null)}
                className="cursor-pointer relative"
              >
                {/* Card glow effect */}
                <motion.div
                  className={`absolute -inset-0.5 rounded-2xl opacity-75 blur-sm bg-gradient-to-br ${puzzle.color}`}
                  animate={{
                    opacity: hoveredPuzzle === index ? 0.9 : 0.5,
                  }}
                  transition={{ duration: 0.3 }}
                />

                <div
                  className={`relative bg-gradient-to-br ${puzzle.color} p-[1px] rounded-2xl shadow-lg h-full overflow-hidden`}
                >
                  <div className="bg-gray-900 rounded-2xl p-8 h-full transition-all duration-300 hover:bg-gray-800/90 flex flex-col items-center relative backdrop-blur-sm">
                    {/* Sparkle effects on hover */}
                    {hoveredPuzzle === index && (
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

                    <motion.div
                      className="mb-6 relative"
                      whileHover={{
                        scale: 1.2,
                        rotate: [0, -10, 10, -5, 0],
                        transition: { duration: 0.5 },
                      }}
                    >
                      {/* Icon glow effect */}
                      <div className="absolute inset-0 filter blur-md opacity-70">{puzzle.icon}</div>
                      {puzzle.icon}
                    </motion.div>

                    <h3 className="text-2xl font-bold text-white mb-3 text-center">{puzzle.title}</h3>
                    <p className="text-gray-300 text-center mb-6">{puzzle.description}</p>

                    <motion.div
                      initial={{ opacity: 0.7, y: 5 }}
                      whileHover={{ opacity: 1, y: 0, scale: 1.05 }}
                      className="mt-auto inline-flex items-center justify-center px-5 py-2.5 rounded-full text-sm font-medium text-white bg-white/10 hover:bg-white/20 transition-colors border border-white/10 hover:border-white/20"
                    >
                      Solve Puzzle
                      <ChevronRight className="ml-1 w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Mate in One Move Section */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-8 text-center flex items-center justify-center">
            <Sparkles className="mr-2 text-yellow-400" size={24} />
            <span>Mate in One Move</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {mateInOne.map((puzzle, index) => (
              <motion.div
                key={index}
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true, margin: "-100px" }}
                onClick={() => handlePuzzleClick(puzzle.path)}
                onMouseEnter={() => setHoveredMate(index)}
                onMouseLeave={() => setHoveredMate(null)}
                className="cursor-pointer relative"
              >
                {/* Card glow effect */}
                <motion.div
                  className={`absolute -inset-0.5 rounded-2xl opacity-75 blur-sm bg-gradient-to-br ${puzzle.color}`}
                  animate={{
                    opacity: hoveredMate === index ? 0.9 : 0.5,
                  }}
                  transition={{ duration: 0.3 }}
                />

                <div
                  className={`relative bg-gradient-to-br ${puzzle.color} p-[1px] rounded-2xl shadow-lg h-full overflow-hidden`}
                >
                  <div className="bg-gray-900 rounded-2xl p-8 h-full transition-all duration-300 hover:bg-gray-800/90 flex flex-col items-center relative backdrop-blur-sm">
                    {/* Sparkle effects on hover */}
                    {hoveredMate === index && (
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

                    <motion.div
                      className="mb-6 relative"
                      whileHover={{
                        scale: 1.2,
                        rotate: [0, -10, 10, -5, 0],
                        transition: { duration: 0.5 },
                      }}
                    >
                      {/* Icon glow effect */}
                      <div className="absolute inset-0 filter blur-md opacity-70">{puzzle.icon}</div>
                      {puzzle.icon}
                    </motion.div>

                    <h3 className="text-2xl font-bold text-white mb-3 text-center">{puzzle.title}</h3>
                    <p className="text-gray-300 text-center mb-6">{puzzle.description}</p>

                    <motion.div
                      initial={{ opacity: 0.7, y: 5 }}
                      whileHover={{ opacity: 1, y: 0, scale: 1.05 }}
                      className="mt-auto inline-flex items-center justify-center px-5 py-2.5 rounded-full text-sm font-medium text-white bg-white/10 hover:bg-white/20 transition-colors border border-white/10 hover:border-white/20"
                    >
                      Solve Puzzle
                      <ChevronRight className="ml-1 w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

