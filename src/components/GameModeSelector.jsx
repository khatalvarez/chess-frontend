"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const gameModes = [
  {
    path: "/global-multiplayer",
    title: "Global Multiplayer",
    description: "Challenge players from around the world in real-time matches",
    icon: "🌍",
    color: "from-blue-500 to-purple-600",
  },
  {
    path: "/random-play",
    title: "Random Play",
    description: "Quick casual games with random moves for fun practice.",
    icon: "🎲",
    color: "from-indigo-500 to-blue-600",
  },
  {
    path: "/against-stockfish",
    title: "AI Opponents",
    description: "Test your skills against Stockfish, one of the strongest chess engines",
    icon: "🤖",
    color: "from-red-500 to-pink-600",
  },
  {
    path: "/puzzle",
    title: "Tactical Puzzles",
    description: "Improve your chess vision with challenging puzzles for all skill levels",
    icon: "🧩",
    color: "from-yellow-500 to-orange-600",
  },
  {
    path: "/local-multiplayer",
    title: "Local Multiplayer",
    description: "Play face-to-face with a friend on the same device",
    icon: "👥",
    color: "from-green-500 to-teal-600",
  },
];

export default function GameModeSelector() {
  const navigate = useNavigate();
  const [typedText, setTypedText] = useState("");
  const [animate, setAnimate] = useState(false);
  const [bgLoaded, setBgLoaded] = useState(false);
  const [selectedMode, setSelectedMode] = useState(null);
  
  const fullText = "Choose Your Chess Experience";

  useEffect(() => {
    // Trigger animations after component mounts
    setTimeout(() => setAnimate(true), 300);
    
    // Load background image
    const bgImage = new Image();
    bgImage.src = "https://images.unsplash.com/photo-1529699211952-734e80c4d42b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2942&q=80";
    bgImage.onload = () => setBgLoaded(true);
    
    // Text typing effect
    let index = 0;
    let currentText = "";
    const interval = setInterval(() => {
      if (index < fullText.length) {
        currentText += fullText[index];
        setTypedText(currentText);
        index++;
      } else {
        clearInterval(interval);
      }
    }, 60);
    
    return () => clearInterval(interval);
  }, []);

  const handleModeSelect = (path, index) => {
    setSelectedMode(index);
    
    // Navigate after a short delay to allow for animation
    setTimeout(() => {
      navigate(path);
    }, 500);
  };

  // Floating chess pieces animation
  const chessPieces = ['♟️', '♞', '♝', '♜', '♛', '♚'];

  return (
    <div className="relative w-screen min-h-screen bg-gray-900 overflow-hidden">
      {/* Background with gradient overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: bgLoaded ? 1 : 0 }}
        transition={{ duration: 1.5 }}
        className="absolute inset-0 w-full h-full"
      >
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1529699211952-734e80c4d42b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2942&q=80')] bg-cover bg-center brightness-50" />
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/70 via-gray-900/80 to-gray-900/90" />
      </motion.div>

      {/* Floating chess pieces */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {chessPieces.map((piece, i) => (
          <motion.div 
            key={i}
            initial={{ y: -20, x: Math.random() * 100 - 50, opacity: 0 }}
            animate={{ 
              y: [
                -20, 
                Math.random() * window.innerHeight * 0.8 + window.innerHeight * 0.2
              ],
              opacity: [0, 0.7, 0],
              x: [
                Math.random() * 100 - 50,
                Math.random() * 200 - 100
              ]
            }}
            transition={{ 
              duration: Math.random() * 20 + 15, 
              delay: Math.random() * 5,
              repeat: Infinity,
              repeatType: "loop"
            }}
            className="absolute text-4xl text-white/20"
            style={{ left: `${Math.random() * 90 + 5}%` }}
          >
            {piece}
          </motion.div>
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        {/* Heading with typing effect */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-6xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-600 mb-6 tracking-tight">
            {typedText}
            <motion.span
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="inline-block w-1 h-12 ml-1 bg-blue-400"
            />
          </h1>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-xl text-gray-300 text-center max-w-3xl mx-auto"
          >
            Select your preferred way to play and embark on your chess journey
          </motion.p>
        </motion.div>

        {/* Game Mode Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {gameModes.map((mode, index) => (
            <motion.div
              key={index}
              initial={{ y: 50, opacity: 0 }}
              animate={animate ? { y: 0, opacity: 1 } : {}}
              transition={{ duration: 0.6, delay: index * 0.1 + 0.4 }}
              whileHover={{ y: -10, scale: 1.03, transition: { duration: 0.3 } }}
              className={`${selectedMode === index ? 'ring-4 ring-white' : ''}`}
              onClick={() => handleModeSelect(mode.path, index)}
            >
              <div className={`bg-gradient-to-br ${mode.color} p-1 rounded-2xl shadow-lg h-full cursor-pointer`}>
                <div className="bg-gray-800 rounded-xl p-8 h-full flex flex-col items-center justify-center transition duration-300 hover:bg-gray-700">
                  <motion.div 
                    whileHover={{ 
                      rotate: [0, -10, 10, -5, 0],
                      scale: [1, 1.2, 1.1],
                      transition: { duration: 0.5 }
                    }}
                    className="mb-6 text-6xl"
                  >
                    {mode.icon}
                  </motion.div>
                  
                  <h2 className="text-2xl font-bold text-white text-center mb-3">{mode.title}</h2>
                  <p className="text-gray-300 text-center">{mode.description}</p>
                  
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    whileHover={{ opacity: 1, y: 0 }}
                    className="mt-6"
                  >
                    <span className="inline-flex items-center justify-center px-4 py-2 rounded-full text-sm font-medium text-white bg-white/10 hover:bg-white/20 transition-colors">
                      Play Now
                      <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7-7 7"></path>
                      </svg>
                    </span>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        {/* Back to Profile Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="text-center mt-20"
        >
          <button 
            onClick={() => navigate("/profile")}
            className="inline-block px-8 py-4 bg-gradient-to-r from-gray-600 to-gray-800 text-white rounded-full text-xl font-semibold hover:from-gray-700 hover:to-gray-900 transition duration-300 transform hover:scale-105 shadow-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
          >
            Back to Profile
          </button>
        </motion.div>
      </div>
    </div>
  );
}