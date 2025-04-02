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

  const refreshProfileData = async () => {
    setIsLoading(true)
    try {
      console.log("Refreshing profile data...")
      const res = await axios.get(`${BASE_URL}/profile`, {
        withCredentials: true,
      })

      const data = res.data
      console.log("Profile data received:", data)
      dispatch(login(data))

      // Calculate stats
      if (data && data.matchHistory) {
        const totalGames = data.wins + data.loses + data.draws
        const winRate = totalGames > 0 ? Math.round((data.wins / totalGames) * 100) : 0

        setStats({
          totalGames,
          winRate,
          rating: calculateRating(data.wins, data.loses, data.draws),
        })
      }

      setIsLoading(false)
    } catch (error) {
      console.error("Error fetching profile:", error)
      setIsLoading(false)
      toast.error("Failed to load profile data")
    }
  }

  useEffect(() => {
    refreshProfileData()
  }, [])

  // Add this after the existing useEffect
  useEffect(() => {
    // Create a function to handle when the window gets focus
    const handleFocus = () => {
      console.log("Window focused, refreshing data...")
      refreshProfileData()
    }

    // Add event listener for when the window gets focus
    window.addEventListener("focus", handleFocus)

    // Clean up the event listener when component unmounts
    return () => {
      window.removeEventListener("focus", handleFocus)
    }
  }, [])

  // Add this after the existing useEffect hooks
  useEffect(() => {
    // Set up polling interval to refresh data
    const intervalId = setInterval(() => {
      console.log("Polling for profile updates...")
      refreshProfileData()
    }, 30000) // Check every 30 seconds

    // Clean up interval on component unmount
    return () => clearInterval(intervalId)
  }, [])

  // Add this style tag to your component
  useEffect(() => {
    // Define a slow spin animation
    const spinSlowKeyframes = `
      @keyframes spin-slow {
        from {
          transform: rotate(0deg);
        }
        to {
          transform: rotate(360deg);
        }
      }
    `
    // Add the custom animation style to the document
    const styleElement = document.createElement("style")
    styleElement.innerHTML = `
      ${spinSlowKeyframes}
      .animate-spin-slow {
        animation: spin-slow 3s linear infinite;
        animation-play-state: paused;
      }
      .animate-spin-slow:hover {
        animation-play-state: running;
      }
    `
    document.head.appendChild(styleElement)

    return () => {
      document.head.removeChild(styleElement)
    }
  }, [])

  const calculateRating = (wins, loses, draws) => {
    const totalGames = wins + loses + draws
    if (totalGames === 0) return 800
    const baseRating = 800
    return Math.round(baseRating + (wins / totalGames) * 2200)
  }

  const handleLogout = async () => {
    try {
      // Call the backend logout endpoint
      await axios.post(
        `${BASE_URL}/user/logout`,
        {},
        {
          withCredentials: true,
        },
      )

      // Then remove the cookie and update Redux state
      Cookies.remove("token", { path: "/" })
      dispatch(logout())
      toast.success("Logged out successfully")
      navigate("/login")
    } catch (error) {
      console.error("Error during logout:", error)
      toast.error("Logout failed. Please try again.")

      // As a fallback, still try to remove the cookie and update Redux state
      Cookies.remove("token", { path: "/" })
      dispatch(logout())
      navigate("/login")
    }
  }

  const toggleMatchDetails = (matchId) => {
    setExpandedMatch(expandedMatch === matchId ? null : matchId)
  }

  const filterMatchHistory = () => {
    if (!userData?.matchHistory) return []

    switch (activeTab) {
      case "wins":
        return userData.matchHistory.filter((match) => match.status === "win")
      case "losses":
        return userData.matchHistory.filter((match) => match.status === "lose")
      case "draws":
        return userData.matchHistory.filter((match) => match.status === "draw")
      default:
        return userData.matchHistory
    }
  }

  if (isLoading) {
    return <LoadingSpinner />
  }

  return (
    <div className="w-screen min-h-screen bg-cover bg-no-repeat bg-center flex items-center justify-center">
      <BackgroundImage src={bg} />

      <div className="w-11/12 lg:w-5/6 flex flex-col lg:flex-row space-y-6 lg:space-y-0 lg:space-x-6 py-32 z-10">
        <ProfileCard userData={userData} stats={stats} handleLogout={handleLogout} />
        <MatchHistoryCard
          userData={userData}
          refreshProfileData={refreshProfileData}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          expandedMatch={expandedMatch}
          toggleMatchDetails={toggleMatchDetails}
          filteredMatches={filterMatchHistory()}
        />
      </div>
    </div>
  )
}

