import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const AnimatedComponents = () => {
  const [typedText, setTypedText] = useState("")
  const fullText = "Welcome to Chess Master"
  
  // Move the typing animation here
  useEffect(() => {
    // Don't replace the heading immediately - wait until animation is ready
    // to prevent flashing/disappearing content
    const headingElement = document.getElementById('heading-text')
    
    // Start typing with a slight delay to ensure the page is stabilized
    let startDelay = setTimeout(() => {
      if (headingElement) {
        headingElement.textContent = ''
      }
      
      let index = 0
      const typingInterval = setInterval(() => {
        if (index < fullText.length) {
          setTypedText((prev) => prev + fullText.charAt(index))
          index++
        } else {
          clearInterval(typingInterval)
        }
      }, 100)
      
      return () => clearInterval(typingInterval)
    }, 300)
    
    return () => clearTimeout(startDelay)
  }, [])
  
  return (
    <>
      {/* Animations for the heading */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="absolute top-0 left-0 w-full h-full pointer-events-none"
      >
        <div className="h-20 mb-6 flex justify-center items-center">
          <h1 className="text-4xl sm:text-5xl text-center font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">
            {typedText}
            <AnimatePresence>
              {typedText.length < fullText.length && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="inline-block w-1 h-8 ml-1 bg-green-400"
                />
              )}
            </AnimatePresence>
          </h1>
        </div>
      </motion.div>
    </>
  )
}

export default AnimatedComponents