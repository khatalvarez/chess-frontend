import React, { useState, useEffect } from "react";
import { Users, Globe, ChevronRight } from "lucide-react";

export default function About() {
  const [activeTab, setActiveTab] = useState("story");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  
  // Basic stats
  const stats = [
    { label: "Active Players", value: "1,000+", icon: <Users size={20} className="text-blue-400" /> },
    { label: "Countries", value: "20+", icon: <Globe size={20} className="text-blue-400" /> }
  ];

  return (
    <div className="relative w-screen min-h-screen overflow-x-hidden bg-gradient-to-b from-gray-950 via-gray-900 to-black">
      {/* Background pattern for chess theme */}
      <div
        className="fixed inset-0 z-0 opacity-5"
        style={{
          backgroundImage: `linear-gradient(45deg, #111 25%, transparent 25%), 
                          linear-gradient(-45deg, #111 25%, transparent 25%), 
                          linear-gradient(45deg, transparent 75%, #111 75%), 
                          linear-gradient(-45deg, transparent 75%, #111 75%)`,
          backgroundSize: "40px 40px",
          backgroundPosition: "0 0, 0 20px, 20px -20px, -20px 0px",
        }}
        aria-hidden="true"
      ></div>

      {/* Header Section */}
      <section className="relative w-full py-16 md:py-28 overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500 mb-6">
            About Chess Master
          </h1>
          
          <p className="text-lg text-gray-300 mb-8">
            A simple chess platform created to help players practice, learn, and enjoy the game online.
          </p>
          
          {/* Tab Navigation */}
          <div className="mb-8">
            <div className="flex flex-wrap justify-center gap-2">
              {["story", "features", "creator"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeTab === tab
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                      : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                  }`}
                >
                  {tab === "story" && "About"}
                  {tab === "features" && "Features"}
                  {tab === "creator" && "Creator"}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="w-full px-4 pb-10 relative z-10">
        <div className="max-w-3xl mx-auto">
          {/* About Content */}
          {activeTab === "story" && (
            <div className="space-y-6">
              <div className="bg-gray-800/70 backdrop-blur-sm p-6 rounded-lg border border-gray-700/50 shadow-lg">
                <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-4">The Story</h2>
                <p className="mb-4 text-gray-300">
                  Chess Master started as a personal project in 2023. As a chess enthusiast myself, I wanted to create a 
                  simple platform where players could practice and improve their skills.
                </p>
                <p className="text-gray-300">
                  What began as a hobby project has slowly grown into a small community of chess players from around 
                  the world. I continue to develop and maintain the site in my spare time, adding new features based 
                  on user feedback.
                </p>
              </div>
              
              <div className="bg-gray-800/70 backdrop-blur-sm p-6 rounded-lg border border-gray-700/50 shadow-lg">
                <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-4">Chess Master Today</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  {stats.map((stat) => (
                    <div key={stat.label} className="bg-gray-700/70 p-4 rounded-lg flex flex-col items-center">
                      <div className="mb-2">
                        {stat.icon}
                      </div>
                      <div className="text-xl font-bold text-white">{stat.value}</div>
                      <div className="text-gray-400 text-sm">{stat.label}</div>
                    </div>
                  ))}
                </div>
                <p className="text-gray-300">
                  While still a modest platform, Chess Master continues to grow through word of mouth and the 
                  support of its community.
                </p>
              </div>
            </div>
          )}
          
          {/* Features Content */}
          {activeTab === "features" && (
            <div className="bg-gray-800/70 backdrop-blur-sm p-6 rounded-lg border border-gray-700/50 shadow-lg">
              <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-4">Features</h2>
              <ul className="space-y-2 pl-4 text-gray-300">
                <li className="flex items-center">
                  <div className="h-2 w-2 rounded-full bg-blue-500 mr-2"></div>
                  Play chess against a simple AI opponent
                </li>
                <li className="flex items-center">
                  <div className="h-2 w-2 rounded-full bg-purple-500 mr-2"></div>
                  Practice with chess puzzles at various difficulty levels
                </li>
                <li className="flex items-center">
                  <div className="h-2 w-2 rounded-full bg-indigo-500 mr-2"></div>
                  Learn basic openings and strategies
                </li>
                <li className="flex items-center">
                  <div className="h-2 w-2 rounded-full bg-blue-500 mr-2"></div>
                  Track your progress and see your rating change over time
                </li>
                <li className="flex items-center">
                  <div className="h-2 w-2 rounded-full bg-purple-500 mr-2"></div>
                  Challenge other players to friendly matches
                </li>
              </ul>
              
              <div className="mt-6">
                <h3 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-2">Coming Soon</h3>
                <ul className="space-y-2 pl-4 text-gray-300">
                  <li className="flex items-center">
                    <div className="h-2 w-2 rounded-full bg-blue-500 mr-2"></div>
                    More advanced AI opponents
                  </li>
                  <li className="flex items-center">
                    <div className="h-2 w-2 rounded-full bg-purple-500 mr-2"></div>
                    Analysis tools for reviewing your games
                  </li>
                  <li className="flex items-center">
                    <div className="h-2 w-2 rounded-full bg-indigo-500 mr-2"></div>
                    Mobile-friendly interface
                  </li>
                </ul>
              </div>
            </div>
          )}
          
          {/* Creator Content */}
          {activeTab === "creator" && (
            <div className="bg-gray-800/70 backdrop-blur-sm p-6 rounded-lg border border-gray-700/50 shadow-lg">
              <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-4">About the Creator</h2>
              <div className="flex flex-col sm:flex-row items-center gap-6 mb-6">
                <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-blue-600 to-purple-600 p-1">
                  <div className="bg-gray-800 rounded-full w-full h-full flex items-center justify-center">
                    <img 
                      src="/api/placeholder/128/128" 
                      alt="Creator" 
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Nargis Khatun</h3>
                  <p className="text-blue-400">Web Developer</p>
                  <p className="mt-2 text-gray-300">
                    I'm a web developer who loves chess. I created Chess Master as a way to combine my 
                    passion for programming and chess into something useful for the community.
                  </p>
                </div>
              </div>
              <p className="text-gray-300">
                I maintain Chess Master in my free time and am always open to feedback and suggestions for 
                improvements. Feel free to reach out if you have ideas or want to contribute to the project!
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="w-full py-10 px-4 bg-gradient-to-b from-gray-900 to-black relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-lg border border-gray-700/50 shadow-lg">
            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-4">
              Ready to Play Some Chess?
            </h2>
            
            <p className="text-gray-300 mb-6">
              Join our growing community of chess enthusiasts and improve your game today.
            </p>
            
            <a
              href="/signup"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors shadow-lg"
            >
              Get Started
              <ChevronRight size={16} className="ml-1" />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}