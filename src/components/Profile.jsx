import { useEffect, useState } from "react"
import axios from "axios"
import { useSelector, useDispatch } from "react-redux"
import { login, logout } from "../store/authSlice"
import Cookies from "js-cookie"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import {
  Trophy,
  Target,
  Calendar,
  LogOut,
  User,
  Activity,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Shield,
} from "lucide-react"
import bg from "../assets/images/bgprofile.webp"
import { BASE_URL } from "../url"
import { toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import LoadingScreen from "./Loading"

function Profile() {
  const userData = useSelector((state) => state.auth.userData)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")
  const [expandedMatch, setExpandedMatch] = useState(null)
  const [stats, setStats] = useState({
    totalGames: 0,
    winRate: 0,
    rating: 0,
  })

  const refreshProfileData = () => {
    setIsLoading(true)
    axios
      .get(`${BASE_URL}/profile`, {
        withCredentials: true,
      })
      .then((res) => {
        const data = res.data
        dispatch(login(data))

        // Calculate stats
        if (data && data.matchHistory) {
          const totalGames = data.wins + data.loses + data.draws
          const winRate = totalGames > 0 ? Math.round((data.wins / totalGames) * 100) : 0
          const rating = calculateRating(data.wins, data.loses, data.draws)

          setStats({
            totalGames,
            winRate,
            rating,
          })
        }

        setIsLoading(false)
      })
      .catch((error) => {
        console.error("Error fetching profile:", error)
        setIsLoading(false)
        toast.error("Failed to load profile data")
      })
  }

  useEffect(() => {
    refreshProfileData()
  }, [dispatch])

  const calculateRating = (wins, loses, draws) => {
    const totalGames = wins + loses + draws
    if (totalGames === 0) return 800
    const baseRating = 800
    return Math.round(baseRating + (wins / totalGames) * 2200)
  }

  const handleLogout = () => {
    Cookies.remove("token", { path: "/" })
    dispatch(logout())
    toast.success("Logged out successfully")
    navigate("/login")
  }

  const toggleMatchDetails = (matchId) => {
    setExpandedMatch(expandedMatch === matchId ? null : matchId)
  }

  const filterMatchHistory = (matchHistory) => {
    if (!matchHistory) return []

    switch (activeTab) {
      case "wins":
        return matchHistory.filter((match) => match.status === "win")
      case "losses":
        return matchHistory.filter((match) => match.status === "lose")
      case "draws":
        return matchHistory.filter((match) => match.status === "draw")
      default:
        return matchHistory
    }
  }

  if (isLoading) {
    return (
      <div className="w-screen min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-300 border-t-green-500 rounded-full animate-spin mx-auto mb-4"></div>
          <LoadingScreen />
        </div>
      </div>
    )
  }

  return (
    <div className="w-screen min-h-screen bg-cover bg-no-repeat bg-center flex items-center justify-center">
      <img
        src={bg || "/placeholder.svg?height=1080&width=1920"}
        sizes="(max-width: 600px) 400px, 800px"
        loading="lazy"
        alt="Chess background"
        className="absolute inset-0 w-full h-full object-cover brightness-[0.4]"
      />

      <div className="w-11/12 lg:w-5/6 flex flex-col lg:flex-row space-y-6 lg:space-y-0 lg:space-x-6 py-12 z-10">
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="lg:w-1/3 bg-gray-900 bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-xl shadow-xl overflow-hidden"
        >
          <div className="p-6 bg-gradient-to-r from-blue-600 to-purple-600">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center text-4xl font-bold text-blue-600">
                {userData?.username?.charAt(0).toUpperCase() || <User size={32} />}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white capitalize">{userData?.username || "Player"}</h1>
                <p className="text-blue-100">{userData?.email}</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
              <Trophy className="mr-2" size={20} />
              Player Statistics
            </h2>

            {/* Rating Card */}
            <div className="bg-gray-800 rounded-lg p-4 mb-4">
              <div className="flex justify-between items-center mb-2">
                <p className="text-gray-300">Rating</p>
                <span className="px-2 py-1 bg-blue-500 bg-opacity-20 text-blue-300 rounded-md text-sm font-medium">
                  {stats.rating}
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2 mb-1">
                <div
                  className="bg-blue-500 h-2 rounded-full"
                  style={{ width: `${Math.min((stats.rating / 3000) * 100, 100)}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-400">
                <span>Beginner</span>
                <span>Advanced</span>
                <span>Master</span>
              </div>
            </div>

            {/* Win Rate */}
            <div className="bg-gray-800 rounded-lg p-4 mb-4">
              <div className="flex justify-between items-center mb-2">
                <p className="text-gray-300">Win Rate</p>
                <span className="px-2 py-1 bg-green-500 bg-opacity-20 text-green-300 rounded-md text-sm font-medium">
                  {stats.winRate}%
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: `${stats.winRate}%` }}></div>
              </div>
            </div>

            {/* Game Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-800 rounded-lg p-4 text-center">
                <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto mb-2">
                  <Trophy size={16} />
                </div>
                <p className="text-gray-400 text-sm mb-1">Wins</p>
                <p className="text-2xl font-bold text-white">{userData?.wins || 0}</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-4 text-center">
                <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-2">
                  <Activity size={16} />
                </div>
                <p className="text-gray-400 text-sm mb-1">Losses</p>
                <p className="text-2xl font-bold text-white">{userData?.loses || 0}</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-4 text-center">
                <div className="w-8 h-8 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center mx-auto mb-2">
                  <Target size={16} />
                </div>
                <p className="text-gray-400 text-sm mb-1">Draws</p>
                <p className="text-2xl font-bold text-white">{userData?.draws || 0}</p>
              </div>
            </div>

            {/* Total Games */}
            <div className="bg-gray-800 rounded-lg p-4 flex justify-between items-center mb-6">
              <div className="flex items-center space-x-2">
                <Shield className="text-blue-400" size={20} />
                <p className="text-white font-medium">Total Games</p>
              </div>
              <span className="px-3 py-1 bg-blue-500 bg-opacity-20 text-blue-300 rounded-md font-medium">
                {stats.totalGames}
              </span>
            </div>

            <button
              onClick={handleLogout}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-lg flex items-center justify-center transition-colors duration-300"
            >
              <LogOut className="mr-2" size={18} />
              Logout
            </button>
          </div>
        </motion.div>

        {/* Match History */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="lg:w-2/3 bg-gray-900 bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-xl shadow-xl overflow-hidden"
        >
          <div className="p-4 bg-gray-800 bg-opacity-70 flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-white flex items-center">
              <Calendar className="mr-2 text-blue-400" size={20} />
              Match History
            </h2>
            <button
              onClick={refreshProfileData}
              className="flex items-center space-x-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
            >
              <RefreshCw size={16} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-700">
            <button
              onClick={() => setActiveTab("all")}
              className={`flex-1 py-3 text-center font-medium ${
                activeTab === "all" ? "text-blue-400 border-b-2 border-blue-400" : "text-gray-400 hover:text-gray-200"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setActiveTab("wins")}
              className={`flex-1 py-3 text-center font-medium ${
                activeTab === "wins"
                  ? "text-green-400 border-b-2 border-green-400"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              Wins
            </button>
            <button
              onClick={() => setActiveTab("losses")}
              className={`flex-1 py-3 text-center font-medium ${
                activeTab === "losses" ? "text-red-400 border-b-2 border-red-400" : "text-gray-400 hover:text-gray-200"
              }`}
            >
              Losses
            </button>
            <button
              onClick={() => setActiveTab("draws")}
              className={`flex-1 py-3 text-center font-medium ${
                activeTab === "draws"
                  ? "text-yellow-400 border-b-2 border-yellow-400"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              Draws
            </button>
          </div>

          {/* Match History Content */}
          <div className="p-4">{renderMatchHistory(filterMatchHistory(userData?.matchHistory))}</div>
        </motion.div>
      </div>
    </div>
  )

  function renderMatchHistory(matchHistory) {
    if (!matchHistory || matchHistory.length === 0) {
      return (
        <div className="text-center py-12 px-4">
          <Trophy className="mx-auto mb-4 text-gray-400 opacity-50" size={48} />
          <p className="text-xl font-medium text-white mb-2">No matches found</p>
          <p className="text-gray-400">
            {activeTab === "all"
              ? "Play your first game to start building your history"
              : `You don't have any ${activeTab} yet`}
          </p>
        </div>
      )
    }

    // Sort match history by date (newest first)
    const sortedHistory = [...matchHistory].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

    return (
      <div className="space-y-3">
        {sortedHistory.map((match, index) => (
          <motion.div
            key={match._id || index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <div
              className={`
                rounded-lg p-3 cursor-pointer transition-all
                ${expandedMatch === match._id ? "bg-gray-800" : "bg-gray-800 bg-opacity-50 hover:bg-opacity-70"}
              `}
              onClick={() => toggleMatchDetails(match._id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div
                    className={`
                    w-10 h-10 rounded-full flex items-center justify-center
                    ${
                      match.status === "win"
                        ? "bg-green-900 bg-opacity-30 text-green-400"
                        : match.status === "lose"
                          ? "bg-red-900 bg-opacity-30 text-red-400"
                          : "bg-yellow-900 bg-opacity-30 text-yellow-400"
                    }
                  `}
                  >
                    {match.status === "win" ? (
                      <Trophy size={18} />
                    ) : match.status === "lose" ? (
                      <Activity size={18} />
                    ) : (
                      <Target size={18} />
                    )}
                  </div>
                  <div>
                    {/* Updated match result display */}
                    <p className="font-medium text-white">
                      {match.status === "win"
                        ? "You won against "
                        : match.status === "lose"
                          ? `${match.opponent} defeated you`
                          : `Draw with `}
                      {match.status !== "lose" && <span className="capitalize">{match.opponent}</span>}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(match.createdAt).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span
                    className={`
                      px-3 py-1 rounded-full text-sm font-medium
                      ${
                        match.status === "win"
                          ? "bg-green-900 bg-opacity-30 text-green-400"
                          : match.status === "lose"
                            ? "bg-red-900 bg-opacity-30 text-red-400"
                            : "bg-yellow-900 bg-opacity-30 text-yellow-400"
                      }
                    `}
                  >
                    {match.status === "win" ? "VICTORY" : match.status === "lose" ? "DEFEAT" : "DRAW"}
                  </span>
                  {expandedMatch === match._id ? (
                    <ChevronUp size={18} className="text-gray-400" />
                  ) : (
                    <ChevronDown size={18} className="text-gray-400" />
                  )}
                </div>
              </div>

              <AnimatePresence>
                {expandedMatch === match._id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-3 mt-3 border-t border-gray-700 grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <p className="text-xs text-gray-400">Match Time</p>
                        <p className="font-medium text-white">
                          {new Date(match.createdAt).toLocaleTimeString(undefined, {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-gray-400">Result Impact</p>
                        <p className="font-medium">
                          {match.status === "win" ? (
                            <span className="text-green-400">+25 Rating</span>
                          ) : match.status === "lose" ? (
                            <span className="text-red-400">-15 Rating</span>
                          ) : (
                            <span className="text-yellow-400">+0 Rating</span>
                          )}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        ))}
      </div>
    )
  }
}

export default Profile

