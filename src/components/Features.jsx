import { useState } from "react"
import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { ChevronRight, Sparkles } from "lucide-react"

export default function FeaturesSection() {
  const navigate = useNavigate()
  const [hoveredFeature, setHoveredFeature] = useState(null)

  const features = [
    {
      path: "/global-multiplayer",
      title: "Global Multiplayer",
      description: "Challenge players from around the world in real-time matches",
      icon: "🌍",
      color: "from-blue-500 to-purple-600",
    },
    {
      path: "/random-play",
      title: "Random Play",
      description: "Quick casual games with random moves for fun practice.",
      icon: "🎲",
      color: "from-indigo-500 to-blue-600",
    },
    {
      path: "/against-stockfish",
      title: "AI Opponents",
      description: "Test your skills against Stockfish, one of the strongest chess engines",
      icon: "🤖",
      color: "from-red-500 to-pink-600",
    },
    {
      path: "/puzzle",
      title: "Tactical Puzzles",
      description: "Improve your chess vision with challenging puzzles for all skill levels",
      icon: "🧩",
      color: "from-yellow-500 to-orange-600",
    },
    {
      path: "/local-multiplayer",
      title: "Local Multiplayer",
      description: "Play face-to-face with a friend on the same device",
      icon: "👥",
      color: "from-green-500 to-teal-600",
    },
  ]

  const handleFeatureClick = (path) => {
    console.log("Navigating to:", path)
    if (path) {
      navigate(path)
    }
  }

  return (
    <div id="features" className="bg-gradient-to-b from-gray-900 to-black py-24 relative overflow-hidden">
      {/* Background chess pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 50%)`,
            backgroundSize: "40px 40px",
          }}
        ></div>
      </div>

      {/* Animated glow spots */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full opacity-20"
          style={{
            background:
              i % 2 === 0
                ? "radial-gradient(circle, rgba(59, 130, 246, 0.6) 0%, rgba(0, 0, 0, 0) 70%)"
                : "radial-gradient(circle, rgba(139, 92, 246, 0.6) 0%, rgba(0, 0, 0, 0) 70%)",
            width: `${200 + Math.random() * 200}px`,
            height: `${200 + Math.random() * 200}px`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            filter: "blur(50px)",
          }}
          animate={{
            x: [0, Math.random() * 100 - 50, 0],
            y: [0, Math.random() * 100 - 50, 0],
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{
            duration: 15 + Math.random() * 10,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
          }}
        />
      ))}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center justify-center mb-4">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-blue-400 mr-4"></div>
            <span className="text-blue-400 font-semibold tracking-wider uppercase text-sm">Game Modes</span>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-blue-400 ml-4"></div>
          </div>

          <h2 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600 mb-6">
            Experience Chess Like Never Before
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Dive into a world of chess with stunning visuals, powerful analysis tools, and multiple game modes.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true, margin: "-100px" }}
              onClick={() => handleFeatureClick(feature.path)}
              onMouseEnter={() => setHoveredFeature(index)}
              onMouseLeave={() => setHoveredFeature(null)}
              className="cursor-pointer group relative"
              role="button"
              tabIndex={0}
              aria-label={`Play ${feature.title}`}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  handleFeatureClick(feature.path)
                }
              }}
            >
              {/* Card glow effect */}
              <motion.div
                className={`absolute -inset-0.5 rounded-2xl opacity-75 blur-sm bg-gradient-to-br ${feature.color}`}
                animate={{
                  opacity: hoveredFeature === index ? 0.9 : 0.5,
                }}
                transition={{ duration: 0.3 }}
              />

              <div
                className={`relative bg-gradient-to-br ${feature.color} p-[1px] rounded-2xl shadow-lg h-full overflow-hidden`}
              >
                <div className="bg-gray-900 rounded-2xl p-8 h-full transition-all duration-300 hover:bg-gray-800/90 flex flex-col items-center relative backdrop-blur-sm">
                  {/* Sparkle effects on hover */}
                  {hoveredFeature === index && (
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
                    className="text-5xl mb-6 relative"
                    whileHover={{
                      scale: 1.2,
                      rotate: [0, -10, 10, -5, 0],
                      transition: { duration: 0.5 },
                    }}
                  >
                    {/* Icon glow effect */}
                    <div className="absolute inset-0 filter blur-md opacity-70">{feature.icon}</div>
                    {feature.icon}
                  </motion.div>

                  <h3 className="text-2xl font-bold text-white mb-3 text-center">{feature.title}</h3>
                  <p className="text-gray-300 text-center mb-6">{feature.description}</p>

                  <motion.div
                    initial={{ opacity: 0.7, y: 5 }}
                    whileHover={{ opacity: 1, y: 0, scale: 1.05 }}
                    className="mt-auto inline-flex items-center justify-center px-5 py-2.5 rounded-full text-sm font-medium text-white bg-white/10 group-hover:bg-white/20 transition-colors border border-white/10 group-hover:border-white/20"
                  >
                    Play Now
                    <ChevronRight className="ml-1 w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </motion.div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}