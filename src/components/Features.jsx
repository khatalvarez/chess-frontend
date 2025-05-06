import React, { useState, useEffect } from "react";
import { Users, Globe, ChevronRight, Award, Sword, Shield, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function FeaturesSection() {
  const navigate = useNavigate();
  const [hoveredFeature, setHoveredFeature] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const features = [
    {
      path: "/global-multiplayer",
      title: "Global Multiplayer",
      description: "Challenge players from around the world in real-time matches",
      icon: <Globe size={24} className="text-yellow-400" />,
      color: "blue"
    },
    {
      path: "/random-play",
      title: "Random Play",
      description: "Quick casual games with random moves for fun practice.",
      icon: <Sword size={24} className="text-yellow-400" />,
      color: "blue"
    },
    {
      path: "/against-stockfish",
      title: "AI Opponents",
      description: "Test your skills against Stockfish, one of the strongest chess engines",
      icon: <Shield size={24} className="text-yellow-400" />,
      color: "blue"
    },
    {
      path: "/puzzle",
      title: "Tactical Puzzles",
      description: "Improve your chess vision with challenging puzzles for all skill levels",
      icon: <Award size={24} className="text-yellow-400" />,
      color: "blue"
    },
    {
      path: "/local-multiplayer",
      title: "Local Multiplayer",
      description: "Play face-to-face with a friend on the same device",
      icon: <Users size={24} className="text-yellow-400" />,
      color: "blue"
    }
  ];

  const handleFeatureClick = (path) => {
    console.log("Navigating to:", path);
    if (path) {
      navigate(path);
    }
  };

  return (
    <div className="relative overflow-x-hidden bg-gray-950 font-mono">
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
      <div className="relative z-10 py-16 md:py-28 min-h-screen flex flex-col">
        {/* Game Header Banner */}
        <div className="w-full bg-gradient-to-r from-indigo-900 via-blue-800 to-indigo-900 border-b-4 border-yellow-500 shadow-lg py-4">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-yellow-400 mb-2 pixelated drop-shadow-md">
              GAME MODES
            </h1>
            <div className="h-1 w-32 mx-auto bg-yellow-500 mb-4"></div>
            <p className="text-lg text-blue-100">
              Discover different ways to play and improve your chess skills
            </p>
          </div>
        </div>

        {/* Main Content Area - Game Panel Style */}
        <div className="flex-grow px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="bg-gray-900 border-2 border-blue-700 rounded-lg p-6 shadow-lg game-panel">
              <div className="bg-blue-800 -mt-8 -mx-6 mb-6 py-2 px-4 border-b-2 border-yellow-500">
                <h2 className="text-2xl font-bold text-yellow-400 uppercase">Experience Chess Like Never Before</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                {features.map((feature, index) => (
                  <div
                    key={index}
                    onClick={() => handleFeatureClick(feature.path)}
                    onMouseEnter={() => setHoveredFeature(index)}
                    onMouseLeave={() => setHoveredFeature(null)}
                    className={`bg-gray-800 border-2 ${
                      hoveredFeature === index ? "border-yellow-500" : "border-blue-600"
                    } p-5 cursor-pointer transition-all duration-300 hover:bg-gray-700 feature-card`}
                  >
                    <div className="flex items-center mb-4">
                      <div className="mr-4 bg-blue-900 p-3 rounded-full border-2 border-yellow-500 flex items-center justify-center">
                        {feature.icon}
                        {hoveredFeature === index && (
                          <div className="absolute">
                            <Sparkles className="h-4 w-4 text-yellow-300" />
                          </div>
                        )}
                      </div>
                      <h3 className="text-xl font-bold text-yellow-400">{feature.title}</h3>
                    </div>
                    <p className="text-blue-100 mb-4">{feature.description}</p>
                    <div className="flex justify-end">
                      <button 
                        className={`px-4 py-2 flex items-center ${
                          hoveredFeature === index 
                            ? "bg-yellow-500 text-gray-900" 
                            : "bg-blue-800 text-blue-100"
                        } rounded border-2 ${
                          hoveredFeature === index 
                            ? "border-yellow-600" 
                            : "border-blue-700"
                        } transition-colors duration-300`}
                      >
                        Play Now
                        <ChevronRight className="ml-1 w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Coming Soon Section */}
            <div className="mt-8 bg-gray-900 border-2 border-blue-700 rounded-lg p-6 shadow-lg game-panel">
              <div className="bg-blue-800 -mt-8 -mx-6 mb-6 py-2 px-4 border-b-2 border-yellow-500">
                <h2 className="text-2xl font-bold text-yellow-400 uppercase">Coming Soon</h2>
              </div>
              
              <div className="bg-gray-800 border-2 border-yellow-600 p-4">
                <h3 className="text-xl font-bold text-yellow-400 uppercase mb-4">New Game Modes</h3>
                <ul className="space-y-4 text-blue-100">
                  <li className="flex items-center">
                    <div className="h-2 w-2 rounded-full bg-yellow-500 mr-2"></div>
                    <span className="font-bold text-yellow-300">Tournament Mode:</span>
                    <span className="ml-2">Compete in online tournaments with players worldwide</span>
                  </li>
                  <li className="flex items-center">
                    <div className="h-2 w-2 rounded-full bg-yellow-500 mr-2"></div>
                    <span className="font-bold text-yellow-300">Training Mode:</span>
                    <span className="ml-2">Practice specific openings and strategies with guided lessons</span>
                  </li>
                  <li className="flex items-center">
                    <div className="h-2 w-2 rounded-full bg-yellow-500 mr-2"></div>
                    <span className="font-bold text-yellow-300">Themed Challenges:</span>
                    <span className="ml-2">Special chess variants with unique rules and objectives</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action - Game Button Style */}
        <div className="w-full bg-gray-900 border-t-4 border-blue-800 py-12 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="bg-gradient-to-b from-blue-900 to-blue-950 border-4 border-yellow-500 rounded-lg p-6 shadow-lg">
              <h2 className="text-3xl font-bold text-yellow-400 mb-4 uppercase">
                Ready to Play Some Chess?
              </h2>
              
              <p className="text-blue-100 mb-8">
                Choose your preferred game mode and start playing right away.
              </p>
              
              <a
                href="/signup"
                className="inline-block px-8 py-4 bg-yellow-500 text-blue-900 text-xl font-bold uppercase rounded-lg hover:bg-yellow-400 transition-colors shadow-lg border-2 border-yellow-700 transform hover:scale-105 transition-transform"
              >
                PLAY NOW
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}