import { motion } from "framer-motion"

const ReconnectModal = ({ game, onRejoin, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3 text-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Reconnect to Game?</h3>
          <div className="mt-2 px-7 py-3">
            <p className="text-sm text-gray-500">
              It looks like you were disconnected from the game. Would you like to rejoin?
            </p>
          </div>
          <div className="items-center px-4 py-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 bg-green-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-300"
              onClick={(e) => {
                e.stopPropagation()
                onRejoin(game.gameId)
              }}
            >
              Rejoin Game
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="mt-2 px-4 py-2 bg-red-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-300"
              onClick={onCancel}
            >
              Cancel
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReconnectModal
