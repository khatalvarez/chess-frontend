import { useState, useEffect, lazy, Suspense } from "react"
import { useNavigate } from "react-router-dom"
import { useSelector } from "react-redux"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, Crown, Trophy, User } from "lucide-react"
import FeaturesSection from "./Features"
import { FaChess } from "react-icons/fa"

const PieceArray = lazy(() => import("./PieceArray"))

function Home() {
  const authStatus = useSelector((state) => state.auth.status)
  const userData = useSelector((state) => state.auth.userData)
  const [showPieceArray, setShowPieceArray] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const navigate = useNavigate()

  const fullText = "Welcome to Chess Master"
  const [typedText, setTypedText] = useState("")
  const [particles, setParticles] = useState([])

  // Generate particles
  useEffect(() => {
    const newParticles = []
    for (let i = 0; i < 50; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 4 + 1,
        speed: Math.random() * 1 + 0.5,
        color: Math.random() > 0.5 ? 
          `rgba(59, 130, 246, ${Math.random() * 0.3 + 0.1})` : 
          `rgba(139, 92, 246, ${Math.random() * 0.3 + 0.1})`
      })
    }
    setParticles(newParticles)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    setTimeout(() => setShowPieceArray(true), 800)
  }, [])

  useEffect(() => {
    let index = 0
    let currentText = ""
    const interval = setInterval(() => {
      if (index < fullText.length) {
        currentText += fullText[index]
        setTypedText(currentText)
        index++
      } else {
        clearInterval(interval)
      }
    }, 65) // Slightly faster typing
    return () => clearInterval(interval)
  }, [])

  const scrollToContent = () => {
    const contentElement = document.getElementById("features")
    if (contentElement) {
      contentElement.scrollIntoView({ behavior: "smooth" })
    }
  }

  const handleFeatureClick = (path) => {
    if (path) {
      navigate(path)
    }
  }

  // Chess piece icons for floating animations
  const pieceIcons = [
    { icon: "♚", delay: 1.2, size: 60 },
    { icon: "♛", delay: 1.5, size: 65 },
    { icon: "♜", delay: 1.8, size: 55 },
    { icon: "♝", delay: 2.1, size: 58 },
    { icon: "♞", delay: 2.4, size: 62 },
    { icon: "♟", delay: 2.7, size: 50 },
    { icon: "♚", delay: 3.0, size: 70 },
    { icon: "♛", delay: 3.3, size: 63 },
    { icon: "♜", delay: 3.6, size: 56 },
    { icon: "♝", delay: 3.9, size: 59 },
  ]

  return (
    <div className="relative w-screen min-h-screen overflow-x-hidden bg-gradient-to-b from-gray-950 via-gray-900 to-black sm:pt-32">
      <div className="fixed inset-0 z-0 opacity-10" 
        style={{
          backgroundImage: `linear-gradient(45deg, #111 25%, transparent 25%), 
                            linear-gradient(-45deg, #111 25%, transparent 25%), 
                            linear-gradient(45deg, transparent 75%, #111 75%), 
                            linear-gradient(-45deg, transparent 75%, #111 75%)`,
          backgroundSize: '60px 60px',
          backgroundPosition: '0 0, 0 30px, 30px -30px, -30px 0px'
        }}>
      </div>

      {/* Animated particles */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute rounded-full"
            style={{
              backgroundColor: particle.color,
              boxShadow: `0 0 ${particle.size * 2}px ${particle.color.replace(')', ', 0.8)')}`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
            }}
            initial={{
              x: `${particle.x}vw`,
              y: `${particle.y}vh`,
              opacity: 0
            }}
            animate={{
              y: [`${particle.y}vh`, `${(particle.y + 20) % 100}vh`, `${particle.y}vh`],
              opacity: [0, 0.7, 0]
            }}
            transition={{
              duration: 10 / particle.speed,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      {/* Floating chess pieces background */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0">
          {pieceIcons.map((piece, index) => (
            <motion.div
              key={index}
              initial={{ 
                x: `${Math.random() * 100}vw`, 
                y: `${Math.random() * 100}vh`,
                opacity: 0
              }}
              animate={{ 
                x: [`${Math.random() * 100}vw`, `${Math.random() * 100}vw`, `${Math.random() * 100}vw`],
                y: [`${Math.random() * 100}vh`, `${Math.random() * 100}vh`, `${Math.random() * 100}vh`],
                opacity: [0, 0.25, 0]
              }}
              transition={{ 
                repeat: Infinity, 
                duration: 15 + Math.random() * 10,
                delay: piece.delay,
                repeatType: "reverse"
              }}
              className="absolute text-white opacity-20"
              style={{ 
                fontSize: `${piece.size}px`,
                textShadow: '0 0 15px rgba(255, 255, 255, 0.5)'
              }}
            >
              {piece.icon}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative w-screen h-screen flex items-center justify-center overflow-hidden">
        {/* Animated glow effects */}
        <motion.div 
          className="absolute z-0 w-96 h-96 rounded-full opacity-30"
          style={{
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.6) 0%, rgba(0, 0, 0, 0) 70%)',
            filter: 'blur(40px)',
            top: '20%',
            left: '30%',
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />
        
        <motion.div 
          className="absolute z-0 w-80 h-80 rounded-full opacity-30"
          style={{
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.6) 0%, rgba(0, 0, 0, 0) 70%)',
            filter: 'blur(40px)',
            top: '30%',
            right: '30%',
          }}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            repeatType: "reverse",
            delay: 1
          }}
        />

        <div className="relative z-10 w-11/12 max-w-5xl">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-center p-8 sm:p-12 rounded-3xl"
            style={{
              background: "radial-gradient(circle at center, rgba(17,24,39,0.8) 0%, rgba(5,10,20,0.6) 70%, rgba(0,0,0,0) 100%)",
              backdropFilter: "blur(12px)",
              boxShadow: "0 0 60px rgba(59, 130, 246, 0.15), 0 0 20px rgba(139, 92, 246, 0.15)"
            }}
          >
            {/* Animated chess logo */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.2 }}
              className="w-24 h-24 mx-auto mb-8"
            >
              <div className="w-full h-full relative">
                <motion.div
                  animate={{ 
                    boxShadow: ["0 0 15px rgba(59, 130, 246, 0.6)", "0 0 30px rgba(139, 92, 246, 0.8)", "0 0 15px rgba(59, 130, 246, 0.6)"]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-600 to-purple-600"
                />
                <FaChess className="absolute inset-0 text-white w-full h-full p-4" />
              </div>
            </motion.div>

            {showPieceArray && (
              <Suspense fallback={<div className="h-16 flex justify-center" />}>
                <motion.div 
                  initial={{ y: -50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.8 }}
                  className="mb-10"
                >
                  <PieceArray />
                </motion.div>
              </Suspense>
            )}

            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="h-24 mb-8 flex justify-center items-center"
            >
              <h1 className="text-5xl sm:text-6xl md:text-7xl text-center font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500">
                {typedText}
                <motion.span
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
                  className="inline-block w-1 h-12 ml-1 bg-blue-400"
                />
              </h1>
            </motion.div>

            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              className="mb-14"
            >
              <p className="text-center text-xl sm:text-2xl lg:text-3xl text-gray-200 leading-relaxed max-w-4xl mx-auto">
                <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Experience the ultimate chess journey.</span> Challenge friends, solve puzzles, and test your skills against
                the world's strongest chess engine.
              </p>
            </motion.div>

            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.9 }}
              className="flex flex-col sm:flex-row justify-center items-center gap-6"
            >
              {authStatus === "true" && userData.username ? (
                <motion.button
                  onClick={() => navigate("/modeselector")}
                  className="w-full sm:w-auto px-10 py-5 rounded-full text-xl font-semibold transition duration-300 transform hover:scale-105 hover:shadow-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 relative overflow-hidden group"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 group-hover:from-blue-700 group-hover:to-purple-700" />
                  <motion.span 
                    className="absolute inset-0 bg-gradient-to-r from-blue-600/0 via-white/20 to-blue-600/0"
                    animate={{ x: ["-100%", "100%"] }}
                    transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3 }}
                  />
                  <span className="absolute inset-0 flex items-center justify-center text-white">
                    <span className="flex items-center">
                      <Crown className="mr-2 inline" size={24} /> Continue Your Journey
                    </span>
                  </span>
                  <span className="invisible">Continue Your Journey</span>
                </motion.button>
              ) : (
                <>
                  <motion.button
                    onClick={() => navigate("/login")}
                    className="w-full sm:w-auto px-10 py-5 rounded-full text-xl font-semibold transition duration-300 transform hover:scale-105 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 relative overflow-hidden group"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 group-hover:from-blue-700 group-hover:to-indigo-700" />
                    <motion.span 
                      className="absolute inset-0 bg-gradient-to-r from-blue-600/0 via-white/20 to-blue-600/0"
                      animate={{ x: ["-100%", "100%"] }}
                      transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3 }}
                    />
                    <span className="absolute inset-0 flex items-center justify-center text-white">
                      <span className="flex items-center">
                        <User className="mr-2 inline" size={24} /> Login
                      </span>
                    </span>
                    <span className="invisible">Login</span>
                  </motion.button>
                  
                  <motion.button
                    onClick={() => navigate("/signup")}
                    className="w-full sm:w-auto px-10 py-5 rounded-full text-xl font-semibold transition duration-300 transform hover:scale-105 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 relative overflow-hidden group"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 group-hover:from-purple-700 group-hover:to-pink-700" />
                    <motion.span 
                      className="absolute inset-0 bg-gradient-to-r from-purple-600/0 via-white/20 to-purple-600/0"
                      animate={{ x: ["-100%", "100%"] }}
                      transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3 }}
                    />
                    <span className="absolute inset-0 flex items-center justify-center text-white">
                      <span className="flex items-center">
                        <Trophy className="mr-2 inline" size={24} /> Sign Up
                      </span>
                    </span>
                    <span className="invisible">Sign Up</span>
                  </motion.button>
                </>
              )}
            </motion.div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="absolute bottom-16 left-0 right-0 flex justify-center"
        >
          <motion.button
            onClick={scrollToContent}
            className="p-2 rounded-full transition-all duration-300 relative z-10"
            whileHover={{ scale: 1.2 }}
            animate={{ 
              y: [0, 5, 0],
              boxShadow: [
                "0 0 10px rgba(59, 130, 246, 0.5)",
                "0 0 20px rgba(139, 92, 246, 0.8)",
                "0 0 10px rgba(59, 130, 246, 0.5)"
              ]
            }}
            transition={{ 
              y: { repeat: Infinity, duration: 1.5 },
              boxShadow: { repeat: Infinity, duration: 2 }
            }}
          >
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-full p-2">
              <ChevronDown size={32} className="text-white" />
            </div>
          </motion.button>
        </motion.div>
      </div>

      {/* Features Section */}
      <FeaturesSection />

      {/* Call to Action */}
      <div className="bg-gradient-to-b from-gray-900 to-black py-20 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden opacity-30 pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{
                background: i % 2 === 0 
                  ? `radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, rgba(0, 0, 0, 0) 70%)`
                  : `radial-gradient(circle, rgba(139, 92, 246, 0.3) 0%, rgba(0, 0, 0, 0) 70%)`,
                width: `${150 + Math.random() * 150}px`,
                height: `${150 + Math.random() * 150}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                filter: 'blur(30px)'
              }}
              animate={{
                x: [0, Math.random() * 100 - 50, 0],
                y: [0, Math.random() * 100 - 50, 0],
                scale: [1, 1.2, 1],
                opacity: [0.2, 0.4, 0.2]
              }}
              transition={{
                duration: 10 + Math.random() * 10,
                repeat: Infinity,
                repeatType: "reverse"
              }}
            />
          ))}
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Ready to Begin Your Chess Journey?</h2>
            <p className="text-xl text-gray-300 mb-10">
              Join thousands of players worldwide and start your chess adventure today
            </p>
            <motion.button
              onClick={() => navigate(authStatus === "true" && userData.username ? "/modeselector" : "/signup")}
              className="inline-block px-8 py-4 rounded-full text-xl font-semibold transition duration-300 transform hover:scale-105 shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 relative overflow-hidden group"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 group-hover:from-blue-700 group-hover:to-purple-700" />
              <motion.span 
                className="absolute inset-0 bg-gradient-to-r from-blue-600/0 via-white/20 to-blue-600/0"
                animate={{ x: ["-100%", "100%"] }}
                transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3 }}
              />
              <span className="absolute inset-0 flex items-center justify-center text-white">
                {authStatus === "true" && userData.username ? "Choose Game Mode" : "Get Started Now"}
              </span>
              <span className="invisible">{authStatus === "true" && userData.username ? "Choose Game Mode" : "Get Started Now"}</span>
            </motion.button>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default Home