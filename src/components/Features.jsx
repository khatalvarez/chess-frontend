"use client";

import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const features = [
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

export default function FeaturesSection() {
  const navigate = useNavigate();

  const handleFeatureClick = (path) => {
    if (path) navigate(path);
  };

  return (
    <div id="features" className="bg-gray-900 py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600 mb-6">
            Experience Chess Like Never Before
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Dive into a world of chess with stunning visuals, powerful analysis tools, and multiple game modes.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true, margin: "-100px" }}
              onClick={() => handleFeatureClick(feature.path)}
              className="cursor-pointer"
            >
              <div className={`bg-gradient-to-br ${feature.color} p-1 rounded-2xl shadow-lg h-full`}>
                <div className="bg-gray-800 rounded-xl p-8 h-full transition duration-300 hover:bg-gray-700">
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="text-2xl font-bold text-white mb-3">{feature.title}</h3>
                  <p className="text-gray-300">{feature.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
    
  );
}
