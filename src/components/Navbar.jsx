import { useState, useEffect, useRef } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useSelector, useDispatch } from "react-redux"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X, ChevronDown, User, LogOut, BookOpen, Home } from "lucide-react"
import logo from "../assets/images/chessLogo.webp"
import { logout, login } from "../store/authSlice"
import { FaChess } from "react-icons/fa"
import Cookies from "js-cookie"
import axios from "axios"
import { BASE_URL } from "../url"

function Navbar() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const authStatus = useSelector((state) => state.auth.status)
  const userData = useSelector((state) => state.auth.userData)
  const location = useLocation()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const profileMenuRef = useRef(null)
  const [navbarFocused, setNavbarFocused] = useState(false)

  // Add a hover effect for the entire navbar
  const handleNavbarHover = (focused) => {
    setNavbarFocused(focused)
  }

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

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

  // Handle logout
  const handleLogout = () => {
    Cookies.remove("token", { path: "/" })
    dispatch(logout())
    setIsProfileMenuOpen(false)
    navigate("/login")
  }

  // Override authStatus to false if the route is /login or /signup
  const isAuthPage = location.pathname === "/login" || location.pathname === "/signup"
  // Make sure we check both authStatus AND userData existence
  const effectiveAuthStatus = isAuthPage ? false : authStatus && !!userData?.username

  // Animation variants
  const navItemVariants = {
    hover: {
      scale: 1.05,
      textShadow: "0 0 8px rgba(74, 222, 128, 0.6)",
      transition: { duration: 0.2 },
    },
  }

  const logoVariants = {
    hover: {
      rotate: 360,
      scale: 1.1,
      transition: { duration: 0.8, ease: "easeInOut" },
    },
  }

  const mobileMenuVariants = {
    hidden: { opacity: 0, height: 0 },
    visible: {
      opacity: 1,
      height: "auto",
      transition: {
        height: { duration: 0.3 },
        opacity: { duration: 0.25, delay: 0.1 },
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
    exit: {
      opacity: 0,
      height: 0,
      transition: { duration: 0.3 },
    },
  }

  const mobileItemVariants = {
    hidden: { x: -20, opacity: 0 },
    visible: { x: 0, opacity: 1 },
    exit: { x: -20, opacity: 0 },
  }

  // Add this useEffect to check auth status on mount and when auth state changes
  useEffect(() => {
    // Check if we're on the login page and have auth status
    if (location.pathname === "/login" && authStatus && userData?.username) {
      // Redirect to home page after successful login
      navigate("/")
    }
  }, [authStatus, userData, location.pathname, navigate])

  // Also add this useEffect to check for token on page load/refresh
  useEffect(() => {
    const token = Cookies.get("token")
    if (token && !authStatus) {
      // If we have a token but no auth status, fetch user data
      const fetchUserData = async () => {
        try {
          const res = await axios.get(`${BASE_URL}/profile`, {
            withCredentials: true,
          })
          if (res.data) {
            dispatch(login(res.data))
          }
        } catch (error) {
          console.error("Error fetching user data:", error)
          Cookies.remove("token", { path: "/" })
        }
      }
      fetchUserData()
    }
  }, [])

  // Add this useEffect to log auth state changes
  useEffect(() => {
    console.log("Auth state changed:", {
      authStatus,
      hasUserData: !!userData?.username,
      username: userData?.username,
    })
  }, [authStatus, userData])

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, type: "spring", stiffness: 120 }}
      onMouseEnter={() => handleNavbarHover(true)}
      onMouseLeave={() => handleNavbarHover(false)}
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
        scrolled
          ? "bg-gray-900 shadow-lg"
          : navbarFocused
            ? "bg-gray-900 bg-opacity-95 backdrop-filter backdrop-blur-md"
            : "bg-gray-900 bg-opacity-80 backdrop-filter backdrop-blur-lg"
      }`}
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo with enhanced animation */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <motion.div className="absolute -inset-1 rounded-full bg-gradient-to-r from-green-400 to-blue-500 opacity-75 group-hover:opacity-100 blur-sm transition-opacity duration-300" />
              <motion.div className="relative">
                <motion.img
                  src={logo}
                  className="w-10 h-10 object-contain relative z-10"
                  alt="Chess Master Logo"
                  variants={logoVariants}
                  whileHover="hover"
                />
              </motion.div>
            </div>
            <div className="flex flex-col">
              <motion.span
                className="text-white font-bold text-xl group-hover:text-green-400 transition-colors duration-300"
                whileHover={{ scale: 1.05 }}
              >
                Chess Master
              </motion.span>
              <span className="text-xs text-gray-400 hidden sm:block">Master your game</span>
            </div>
          </Link>

          {/* Desktop Navigation - Simplified */}
          <div className="hidden md:flex items-center space-x-8">
            <motion.div variants={navItemVariants} whileHover="hover">
              <Link
                to="/"
                className={`flex items-center space-x-1 text-lg font-medium transition-all duration-300 ${
                  location.pathname === "/"
                    ? "text-green-400 border-b border-green-400 pb-1"
                    : "text-white hover:text-green-400"
                }`}
              >
                <Home size={18} />
                <span>Home</span>
              </Link>
            </motion.div>

            {effectiveAuthStatus === true && userData?.username ? (
              <>
                <motion.div variants={navItemVariants} whileHover="hover">
                  <Link
                    to="/modeselector"
                    className={`flex items-center space-x-1 text-lg font-medium transition-all duration-300 ${
                      location.pathname === "/modeselector"
                        ? "text-green-400 border-b border-green-400 pb-1"
                        : "text-white hover:text-green-400"
                    }`}
                  >
                    <FaChess size={18} />
                    <span>Play</span>
                  </Link>
                </motion.div>

                <motion.div variants={navItemVariants} whileHover="hover">
                  <Link
                    to="/puzzle"
                    className={`flex items-center space-x-1 text-lg font-medium transition-all duration-300 ${
                      location.pathname === "/puzzle"
                        ? "text-green-400 border-b border-green-400 pb-1"
                        : "text-white hover:text-green-400"
                    }`}
                  >
                    <BookOpen size={18} />
                    <span>Puzzles</span>
                  </Link>
                </motion.div>

                {/* Simplified Profile Dropdown */}
                <div className="relative" ref={profileMenuRef}>
                  <motion.button
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    whileHover={{ scale: 1.05 }}
                    className={`flex items-center space-x-2 px-4 py-1.5 rounded-full transition-all duration-300 ${
                      isProfileMenuOpen ? "bg-gray-700 text-green-400" : "text-green-400 hover:bg-gray-800"
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white font-bold">
                      {userData?.username ? userData.username.charAt(0).toUpperCase() : "U"}
                    </div>
                    <span className="capitalize">
                      {userData?.username ? userData.username.split(" ")[0] : "Loading..."}
                    </span>
                    <ChevronDown
                      size={16}
                      className={`transition-transform duration-300 ${isProfileMenuOpen ? "rotate-180" : ""}`}
                    />
                  </motion.button>

                  <AnimatePresence>
                    {isProfileMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg py-2 z-50 border border-gray-700"
                      >
                        <Link
                          to="/profile"
                          className="flex items-center px-4 py-2 text-sm text-white hover:bg-gray-700 transition-colors duration-300"
                          onClick={() => setIsProfileMenuOpen(false)}
                        >
                          <User size={16} className="mr-3 text-green-400" />
                          <span>Profile</span>
                        </Link>

                        <button
                          onClick={handleLogout}
                          className="flex items-center px-4 py-2 text-sm text-white hover:bg-gray-700 transition-colors duration-300 w-full text-left group"
                        >
                          <LogOut
                            size={16}
                            className="mr-3 text-red-400 group-hover:translate-x-1 transition-transform duration-300"
                          />
                          <span>Logout</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <>
                <motion.div variants={navItemVariants} whileHover="hover">
                  <Link
                    to="/signup"
                    className="text-lg font-medium text-white hover:text-green-400 transition-colors duration-300"
                  >
                    Sign Up
                  </Link>
                </motion.div>

                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }} className="group relative">
                  <span className="absolute -inset-0.5 border border-transparent rounded-lg shadow-sm text-lg font-medium text-white bg-gradient-to-r from-green-600 to-teal-700 rounded-lg blur opacity-95 group-hover:opacity-100 transition duration-300"></span>
                  <Link
                    to="/login"
                    className="relative px-5 py-1 font-bold text-lg text-white rounded-lg leading-none flex items-center group-hover:text-green-200 transition-colors duration-300"
                  >
                    Login
                  </Link>
                </motion.button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            className="md:hidden relative w-10 h-10 flex items-center justify-center bg-gray-800 text-white rounded-full focus:outline-none"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <AnimatePresence mode="wait">
              {isMenuOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <X size={20} />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Menu size={20} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>

      {/* Mobile Menu - Simplified */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            variants={mobileMenuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="md:hidden bg-gray-800 border-t border-gray-700 overflow-hidden"
          >
            <div className="px-4 py-4 space-y-3">
              <motion.div variants={mobileItemVariants} className="overflow-hidden">
                <Link
                  to="/"
                  className="flex items-center space-x-3 py-2 px-3 rounded-lg text-lg font-medium text-white hover:bg-gray-700 hover:text-green-400 transition-colors duration-300"
                >
                  <Home size={18} className="text-green-400" />
                  <span>Home</span>
                </Link>
              </motion.div>

              {effectiveAuthStatus === true && userData?.username ? (
                <>
                  <motion.div variants={mobileItemVariants}>
                    <Link
                      to="/modeselector"
                      className="flex items-center space-x-3 py-2 px-3 rounded-lg text-lg font-medium text-white hover:bg-gray-700 hover:text-green-400 transition-colors duration-300"
                    >
                      <FaChess size={18} className="text-green-400" />
                      <span>Play</span>
                    </Link>
                  </motion.div>

                  <motion.div variants={mobileItemVariants}>
                    <Link
                      to="/puzzle"
                      className="flex items-center space-x-3 py-2 px-3 rounded-lg text-lg font-medium text-white hover:bg-gray-700 hover:text-green-400 transition-colors duration-300"
                    >
                      <BookOpen size={18} className="text-green-400" />
                      <span>Puzzles</span>
                    </Link>
                  </motion.div>

                  <motion.div variants={mobileItemVariants}>
                    <Link
                      to="/profile"
                      className="flex items-center space-x-3 py-2 px-3 rounded-lg text-lg font-medium text-white hover:bg-gray-700 hover:text-green-400 transition-colors duration-300"
                    >
                      <User size={18} className="text-green-400" />
                      <span>Profile</span>
                    </Link>
                  </motion.div>

                  <motion.div variants={mobileItemVariants} className="pt-2 mt-2 border-t border-gray-700">
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-3 py-2 px-3 rounded-lg text-lg font-medium text-white hover:bg-gray-700 hover:text-red-400 transition-colors duration-300 w-full"
                    >
                      <LogOut size={18} className="text-red-400" />
                      <span>Logout</span>
                    </button>
                  </motion.div>
                </>
              ) : (
                <>
                  <motion.div variants={mobileItemVariants}>
                    <Link
                      to="/signup"
                      className="flex items-center space-x-3 py-2 px-3 rounded-lg text-lg font-medium text-white hover:bg-gray-700 hover:text-green-400 transition-colors duration-300"
                    >
                      <User size={18} className="text-green-400" />
                      <span>Sign Up</span>
                    </Link>
                  </motion.div>

                  <motion.div variants={mobileItemVariants}>
                    <Link
                      to="/login"
                      className="flex items-center space-x-3 py-2 px-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors duration-300 mt-2"
                    >
                      <LogOut size={18} />
                      <span>Login</span>
                    </Link>
                  </motion.div>
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

