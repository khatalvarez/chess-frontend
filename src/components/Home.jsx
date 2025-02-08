import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useSelector } from "react-redux"
import { motion, AnimatePresence } from "framer-motion"
import bgChess from "../assets/images/bgChess.jpg"

function Home() {
  const authStatus = useSelector((state) => state.auth.status)
  const userData = useSelector((state) => state.auth.userData)
  const [typedText, setTypedText] = useState("")
  const fullText = "WWelcome to Chess Master"

  useEffect(() => {
    let index = 0
    const typingInterval = setInterval(() => {
      if (index < fullText.length) {
        setTypedText((prev) => prev + fullText.charAt(index))
        index++
      } else {
        clearInterval(typingInterval)
      }
    }, 100)

    return () => clearInterval(typingInterval)
  }, [])

  return (
    <div className="relative w-screen h-screen flex items-center justify-center overflow-hidden">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url(${bgChess})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "brightness(0.3)",
        }}
      />
      <div className="relative z-10 w-11/12 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden"
        >
          <div className="p-8 sm:p-12 bg-gray-900 bg-opacity-80 backdrop-filter backdrop-blur-xl">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">
              {typedText}
              <AnimatePresence>
                {typedText.length < fullText.length && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="inline-block w-1 h-8 ml-1 bg-green-400"
                  />
                )}

              </AnimatePresence>
            </h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5, duration: 1 }}
              className="text-center text-xl sm:text-2xl lg:text-3xl text-gray-300 mb-10 leading-relaxed"
            >
              Experience the ultimate chess journey. Challenge friends, solve puzzles, and test your skills against the
              world's strongest chess engine.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2, duration: 0.8 }}
              className="flex sm:flex-row justify-center items-center gap-6"
            >
              {authStatus === "true" && userData.username ? (
                <Link
                  to="/modeselector"
                  className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-full text-xl lg:text-2xl font-semibold hover:from-green-600 hover:to-blue-700 transition duration-300 transform hover:scale-105 shadow-lg hover:shadow-green-500/50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
                >
                  Continue Your Journey
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="sm:w-auto px-4 py-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-full text-xl lg:text-2xl font-semibold hover:from-amber-600 hover:to-orange-700 transition duration-300 transform hover:scale-105 shadow-lg hover:shadow-amber-500/50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-opacity-50"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="sm:w-auto px-4 py-4 bg-transparent border-2 border-amber-500 text-amber-500 rounded-full text-xl lg:text-2xl font-semibold hover:bg-amber-500 hover:text-gray-100 transition duration-300 transform hover:scale-105 shadow-lg hover:shadow-amber-500/50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-opacity-50"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Home

