"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { useSelector, useDispatch } from "react-redux"
import { login, logout } from "../store/authSlice"
import Cookies from "js-cookie"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { Trophy, Target, Calendar, LogOut, User, Activity } from "lucide-react"
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

  const renderMatchHistory = (matchHistory) => {
    if (!matchHistory || matchHistory.length === 0) {
      return (
        <div className="text-center py-8 text-gray-400">
          <Trophy className="mx-auto mb-4 opacity-50" size={48} />
          <p className="text-xl">No matches played yet</p>
          <p className="mt-2">Play your first game to start building your history</p>
        </div>
      )
    }

    // Sort match history by date (newest first)
    const sortedHistory = [...matchHistory].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="h-full bg-gray-800 bg-opacity-50 rounded-lg shadow-md overflow-hidden"
      >
        <div className="p-4 bg-gray-700 bg-opacity-70 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-white">Match History</h2>
          <div className="flex items-center space-x-2">
            <Calendar className="text-gray-300" size={20} />
            <button
              onClick={refreshProfileData}
              className="text-sm text-blue-300 hover:text-blue-100 transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full bg-gray-800 bg-opacity-50 text-gray-100">
            <thead className="bg-gray-700 bg-opacity-70">
              <tr>
                <th className="px-4 lg:px-6 py-3 text-left text-lg font-semibold text-white">#</th>
                <th className="px-4 lg:px-6 py-3 text-left text-lg font-semibold text-white">OPPONENT</th>
                <th className="px-4 lg:px-6 py-3 text-left text-lg font-semibold text-white">RESULT</th>
                <th className="hidden md:table-cell px-4 lg:px-6 py-3 text-left text-lg font-semibold text-white">
                  DATE
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedHistory.map((match, index) => (
                <motion.tr
                  key={match._id || index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="hover:bg-gray-700 transition-colors duration-200"
                >
                  <td className="border-t border-gray-700 px-4 lg:px-6 py-4 text-lg text-gray-100">{index + 1}</td>
                  <td className="border-t border-gray-700 px-4 lg:px-6 py-4 capitalize text-lg text-gray-100">
                    {match.opponent}
                  </td>
                  <td className="border-t border-gray-700 px-4 lg:px-6 py-4 text-lg">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        match.status === "win"
                          ? "bg-green-100 text-green-800"
                          : match.status === "lose"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {match.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="hidden md:table-cell border-t border-gray-700 px-4 lg:px-6 py-4 text-lg text-gray-300">
                    {new Date(match.createdAt).toLocaleDateString()}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    )
  }

  const calculateRating = (wins, loses, draws) => {
    const totalGames = wins + loses + draws
    if (totalGames === 0) return 800
    const winRatio = wins / totalGames
    const baseRating = 800
    return Math.round(baseRating + winRatio * 2200)
  }

  const handleLogout = () => {
    Cookies.remove("token", { path: "/" })
    dispatch(logout())
    toast.success("Logged out successfully")
    navigate("/login")
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
        src={bg || "/placeholder.svg"}
        sizes="(max-width: 600px) 400px, 800px"
        loading="lazy"
        alt="Chess background"
        className="absolute inset-0 w-full h-full object-cover brightness-[0.4]"
      />

      <div className="w-11/12 lg:w-5/6 flex flex-col lg:flex-row space-y-6 lg:space-y-0 lg:space-x-6 py-24">
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-800 rounded-lg p-4 text-center">
                <p className="text-gray-400 text-sm mb-1">Rating</p>
                <p className="text-3xl font-bold text-white">{stats.rating}</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-4 text-center">
                <p className="text-gray-400 text-sm mb-1">Win Rate</p>
                <p className="text-3xl font-bold text-white">{stats.winRate}%</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-4 text-center">
                <p className="text-gray-400 text-sm mb-1">Games</p>
                <p className="text-3xl font-bold text-white">{stats.totalGames}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center mr-3">
                    <Trophy size={16} />
                  </div>
                  <span className="text-white">Wins</span>
                </div>
                <span className="text-xl font-semibold text-white">{userData?.wins || 0}</span>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center mr-3">
                    <Activity size={16} />
                  </div>
                  <span className="text-white">Losses</span>
                </div>
                <span className="text-xl font-semibold text-white">{userData?.loses || 0}</span>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center mr-3">
                    <Target size={16} />
                  </div>
                  <span className="text-white">Draws</span>
                </div>
                <span className="text-xl font-semibold text-white">{userData?.draws || 0}</span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="mt-8 w-full bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-lg flex items-center justify-center transition-colors duration-300"
            >
              <LogOut className="mr-2" size={18} />
              Logout
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="lg:w-2/3 bg-gray-900 bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-xl shadow-xl overflow-hidden"
        >
          {userData && userData.matchHistory && renderMatchHistory(userData.matchHistory)}
        </motion.div>
      </div>
    </div>
  )
}

export default Profile

