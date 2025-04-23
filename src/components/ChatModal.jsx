import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Send, X } from "lucide-react";

const ChatModal = ({ isOpen, onClose, messages, onSendMessage, currentUser }) => {
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      onSendMessage(newMessage);
      setNewMessage("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-gray-800 rounded-lg shadow-lg max-w-md w-full max-h-[80vh] flex flex-col"
      >
        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
          <h3 className="text-xl font-semibold text-white">Chat with Opponent</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[300px] max-h-[50vh]">
          {messages.length === 0 ? (
            <p className="text-gray-400 text-center italic">No messages yet. Say hello!</p>
          ) : (
            messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.sender === currentUser.userId ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    msg.sender === currentUser.userId ? "bg-blue-600 text-white" : "bg-gray-700 text-white"
                  }`}
                >
                  <p className="text-sm font-semibold">{msg.sender === currentUser.userId ? "You" : msg.senderName}</p>
                  <p>{msg.message}</p>
                  <p className="text-xs opacity-70 text-right mt-1">
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-3 border-t border-gray-700">
          <div className="flex">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Type a message..."
              className="flex-1 bg-gray-700 text-white rounded-l-lg p-2 outline-none resize-none"
              rows={2}
            />
            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-r-lg px-4 flex items-center justify-center"
            >
              <Send size={20} />
            </button>
          </div>
          <p className="text-gray-400 text-xs mt-1">Press Enter to send, Shift+Enter for new line</p>
        </div>
      </motion.div>
    </div>
  );
};

export default ChatModal;
