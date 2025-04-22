import { useState, useEffect, lazy, Suspense } from "react"
import { useNavigate } from "react-router-dom"
import { useSelector } from "react-redux"
import { motion } from "framer-motion"
import { ChevronDown, Crown, Trophy, User, ChevronRight } from "lucide-react"
import FeaturesSection from "./Features"
import ChessMasterLogo from "./ChessMasterLogo"
import Footer from "./Footer"

const PieceArray = lazy(() => import("./PieceArray"))

export default function Home() {
  const authStatus = useSelector((state) => state.auth.status)
  const userData = useSelector((state) => state.auth.userData)
  const [showPieceArray, setShowPieceArray] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [navbarHeight, setNavbarHeight] = useState(0)
  const navigate = useNavigate()

  const fullText = "Welcome to Chess Master"
  const [typedText, setTypedText] = useState("")
  const [particles, setParticles] = useState([])
  const [isHovering, setIsHovering] = useState({ login: false, signup: false, continue: false })
  const [devicePerformance, setDevicePerformance] = useState('high') 

            {/* // <meta name="description" content="Chess Master - Experience the ultimate chess journey. Challenge friends, solve puzzles, and test your skills." />
          // <meta name="keywords" content="chess, online chess, chess game, strategy game, multiplayer chess" />
          // <meta property="og:title" content="Chess Master - The Ultimate Chess Experience" />
          // <meta property="og:description" content="Experience the ultimate chess journey. Challenge friends, solve puzzles, and test your skills." />
          // <meta property="og:type" content="website" />
          // <meta name="twitter:card" content="summary_large_image" />
          // <meta name="twitter:title" content="Chess Master - The Ultimate Chess Experience" />
          // <meta name="twitter:description" content="Experience the ultimate chess journey. Challenge friends, solve puzzles, and test your skills." /> */}

  useEffect(() => {
    const isMobile = window.innerWidth < 768
    const isLowMemory = navigator.deviceMemory && navigator.deviceMemory < 4
    
    if (isMobile || isLowMemory) {
      setDevicePerformance('low')
    }
  }, [])

  // Detect navbar height
  useEffect(() => {
    const updateNavbarHeight = () => {
      const navbar = document.querySelector("nav")
      if (navbar) {
        setNavbarHeight(navbar.offsetHeight)
      }
    }

    updateNavbarHeight()
    window.addEventListener("resize", updateNavbarHeight)
    const timer = setTimeout(updateNavbarHeight, 500)

    return () => {
      window.removeEventListener("resize", updateNavbarHeight)
      clearTimeout(timer)
    }
  }, [])

  // Generate fewer particles based on device performance
  useEffect(() => {
    const isMobile = window.innerWidth < 768
    const particleCount = devicePerformance === 'low' ? 15 : isMobile ? 30 : 60
    
    const newParticles = []
    for (let i = 0; i < particleCount; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * (isMobile ? 2 : 4) + 1, // Smaller particles on mobile
        speed: Math.random() * 1 + 0.5,
        color:
          Math.random() > 0.5
            ? `rgba(59, 130, 246, ${Math.random() * 0.3 + 0.1})`
            : `rgba(139, 92, 246, ${Math.random() * 0.3 + 0.1})`,
      })
    }
    setParticles(newParticles)
  }, [devicePerformance])

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }

    // Use passive listener for better scroll performance
    window.addEventListener("scroll", handleScroll, { passive: true })
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
    }, 65)
    return () => clearInterval(interval)
  }, [])

  const scrollToContent = () => {
    const contentElement = document.getElementById("features")
    if (contentElement) {
      contentElement.scrollIntoView({ behavior: "smooth" })
    }
  }

  // Fewer pieces on mobile or low-performance devices
  const pieceIcons = devicePerformance === 'low' ? [
    { icon: "♚", delay: 1.2, size: 60 },
    { icon: "♛", delay: 1.5, size: 65 },
  ] : [
    { icon: "♚", delay: 1.2, size: 60 },
    { icon: "♛", delay: 1.5, size: 65 },
    { icon: "♜", delay: 1.8, size: 55 },
    { icon: "♝", delay: 2.1, size: 58 },
    { icon: "♞", delay: 2.4, size: 62 },
  ]

  return (
    <div className="relative w-screen min-h-screen overflow-x-hidden bg-gradient-to-b from-gray-950 via-gray-900 to-black">
      {/* Add Meta Tags Component */}
      {/* <MetaTags /> */}
      
      {/* Chess board pattern background - simplified for mobile */}
      <div
        className="fixed inset-0 z-0 opacity-5"
        style={{
          backgroundImage: `linear-gradient(45deg, #111 25%, transparent 25%), 
                          linear-gradient(-45deg, #111 25%, transparent 25%), 
                          linear-gradient(45deg, transparent 75%, #111 75%), 
                          linear-gradient(-45deg, transparent 75%, #111 75%)`,
          backgroundSize: devicePerformance === 'low' ? "60px 60px" : "40px 40px", // Bigger pattern on low-perf devices
          backgroundPosition: "0 0, 0 20px, 20px -20px, -20px 0px",
        }}
        aria-hidden="true"
      ></div>

      {/* Animated particles - conditionally rendered based on device capability */}
      {devicePerformance !== 'low' && (
        <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none" aria-hidden="true">
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              className="absolute rounded-full"
              style={{
                backgroundColor: particle.color,
                boxShadow: `0 0 ${particle.size * 2}px ${particle.color.replace(")", ", 0.8)")}`,
                width: `${particle.size}px`,
                height: `${particle.size}px`,
              }}
              initial={{
                x: `${particle.x}vw`,
                y: `${particle.y}vh`,
                opacity: 0,
              }}
              animate={{
                y: [`${particle.y}vh`, `${(particle.y + 20) % 100}vh`, `${particle.y}vh`],
                opacity: [0, 0.7, 0],
              }}
              transition={{
                duration: 10 / particle.speed,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      )}

      {/* Floating chess pieces - conditionally rendered based on device capability */}
      {devicePerformance !== 'low' && (
        <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none md:block hidden" aria-hidden="true">
          <div className="absolute inset-0">
            {pieceIcons.map((piece, index) => (
              <motion.div
                key={index}
                initial={{
                  x: `${Math.random() * 100}vw`,
                  y: `${Math.random() * 100}vh`,
                  opacity: 0,
                }}
                animate={{
                  x: [`${Math.random() * 100}vw`, `${Math.random() * 100}vw`, `${Math.random() * 100}vw`],
                  y: [`${Math.random() * 100}vh`, `${Math.random() * 100}vh`, `${Math.random() * 100}vh`],
                  opacity: [0, 0.25, 0],
                }}
                transition={{
                  repeat: Number.POSITIVE_INFINITY,
                  duration: 15 + Math.random() * 10,
                  delay: piece.delay,
                  repeatType: "reverse",
                }}
                className="absolute text-white opacity-20"
                style={{
                  fontSize: `${piece.size}px`,
                  textShadow: "0 0 15px rgba(255, 255, 255, 0.5)",
                }}
              >
                {piece.icon}
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Hero Section - Adjusted for mobile and accessibility */}
      <section 
        className="relative w-screen min-h-screen flex items-center justify-center overflow-hidden"
        style={{ paddingTop: navbarHeight }}
        aria-labelledby="hero-heading"
      >
        {/* Simplified glow effects for mobile */}
        <motion.div
          className="absolute z-0 w-64 md:w-96 h-64 md:h-96 rounded-full opacity-20 md:opacity-30"
          style={{
            background: "radial-gradient(circle, rgba(59, 130, 246, 0.6) 0%, rgba(0, 0, 0, 0) 70%)",
            filter: "blur(30px)",
            top: "20%",
            left: "30%",
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{
            duration: 8,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
          }}
          aria-hidden="true"
        />

        <motion.div
          className="absolute z-0 w-64 md:w-80 h-64 md:h-80 rounded-full opacity-20 md:opacity-30"
          style={{
            background: "radial-gradient(circle, rgba(139, 92, 246, 0.6) 0%, rgba(0, 0, 0, 0) 70%)",
            filter: "blur(30px)",
            top: "30%",
            right: "30%",
          }}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
            delay: 1,
          }}
          aria-hidden="true"
        />

        <div className="relative z-10 w-11/12 max-w-5xl mt-2 sm:mt-0 px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-center p-6 sm:p-12 rounded-2xl sm:rounded-3xl"
            style={{
              background:
                "radial-gradient(circle at center, rgba(17,24,39,0.8) 0%, rgba(5,10,20,0.6) 70%, rgba(0,0,0,0) 100%)",
              backdropFilter: "blur(8px)",
              boxShadow: "0 0 40px rgba(59, 130, 246, 0.15), 0 0 15px rgba(139, 92, 246, 0.15)",
            }}
          >
            <ChessMasterLogo variant="home" />

            {showPieceArray && (
              <Suspense fallback={<div className="h-12 sm:h-16 flex justify-center" aria-label="Loading piece array..." />}>
                <motion.div
                  initial={{ y: -30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.8 }}
                  className="mb-4 sm:mb-6"
                >
                  <PieceArray />
                </motion.div>
              </Suspense>
            )}

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="h-16 sm:h-20 mb-2 flex justify-center items-center"
            >
              <h1 
                id="hero-heading"
                className="text-3xl sm:text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500 mb-4 sm:mb-8"
              >
                {typedText}
                <motion.span
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
                  className="inline-block w-1 h-8 sm:h-12 ml-1 bg-blue-400"
                  aria-hidden="true"
                />
              </h1>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              className="mb-8 sm:mb-14"
            >
              <p className="text-center text-lg sm:text-xl lg:text-2xl text-gray-200 leading-relaxed max-w-4xl mx-auto">
                <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
                  Experience the ultimate chess journey.
                </span>{" "}
                Challenge friends, solve puzzles, and test your skills.
              </p>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.9 }}
              className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6"
            >
              {authStatus === true && userData?.username ? (
                <motion.button
                  onClick={() => navigate("/modeselector")}
                  className="w-full sm:w-auto px-6 sm:px-10 py-4 sm:py-5 rounded-full text-lg sm:text-xl font-semibold transition duration-300 transform hover:scale-105 hover:shadow-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 relative overflow-hidden group"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  onMouseEnter={() => setIsHovering({ ...isHovering, continue: true })}
                  onMouseLeave={() => setIsHovering({ ...isHovering, continue: false })}
                  aria-label="Continue Your Chess Journey"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 group-hover:from-blue-700 group-hover:to-purple-700" />
                  <motion.span
                    className="absolute inset-0 bg-gradient-to-r from-blue-600/0 via-white/20 to-blue-600/0"
                    animate={{ x: ["-100%", "100%"] }}
                    transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, repeatDelay: 3 }}
                    aria-hidden="true"
                  />
                  <span className="absolute inset-0 flex items-center justify-center text-white">
                    <span className="flex items-center">
                      <Crown className="mr-2 inline" size={20} aria-hidden="true" />
                      Continue
                      <span className="hidden sm:inline ml-1">Your Journey</span>
                      {isHovering.continue && (
                        <motion.span
                          initial={{ opacity: 0, x: -5 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.2 }}
                          aria-hidden="true"
                        >
                          <ChevronRight className="ml-2" size={16} />
                        </motion.span>
                      )}
                    </span>
                  </span>
                  <span className="invisible">Continue Your Journey</span>
                </motion.button>
              ) : (
                <>
                  <motion.button
                    onClick={() => navigate("/login")}
                    className="w-full sm:w-auto px-6 sm:px-10 py-4 sm:py-5 rounded-full text-lg sm:text-xl font-semibold transition duration-300 transform hover:scale-105 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 relative overflow-hidden group"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                    onMouseEnter={() => setIsHovering({ ...isHovering, login: true })}
                    onMouseLeave={() => setIsHovering({ ...isHovering, login: false })}
                    aria-label="Login to Chess Master"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 group-hover:from-blue-700 group-hover:to-indigo-700" />
                    <motion.span
                      className="absolute inset-0 bg-gradient-to-r from-blue-600/0 via-white/20 to-blue-600/0"
                      animate={{ x: ["-100%", "100%"] }}
                      transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, repeatDelay: 3 }}
                      aria-hidden="true"
                    />
                    <span className="absolute inset-0 flex items-center justify-center text-white">
                      <span className="flex items-center">
                        <User className="mr-2 inline" size={18} aria-hidden="true" />
                        Login
                        {isHovering.login && (
                          <motion.span
                            initial={{ opacity: 0, x: -5 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.2 }}
                            aria-hidden="true"
                          >
                            <ChevronRight className="ml-2" size={16} />
                          </motion.span>
                        )}
                      </span>
                    </span>
                    <span className="invisible">Login</span>
                  </motion.button>

                  <motion.button
                    onClick={() => navigate("/signup")}
                    className="w-full sm:w-auto px-6 sm:px-10 py-4 sm:py-5 rounded-full text-lg sm:text-xl font-semibold transition duration-300 transform hover:scale-105 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 relative overflow-hidden group"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                    onMouseEnter={() => setIsHovering({ ...isHovering, signup: true })}
                    onMouseLeave={() => setIsHovering({ ...isHovering, signup: false })}
                    aria-label="Sign up for Chess Master"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 group-hover:from-purple-700 group-hover:to-pink-700" />
                    <motion.span
                      className="absolute inset-0 bg-gradient-to-r from-purple-600/0 via-white/20 to-purple-600/0"
                      animate={{ x: ["-100%", "100%"] }}
                      transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, repeatDelay: 3 }}
                      aria-hidden="true"
                    />
                    <span className="absolute inset-0 flex items-center justify-center text-white">
                      <span className="flex items-center">
                        <Trophy className="mr-2 inline" size={18} aria-hidden="true" />
                        Sign Up
                        {isHovering.signup && (
                          <motion.span
                            initial={{ opacity: 0, x: -5 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.2 }}
                            aria-hidden="true"
                          >
                            <ChevronRight className="ml-2" size={16} />
                          </motion.span>
                        )}
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
          className="absolute bottom-8 sm:bottom-16 left-0 right-0 flex justify-center"
        >
          <motion.button
            onClick={scrollToContent}
            className="p-2 rounded-full transition-all duration-300 relative z-10"
            whileHover={{ scale: 1.2 }}
            animate={{
              y: [0, 5, 0],
              boxShadow: [
                "0 0 5px rgba(59, 130, 246, 0.5)",
                "0 0 10px rgba(139, 92, 246, 0.8)",
                "0 0 5px rgba(59, 130, 246, 0.5)",
              ],
            }}
            transition={{
              y: { repeat: Number.POSITIVE_INFINITY, duration: 1.5 },
              boxShadow: { repeat: Number.POSITIVE_INFINITY, duration: 2 },
            }}
            aria-label="Scroll to features"
          >
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-full p-2">
              <ChevronDown size={24} className="text-white" aria-hidden="true" />
            </div>
          </motion.button>
        </motion.div>
      </section>

      {/* Features Section with ID for scroll target */}
      <section id="features" aria-label="Chess Master Features">
        <FeaturesSection />
      </section>

      {/* Call to Action - Semantic and accessible */}
      <section className="bg-gradient-to-b from-gray-900 to-black py-20 relative overflow-hidden" aria-labelledby="cta-heading">
        {/* Subtle background elements - minimal but effective */}
        <div className="absolute inset-0 overflow-hidden opacity-20 pointer-events-none" aria-hidden="true">
          {/* Just a few elegant glowing orbs */}
          {devicePerformance !== 'low' && [...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{
                background: i % 2 === 0
                  ? `radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, rgba(0, 0, 0, 0) 70%)`
                  : `radial-gradient(circle, rgba(139, 92, 246, 0.3) 0%, rgba(0, 0, 0, 0) 70%)`,
                width: `${200 + Math.random() * 100}px`,
                height: `${200 + Math.random() * 100}px`,
                left: `${20 + Math.random() * 60}%`,
                top: `${20 + Math.random() * 60}%`,
                filter: "blur(40px)",
              }}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.2, 0.3, 0.2],
              }}
              transition={{
                duration: 8 + Math.random() * 4,
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "reverse",
              }}
            />
          ))}
        </div>

        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true, margin: "-100px" }}
          >
            {/* Simple clean divider */}
            <div className="mb-8 flex items-center justify-center">
              <div className="h-px w-12 bg-gradient-to-r from-transparent to-blue-400"></div>
              <div className="mx-4">
              <span className="text-blue-400 font-semibold tracking-wider uppercase text-xs sm:text-sm">Join Now</span>
              </div>
              <div className="h-px w-12 bg-gradient-to-l from-transparent to-blue-400"></div>
            </div>

            {/* Clean typography with balanced spacing */}
            <h2 id="cta-heading" className="text-2xl sm:text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600 mb-4 sm:mb-6">
              Ready to Begin Your Chess Journey?
            </h2>
            
            <p className="text-lg text-gray-300 mb-10 max-w-xl mx-auto">
              Join thousands of players worldwide and become part of the Chess Master community
            </p>

            {/* Clean, cool button design */}
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              <button
                onClick={() => navigate(authStatus === true && userData?.username ? "/modeselector" : "/signup")}
                className="rounded-full bg-transparent"
                aria-label={authStatus === true && userData?.username ? "Play Now" : "Get Started with Chess Master"}
              >
                
                {/* Clean button surface */}
                <div className="relative flex items-center bg-gradient-to-r from-blue-600 to-purple-600 group-hover:from-blue-700 group-hover:to-purple-700 text-white px-8 py-4 rounded-full">
                  <span className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-600/30 to-purple-600/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                  
                  {/* Simple shine effect */}
                  <motion.span
                    className="absolute inset-0 rounded-full"
                    animate={{ x: ["-100%", "100%"] }}
                    transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, repeatDelay: 4 }}
                    aria-hidden="true"
                  />
                  
                  {/* Clean content layout */}
                  <div className="flex items-center space-x-2 text-lg sm:text-xl font-medium">
                    {authStatus === true && userData?.username ? (
                      <>
                        <Crown className="h-5 w-5" aria-hidden="true" />
                        <span>Play Now</span>
                      </>
                    ) : (
                      <>
                        <Trophy className="h-5 w-5" aria-hidden="true" />
                        <span>Get Started</span>
                      </>
                    )}
                    <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" aria-hidden="true" />
                  </div>
                </div>
              </button>
            </motion.div>
            
            {/* Simple feature highlights with clean icons */}
            <div className="mt-12 flex flex-wrap justify-center gap-8 text-gray-300">
              <div className="flex items-center">
                <div className="h-2 w-2 rounded-full bg-blue-500 mr-2" aria-hidden="true"></div>
                <span>Free to Play</span>
              </div>
              <div className="flex items-center">
                <div className="h-2 w-2 rounded-full bg-purple-500 mr-2" aria-hidden="true"></div>
                <span>Global Leaderboards</span>
              </div>
              <div className="flex items-center">
                <div className="h-2 w-2 rounded-full bg-indigo-500 mr-2" aria-hidden="true"></div>
                <span>Advanced AI</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

    
    </div>
  )
}