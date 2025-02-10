import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import bg from "../assets/images/bgprofile.jpg";

const GameOverModal = ({ isOpen, message, onRestart }) => {
  useEffect(() => {
    if (isOpen && message.toLowerCase().includes("win")) {
      const count = 150;
      const defaults = {
        origin: { y: 0.7 },
        colors: ['#FFD700', '#C0C0C0', '#000000', '#FFFFFF'], // gold, silver, black, white
      };

      // Burst of confetti for a win
      confetti({
        ...defaults,
        particleCount: count,
        spread: 120,
      });

      setTimeout(() => {
        confetti({
          ...defaults,
          particleCount: count,
          spread: 120,
          startVelocity: 45,
        });
      }, 500);
    }
  }, [isOpen, message]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-70">
        <motion.div
          className="w-screen min-h-screen flex items-center justify-center py-16 bg-gray-900 "
          style={{
            backgroundImage: `url(${bg})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Modal container with dark blue gradient & gold border */}
          <motion.div
            className="relative bg-gradient-to-br from-[#1E3A8A] to-[#1E40AF] rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 border border-yellow-400 overflow-hidden"
            initial={{ scale: 0.8, y: 50, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.8, y: 50, opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          >
            {/* Subtle Chessboard Overlay */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <div className="grid grid-cols-8 grid-rows-8 w-full h-full">
                {Array.from({ length: 64 }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-full h-full ${
                      ((Math.floor(i / 8) + (i % 8)) % 2 === 0)
                        ? "bg-black"
                        : "bg-white"
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="relative flex flex-col items-center">
              {/* Animated Chess Piece Icon */}
              <div className="text-6xl mb-4">
                {message.toLowerCase().includes("win") ? "♔" : "♚"}
              </div>

              <h2 className="text-3xl font-extrabold text-red-600 mb-4 text-center uppercase tracking-wider drop-shadow-lg">
                {message}
              </h2>

              <p className="text-lg text-gray-300 mb-8 text-center italic">
                {message.toLowerCase().includes("win")
                  ? "Victory is sweet, but the game awaits your next challenge."
                  : "Defeat is just another step toward mastery. Try again?"}
              </p>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onRestart}
                className="relative z-10 w-full py-3 px-6 bg-gradient-to-r from-yellow-500 to-yellow-300 rounded-full text-xl font-semibold text-gray-900 shadow-lg hover:shadow-xl transition duration-200"
              >
                Play Again
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default GameOverModal;
