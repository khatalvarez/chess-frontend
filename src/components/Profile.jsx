import { useEffect } from "react"
import axios from "axios"
import { useSelector, useDispatch } from "react-redux"
import { login, logout } from "../store/authSlice"
import Cookies from "js-cookie"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import bg from "../assets/images/bgprofile.webp"
import { BASE_URL } from "../url"

function Profile() {
  const userData = useSelector((state) => state.auth.userData)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  useEffect(() => {
    axios
      .get(`${BASE_URL}/profile`, {
        withCredentials: true,
      })
      .then((res) => {
        const data = res.data
        dispatch(login(data))
        console.log(data);
      })
      .catch((error) => {
        console.error("Error fetching profile:", error)
      })
  }, [dispatch])

  const renderMatchHistory = (matchHistory) => {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="h-full bg-gray-800 bg-opacity-50 lg:p-4 rounded-lg shadow-md"
      >
        <h2 className="text-2xl lg:text-3xl font-semibold text-center text-white mb-2">Match History</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-gray-200 bg-opacity-20 text-gray-100 rounded-lg">
            <thead className="bg-gray-700 bg-opacity-70">
              <tr>
                <th className="px-4 lg:px-6 py-2 lg:py-3 text-left text-lg lg:text-xl font-semibold text-white">
                  SR.NO
                </th>
                <th className="px-4 lg:px-6 py-2 lg:py-3 text-left text-lg lg:text-xl font-semibold text-white">
                  OPPONENT
                </th>
                <th className="px-4 lg:px-6 py-2 lg:py-3 text-left text-lg lg:text-xl font-semibold text-white">
                  RESULT
                </th>
                <th className="hidden md:table-cell px-4 lg:px-6 py-2 lg:py-3 text-left text-lg lg:text-xl font-semibold text-white">
                  DATE
                </th>
              </tr>
            </thead>
            <tbody>
              {matchHistory.map((match, index) => (
                <tr key={match._id} className="hover:bg-gray-600 transition-colors duration-300">
                  <td className="px-4 lg:px-6 py-2 lg:py-4 text-lg lg:text-xl text-gray-100">{index + 1}</td>
                  <td className="px-4 lg:px-6 py-2 lg:py-4 capitalize text-lg lg:text-xl text-gray-100">
                    {match.opponent}
                  </td>
                  <td className="px-4 lg:px-6 py-2 lg:py-4 capitalize text-lg lg:text-xl text-gray-100">
                    {match.status}
                  </td>
                  <td className="hidden md:table-cell px-4 lg:px-6 py-2 lg:py-4 text-lg lg:text-xl text-gray-100">
                    {new Date(match.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    )
  }

  const handleLogout = () => {
    Cookies.remove("token", { path: "/" })
    dispatch(logout())
    navigate("/login")
  }

  return (
    <div className="w-screen min-h-screen bg-cover bg-no-repeat bg-center flex items-center justify-center">
        <img 
          src={bg} 
          sizes="(max-width: 600px) 400px, 800px" 
          loading="lazy" 
          alt="Chess background" 
          className="absolute inset-0 w-full h-full object-cover"
        />
      <div className="w-11/12 lg:w-5/6 flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-4">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="lg:w-1/2 bg-gray-700 bg-opacity-50 rounded-lg shadow-md flex flex-col justify-between p-4"
        >
          <div className="flex flex-col items-center lg:items-start flex-grow overflow-y-auto">
            <h1 className="text-3xl lg:text-4xl font-semibold text-center lg:text-left text-white mb-4">
              User Profile
            </h1>
            <div className="text-gray-100 text-lg lg:text-xl mb-4 w-full">
              <table className="min-w-full text-left">
                <tbody>
                  {userData &&
                    Object.entries(userData).map(([key, value]) => {
                      if (key !== "userId" && key !== "iat" && key !== "exp" && key !== "matchHistory") {
                        return (
                          <tr key={key} className="hover:text-gray-400 transition-colors duration-300">
                            <td className="font-semibold text-xl lg:text-2xl capitalize py-2">{key}:</td>
                            <td className="capitalize text-xl lg:text-2xl py-2">{value}</td>
                          </tr>
                        )
                      }
                      return null
                    })}
                </tbody>
              </table>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white text-lg lg:text-2xl my-4 py-2 lg:py-3 font-bold rounded hover:bg-red-600 transition-colors duration-300"
          >
            Logout
          </button>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="lg:w-1/2 bg-gray-700 bg-opacity-50 rounded-lg shadow-md p-4 overflow-y-auto"
        >
          {userData && userData.matchHistory && renderMatchHistory(userData.matchHistory)}
        </motion.div>
      </div>
    </div>
  )
}

export default Profile

