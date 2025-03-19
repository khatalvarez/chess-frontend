import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useNavigate } from "react-router-dom"
import {
  ChevronLeft,
  BarChart2,
  Zap,
  Clock,
  Flag,
  Download,
  Share2,
  BookOpen,
  ArrowLeft,
  ArrowRight,
  Maximize2,
  RotateCcw,
  Info,
  X,
} from "lucide-react"
import bg from "../assets/images/bgprofile.webp"

function Analysis() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("moves")
  const [currentMove, setCurrentMove] = useState(0)
  const [showInfo, setShowInfo] = useState(false)

  // Mock game data - in a real app, this would come from your API
  const gameData = {
    id: "gm12345",
    white: "YourUsername",
    black: "Opponent123",
    date: "2023-03-15",
    result: "1-0",
    timeControl: "10+5",
    opening: "Sicilian Defense: Najdorf Variation",
    moves: [
      { san: "e4", evaluation: 0.2, time: 3 },
      { san: "c5", evaluation: 0.3, time: 5 },
      { san: "Nf3", evaluation: 0.1, time: 2 },
      { san: "d6", evaluation: 0.2, time: 4 },
      { san: "d4", evaluation: 0.3, time: 3 },
      { san: "cxd4", evaluation: 0.2, time: 2 },
      { san: "Nxd4", evaluation: 0.4, time: 1 },
      { san: "Nf6", evaluation: 0.3, time: 3 },
      { san: "Nc3", evaluation: 0.5, time: 4 },
      { san: "a6", evaluation: 0.4, time: 5 },
      { san: "Be3", evaluation: 0.6, time: 6 },
      { san: "e5", evaluation: 0.5, time: 7 },
      { san: "Nb3", evaluation: 0.7, time: 3 },
      { san: "Be7", evaluation: 0.6, time: 4 },
      { san: "f3", evaluation: 0.8, time: 5 },
      { san: "Be6", evaluation: 0.7, time: 6 },
      { san: "Qd2", evaluation: 0.9, time: 4 },
      { san: "O-O", evaluation: 0.8, time: 3 },
      { san: "O-O-O", evaluation: 1.1, time: 5 },
      { san: "Nbd7", evaluation: 1.0, time: 6 },
    ],
    accuracy: {
      white: 92,
      black: 87,
    },
  }

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1500)
    return () => clearTimeout(timer)
  }, [])

  const handlePreviousMove = () => {
    if (currentMove > 0) {
      setCurrentMove(currentMove - 1)
    }
  }

  const handleNextMove = () => {
    if (currentMove < gameData.moves.length - 1) {
      setCurrentMove(currentMove + 1)
    }
  }

  // Generate evaluation chart data
  const evaluationData = gameData.moves.map((move, index) => ({
    move: index + 1,
    evaluation: move.evaluation,
  }))

  // Calculate max evaluation for chart scaling
  const maxEval = Math.max(...evaluationData.map((d) => Math.abs(d.evaluation))) || 1

  if (isLoading) {
    return (
      <div className="w-screen min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl text-gray-300">Loading analysis...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-screen min-h-screen bg-cover bg-no-repeat bg-center flex flex-col">
      <img
        src={bg || "/placeholder.svg?height=1080&width=1920"}
        sizes="(max-width: 600px) 400px, 800px"
        loading="lazy"
        alt="Chess background"
        className="absolute inset-0 w-full h-full object-cover brightness-[0.3]"
      />

      {/* Header */}
      <div className="relative z-10 bg-gray-900 bg-opacity-80 backdrop-filter backdrop-blur-sm p-4 border-b border-gray-800">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-300 hover:text-white transition-colors"
          >
            <ChevronLeft className="mr-1" size={20} />
            <span>Back</span>
          </button>
          <h1 className="text-2xl font-bold text-white">Game Analysis</h1>
          <button
            onClick={() => setShowInfo(!showInfo)}
            className="flex items-center text-gray-300 hover:text-white transition-colors"
          >
            <Info className="mr-1" size={20} />
            <span className="hidden sm:inline">Game Info</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex-grow flex flex-col lg:flex-row">
        {/* Chess Board */}
        <div className="lg:w-2/3 p-4 flex flex-col">
          <div className="bg-gray-900 bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-xl shadow-xl overflow-hidden flex-grow">
            <div className="p-4 border-b border-gray-800 flex justify-between items-center">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-lg font-bold text-blue-600 mr-2">
                  {gameData.white.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-white font-medium">{gameData.white}</p>
                  <div className="flex items-center">
                    <span className="text-xs text-gray-400 mr-2">Accuracy:</span>
                    <span className="text-xs px-2 py-0.5 bg-green-500 bg-opacity-20 text-green-300 rounded">
                      {gameData.accuracy.white}%
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-white">{gameData.result}</p>
                <p className="text-xs text-gray-400">{gameData.timeControl}</p>
              </div>
              <div className="flex items-center">
                <div>
                  <p className="text-white font-medium text-right">{gameData.black}</p>
                  <div className="flex items-center justify-end">
                    <span className="text-xs text-gray-400 mr-2">Accuracy:</span>
                    <span className="text-xs px-2 py-0.5 bg-green-500 bg-opacity-20 text-green-300 rounded">
                      {gameData.accuracy.black}%
                    </span>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-lg font-bold text-gray-300 ml-2">
                  {gameData.black.charAt(0).toUpperCase()}
                </div>
              </div>
            </div>

            {/* Chess Board Placeholder */}
            <div className="aspect-square max-h-[600px] mx-auto p-4 relative">
              <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <BarChart2 size={48} className="mx-auto mb-4 text-blue-400 opacity-70" />
                  <p className="text-xl font-medium text-white mb-2">Chess Board Visualization</p>
                  <p className="text-gray-400 max-w-md mx-auto">
                    In the full implementation, this area would display the chess board with the current position.
                  </p>
                </div>
              </div>

              {/* Board Controls */}
              <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center space-x-4 bg-gray-800 bg-opacity-80 backdrop-filter backdrop-blur-sm rounded-full px-4 py-2">
                <button className="text-gray-400 hover:text-white transition-colors">
                  <RotateCcw size={18} />
                </button>
                <button
                  onClick={handlePreviousMove}
                  className="text-gray-400 hover:text-white transition-colors"
                  disabled={currentMove === 0}
                >
                  <ArrowLeft size={20} />
                </button>
                <div className="px-2 py-1 bg-blue-900 bg-opacity-50 rounded-md text-white font-medium">
                  Move {Math.floor(currentMove / 2) + 1}
                  {currentMove % 2 === 0 ? ". " : "... "}
                  {gameData.moves[currentMove]?.san || ""}
                </div>
                <button
                  onClick={handleNextMove}
                  className="text-gray-400 hover:text-white transition-colors"
                  disabled={currentMove === gameData.moves.length - 1}
                >
                  <ArrowRight size={20} />
                </button>
                <button className="text-gray-400 hover:text-white transition-colors">
                  <Maximize2 size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* Evaluation Chart */}
          <div className="mt-4 bg-gray-900 bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-xl shadow-xl overflow-hidden">
            <div className="p-3 border-b border-gray-800">
              <h3 className="text-lg font-medium text-white">Evaluation Chart</h3>
            </div>
            <div className="p-4 h-40">
              <div className="w-full h-full relative">
                {/* Zero line */}
                <div className="absolute left-0 right-0 top-1/2 h-px bg-gray-600"></div>

                {/* Evaluation lines */}
                {evaluationData.map((data, index) => {
                  const nextData = evaluationData[index + 1]
                  if (!nextData) return null

                  const x1 = `${(index / (evaluationData.length - 1)) * 100}%`
                  const x2 = `${((index + 1) / (evaluationData.length - 1)) * 100}%`
                  const y1 = `${50 - (data.evaluation / maxEval) * 40}%`
                  const y2 = `${50 - (nextData.evaluation / maxEval) * 40}%`

                  const isWhiteMove = index % 2 === 0

                  return (
                    <svg key={index} className="absolute inset-0 w-full h-full overflow-visible">
                      <line
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        stroke={isWhiteMove ? "#93c5fd" : "#f9a8d4"}
                        strokeWidth="2"
                      />
                    </svg>
                  )
                })}

                {/* Current move indicator */}
                <div
                  className="absolute w-0.5 h-full bg-yellow-500 opacity-70"
                  style={{ left: `${(currentMove / (evaluationData.length - 1)) * 100}%` }}
                ></div>

                {/* Evaluation points */}
                {evaluationData.map((data, index) => {
                  const isWhiteMove = index % 2 === 0
                  const isCurrent = index === currentMove

                  return (
                    <div
                      key={index}
                      className={`absolute w-2 h-2 rounded-full transform -translate-x-1 -translate-y-1 ${
                        isCurrent ? "w-3 h-3 border-2 border-yellow-400" : ""
                      } ${isWhiteMove ? "bg-blue-400" : "bg-pink-400"}`}
                      style={{
                        left: `${(index / (evaluationData.length - 1)) * 100}%`,
                        top: `${50 - (data.evaluation / maxEval) * 40}%`,
                      }}
                    ></div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Analysis Panel */}
        <div className="lg:w-1/3 p-4">
          <div className="bg-gray-900 bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-xl shadow-xl overflow-hidden h-full">
            {/* Tabs */}
            <div className="flex border-b border-gray-800">
              <button
                onClick={() => setActiveTab("moves")}
                className={`flex-1 py-3 text-center font-medium ${
                  activeTab === "moves"
                    ? "text-blue-400 border-b-2 border-blue-400"
                    : "text-gray-400 hover:text-gray-200"
                }`}
              >
                Moves
              </button>
              <button
                onClick={() => setActiveTab("analysis")}
                className={`flex-1 py-3 text-center font-medium ${
                  activeTab === "analysis"
                    ? "text-purple-400 border-b-2 border-purple-400"
                    : "text-gray-400 hover:text-gray-200"
                }`}
              >
                Analysis
              </button>
              <button
                onClick={() => setActiveTab("mistakes")}
                className={`flex-1 py-3 text-center font-medium ${
                  activeTab === "mistakes"
                    ? "text-red-400 border-b-2 border-red-400"
                    : "text-gray-400 hover:text-gray-200"
                }`}
              >
                Mistakes
              </button>
            </div>

            {/* Tab Content */}
            <div className="p-4 overflow-y-auto" style={{ maxHeight: "calc(100vh - 220px)" }}>
              {activeTab === "moves" && (
                <div className="space-y-2">
                  {Array.from({ length: Math.ceil(gameData.moves.length / 2) }).map((_, i) => {
                    const whiteIndex = i * 2
                    const blackIndex = i * 2 + 1
                    const whiteMove = gameData.moves[whiteIndex]
                    const blackMove = gameData.moves[blackIndex]

                    return (
                      <div key={i} className="flex">
                        <div className="w-10 text-gray-500 font-mono">{i + 1}.</div>
                        <div
                          className={`flex-1 px-2 py-1 rounded ${currentMove === whiteIndex ? "bg-blue-900 bg-opacity-30" : ""}`}
                          onClick={() => setCurrentMove(whiteIndex)}
                        >
                          <span className="font-medium text-white">{whiteMove?.san}</span>
                          <span className="ml-2 text-xs text-gray-400">{whiteMove?.time}s</span>
                        </div>
                        {blackMove && (
                          <div
                            className={`flex-1 px-2 py-1 rounded ${currentMove === blackIndex ? "bg-blue-900 bg-opacity-30" : ""}`}
                            onClick={() => setCurrentMove(blackIndex)}
                          >
                            <span className="font-medium text-white">{blackMove.san}</span>
                            <span className="ml-2 text-xs text-gray-400">{blackMove.time}s</span>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}

              {activeTab === "analysis" && (
                <div className="space-y-4">
                  <div className="bg-gray-800 rounded-lg p-3">
                    <h4 className="text-lg font-medium text-white mb-2 flex items-center">
                      <BookOpen size={18} className="mr-2 text-purple-400" />
                      Opening
                    </h4>
                    <p className="text-gray-300">{gameData.opening}</p>
                  </div>

                  <div className="bg-gray-800 rounded-lg p-3">
                    <h4 className="text-lg font-medium text-white mb-2 flex items-center">
                      <Zap size={18} className="mr-2 text-yellow-400" />
                      Key Moments
                    </h4>
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <span className="w-10 text-gray-500 font-mono">10.</span>
                        <div>
                          <p className="text-white">Knight to better square</p>
                          <p className="text-sm text-gray-400">Improved piece activity</p>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <span className="w-10 text-gray-500 font-mono">15.</span>
                        <div>
                          <p className="text-white">Pawn structure change</p>
                          <p className="text-sm text-gray-400">Created weakness on e6</p>
                        </div>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-gray-800 rounded-lg p-3">
                    <h4 className="text-lg font-medium text-white mb-2 flex items-center">
                      <Clock size={18} className="mr-2 text-blue-400" />
                      Time Usage
                    </h4>
                    <div className="space-y-2">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-white">{gameData.white}</span>
                          <span className="text-gray-400">Avg: 3.8s per move</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div className="bg-blue-500 h-2 rounded-full" style={{ width: "65%" }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-white">{gameData.black}</span>
                          <span className="text-gray-400">Avg: 4.5s per move</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div className="bg-pink-500 h-2 rounded-full" style={{ width: "78%" }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "mistakes" && (
                <div className="space-y-4">
                  <div className="bg-gray-800 rounded-lg p-3">
                    <h4 className="text-lg font-medium text-white mb-2 flex items-center">
                      <Flag size={18} className="mr-2 text-red-400" />
                      Critical Mistakes
                    </h4>
                    <div className="space-y-3">
                      <div className="border-l-2 border-red-500 pl-3">
                        <div className="flex justify-between">
                          <span className="text-white font-medium">Move 12</span>
                          <span className="text-red-400">-1.2</span>
                        </div>
                        <p className="text-sm text-gray-300">e5 weakened the d5 square</p>
                        <p className="text-xs text-gray-400 mt-1">Better was Nc6 developing with tempo</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-800 rounded-lg p-3">
                    <h4 className="text-lg font-medium text-white mb-2 flex items-center">
                      <Flag size={18} className="mr-2 text-yellow-400" />
                      Inaccuracies
                    </h4>
                    <div className="space-y-3">
                      <div className="border-l-2 border-yellow-500 pl-3">
                        <div className="flex justify-between">
                          <span className="text-white font-medium">Move 7</span>
                          <span className="text-yellow-400">-0.4</span>
                        </div>
                        <p className="text-sm text-gray-300">Nxd4 was slightly inaccurate</p>
                        <p className="text-xs text-gray-400 mt-1">c4 would maintain more tension</p>
                      </div>
                      <div className="border-l-2 border-yellow-500 pl-3">
                        <div className="flex justify-between">
                          <span className="text-white font-medium">Move 16</span>
                          <span className="text-yellow-400">-0.3</span>
                        </div>
                        <p className="text-sm text-gray-300">Be6 allowed tactical opportunity</p>
                        <p className="text-xs text-gray-400 mt-1">Nc6 would connect the rooks</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-800 rounded-lg p-3">
                    <h4 className="text-lg font-medium text-white mb-2 flex items-center">
                      <Flag size={18} className="mr-2 text-green-400" />
                      Excellent Moves
                    </h4>
                    <div className="space-y-3">
                      <div className="border-l-2 border-green-500 pl-3">
                        <div className="flex justify-between">
                          <span className="text-white font-medium">Move 19</span>
                          <span className="text-green-400">+0.5</span>
                        </div>
                        <p className="text-sm text-gray-300">O-O-O was an excellent decision</p>
                        <p className="text-xs text-gray-400 mt-1">Activated the rook and secured the king</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="p-4 border-t border-gray-800 flex justify-between">
              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center transition-colors">
                <Download size={16} className="mr-2" />
                <span>Export PGN</span>
              </button>
              <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center transition-colors">
                <Share2 size={16} className="mr-2" />
                <span>Share Analysis</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Game Info Modal */}
      <AnimatePresence>
        {showInfo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backdropFilter: "blur(8px)" }}
          >
            <div className="absolute inset-0 bg-black opacity-70" onClick={() => setShowInfo(false)} />

            <motion.div
              initial={{ scale: 0.8, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.8, y: 20, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4 border border-gray-700"
            >
              <button
                onClick={() => setShowInfo(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors duration-200"
              >
                <X size={24} />
              </button>

              <h3 className="text-2xl font-bold text-white mb-4">Game Information</h3>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-400">Players</p>
                  <div className="flex justify-between mt-1">
                    <p className="text-white">White: {gameData.white}</p>
                    <p className="text-white">Black: {gameData.black}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-400">Date & Result</p>
                  <div className="flex justify-between mt-1">
                    <p className="text-white">{new Date(gameData.date).toLocaleDateString()}</p>
                    <p className="text-white font-medium">{gameData.result}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-400">Time Control</p>
                  <p className="text-white mt-1">{gameData.timeControl}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-400">Opening</p>
                  <p className="text-white mt-1">{gameData.opening}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-400">Accuracy</p>
                  <div className="flex justify-between mt-1">
                    <div>
                      <span className="text-white">White: </span>
                      <span className="px-2 py-0.5 bg-green-500 bg-opacity-20 text-green-300 rounded">
                        {gameData.accuracy.white}%
                      </span>
                    </div>
                    <div>
                      <span className="text-white">Black: </span>
                      <span className="px-2 py-0.5 bg-green-500 bg-opacity-20 text-green-300 rounded">
                        {gameData.accuracy.black}%
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-400">Total Moves</p>
                  <p className="text-white mt-1">{gameData.moves.length}</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Analysis

