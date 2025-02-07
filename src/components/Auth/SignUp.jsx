import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { Eye, EyeOff, CheckCircle } from "lucide-react"
import bgChess from "../../assets/images/bgChess.jpg"
import { BASE_URL } from "../../url"
import { toast, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

const SignUp = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const togglePasswordVisibility = (field) => {
    if (field === "password") {
      setShowPassword(!showPassword)
    } else if (field === "confirmPassword") {
      setShowConfirmPassword(!showConfirmPassword)
    }
  }

  const onSubmitHandler = async (e) => {
    e.preventDefault()
    const { name, email, password, confirmPassword } = formData

    if (password !== confirmPassword) {
      toast.error("Password and confirm password do not match.")
      return
    }

    setIsLoading(true)

    try {
      const res = await fetch(`${BASE_URL}/user/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: name,
          email: email,
          password: password,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.message || "Something went wrong")
      }
      setIsSuccess(true)
      toast.success("Sign up successful! Redirecting to login...")
      setTimeout(() => {
        navigate("/login")
      }, 2000)
    } catch (error) {
      console.error("Error during signup:", error)
      toast.error(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div
      className="w-screen min-h-screen bg-cover bg-no-repeat bg-center flex items-center justify-center"
      style={{ backgroundImage: `url(${bgChess})` }}
    >
      <ToastContainer position="top-center" autoClose={3000} />
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gray-900 bg-opacity-80 backdrop-filter backdrop-blur-xl border border-gray-200 p-8 lg:p-12 rounded-xl shadow-lg w-11/12 max-w-md lg:max-w-lg"
      >
        <h2 className="text-4xl lg:text-5xl font-bold text-white text-center mb-8">Sign Up</h2>
        <form className="space-y-4" onSubmit={onSubmitHandler}>
          <div>
            <label htmlFor="username" className="block text-lg font-medium text-white">
              Username
            </label>
            <input
              type="text"
              id="username"
              name="name"
              className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your username"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-lg font-medium text-white">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
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
                className="block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs leading-5 bg-gray-600"
                onClick={() => togglePasswordVisibility("password")}
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
            <label htmlFor="confirmPassword" className="block text-lg font-medium text-white">
              Confirm Password
            </label>
            <div className="relative mt-1">
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                className="block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5 bg-gray-600"
                onClick={() => togglePasswordVisibility("confirmPassword")}
              >
                {showConfirmPassword ? (
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
              {isLoading ? "Processing..." : isSuccess ? "Success!" : "Sign Up"}
            </motion.button>
          </div>
        </form>
        <div className="mt-6 text-center">
          <Link
            to="/login"
            className="font-medium text-blue-400 hover:text-blue-300 transition duration-150 ease-in-out"
          >
            Already have an account? Log in
          </Link>
        </div>
      </motion.div>
    </div>
  )
}

export default SignUp

