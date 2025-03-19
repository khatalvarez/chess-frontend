"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaChessKnight, FaChessQueen, FaChessBoard } from "react-icons/fa";
import bg from "../../assets/images/bgprofile.webp";

const topPuzzles = [
  { 
    path: "/puzzle1", 
    title: "The Magician's Puzzle", 
    description: "A complex puzzle that requires creative thinking and tactical vision",
    icon: <FaChessKnight className="text-4xl" />, 
    color: "from-blue-500 to-indigo-600" 
  },
  { 
    path: "/puzzle2", 
    title: "The Mighty Knight Puzzle", 
    description: "Master the knight's unique movement to solve this challenging puzzle",
    icon: <FaChessQueen className="text-4xl" />, 
    color: "from-red-500 to-orange-600" 
  },
  { 
    path: "/puzzle3", 
    title: "The Enigmatic Puzzle", 
    description: "An intricate puzzle that will test even the most skilled players",
    icon: <FaChessBoard className="text-4xl" />, 
    color: "from-green-500 to-teal-600" 
  },
];

const mateInOne = [
  { 
    path: "/puzzle4", 
    title: "Easy Mate-in-One", 
    description: "Perfect for beginners looking to improve their checkmate vision",
    icon: <FaChessKnight className="text-4xl" />, 
    color: "from-yellow-500 to-amber-600" 
  },
  { 
    path: "/puzzle5", 
    title: "Normal Mate-in-One", 
    description: "Standard difficulty checkmate puzzles for intermediate players",
    icon: <FaChessQueen className="text-4xl" />, 
    color: "from-purple-500 to-pink-600" 
  },
  { 
    path: "/puzzle6", 
    title: "Hard Mate-in-One", 
    description: "Challenge yourself with these difficult mate-in-one positions",
    icon: <FaChessBoard className="text-4xl" />, 
    color: "from-gray-500 to-gray-700" 
  },
];

export default function Puzzles() {
  const navigate = useNavigate();
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    setAnimate(true);
  }, []);

  const handlePuzzleClick = (path) => {
    if (path) navigate(path);
  };

  return (
    <div
      className="w-screen min-h-screen flex items-center justify-center bg-gray-900 py-16"
      style={{ backgroundImage: `url(${bg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-6">
            Challenge Your Mind with Puzzles
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Sharpen your tactical vision and improve your chess skills with our collection of handcrafted puzzles.
          </p>
        </motion.div>

        {/* The Big Three Section */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, margin: "-100px" }}
          className="mb-12"
        >
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-8 text-center">
            The Big Three (Hardest Puzzles)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {topPuzzles.map((puzzle, index) => (
              <motion.div
                key={index}
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true, margin: "-100px" }}
                onClick={() => handlePuzzleClick(puzzle.path)}
                className="cursor-pointer"
              >
                <div className={`bg-gradient-to-br ${puzzle.color} p-1 rounded-2xl shadow-lg h-full`}>
                  <div className="bg-gray-800 bg-opacity-90 rounded-xl p-8 h-full transition duration-300 hover:bg-gray-700">
                    <div className="mb-4">{puzzle.icon}</div>
                    <h3 className="text-2xl font-bold text-white mb-3">{puzzle.title}</h3>
                    <p className="text-gray-300">{puzzle.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Mate in One Move Section */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-8 text-center">
            Mate in One Move
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {mateInOne.map((puzzle, index) => (
              <motion.div
                key={index}
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true, margin: "-100px" }}
                onClick={() => handlePuzzleClick(puzzle.path)}
                className="cursor-pointer"
              >
                <div className={`bg-gradient-to-br ${puzzle.color} p-1 rounded-2xl shadow-lg h-full`}>
                  <div className="bg-gray-800 bg-opacity-90 rounded-xl p-8 h-full transition duration-300 hover:bg-gray-700">
                    <div className="mb-4">{puzzle.icon}</div>
                    <h3 className="text-2xl font-bold text-white mb-3">{puzzle.title}</h3>
                    <p className="text-gray-300">{puzzle.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}