import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useDispatch } from "react-redux"
import { motion, AnimatePresence } from "framer-motion"
import { Eye, EyeOff, CheckCircle } from "lucide-react"
import bgImage from "../../assets/images/bgChess.jpg"
import axios from "axios"
import { login } from "../../store/authSlice"
import PieceArray from "../PieceArray"
import { BASE_URL } from "../../url"
import { toast, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

function Login() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  useEffect(() => {
    axios
      .get(`${BASE_URL}/profile`, {
        withCredentials: true,
      })
      .then((res) => {
        const data = res.data
        dispatch(login(data))
      })
      .catch((error) => {
        console.error("Error fetching profile:", error)
      })
  }, [dispatch])

  const handleLogin = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const response = await fetch(`${BASE_URL}/user/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      })

      const data = await response.json()
      if (response.ok) {
        setIsSuccess(true)
        dispatch(login(data))
        toast.success("Login successful! Redirecting...")
        setTimeout(() => {
          navigate("/profile")
        }, 2000)
      } else {
        toast.error(data.error || "Login failed")
      }
    } catch (error) {
      console.error("Error during login:", error)
      toast.error("Internal server error")
    } finally {
      setIsLoading(false)
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  return (
    <div
      className="w-screen min-h-screen bg-cover bg-no-repeat bg-center flex items-center justify-center"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <ToastContainer position="top-center" autoClose={3000} />
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gray-900 bg-opacity-80 backdrop-filter backdrop-blur-xl border border-gray-200 p-8 lg:p-12 rounded-xl shadow-lg w-11/12 max-w-md lg:max-w-lg"
      >
        <PieceArray />
        <h2 className="text-4xl lg:text-5xl font-bold text-center text-white mb-8">Welcome Back</h2>
        <form className="space-y-6" onSubmit={handleLogin}>
          <div>
            <label htmlFor="email" className="block text-lg font-medium text-white">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="you@example.com"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-lg font-medium text-white">
              Password
            </label>
            <div className="relative mt-1">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5 bg-gray-600"
                onClick={togglePasswordVisibility}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-300" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-300" />
                )}
              </button>
            </div>
          </div>
          <div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              className={`w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-black ${
                isLoading || isSuccess ? "bg-gray-100 hover:bg-gray-200" : "bg-blue-600 hover:bg-blue-700"
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-300`}
              disabled={isLoading || isSuccess}
            >
              <AnimatePresence mode="wait">
                {isLoading && (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="mr-2"
                  >
                    <div className="w-5 h-5 border-t-2 border-black border-solid rounded-full animate-spin"></div>
                  </motion.div>
                )}
                {isSuccess && (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    className="mr-2"
                  >
                    <CheckCircle className="w-5 h-5 text-white" />
                  </motion.div>
                )}
              </AnimatePresence>
              {isLoading ? "Processing..." : isSuccess ? "Success!" : "Sign in"}
            </motion.button>
          </div>
        </form>
        <div className="mt-6 text-center">
          <Link
            to="/signup"
            className="font-medium text-blue-400 hover:text-blue-300 transition duration-150 ease-in-out"
          >
            Don't have an account? Sign up
          </Link>
        </div>
      </motion.div>
    </div>
  )
}

export default Login

