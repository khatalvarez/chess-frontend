import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Home, ArrowLeft, RefreshCw } from "lucide-react";
import ChessMasterLogo from "./ChessMasterLogo";

const NotFound = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [mounted, setMounted] = useState(false);
  const [currentPiece, setCurrentPiece] = useState(0);
  
  // Chess pieces in unicode
  const chessPieces = ["♚", "♛", "♜", "♝", "♞", "♟"];
  
  // Handle mouse movement to create subtle parallax effect
  const handleMouseMove = (e) => {
    if (!mounted) return;
    
    const { clientX, clientY } = e;
    const moveX = (clientX - window.innerWidth / 2) / 50;
    const moveY = (clientY - window.innerHeight / 2) / 50;
    
    setPosition({ x: moveX, y: moveY });
  };
  
  // Cycle through different chess pieces
  useEffect(() => {
    window.scrollTo(0, 0);
    setMounted(true);
    
    const interval = setInterval(() => {
      setCurrentPiece((prev) => (prev + 1) % chessPieces.length);
    }, 3000);
    
    return () => {
      clearInterval(interval);
      setMounted(false);
    };
  }, []);

  return (
    <div 
      className="relative w-screen min-h-screen w-full bg-gradient-to-b from-gray-950 to-black text-gray-200 flex flex-col items-center justify-center relative overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      {/* Chess board pattern background */}
      <div 
        className="absolute inset-0 opacity-5" 
        style={{
          backgroundImage: `linear-gradient(45deg, #222 25%, transparent 25%), 
                          linear-gradient(-45deg, #222 25%, transparent 25%), 
                          linear-gradient(45deg, transparent 75%, #222 75%), 
                          linear-gradient(-45deg, transparent 75%, #222 75%)`,
          backgroundSize: "40px 40px",
          backgroundPosition: "0 0, 0 20px, 20px -20px, -20px 0px",
        }}
        aria-hidden="true"
      />
      
      {/* Animated glow effects */}
      <div 
        className="absolute top-1/4 left-1/4 w-40 h-40 bg-blue-500 rounded-full filter blur-[100px] opacity-10"
        style={{ 
          transform: `translate(${position.x * 2}px, ${position.y * 2}px)` 
        }}
        aria-hidden="true" 
      />
      <div 
        className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-purple-500 rounded-full filter blur-[100px] opacity-10"
        style={{ 
          transform: `translate(${-position.x * 2}px, ${-position.y * 2}px)` 
        }}
        aria-hidden="true" 
      />
      
      {/* Logo */}
      <div className="mb-8">
        <Link to="/">
          <ChessMasterLogo variant="footer" />
        </Link>
      </div>
      
      {/* Main content */}
      <div className="text-center max-w-md px-6 relative z-10">
        <div className="mb-6">
          <span 
            className="text-8xl block mb-2"
            style={{ 
              transform: `translate(${position.x * 1.5}px, ${position.y * 1.5}px)` 
            }}
          >
            {chessPieces[currentPiece]}
          </span>
          <h1 className="text-5xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            404
          </h1>
          <h2 className="text-xl mb-4">Page Not Found</h2>
        </div>
        
        <p className="text-gray-400 mb-8">
          This move is invalid. The page you're looking for has been captured or doesn't exist.
        </p>
        
        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link
            to="/"
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-md flex items-center justify-center transition-all"
          >
            <Home size={18} className="mr-2" />
            Back to Home
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="bg-gray-800 hover:bg-gray-700 text-gray-200 px-6 py-3 rounded-md flex items-center justify-center transition-all"
          >
            <ArrowLeft size={18} className="mr-2" />
            Go Back
          </button>
        </div>
      </div>
      
      {/* Floating chess pieces */}
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="absolute text-2xl text-gray-600 opacity-40"
          style={{
            top: `${10 + Math.random() * 80}%`,
            left: `${10 + Math.random() * 80}%`,
            transform: `translate(${position.x * (i + 1)}px, ${position.y * (i + 1)}px) rotate(${i * 45}deg)`,
            animation: `float ${5 + i}s ease-in-out infinite alternate`,
          }}
          aria-hidden="true"
        >
          {chessPieces[i % chessPieces.length]}
        </div>
      ))}
      
      {/* Add keyframes for floating animation */}
      <style jsx="true">{`
        @keyframes float {
          0% { transform: translateY(0px) rotate(0deg); }
          100% { transform: translateY(-20px) rotate(10deg); }
        }
      `}</style>
    </div>
  );
};  

export default NotFound;