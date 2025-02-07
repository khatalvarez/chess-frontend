import { Link } from "react-router-dom"
import { useSelector } from "react-redux"
import { motion } from "framer-motion"
import bgChess from "../assets/images/bgChess.jpg"
import Typing from "react-typing-effect"

function Home() {
  const authStatus = useSelector((state) => state.auth.status)
  const userData = useSelector((state) => state.auth.userData)

  return (
    <div
      className="w-screen min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{
        backgroundImage: `url(${bgChess})`,
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-60" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="bg-gray-900 bg-opacity-80 backdrop-filter backdrop-blur-xl border border-gray-200 p-8 lg:p-12 rounded-xl shadow-lg w-11/12 max-w-md lg:max-w-lg"
      >
       <h1 className="text-4xl sm:text-5xl font-extrabold mb-6 text-transparent bg-clip-text bg-green-400"> <Typing text={["Welcome to Chess Master"]} speed={100} eraseSpeed={50} typingDelay={200} eraseDelay={5000} /> </h1> 

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="text-center align-middle text-xl md:text-2xl lg:text-3xl text-gray-300 mb-8 leading-relaxed"
        >
          Experience the ultimate chess journey. Challenge friends, solve puzzles, and test your skills against the
          world's strongest chess engine.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="flex justify-center gap-6"
        >
          {authStatus === "true" && userData.username ? (
            <Link
              to="/modeselector"
              className="bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 px-4 rounded-full text-xl lg:text-2xl w-full max-w-md hover:from-green-600 hover:to-emerald-700 transition duration-300 shadow-lg hover:shadow-green-500/50 transform hover:scale-105"
            >
              Continue Your Journey
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="bg-gradient-to-r from-amber-500 to-yellow-600 text-white py-4 px-4 rounded-full text-xl lg:text-2xl w-full sm:w-auto hover:from-amber-600 hover:to-yellow-700 transition duration-300 shadow-lg hover:shadow-amber-500/50 transform hover:scale-105"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="bg-transparent border-2 border-amber-500 text-amber-500 py-4 px-8 rounded-full text-xl lg:text-2xl w-full sm:w-auto hover:bg-amber-500 hover:text-gray-100 transition duration-300 shadow-lg hover:shadow-amber-500/50 transform hover:scale-105"
              >
                Sign Up
              </Link>
            </>
          )}
        </motion.div>
      </motion.div>
    </div>
  )
}

export default Home