// Component for loading spinner
const LoadingSpinner = () => (
  <div className="w-screen min-h-screen bg-gray-900 flex items-center justify-center">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-gray-300 border-t-green-500 rounded-full animate-spin mx-auto mb-4"></div>
      <LoadingScreen />
    </div>
  </div>
)

// Component for background image
const BackgroundImage = ({ src }) => (
  <img
    src={src || "/placeholder.svg?height=1080&width=1920"}
    sizes="(max-width: 600px) 400px, 800px"
    loading="lazy"
    alt="Chess background"
    className="absolute inset-0 w-full h-full object-cover brightness-[0.4]"
  />
)

// Component for profile card
const ProfileCard = ({ userData, stats, handleLogout }) => (
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

      <StatCard
        label="Rating"
        value={stats.rating}
        colorClass="bg-blue-500"
        textClass="text-blue-300"
        percentage={Math.min((stats.rating / 3000) * 100, 100)}
        showLegend
      />

      <StatCard
        label="Win Rate"
        value={`${stats.winRate}%`}
        colorClass="bg-green-500"
        textClass="text-green-300"
        percentage={stats.winRate}
      />

      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatBox
          icon={<Trophy size={16} />}
          label="Wins"
          value={userData?.wins || 0}
          bgColor="bg-green-100"
          textColor="text-green-600"
        />
        <StatBox
          icon={<Activity size={16} />}
          label="Losses"
          value={userData?.loses || 0}
          bgColor="bg-red-100"
          textColor="text-red-600"
        />
        <StatBox
          icon={<Target size={16} />}
          label="Draws"
          value={userData?.draws || 0}
          bgColor="bg-yellow-100"
          textColor="text-yellow-600"
        />
      </div>

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
)

// Component for stat card with progress bar
const StatCard = ({ label, value, colorClass, textClass, percentage, showLegend }) => (
  <div className="bg-gray-800 rounded-lg p-4 mb-4">
    <div className="flex justify-between items-center mb-2">
      <p className="text-gray-300">{label}</p>
      <span className={`px-2 py-1 ${colorClass} bg-opacity-20 ${textClass} rounded-md text-sm font-medium`}>
        {value}
      </span>
    </div>
    <div className="w-full bg-gray-700 rounded-full h-2 mb-1">
      <div className={`${colorClass} h-2 rounded-full`} style={{ width: `${percentage}%` }}></div>
    </div>
    {showLegend && (
      <div className="flex justify-between text-xs text-gray-400">
        <span>Beginner</span>
        <span>Advanced</span>
        <span>Master</span>
      </div>
    )}
  </div>
)

// Component for stat box
const StatBox = ({ icon, label, value, bgColor, textColor }) => (
  <div className="bg-gray-800 rounded-lg p-4 text-center">
    <div className={`w-8 h-8 rounded-full ${bgColor} ${textColor} flex items-center justify-center mx-auto mb-2`}>
      {icon}
    </div>
    <p className="text-gray-400 text-sm mb-1">{label}</p>
    <p className="text-2xl font-bold text-white">{value}</p>
  </div>
)

// Component for match history card
const MatchHistoryCard = ({
  userData,
  refreshProfileData,
  activeTab,
  setActiveTab,
  expandedMatch,
  toggleMatchDetails,
  filteredMatches,
}) => (
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
        className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors font-medium"
      >
        <RefreshCw size={16} className="animate-spin-slow" />
        <span className="hidden sm:inline">Refresh</span>
      </button>
    </div>

    <MatchHistoryTabs activeTab={activeTab} setActiveTab={setActiveTab} />
    <div className="p-4">
      <MatchHistoryContent
        matches={filteredMatches}
        activeTab={activeTab}
        expandedMatch={expandedMatch}
        toggleMatchDetails={toggleMatchDetails}
      />
    </div>
  </motion.div>
)

