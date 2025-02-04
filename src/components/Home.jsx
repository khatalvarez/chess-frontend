import { Link } from "react-router-dom"
import { useSelector } from "react-redux"
import Typing from "react-typing-effect"
import bgImage from "../assets/images/bgChess.jpg"

function Home() {
  const authStatus = useSelector((state) => state.auth.status)
  const userData = useSelector((state) => state.auth.userData)

  return (
    <div
      className="w-screen min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="animate-float absolute top-10 left-10 w-16 h-16 bg-contain bg-no-repeat opacity-30"
          style={{ backgroundImage: "url('/chess-knight.png')" }}
        ></div>
        {/* <div
          className="animate-float-delayed absolute bottom-10 right-10 w-16 h-16 bg-contain bg-no-repeat opacity-30"
          style={{ backgroundImage: "url('/chess-king.png')" }}
        ></div> */}
      </div>

      <div className="my-32 font-sans tracking-wide bg-gray-900 flex flex-col bg-opacity-80 backdrop-filter backdrop-blur-xl border border-amber-500/30 p-8 rounded-2xl shadow-2xl text-center w-11/12 max-w-4xl">
      <h1 className="text-4xl sm:text-5xl font-extrabold mb-6 text-transparent bg-clip-text bg-green-400">
            <Typing
              text={["Welcome to Chess Master"]}
              speed={100}
              eraseSpeed={50}
              typingDelay={200}
              eraseDelay={5000}
            />
          </h1>

        <div className="description text-center align-middle text-lg md:text-xl lg:text-2xl text-gray-300 mb-8 leading-relaxed">
          Experience the ultimate chess journey with Chess Master. Challenge your friends in local multiplayer, or take
          on global opponents with our advanced socket integration. Sharpen your skills with intricate puzzles, or test
          your strategies against Stockfish, the world's strongest chess engine. For those moments of frustration,
          switch to "Always Win" mode and enjoy a flawless victory every time.
        </div>

        <div className="flex flex-wrap justify-center gap-6">
          {authStatus === "true" && userData.username ? (
            <Link
              to="/modeselector"
              className="block bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 px-8 rounded-full text-xl lg:text-2xl w-full max-w-md hover:from-green-600 hover:to-emerald-700 transition duration-300 shadow-lg hover:shadow-green-500/50 transform hover:scale-105"
            >
              Continue Your Journey
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="block bg-gradient-to-r from-amber-500 to-yellow-600 text-white py-4 px-8 rounded-full text-xl lg:text-2xl w-full sm:w-auto hover:from-amber-600 hover:to-yellow-700 transition duration-300 shadow-lg hover:shadow-amber-500/50 transform hover:scale-105"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="block bg-transparent border-2 border-amber-500 text-amber-500 py-4 px-8 rounded-full text-xl lg:text-2xl w-full sm:w-auto hover:bg-amber-500 hover:text-gray-100 transition duration-300 shadow-lg hover:shadow-amber-500/50 transform hover:scale-105"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default Home

