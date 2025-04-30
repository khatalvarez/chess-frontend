"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useDispatch } from "react-redux"
import { Mail, Lock, ChevronRight, Eye, EyeOff, CheckCircle } from "lucide-react"
import { login } from "../../store/authSlice"
import axios from "axios"
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

  // Chess pieces array for decoration
  const chessPieces = ["♟", "♞", "♝", "♜", "♛", "♚"]

  return (
    <div className="relative w-screen overflow-x-hidden bg-gray-950 font-mono">
      {/* Chess board background with perspective */}
      <div className="fixed inset-0 z-0 perspective-1000">
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

      {/* Game UI Container */}
      <div className="relative z-10 pt-16  flex flex-col">
        {/* Game Header Banner */}
        <div className="w-full bg-gradient-to-r from-indigo-900 via-blue-800 to-indigo-900 border-b-4 border-yellow-500 shadow-lg py-4">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-yellow-400 mb-2 pixelated drop-shadow-md">
              CHESS MASTER
            </h1>
            <div className="h-1 w-32 mx-auto bg-yellow-500 mb-4"></div>
            <p className="text-lg text-blue-100">
              Sign in to continue your chess journey
            </p>
          </div>
        </div>

        {/* Main Content Area - Game Panel Style */}
        <div className="flex-grow px-8 py-16 text-center item-center">
          <div className="max-w-md mx-auto">
            {/* Login Form */}
            <div className="bg-gray-900 border-2 border-blue-700 rounded-lg p-6 shadow-lg game-panel">
              <div className="bg-blue-800 -mt-8 -mx-6 mb-8 py-2 px-4 border-b-2 border-yellow-500">
                <h2 className="text-2xl font-bold text-yellow-400 uppercase">Player Login</h2>
              </div>

              <form className="space-y-6" onSubmit={handleLogin}>
                <div>
                  <label htmlFor="email" className="block text-lg font-medium text-yellow-400 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-blue-400" />
                    </div>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 block w-full px-4 py-3 bg-gray-800 border-2 border-blue-600 rounded-lg text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-lg font-medium text-yellow-400 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-blue-400" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      name="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 block w-full px-4 py-3 bg-gray-800 border-2 border-blue-600 rounded-lg text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-blue-400 hover:text-yellow-400"
                      onClick={togglePasswordVisibility}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    className="w-full px-8 py-4 bg-yellow-500 text-blue-900 text-xl font-bold uppercase rounded-lg hover:bg-yellow-400 transition-colors shadow-lg border-2 border-yellow-700 transform hover:scale-105 transition-transform flex justify-center items-center"
                    disabled={isLoading || isSuccess}
                  >
                    {isLoading && (
                      <div className="mr-2">
                        <div className="w-5 h-5 border-t-2 border-blue-900 border-solid rounded-full animate-spin"></div>
                      </div>
                    )}
                    {isSuccess && (
                      <CheckCircle className="w-5 h-5 text-blue-900 mr-2" />
                    )}
                    <span>{isLoading ? "PREPARING BOARD..." : isSuccess ? "GAME READY!" : "ENTER GAME"}</span>
                    {!isLoading && !isSuccess && (
                      <ChevronRight className="ml-2 h-5 w-5" />
                    )}
                  </button>
                </div>
              </form>

              <div className="mt-8 text-center">
                <p className="text-blue-200">
                  Need a player account?{" "}
                  <Link
                    to="/signup"
                    className="font-medium text-yellow-400 hover:text-yellow-300 transition duration-150 ease-in-out"
                  >
                    SIGN UP
                  </Link>
                </p>
              </div>

              {/* Chess pieces decoration */}
              <div className="flex justify-center mt-6 space-x-4">
                {chessPieces.map((piece, index) => (
                  <div key={index} className="text-4xl text-white">{piece}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Game UI CSS */}
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
    </div>
  )
}

export default Login