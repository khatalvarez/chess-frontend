import { useState, useEffect, lazy, Suspense } from "react"
import { Link } from "react-router-dom"
import { useSelector } from "react-redux"
import { motion } from "framer-motion"
import bgChessPlaceholder from "../assets/images/bgChess.webp"

const PieceArray = lazy(() => import("./PieceArray"))

function Home() {
  const authStatus = useSelector((state) => state.auth.status)
  const userData = useSelector((state) => state.auth.userData)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [bgImage, setBgImage] = useState(null)
  const [showPieceArray, setShowPieceArray] = useState(false)

  const fullText = "Welcome to Chess Master"
  const [typedText, setTypedText] = useState("")
  
  useEffect(() => {
    import("../assets/images/bgChess.webp").then((module) => {
      setBgImage(module.default)
      const img = new Image()
      img.src = module.default
      img.onload = () => setImageLoaded(true)
    })
  }, [])

  useEffect(() => {
    setTimeout(() => setShowPieceArray(true), 1200) 
  }, [])

  useEffect(() => {
    let index = 0;
    let currentText = ""; 
    const interval = setInterval(() => {
      if (index < fullText.length) {
        currentText += fullText[index]; 
        setTypedText(currentText); 
        index++;
      } else {
        clearInterval(interval);
      }
    }, 80);
    return () => clearInterval(interval);
  }, []);
  
  

  return (
    <div className="relative w-screen h-screen flex items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 w-full h-full bg-gray-900"
        style={{ aspectRatio: "16/9" }}
        aria-hidden="true"
      >
        {!imageLoaded && (
          <img
            src={bgChessPlaceholder}
            width="1920"
            height="1080"
            alt=""
            className="w-full h-full object-cover brightness-50 blur-sm"
          />
        )}
      </div>

      {bgImage && (
        <img
          src={bgImage}
          width="1920"
          height="1080"
          alt="Chess background"
          fetchpriority="high"
          className="absolute inset-0 w-full h-full object-cover brightness-50 -z-10"
        />
      )}

      <div className="relative z-10 w-11/12 max-w-4xl min-h-[400px]">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gray-900 rounded-3xl shadow-xl p-8 sm:p-12"
        >
          {showPieceArray && (
            <Suspense fallback={<div className="h-12 flex justify-center" />}>
              <PieceArray />
            </Suspense>
          )}

          <div className="h-20 mb-6 flex justify-center items-center">
            <h1 className="text-4xl sm:text-5xl text-center font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">
              {typedText}
              <motion.span
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="inline-block w-1 h-8 ml-1 bg-green-400"
              />
            </h1>
          </div>

          <div className="h-24 mb-10 flex items-center">
            <p className="text-center text-xl sm:text-2xl lg:text-3xl text-gray-300 leading-relaxed">
              Experience the ultimate chess journey. Challenge friends, solve puzzles, and test your skills against the world's strongest chess engine.
            </p>
          </div>

          <div className="flex sm:flex-row justify-center items-center gap-6">
            {authStatus === "true" && userData.username ? (
              <Link
                to="/modeselector"
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-full font-semibold hover:from-green-600 hover:to-blue-700 transition duration-300 transform hover:scale-105 shadow-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
              >
                Continue Your Journey
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="sm:w-auto px-4 py-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-full text-xl lg:text-2xl font-semibold hover:from-amber-600 hover:to-orange-700 transition duration-300 transform hover:scale-105 shadow-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-opacity-50"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="sm:w-auto px-4 py-4 bg-transparent border-2 border-amber-500 text-amber-500 rounded-full text-xl lg:text-2xl font-semibold hover:bg-amber-500 hover:text-gray-100 transition duration-300 transform hover:scale-105 shadow-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-opacity-50"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Home
