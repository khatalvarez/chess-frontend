"use client"

import { useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import confetti from "canvas-confetti"
import { Trophy, X, RotateCcw, Home, Sparkles, ChevronRight, Clock, Award, Shield, Sword } from "lucide-react"
import { Link } from "react-router-dom"

const GameOverModal = ({
  isOpen,
  message,
  onRestart,
  onPlayAgain,
  playAgainRequested,
  playAgainCountdown,
  opponentPlayAgainRequested,
  onAcceptPlayAgain,
  onDeclinePlayAgain,
}) => {
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
          className="fixed inset-0 z-50 flex items-center justify-center p-4 font-mono"
          style={{ backdropFilter: "blur(8px)" }}
        >
          {/* Chess board background with perspective - copied from About page */}
          <div className="absolute inset-0 z-0 perspective-1000">
            <div 
              className="absolute inset-0 transform-style-3d rotate-x-60 scale-150"
              style={{
                backgroundImage: `linear-gradient(to right, transparent 0%, transparent 12.5%, #222 12.5%, #222 25%, 
                                transparent 25%, transparent 37.5%, #222 37.5%, #222 50%,
                                transparent 50%, transparent 62.5%, #222 62.5%, #222 75%,
                                transparent 75%, transparent 87.5%, #222 87.5%, #222 100%)`,
                backgroundSize: '200px 100px',
                opacity: 0.15
              }}
            ></div>
          </div>

          <div className="absolute inset-0 bg-black opacity-70" onClick={onRestart} />

          <motion.div
            initial={{ scale: 0.8, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.8, y: 20, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative max-w-md w-full mx-4 game-panel bg-gray-900 border-2 border-blue-700 rounded-lg shadow-lg overflow-hidden"
          >
            {/* Game Panel Header - similar to About page panels */}
            <div className="bg-blue-800 py-3 px-4 border-b-2 border-yellow-500 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-yellow-400 uppercase pixelated">
                Game Over
              </h2>
              <button
                onClick={onRestart}
                className="text-gray-300 hover:text-white transition-colors duration-200"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6">
              <div className="flex flex-col items-center text-center">
                {/* Trophy icon with border styling like About page */}
                <div className="relative mb-6">
                  <div
                    className={`w-24 h-24 rounded-full border-4 ${
                      message.toLowerCase().includes("win")
                        ? "border-yellow-500 bg-blue-900"
                        : message.toLowerCase().includes("draw")
                          ? "border-blue-600 bg-blue-900"
                          : "border-red-500 bg-blue-900"
                    } p-2 flex items-center justify-center`}
                  >
                    {message.toLowerCase().includes("win") ? (
                      <Trophy className="w-12 h-12 text-yellow-400" />
                    ) : message.toLowerCase().includes("draw") ? (
                      <motion.div
                        animate={{ rotate: [0, 360] }}
                        transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                      >
                        <Shield className="w-12 h-12 text-blue-300" />
                      </motion.div>
                    ) : (
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
                      >
                        <Sword className="w-12 h-12 text-red-400" />
                      </motion.div>
                    )}
                  </div>
                </div>

                <h2
                  className={`text-3xl font-bold mb-4 uppercase tracking-wider pixelated ${
                    message.toLowerCase().includes("win")
                      ? "text-yellow-400"
                      : message.toLowerCase().includes("draw")
                        ? "text-blue-300"
                        : "text-red-400"
                  }`}
                >
                  {message}
                </h2>

                <div className="bg-gray-800 border-2 border-blue-600 p-4 mb-6 w-full">
                  <p className="text-blue-100">
                    {message.toLowerCase().includes("win")
                      ? "Congratulations on your victory! Your strategy and skill have paid off."
                      : message.toLowerCase().includes("draw")
                        ? "A balanced match! Both players showed great skill and determination."
                        : "Don't worry, every loss is a learning opportunity. Try again!"}
                  </p>
                </div>

                {/* Multiplayer Play Again Section */}
                {opponentPlayAgainRequested ? (
                  <div className="w-full mb-6">
                    <div className="bg-gray-800 border-2 border-yellow-600 p-4">
                      <h3 className="text-xl font-bold text-yellow-400 uppercase mb-2">Rematch Request</h3>
                      <p className="text-blue-100 mb-4">Your opponent wants to play again! Would you like to accept their challenge?</p>

                      <div className="flex gap-3">
                        <button
                          onClick={onAcceptPlayAgain}
                          className="flex-1 py-2 px-4 bg-blue-700 hover:bg-blue-600 border-2 border-yellow-500 rounded-lg text-yellow-400 font-bold flex items-center justify-center group"
                        >
                          <span>Accept</span>
                          <ChevronRight className="ml-1 h-4 w-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
                        </button>

                        <button
                          onClick={onDeclinePlayAgain}
                          className="flex-1 py-2 px-4 bg-red-700 hover:bg-red-600 border-2 border-red-500 rounded-lg text-white font-bold flex items-center justify-center group"
                        >
                          <span>Decline</span>
                          <X className="ml-1 h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ) : playAgainRequested ? (
                  <div className="w-full mb-6">
                    <div className="bg-gray-800 border-2 border-blue-600 p-4">
                      <h3 className="text-xl font-bold text-blue-300 uppercase mb-2">Waiting for Response</h3>
                      <div className="flex items-center justify-center gap-2">
                        <Clock className="text-blue-400 animate-pulse" size={18} />
                        <p className="text-blue-100">
                          Request expires in <span className="text-yellow-400 font-bold">{playAgainCountdown}</span>{" "}
                          seconds
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                    <button
                      onClick={onPlayAgain}
                      className="py-3 px-4 bg-blue-800 hover:bg-blue-700 border-2 border-yellow-500 rounded-lg text-yellow-400 font-bold flex items-center justify-center"
                    >
                      <RotateCcw className="mr-2" size={18} />
                      <span>Play Again</span>
                    </button>

                    <Link to="/modeselector" className="w-full">
                      <button
                        className="w-full py-3 px-4 bg-gray-800 hover:bg-gray-700 border-2 border-blue-600 rounded-lg text-blue-100 font-bold flex items-center justify-center"
                      >
                        <Home className="mr-2" size={18} />
                        <span>Game Modes</span>
                      </button>
                    </Link>
                  </div>
                )}

                {/* Chess pieces decoration - like About page */}
                <div className="flex justify-center mt-8 space-x-4">
                  <div className="text-4xl text-white">♟</div>
                  <div className="text-4xl text-white">♞</div>
                  <div className="text-4xl text-white">♝</div>
                  <div className="text-4xl text-white">♜</div>
                  <div className="text-4xl text-white">♛</div>
                  <div className="text-4xl text-white">♚</div>
                </div>

                {/* Status message at bottom */}
                <p className="text-blue-300 text-sm mt-6">Your game results have been recorded in your profile.</p>
              </div>
            </div>
          </motion.div>

          {/* Game UI CSS - copied from About page */}
          <style jsx global>{`
            .game-panel {
              position: relative;
              box-shadow: 0 0 0 2px rgba(30, 64, 175, 0.5), 0 0 15px rgba(0, 0, 0, 0.5);
            }
            
            .perspective-1000 {
              perspective: 1000px;
            }
            
            .transform-style-3d {
              transform-style: preserve-3d;
            }
            
            .rotate-x-60 {
              transform: rotateX(60deg);
            }
            
            .pixelated {
              letter-spacing: 2px;
              text-shadow: 
                2px 2px 0 rgba(0,0,0,0.5),
                4px 4px 0 rgba(0,0,0,0.25);
            }

            /* Button press effect */
            button:active:not(:disabled) {
              transform: translateY(2px);
            }
          `}</style>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default GameOverModal