import React from "react";
import { motion } from "framer-motion";

const ReconnectModal = ({ games, onRejoin, onDecline }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full"
      >
        <h2 className="text-2xl font-bold text-white mb-4">Rejoin Game</h2>
        <p className="text-gray-300 mb-6">You have unfinished games. Would you like to rejoin one of them?</p>

        <div className="space-y-4 max-h-60 overflow-y-auto mb-6">
          {games.map((game) => {
            const lastMoveTime = new Date(game.lastMoveTime).getTime();
            const now = Date.now();
            const minutesSinceLastMove = Math.floor((now - lastMoveTime) / (1000 * 60));

            return (
              <motion.div
                key={game.gameId}
                whileHover={{ scale: 1.02 }}
                className="bg-gray-700 p-4 rounded-lg cursor-pointer"
                onClick={() => onRejoin(game.gameId)}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-white font-medium">vs. {game.opponent.username}</p>
                    <p className="text-gray-400 text-sm">
                      {minutesSinceLastMove < 60
                        ? `Last move: ${minutesSinceLastMove} minutes ago`
                        : `Last move: ${Math.floor(minutesSinceLastMove / 60)} hours ago`}
                    </p>
                  </div>
                  <button
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRejoin(game.gameId);
                    }}
                  >
                    Rejoin
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="flex justify-between">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onDecline}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Start New Game
          </motion.button>
          <p className="text-gray-400 text-sm self-center">Declining will forfeit these games</p>
        </div>
      </motion.div>
    </div>
  );
};

export default ReconnectModal;
