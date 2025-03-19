"use client"

import { useState, useEffect, lazy, Suspense } from "react"
import { useNavigate } from "react-router-dom"
import { useSelector } from "react-redux"
import { motion } from "framer-motion"
import { ChevronDown } from "lucide-react"
import bgChessPlaceholder from "../assets/images/bgChess.webp"
import FeaturesSection from "./Features"

const PieceArray = lazy(() => import("./PieceArray"))

function Home() {
  const authStatus = useSelector((state) => state.auth.status)
  const userData = useSelector((state) => state.auth.userData)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [bgImage, setBgImage] = useState(null)
  const [showPieceArray, setShowPieceArray] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const navigate = useNavigate()

  const fullText = "Welcome to Chess Master"
  const [typedText, setTypedText] = useState("")

  useEffect(() => {
    import("../assets/images/bgChess.webp").then((module) => {
      setBgImage(module.default)
      const img = new Image()
      img.src = module.default
      img.onload = () => setImageLoaded(true)
    })

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

  return (
    <div className="relative w-screen min-h-screen overflow-x-hidden">
      {/* Hero Section */}
      <div className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 w-full h-full bg-gray-900" style={{ aspectRatio: "16/9" }} aria-hidden="true">
          {!imageLoaded && (
            <img
              src={bgChessPlaceholder || "/placeholder.svg"}
              width="1920"
              height="1080"
              alt=""
              className="w-full h-full object-cover brightness-40 blur-sm"
            />
          )}
        </div>

        {bgImage && (
          <motion.div
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.5 }}
            className="absolute inset-0 w-full h-full"
          >
            <img
              src={bgImage || "/placeholder.svg"}
              width="1920"
              height="1080"
              alt="Chess background"
              fetchpriority="high"
              className="w-full h-full object-cover brightness-40 -z-10"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-gray-900 z-0"></div>
          </motion.div>
        )}

        <div className="relative z-10 w-11/12 max-w-5xl">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-center bg-gradient-to-r from-transparent via-transparent to-gray-700 p-8 sm:p-12 rounded-3xl"
          >
            {showPieceArray && (
              <Suspense fallback={<div className="h-16 flex justify-center" />}>
                <div className="mb-8">
                  <PieceArray />
                </div>
              </Suspense>
            )}

            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="h-24 mb-6 flex justify-center items-center"
            >
              <h1 className="text-5xl sm:text-6xl md:text-7xl text-center font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-blue-500 to-purple-600">
                {typedText}
                <motion.span
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
                  className="inline-block w-1 h-12 ml-1 bg-green-400"
                />
              </h1>
            </motion.div>

            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              className="mb-12"
            >
              <p className="text-center text-xl sm:text-2xl lg:text-3xl text-gray-200 leading-relaxed max-w-4xl mx-auto">
                Experience the ultimate chess journey. Challenge friends, solve puzzles, and test your skills against
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
                <button
                  onClick={() => navigate("/modeselector")}
                  className="w-full sm:w-auto px-10 py-5 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-full text-xl font-semibold hover:from-green-600 hover:to-blue-700 transition duration-300 transform hover:scale-105 hover:shadow-lg shadow-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
                >
                  Continue Your Journey
                </button>
              ) : (
                <>
                  <button
                    onClick={() => navigate("/login")}
                    className="w-full sm:w-auto px-10 py-5 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-full text-xl font-semibold hover:from-amber-600 hover:to-orange-700 transition duration-300 transform hover:scale-105 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-opacity-50"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => navigate("/signup")}
                    className="w-full sm:w-auto px-10 py-5 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-full text-xl font-semibold hover:from-purple-600 hover:to-pink-700 transition duration-300 transform hover:scale-105 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
                  >
                    Sign Up
                  </button>
                </>
              )}
            </motion.div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="absolute bottom-24 left-0 right-0 flex justify-center"
        >
          <button
            onClick={scrollToContent}
            className="p-2 bg-white bg-opacity-30 rounded-full hover:bg-opacity-70 transition-all duration-300"
          >
            <ChevronDown size={32} className="text-white animate-bounce" />
          </button>
        </motion.div>
      </div>

      {/* Features Section */}
     <FeaturesSection />

      {/* Call to Action */}
      <div className="bg-gradient-to-b from-gray-900 to-gray-800 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
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
            <button
              onClick={() => navigate(authStatus === "true" && userData.username ? "/modeselector" : "/signup")}
              className="inline-block px-8 py-4 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-full text-xl font-semibold hover:from-green-600 hover:to-blue-700 transition duration-300 transform hover:scale-105 shadow-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
            >
              {authStatus === "true" && userData.username ? "Choose Game Mode" : "Get Started Now"}
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default Home

