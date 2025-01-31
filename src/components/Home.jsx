import { Link } from "react-router-dom";
import bgImage from "../assets/bgChess.jpg";
import Typing from 'react-typing-effect';

const Home = () => {
  return (
    <div className="relative w-full min-h-screen flex flex-col">

      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${bgImage})` }}
      />

      <div className="relative flex-grow flex items-center justify-center px-4 sm:px-8">
        <div className="max-w-3xl bg-[hsla(0,9.85%,83.57%,0.9)] shadow-[4px_4px_4px_#b3a6a6] p-8 sm:p-12 rounded-lg text-center text-black border border-gray-500">
          <h1 className="text-3xl sm:text-5xl font-bold mb-4 leading-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
            <Typing
              text={['Welcome to Chess Master']}
              speed={100}
              eraseSpeed={50}
              typingDelay={200}
              eraseDelay={5000}
            />
          </h1>
          <p className="text-lg sm:text-xl mb-6 leading-relaxed">
            Experience the ultimate chess journey. Challenge friends locally,
            face global opponents, solve intricate puzzles, or test your
            skills against Stockfish. Feeling frustrated? Switch to
            "Always Win" mode for a guaranteed victory.
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Link
              to="/modeselector"
              className="px-6 py-3 bg-yellow-600 text-black font-semibold rounded-full 
              hover:bg-yellow-500 transition duration-300 transform hover:scale-105"
            >
              Start Playing
            </Link>
            <Link
              to="/signup"
              className="px-6 py-3 bg-transparent border-2 border-black text-black font-semibold rounded-full 
              hover:bg-black hover:text-white transition duration-300 transform hover:scale-105"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
