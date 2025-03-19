import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useNavigate } from "react-router-dom"
import {
  ChevronLeft,
  Brain,
  Target,
  Zap,
  Award,
  Clock,
  TrendingUp,
  CheckCircle,
  X,
  ArrowRight,
  BarChart2,
  BookOpen,
  Lightbulb,
} from "lucide-react"
import bg from "../assets/images/bgprofile.webp"

function Training() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("recommended")
  const [showPuzzleModal, setShowPuzzleModal] = useState(false)
  const [currentSkill, setCurrentSkill] = useState(null)

  // Mock user data - in a real app, this would come from your API
  const userData = {
    username: "ChessMaster",
    rating: 1250,
    puzzleRating: 1320,
    completedPuzzles: 87,
    streak: 5,
    weaknesses: ["Endgames", "Tactics", "Pawn Structures"],
    strengths: ["Openings", "Middle Game", "Knight Maneuvers"],
    recommendedSkills: [
      "Pin Tactics",
      "Fork Combinations",
      "Endgame Principles",
      "Defensive Techniques",
      "Pawn Breakthrough",
    ],
  }

  // Mock training data
  const trainingModules = {
    recommended: [
      {
        id: "pin-tactics",
        title: "Pin Tactics",
        description: "Learn to immobilize enemy pieces with strategic pins",
        difficulty: "Intermediate",
        exercises: 12,
        estimatedTime: "25 min",
        progress: 0,
        image: "📌",
        category: "tactics",
      },
      {
        id: "endgame-principles",
        title: "Endgame Principles",
        description: "Master the fundamental principles of successful endgames",
        difficulty: "Advanced",
        exercises: 15,
        estimatedTime: "30 min",
        progress: 0,
        image: "🏁",
        category: "endgame",
      },
      {
        id: "fork-combinations",
        title: "Fork Combinations",
        description: "Attack multiple pieces simultaneously with deadly forks",
        difficulty: "Intermediate",
        exercises: 10,
        estimatedTime: "20 min",
        progress: 0,
        image: "🍴",
        category: "tactics",
      },
    ],
    tactics: [
      {
        id: "pin-tactics",
        title: "Pin Tactics",
        description: "Learn to immobilize enemy pieces with strategic pins",
        difficulty: "Intermediate",
        exercises: 12,
        estimatedTime: "25 min",
        progress: 0,
        image: "📌",
        category: "tactics",
      },
      {
        id: "fork-combinations",
        title: "Fork Combinations",
        description: "Attack multiple pieces simultaneously with deadly forks",
        difficulty: "Intermediate",
        exercises: 10,
        estimatedTime: "20 min",
        progress: 0,
        image: "🍴",
        category: "tactics",
      },
      {
        id: "discovered-attacks",
        title: "Discovered Attacks",
        description: "Unleash powerful attacks by moving one piece to reveal another",
        difficulty: "Advanced",
        exercises: 8,
        estimatedTime: "18 min",
        progress: 0,
        image: "🔍",
        category: "tactics",
      },
      {
        id: "zwischenzug",
        title: "Zwischenzug",
        description: "Master the 'in-between move' to disrupt your opponent's plans",
        difficulty: "Expert",
        exercises: 7,
        estimatedTime: "15 min",
        progress: 0,
        image: "⏯️",
        category: "tactics",
      },
    ],
    endgame: [
      {
        id: "endgame-principles",
        title: "Endgame Principles",
        description: "Master the fundamental principles of successful endgames",
        difficulty: "Advanced",
        exercises: 15,
        estimatedTime: "30 min",
        progress: 0,
        image: "🏁",
        category: "endgame",
      },
      {
        id: "pawn-endgames",
        title: "Pawn Endgames",
        description: "Learn the critical concepts of pawn endgames and opposition",
        difficulty: "Intermediate",
        exercises: 12,
        estimatedTime: "25 min",
        progress: 0,
        image: "♟️",
        category: "endgame",
      },
      {
        id: "rook-endgames",
        title: "Rook Endgames",
        description: "Study common rook endgame positions and techniques",
        difficulty: "Advanced",
        exercises: 10,
        estimatedTime: "22 min",
        progress: 0,
        image: "♜",
        category: "endgame",
      },
    ],
    openings: [
      {
        id: "sicilian-defense",
        title: "Sicilian Defense",
        description: "Master the aggressive Sicilian Defense as Black",
        difficulty: "Advanced",
        exercises: 14,
        estimatedTime: "28 min",
        progress: 0,
        image: "🛡️",
        category: "openings",
      },
      {
        id: "queens-gambit",
        title: "Queen's Gambit",
        description: "Learn the strategic Queen's Gambit opening as White",
        difficulty: "Intermediate",
        exercises: 12,
        estimatedTime: "25 min",
        progress: 0,
        image: "👑",
        category: "openings",
      },
      {
        id: "kings-indian",
        title: "King's Indian Defense",
        description: "Study the hypermodern King's Indian Defense",
        difficulty: "Advanced",
        exercises: 15,
        estimatedTime: "30 min",
        progress: 0,
        image: "🏰",
        category: "openings",
      },
    ],
    completed: [
      {
        id: "double-attack",
        title: "Double Attack",
        description: "Attack two targets simultaneously to gain material",
        difficulty: "Beginner",
        exercises: 8,
        estimatedTime: "15 min",
        progress: 100,
        completedDate: "2023-03-10",
        image: "🎯",
        category: "tactics",
      },
      {
        id: "back-rank-mate",
        title: "Back Rank Mate",
        description: "Learn to execute and defend against back rank checkmates",
        difficulty: "Beginner",
        exercises: 10,
        estimatedTime: "20 min",
        progress: 100,
        completedDate: "2023-03-05",
        image: "⚔️",
        category: "tactics",
      },
    ],
  }

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1500)
    return () => clearTimeout(timer)
  }, [])

  const handleStartTraining = (skill) => {
    setCurrentSkill(skill)
    setShowPuzzleModal(true)
  }

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "Beginner":
        return "text-green-400"
      case "Intermediate":
        return "text-blue-400"
      case "Advanced":
        return "text-purple-400"
      case "Expert":
        return "text-red-400"
      default:
        return "text-gray-400"
    }
  }

  const getModulesByTab = () => {
    switch (activeTab) {
      case "recommended":
        return trainingModules.recommended
      case "tactics":
        return trainingModules.tactics
      case "endgame":
        return trainingModules.endgame
      case "openings":
        return trainingModules.openings
      case "completed":
        return trainingModules.completed
      default:
        return trainingModules.recommended
    }
  }

  if (isLoading) {
    return (
      <div className="w-screen min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-300 border-t-green-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl text-gray-300">Loading training modules...</p>
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
          <h1 className="text-2xl font-bold text-white">Personalized Training</h1>
          <div className="flex items-center">
            <div className="px-3 py-1 bg-blue-900 bg-opacity-50 rounded-full text-blue-300 flex items-center">
              <Target size={16} className="mr-1" />
              <span>Puzzle Rating: {userData.puzzleRating}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex-grow p-4 md:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-gray-900 bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-xl shadow-xl p-4 border border-gray-800"
            >
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-blue-900 bg-opacity-50 flex items-center justify-center mr-4">
                  <Brain className="text-blue-400" size={24} />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Puzzle Rating</p>
                  <p className="text-2xl font-bold text-white">{userData.puzzleRating}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="bg-gray-900 bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-xl shadow-xl p-4 border border-gray-800"
            >
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-green-900 bg-opacity-50 flex items-center justify-center mr-4">
                  <CheckCircle className="text-green-400" size={24} />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Completed Puzzles</p>
                  <p className="text-2xl font-bold text-white">{userData.completedPuzzles}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="bg-gray-900 bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-xl shadow-xl p-4 border border-gray-800"
            >
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-yellow-900 bg-opacity-50 flex items-center justify-center mr-4">
                  <Zap className="text-yellow-400" size={24} />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Current Streak</p>
                  <p className="text-2xl font-bold text-white">{userData.streak} days</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
              className="bg-gray-900 bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-xl shadow-xl p-4 border border-gray-800"
            >
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-purple-900 bg-opacity-50 flex items-center justify-center mr-4">
                  <TrendingUp className="text-purple-400" size={24} />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Progress</p>
                  <div className="flex items-center">
                    <div className="w-24 bg-gray-700 rounded-full h-2 mr-2">
                      <div
                        className="bg-purple-500 h-2 rounded-full"
                        style={{ width: `${(userData.completedPuzzles / 100) * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-white">{userData.completedPuzzles}%</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Skill Analysis */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-gray-900 bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-xl shadow-xl p-6 mb-8 border border-gray-800"
          >
            <h2 className="text-xl font-bold text-white mb-4 flex items-center">
              <BarChart2 className="mr-2 text-blue-400" size={20} />
              Skill Analysis
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-white mb-3 flex items-center">
                  <Target className="mr-2 text-red-400" size={18} />
                  Areas to Improve
                </h3>
                <ul className="space-y-2">
                  {userData.weaknesses.map((weakness, index) => (
                    <li key={index} className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-red-500 mr-2"></div>
                      <span className="text-gray-300">{weakness}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium text-white mb-3 flex items-center">
                  <Award className="mr-2 text-green-400" size={18} />
                  Your Strengths
                </h3>
                <ul className="space-y-2">
                  {userData.strengths.map((strength, index) => (
                    <li key={index} className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                      <span className="text-gray-300">{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>

          {/* Training Modules */}
          <div>
            {/* Tabs */}
            <div className="flex overflow-x-auto pb-2 mb-4 scrollbar-hide">
              <button
                onClick={() => setActiveTab("recommended")}
                className={`px-4 py-2 rounded-full whitespace-nowrap mr-2 ${
                  activeTab === "recommended" ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                }`}
              >
                Recommended
              </button>
              <button
                onClick={() => setActiveTab("tactics")}
                className={`px-4 py-2 rounded-full whitespace-nowrap mr-2 ${
                  activeTab === "tactics" ? "bg-purple-600 text-white" : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                }`}
              >
                Tactics
              </button>
              <button
                onClick={() => setActiveTab("endgame")}
                className={`px-4 py-2 rounded-full whitespace-nowrap mr-2 ${
                  activeTab === "endgame" ? "bg-green-600 text-white" : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                }`}
              >
                Endgame
              </button>
              <button
                onClick={() => setActiveTab("openings")}
                className={`px-4 py-2 rounded-full whitespace-nowrap mr-2 ${
                  activeTab === "openings" ? "bg-yellow-600 text-white" : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                }`}
              >
                Openings
              </button>
              <button
                onClick={() => setActiveTab("completed")}
                className={`px-4 py-2 rounded-full whitespace-nowrap ${
                  activeTab === "completed" ? "bg-gray-600 text-white" : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                }`}
              >
                Completed
              </button>
            </div>

            {/* Module Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getModulesByTab().map((module, index) => (
                <motion.div
                  key={module.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="bg-gray-900 bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-xl shadow-xl overflow-hidden border border-gray-800"
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="text-4xl mr-4">{module.image}</div>
                      <div>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor(module.difficulty)} bg-opacity-20 border border-current`}
                        >
                          {module.difficulty}
                        </span>
                      </div>
                    </div>

                    <h3 className="text-xl font-bold text-white mb-2">{module.title}</h3>
                    <p className="text-gray-400 mb-4">{module.description}</p>

                    <div className="flex justify-between text-sm text-gray-400 mb-4">
                      <div className="flex items-center">
                        <BookOpen size={14} className="mr-1" />
                        <span>{module.exercises} exercises</span>
                      </div>
                      <div className="flex items-center">
                        <Clock size={14} className="mr-1" />
                        <span>{module.estimatedTime}</span>
                      </div>
                    </div>

                    {module.progress > 0 && module.progress < 100 && (
                      <div className="mb-4">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-400">Progress</span>
                          <span className="text-blue-400">{module.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${module.progress}%` }}></div>
                        </div>
                      </div>
                    )}

                    {module.progress === 100 ? (
                      <div className="flex justify-between items-center">
                        <div className="flex items-center text-green-400">
                          <CheckCircle size={16} className="mr-1" />
                          <span>Completed</span>
                        </div>
                        <button
                          onClick={() => handleStartTraining(module)}
                          className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors"
                        >
                          Review
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleStartTraining(module)}
                        className="w-full py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg flex items-center justify-center transition-colors"
                      >
                        {module.progress > 0 ? "Continue" : "Start Training"}
                        <ArrowRight size={16} className="ml-1" />
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Training Modal */}
      <AnimatePresence>
        {showPuzzleModal && currentSkill && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backdropFilter: "blur(8px)" }}
          >
            <div className="absolute inset-0 bg-black opacity-70" onClick={() => setShowPuzzleModal(false)} />

            <motion.div
              initial={{ scale: 0.8, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.8, y: 20, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl p-6 max-w-4xl w-full mx-4 border border-gray-700 overflow-hidden"
            >
              <button
                onClick={() => setShowPuzzleModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors duration-200"
              >
                <X size={24} />
              </button>

              <div className="flex flex-col md:flex-row md:space-x-6">
                <div className="md:w-1/2 mb-6 md:mb-0">
                  <div className="aspect-square bg-gray-800 rounded-lg flex items-center justify-center">
                    <div className="text-center p-6">
                      <Lightbulb size={48} className="mx-auto mb-4 text-yellow-400 opacity-70" />
                      <p className="text-xl font-medium text-white mb-2">Chess Puzzle Visualization</p>
                      <p className="text-gray-400">
                        In the full implementation, this area would display an interactive chess puzzle.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="md:w-1/2">
                  <h3 className="text-2xl font-bold text-white mb-2">{currentSkill.title}</h3>
                  <p className="text-gray-300 mb-4">{currentSkill.description}</p>

                  <div className="bg-gray-800 rounded-lg p-4 mb-4">
                    <h4 className="text-lg font-medium text-white mb-2">Training Overview</h4>
                    <ul className="space-y-2">
                      <li className="flex justify-between">
                        <span className="text-gray-400">Difficulty:</span>
                        <span className={getDifficultyColor(currentSkill.difficulty)}>{currentSkill.difficulty}</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-gray-400">Exercises:</span>
                        <span className="text-white">{currentSkill.exercises}</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-gray-400">Estimated Time:</span>
                        <span className="text-white">{currentSkill.estimatedTime}</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-gray-400">Category:</span>
                        <span className="text-white capitalize">{currentSkill.category}</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-gray-800 rounded-lg p-4 mb-6">
                    <h4 className="text-lg font-medium text-white mb-2">What You'll Learn</h4>
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <CheckCircle size={16} className="text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-300">Recognize {currentSkill.title.toLowerCase()} patterns</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle size={16} className="text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-300">Apply techniques in various positions</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle size={16} className="text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-300">Improve your tactical vision</span>
                      </li>
                    </ul>
                  </div>

                  <button
                    onClick={() => setShowPuzzleModal(false)}
                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg flex items-center justify-center transition-colors"
                  >
                    Start Training
                    <ArrowRight size={18} className="ml-2" />
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Training

