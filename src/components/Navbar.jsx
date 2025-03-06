import { useState, useEffect, useRef } from "react"
import { Link, useLocation } from "react-router-dom"
import { useSelector, useDispatch } from "react-redux"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X, ChevronDown, User, LogOut } from "lucide-react"
import logo from "../assets/images/chessLogo.webp"
import { login } from "../store/authSlice"
import axios from "axios"
import { BASE_URL } from "../url"

function Navbar() {
  const dispatch = useDispatch()
  const authStatus = useSelector((state) => state.auth.status)
  const userData = useSelector((state) => state.auth.userData)
  const location = useLocation()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const profileMenuRef = useRef(null)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

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

  useEffect(() => {
    // Close mobile menu when route changes
    setIsMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    // Close profile menu when clicking outside
    function handleClickOutside(event) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setIsProfileMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Override authStatus to false if the route is /login or /signup
  const isAuthPage = location.pathname === "/login" || location.pathname === "/signup"
  const effectiveAuthStatus = isAuthPage ? "false" : authStatus

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        scrolled ? "bg-gray-900 shadow-lg" : "bg-gray-900 bg-opacity-80 backdrop-filter backdrop-blur-lg"
      }`}
    >
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <motion.img
              src={logo}
              className="w-8 h-8 object-contain"
              alt="Chess Master Logo"
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
            />
            <span className="text-white font-bold text-xl group-hover:text-green-400 transition-colors duration-300">
              Chess Master
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className={`text-lg font-medium transition-colors duration-300 ${
                location.pathname === "/" ? "text-green-400" : "text-white hover:text-green-400"
              }`}
            >
              Home
            </Link>

            {effectiveAuthStatus === "true" && userData?.username ? (
              <>
                <Link
                  to="/modeselector"
                  className={`text-lg font-medium transition-colors duration-300 ${
                    location.pathname === "/modeselector" ? "text-green-400" : "text-white hover:text-green-400"
                  }`}
                >
                  Play
                </Link>
                <Link
                  to="/puzzle"
                  className={`text-lg font-medium transition-colors duration-300 ${
                    location.pathname === "/puzzle" ? "text-green-400" : "text-white hover:text-green-400"
                  }`}
                >
                  Puzzles
                </Link>

                {/* Profile Dropdown */}
                <div className="relative"  ref={profileMenuRef}>
                  <button
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className="flex items-center space-x-1 text-lg font-medium text-green-400 hover:text-green-300 transition-colors duration-300"
                  >
                    <span className="capitalize">{userData?.username?.split(" ")[0]}</span>
                    <ChevronDown size={16} />
                  </button>

                  <AnimatePresence>
                    {isProfileMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg py-1 z-50"
                      >
                        <Link
                          to="/profile"
                          className="flex items-center px-4 py-2 text-sm text-white hover:bg-gray-700"
                          onClick={() => setIsProfileMenuOpen(false)}
                        >
                          <User size={16} className="mr-2" />
                          View Profile
                        </Link>
                        <Link
                          to="/login"
                          className="flex items-center px-4 py-2 text-sm text-white hover:bg-gray-700"
                          onClick={() => setIsProfileMenuOpen(false)}
                        >
                          <LogOut size={16} className="mr-2" />
                          Logout
                        </Link>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/signup"
                  className="text-lg font-medium text-white hover:text-green-400 transition-colors duration-300"
                >
                  Sign Up
                </Link>
                <Link
                  to="/login"
                  className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md transition-colors duration-300"
                >
                  Login
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden text-white focus:outline-none" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-gray-800"
          >
            <div className="px-4 py-3 space-y-4">
              <Link
                to="/"
                className="block text-lg font-medium text-white hover:text-green-400 transition-colors duration-300"
              >
                Home
              </Link>

              {effectiveAuthStatus === "true" && userData?.username ? (
                <>
                  <Link
                    to="/modeselector"
                    className="block text-lg font-medium text-white hover:text-green-400 transition-colors duration-300"
                  >
                    Play
                  </Link>
                  <Link
                    to="/puzzle"
                    className="block text-lg font-medium text-white hover:text-green-400 transition-colors duration-300"
                  >
                    Puzzles
                  </Link>
                  <Link
                    to="/profile"
                    className="block text-lg font-medium text-green-400 hover:text-green-300 transition-colors duration-300 capitalize"
                  >
                    {userData?.username?.split(" ")[0]}
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/signup"
                    className="block text-lg font-medium text-white hover:text-green-400 transition-colors duration-300"
                  >
                    Sign Up
                  </Link>
                  <Link
                    to="/login"
                    className="block text-lg font-medium text-white hover:text-green-400 transition-colors duration-300"
                  >
                    Login
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}

export default Navbar

