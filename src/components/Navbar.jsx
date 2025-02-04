import { Link } from "react-router-dom"
import chessLogo from "../assets/images/logo.webp";

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-4 bg-black bg-opacity-70 text-white px-16">
      <div className="flex items-center">
        <img src={chessLogo || "/placeholder.svg"} alt="Chess Master Logo" className="h-8 md:h-10" />
        <span className="ml-2 text-lg md:text-xl font-semibold text-amber-500">Chess Master</span>
      </div>
      <div className="flex space-x-4 md:space-x-6">
      <Link to="/" className="text-sm md:text-base hover:text-amber-400 transition duration-300">
          Home
        </Link>
        <Link to="/signup" className="text-sm md:text-base hover:text-amber-400 transition duration-300">
          Sign Up
        </Link>
        <Link to="/login" className="text-sm md:text-base hover:text-amber-400 transition duration-300">
          Login
        </Link>
      </div>
    </nav>
  )
}

export default Navbar

