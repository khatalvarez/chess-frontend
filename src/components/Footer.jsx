import React, { useState } from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import {  
  Crown, 
  Book, 
  Users, 
  Mail, 
  Github, 
  Twitter, 
  Youtube, 
  Linkedin,
  ChevronRight
} from "lucide-react"
import ChessMasterLogo from "./ChessMasterLogo"

export default function Footer() {
  const currentYear = new Date().getFullYear()
  const [hoveredSection, setHoveredSection] = useState(null)
  const [emailInput, setEmailInput] = useState("itxnargiskhatun@gmail.com")
  const [subscriptionStatus, setSubscriptionStatus] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }
  
  const footerLinks = [
    {
      id: "game-modes",
      title: "Game Modes",
      icon: <Crown size={18} className="text-blue-400" />,
      links: [
        { name: "Play Online", path: "/modeselector" },
        { name: "Daily Puzzles", path: "/puzzle" },
        { name: "vs Computer", path: "/against-stockfish" },
        { name: "Tournament", path: "/tournament" }
      ]
    },
    {
      id: "learn",
      title: "Learn",
      icon: <Book size={18} className="text-purple-400" />,
      links: [
        { name: "Tutorials", path: "/tutorials" },
        { name: "Strategies", path: "/strategies" },
        { name: "Opening Database", path: "/openings" },
        { name: "Video Lessons", path: "/lessons" }
      ]
    },
    {
      id: "community",
      title: "Community",
      icon: <Users size={18} className="text-indigo-400" />,
      links: [
        { name: "About Us", path: "/about" },
        { name: "Contact", path: "/contact" },
        { name: "Privacy Policy", path: "/privacy" },
        { name: "Terms of Use", path: "/terms" }
      ]
    }
  ]
  
  const socialLinks = [
    { name: "GitHub", icon: <Github size={20} />, link: "https://github.com/itxnargis" },
    { name: "Twitter", icon: <Twitter size={20} />, link: "https://twitter.com/81283nargis" },
    { name: "LinkedIn", icon: <Linkedin size={20} />, link: "https://www.linkedin.com/in/nargis-khatun-4008ab2a9/" },
    { name: "YouTube", icon: <Youtube size={20} />, link: "https://youtube.com" }
  ]

  const handleEmailSubmit = async (e) => {
    e.preventDefault()
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(emailInput)) {
      setSubscriptionStatus({
        success: false,
        message: "Please enter a valid email address"
      })
      return
    }
    
    setIsSubmitting(true)
    
    try {
      // Simulating an API call to a newsletter service
      // In a real implementation, you would replace this with your actual API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      console.log("Email submitted:", emailInput)
      
      // Set success status
      setSubscriptionStatus({
        success: true,
        message: "Thank you for subscribing to our newsletter!"
      })
      
      // Clear input after successful submission
      setEmailInput("")
    } catch (error) {
      console.error("Newsletter subscription failed:", error)
      setSubscriptionStatus({
        success: false,
        message: "Subscription failed. Please try again later."
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <motion.footer 
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      className="relative w-full overflow-hidden bg-gradient-to-b from-gray-950 to-black text-gray-300 pt-8 pb-6"
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
      <motion.div 
        className="absolute top-0 left-1/4 w-40 h-40 bg-blue-500 rounded-full filter blur-[100px] opacity-10" 
        animate={{
          opacity: [0.05, 0.1, 0.05],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 8, 
          repeat: Infinity,
          repeatType: "reverse"
        }}
        aria-hidden="true" 
      />
      <motion.div 
        className="absolute bottom-0 right-1/4 w-40 h-40 bg-purple-500 rounded-full filter blur-[100px] opacity-10"
        animate={{
          opacity: [0.05, 0.1, 0.05],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 7, 
          delay: 1,
          repeat: Infinity,
          repeatType: "reverse"
        }}
        aria-hidden="true" 
      />
      
      <div className="w-full max-w-6xl mx-auto px-4 relative z-10">
        {/* Top section with logo and description */}
        <div className="w-full flex flex-col mb-8 pb-8 border-b border-gray-800/50">
          <motion.div 
            variants={fadeIn}
            transition={{ duration: 0.6 }}
            className="w-full"
          >
            <Link to="/" className="inline-block">
              <ChessMasterLogo variant="footer" />
            </Link>
            <p className="mt-4 text-gray-400 leading-relaxed max-w-lg">
              Chess Master offers the ultimate chess experience with multiple game modes,
              skill levels, and a global community of players dedicated to the royal game.
            </p>
          </motion.div>
          
          {/* Newsletter signup */}
          <motion.div
            variants={fadeIn}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="w-full mt-6"
          >
            <h4 className="text-gray-200 font-medium mb-3 flex items-center">
              <Mail size={16} className="mr-2 text-blue-400" />
              Stay Updated
            </h4>
            <form onSubmit={handleEmailSubmit} className="relative max-w-md">
              <div className="flex mt-2">
                <input 
                  type="email" 
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="Your email" 
                  className="bg-gray-900/70 border border-gray-700 rounded-l-md px-4 py-2 w-full mr-2 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300"
                  aria-label="Email for newsletter"
                  required
                />
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className={`relative bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 rounded-r-md ${isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:from-blue-700 hover:to-purple-700'}`}
                >
                  {isSubmitting ? 
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Joining...
                    </span> 
                    : 'Join'
                  }
                </button>
              </div>
              
              {subscriptionStatus && (
                <p className={`text-sm mt-2 ${subscriptionStatus.success ? 'text-green-500' : 'text-red-500'}`}>
                  {subscriptionStatus.message}
                </p>
              )}
              
              <p className="text-xs mt-2 text-gray-500">
                Stay up to date with tournaments and special events
              </p>
            </form>
          </motion.div>
        </div>
        
        {/* Navigation links */}
        <div className="w-full mb-8 pb-8 border-b border-gray-800/50">
          <motion.div 
            variants={fadeIn}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8"
          >
            {footerLinks.map((section) => (
              <motion.div 
                key={section.id}
                onMouseEnter={() => setHoveredSection(section.id)}
                onMouseLeave={() => setHoveredSection(null)}
                className="w-full"
              >
                <h3 className="text-gray-100 font-medium mb-4 flex items-center">
                  <span className="mr-2">{section.icon}</span>
                  {section.title}
                </h3>
                <ul className="space-y-2">
                  {section.links.map((link) => (
                    <li key={link.name}>
                      <Link 
                        to={link.path} 
                        className="hover:text-blue-400 transition-colors flex items-center group"
                        aria-label={link.name}
                      >
                        <span className="h-[2px] bg-blue-400 mr-2 inline-block w-0 group-hover:w-2 opacity-0 group-hover:opacity-100 transition-all" />
                        {link.name}
                        <span className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <ChevronRight size={14} className="text-blue-400" />
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </motion.div>
        </div>
        
        {/* Bottom section with social links and copyright */}
        <div className="w-full flex flex-col sm:flex-row justify-between items-center space-y-6 sm:space-y-0">
          <div className="flex flex-wrap justify-center gap-6">
            {socialLinks.map((social) => (
              <a 
                key={social.name}
                href={social.link}
                target="_blank"
                rel="noreferrer"
                aria-label={`Follow us on ${social.name}`}
                className="text-gray-400 hover:text-blue-400 transition-colors"
              >
                {social.icon}
              </a>
            ))}
          </div>
          
          <div className="text-sm text-gray-500 text-center sm:text-right">
            <div className="flex items-center justify-center">
              <span className="mr-2 text-gray-400" aria-hidden="true">♟</span>
              <p>&copy; {currentYear} Chess Master. All rights reserved.</p>
            </div>
          </div>
        </div>
        
        {/* Chess piece accent at bottom */}
        <div className="w-full flex justify-center mt-6 overflow-hidden">
          <div className="chess-piece-row text-base opacity-20 tracking-widest relative" aria-hidden="true">
            ♜ ♞ ♝ ♛ ♚ ♝ ♞ ♜ ♟ ♟ ♟ ♟
          </div>
        </div>
      </div>
    </motion.footer>
  )
}