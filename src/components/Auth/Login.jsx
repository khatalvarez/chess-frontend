"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useDispatch } from "react-redux"
import { motion, AnimatePresence } from "framer-motion"
import { Eye, EyeOff, CheckCircle, Mail, Lock, ChevronRight } from "lucide-react"
import bgImage from "../../assets/images/bgChess.webp"
import axios from "axios"
import { login } from "../../store/authSlice"
import PieceArray from "../PieceArray"
import { BASE_URL } from "../../url"
import { toast } from "react-toastify"
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
        navigate("/modeselector")
      })
      .catch((error) => {
        console.error("Error fetching profile:", error)
      })
  }, [dispatch, navigate])

  const handleLogin = async (e) => {
    e.preventDefault()

    if (!email || !password) {
      toast.error("Please fill in all fields")
      return
    }

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

        // Store token in Redux state
        dispatch(
          login({
            ...data,
            username: data.username || email.split("@")[0], // Fallback username if not provided
          }),
        )

        toast.success("Login successful!")

        // Wait a moment for cookies to be set
        setTimeout(async () => {
          try {
            // Fetch profile with credentials to include cookies
            const profileRes = await axios.get(`${BASE_URL}/profile`, {
              withCredentials: true,
            })

            if (profileRes.data) {
              // Update Redux with the complete profile data
              dispatch(login(profileRes.data))
            }

            navigate("/modeselector")
          } catch (profileError) {
            console.error("Error fetching profile after login:", profileError)
            // Even if profile fetch fails, still navigate to mode selector
            // since we have basic user data from login
            navigate("/modeselector")
          }
        }, 500)
      } else {
        toast.error(data.error || "Login failed")
        setIsLoading(false)
      }
    } catch (error) {
      console.error("Error during login:", error)
      toast.error("Connection error. Please try again.")
      setIsLoading(false)
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  return (
    <div className="w-screen min-h-screen bg-cover bg-no-repeat bg-center flex items-center justify-center">
      <img
        src={bgImage || "/placeholder.svg"}
        sizes="(max-width: 600px) 400px, 800px"
        loading="lazy"
        alt="Chess background"
        className="absolute inset-0 w-full h-full object-cover brightness-[0.3]"
      />

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-11/12 max-w-md lg:max-w-lg mx-auto"
      >
        <div className="bg-gray-900 bg-opacity-80 backdrop-filter backdrop-blur-xl border border-gray-700 p-8 lg:p-12 rounded-xl shadow-2xl">
          <div className="text-center mb-8">
            <PieceArray />
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">Welcome Back</h2>
            <p className="text-gray-300">Sign in to continue your chess journey</p>
          </div>

          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label htmlFor="email" className="block text-lg font-medium text-white mb-2">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 block w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-lg font-medium text-white mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 block w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="group w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-lg font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300"
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
                      <div className="w-5 h-5 border-t-2 border-white border-solid rounded-full animate-spin"></div>
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
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    </motion.div>
                  )}
                </AnimatePresence>
                <span>{isLoading ? "Signing in..." : isSuccess ? "Success!" : "Sign in"}</span>
                {!isLoading && !isSuccess && (
                  <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                )}
              </motion.button>
            </div>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-400">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="font-medium text-blue-400 hover:text-blue-300 transition duration-150 ease-in-out"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default Login