// Component for match history tabs
const MatchHistoryTabs = ({ activeTab, setActiveTab }) => (
  <div className="flex border-b border-gray-700">
    <TabButton
      label="All"
      isActive={activeTab === "all"}
      onClick={() => setActiveTab("all")}
      colorClass="text-blue-400 border-blue-400"
    />
    <TabButton
      label="Wins"
      isActive={activeTab === "wins"}
      onClick={() => setActiveTab("wins")}
      colorClass="text-green-400 border-green-400"
    />
    <TabButton
      label="Losses"
      isActive={activeTab === "losses"}
      onClick={() => setActiveTab("losses")}
      colorClass="text-red-400 border-red-400"
    />
    <TabButton
      label="Draws"
      isActive={activeTab === "draws"}
      onClick={() => setActiveTab("draws")}
      colorClass="text-yellow-400 border-yellow-400"
    />
  </div>
)

// Component for tab button
const TabButton = ({ label, isActive, onClick, colorClass }) => (
  <button
    onClick={onClick}
    className={`flex-1 py-3 text-center font-medium ${
      isActive ? `${colorClass} border-b-2` : "text-gray-400 hover:text-gray-200"
    }`}
  >
    {label}
  </button>
)

// Component for match history content
const MatchHistoryContent = ({ matches, activeTab, expandedMatch, toggleMatchDetails }) => {
  if (!matches || matches.length === 0) {
    return <EmptyMatchHistory activeTab={activeTab} />
  }

  // Sort match history by date (newest first)
  const sortedMatches = [...matches].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  return (
    <div className="space-y-3">
      {sortedMatches.map((match, index) => (
        <MatchItem
          key={match._id || index}
          match={match}
          index={index}
          isExpanded={expandedMatch === match._id}
          toggleDetails={() => toggleMatchDetails(match._id)}
        />
      ))}
    </div>
  )
}

// Component for empty match history state
const EmptyMatchHistory = ({ activeTab }) => (
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

// Component for match item
const MatchItem = ({ match, index, isExpanded, toggleDetails }) => {
  const statusConfig = {
    win: {
      icon: <Trophy size={18} />,
      bgColor: "bg-green-900",
      textColor: "text-green-400",
      label: "VICTORY",
      result: `You won against ${match.opponent}`,
      ratingChange: "+25 Rating",
      ratingColor: "text-green-400",
    },
    lose: {
      icon: <Activity size={18} />,
      bgColor: "bg-red-900",
      textColor: "text-red-400",
      label: "DEFEAT",
      result: `${match.opponent} defeated you`,
      ratingChange: "-15 Rating",
      ratingColor: "text-red-400",
    },
    draw: {
      icon: <Target size={18} />,
      bgColor: "bg-yellow-900",
      textColor: "text-yellow-400",
      label: "DRAW",
      result: `Draw with ${match.opponent}`,
      ratingChange: "+0 Rating",
      ratingColor: "text-yellow-400",
    },
  }

  const config = statusConfig[match.status]

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <div
        className={`rounded-lg p-3 cursor-pointer transition-all ${
          isExpanded ? "bg-gray-800" : "bg-gray-800 bg-opacity-50 hover:bg-opacity-70"
        }`}
        onClick={toggleDetails}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center ${config.bgColor} bg-opacity-30 ${config.textColor}`}
            >
              {config.icon}
            </div>
            <div>
              <p className="font-medium text-white">{config.result}</p>
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
              className={`px-3 py-1 rounded-full text-sm font-medium ${config.bgColor} bg-opacity-30 ${config.textColor}`}
            >
              {config.label}
            </span>
            {isExpanded ? (
              <ChevronUp size={18} className="text-gray-400" />
            ) : (
              <ChevronDown size={18} className="text-gray-400" />
            )}
          </div>
        </div>

        <AnimatePresence>
          {isExpanded && (
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
                    <span className={config.ratingColor}>{config.ratingChange}</span>
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

export default Profile

