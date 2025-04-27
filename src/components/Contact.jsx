import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { 
  Mail, 
  MessageSquare, 
  User, 
  Send, 
  MapPin, 
  PhoneCall, 
  Clock,
  CheckCircle,
  AlertCircle,
  Github,
  Twitter,
  Linkedin,
  Youtube,
  ChevronDown,
  ChevronUp
} from "lucide-react"
import ChessMasterLogo from "./ChessMasterLogo"

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })
  const [formStatus, setFormStatus] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [navbarHeight, setNavbarHeight] = useState(0)
  const [devicePerformance, setDevicePerformance] = useState('high')
  const [particles, setParticles] = useState([])
  const [expandedFaq, setExpandedFaq] = useState(null)

   useEffect(() => {
      window.scrollTo(0, 0);
    }, []);

  // Social links data
  const socialLinks = [
    { name: "GitHub", icon: <Github size={20} />, link: "https://github.com/itxnargis" },
    { name: "Twitter", icon: <Twitter size={20} />, link: "https://twitter.com/81283nargis" },
    { name: "LinkedIn", icon: <Linkedin size={20} />, link: "https://www.linkedin.com/in/nargis-khatun-4008ab2a9/" },
    { name: "YouTube", icon: <Youtube size={20} />, link: "https://youtube.com" }
  ]

  // FAQ data
  const faqItems = [
    {
      id: 1,
      question: "How do I report a bug in the game?",
      answer: "You can report bugs through our support system by clicking on \"Help\" in the main menu or by emailing support@chessmaster.com with details of the issue you encountered."
    },
    {
      id: 2,
      question: "How can I suggest a new feature?",
      answer: "We welcome your ideas! Send your feature suggestions to ideas@chessmaster.com or use the \"Feedback\" option in your account settings."
    },
    {
      id: 3,
      question: "Can I change my username?",
      answer: "Yes, premium users can change their username once every 30 days in account settings. Free users should contact support for assistance."
    },
    {
      id: 4,
      question: "How do I recover my password?",
      answer: "On the login page, click \"Forgot Password\" and follow the instructions sent to your registered email. If you can't access your email, contact our support team."
    }
  ]

  // Device performance detection
  useEffect(() => {
    const isMobile = window.innerWidth < 768
    const isLowMemory = navigator.deviceMemory && navigator.deviceMemory < 4
    
    if (isMobile || isLowMemory) {
      setDevicePerformance('low')
    }
  }, [])

  // Detect navbar height
  useEffect(() => {
    const updateNavbarHeight = () => {
      const navbar = document.querySelector("nav")
      if (navbar) {
        setNavbarHeight(navbar.offsetHeight)
      }
    }

    updateNavbarHeight()
    window.addEventListener("resize", updateNavbarHeight)
    const timer = setTimeout(updateNavbarHeight, 500)

    return () => {
      window.removeEventListener("resize", updateNavbarHeight)
      clearTimeout(timer)
    }
  }, [])

  // Generate particles based on device performance
  useEffect(() => {
    const isMobile = window.innerWidth < 768
    const particleCount = devicePerformance === 'low' ? 10 : isMobile ? 20 : 40
    
    const newParticles = []
    for (let i = 0; i < particleCount; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * (isMobile ? 2 : 4) + 1,
        speed: Math.random() * 1 + 0.5,
        color:
          Math.random() > 0.5
            ? `rgba(59, 130, 246, ${Math.random() * 0.3 + 0.1})`
            : `rgba(139, 92, 246, ${Math.random() * 0.3 + 0.1})`,
      })
    }
    setParticles(newParticles)
  }, [devicePerformance])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Basic form validation
    if (!formData.name || !formData.email || !formData.message) {
      setFormStatus({
        success: false,
        message: "Please fill out all required fields."
      })
      setIsSubmitting(false)
      return
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setFormStatus({
        success: false,
        message: "Please enter a valid email address."
      })
      setIsSubmitting(false)
      return
    }

    try {
      // Simulating an API call to handle form submission
      // In a real implementation, you would replace this with your actual API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      console.log("Form submitted:", formData)
      
      // Set success status
      setFormStatus({
        success: true,
        message: "Thank you for your message! We'll get back to you soon."
      })
      
      // Clear form after successful submission
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      })
    } catch (error) {
      console.error("Form submission failed:", error)
      setFormStatus({
        success: false,
        message: "Message could not be sent. Please try again later."
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleFaq = (id) => {
    setExpandedFaq(expandedFaq === id ? null : id)
  }

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  return (
    <div className="relative w-screen min-h-screen overflow-x-hidden bg-gradient-to-b from-gray-950 via-gray-900 to-black">
      {/* Add Meta Tags for SEO */}
      {/* <MetaTags title="Contact Us - Chess Master" description="Get in touch with the Chess Master team. We're here to help with your questions, feedback, and support needs." /> */}
      
      {/* Chess board pattern background */}
      <div
        className="fixed inset-0 z-0 opacity-5"
        style={{
          backgroundImage: `linear-gradient(45deg, #111 25%, transparent 25%), 
                            linear-gradient(-45deg, #111 25%, transparent 25%), 
                            linear-gradient(45deg, transparent 75%, #111 75%), 
                            linear-gradient(-45deg, transparent 75%, #111 75%)`,
          backgroundSize: devicePerformance === 'low' ? "60px 60px" : "40px 40px",
          backgroundPosition: "0 0, 0 20px, 20px -20px, -20px 0px",
        }}
        aria-hidden="true"
      ></div>

      {/* Animated particles */}
      {devicePerformance !== 'low' && (
        <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none" aria-hidden="true">
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              className="absolute rounded-full"
              style={{
                backgroundColor: particle.color,
                boxShadow: `0 0 ${particle.size * 2}px ${particle.color.replace(")", ", 0.8)")}`,
                width: `${particle.size}px`,
                height: `${particle.size}px`,
              }}
              initial={{
                x: `${particle.x}vw`,
                y: `${particle.y}vh`,
                opacity: 0,
              }}
              animate={{
                y: [`${particle.y}vh`, `${(particle.y + 20) % 100}vh`, `${particle.y}vh`],
                opacity: [0, 0.7, 0],
              }}
              transition={{
                duration: 10 / particle.speed,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      )}

      {/* Main content */}
      <main 
        className="relative z-10 pt-8 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
        style={{ paddingTop: `calc(${navbarHeight}px + 2rem)` }}
      >
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center justify-center mb-12"
        >
          <div className="inline-block mb-4">
            <ChessMasterLogo variant="small" />
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500 mb-4 text-center">
            Contact Us
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl text-center">
            Have questions or feedback about Chess Master? We're here to help.
            Get in touch with our team and we'll respond as soon as possible.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-full"
          >
            <div 
              className="bg-gray-900/60 backdrop-blur-md rounded-2xl p-6 sm:p-8 border border-gray-800/50 shadow-xl"
              style={{
                boxShadow: "0 10px 30px -10px rgba(59, 130, 246, 0.2), 0 0 8px rgba(139, 92, 246, 0.3)",
              }}
            >
              <h2 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400 mb-6">
                Send Us a Message
              </h2>
              
              {formStatus && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mb-6 p-4 rounded-lg flex items-start ${
                    formStatus.success 
                      ? "bg-green-900/30 border border-green-700/50 text-green-400" 
                      : "bg-red-900/30 border border-red-700/50 text-red-400"
                  }`}
                >
                  {formStatus.success ? (
                    <CheckCircle size={20} className="mr-3 mt-0.5 flex-shrink-0" />
                  ) : (
                    <AlertCircle size={20} className="mr-3 mt-0.5 flex-shrink-0" />
                  )}
                  <p>{formStatus.message}</p>
                </motion.div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-gray-200 font-medium mb-2 flex items-center">
                    <User size={16} className="mr-2 text-blue-400" />
                    Your Name <span className="text-blue-500 ml-1">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300 text-white"
                    placeholder="John Doe"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-gray-200 font-medium mb-2 flex items-center">
                    <Mail size={16} className="mr-2 text-blue-400" />
                    Your Email <span className="text-blue-500 ml-1">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300 text-white"
                    placeholder="john@example.com"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="subject" className="block text-gray-200 font-medium mb-2 flex items-center">
                    <MessageSquare size={16} className="mr-2 text-blue-400" />
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300 text-white"
                    placeholder="How can we help you?"
                  />
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-gray-200 font-medium mb-2 flex items-center">
                    <MessageSquare size={16} className="mr-2 text-blue-400" />
                    Your Message <span className="text-blue-500 ml-1">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows="5"
                    className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300 text-white"
                    placeholder="Type your message here..."
                    required
                  ></textarea>
                </div>
                
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full relative bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg py-3 px-4 font-medium transition-all duration-300 ${
                      isSubmitting ? "opacity-70 cursor-not-allowed" : "hover:from-blue-700 hover:to-purple-700"
                    }`}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Sending...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center">
                        <Send size={18} className="mr-2" />
                        Send Message
                      </span>
                    )}

                  </button>
                </motion.div>
              </form>
            </div>
          </motion.div>

          {/* Contact Information - UPDATED WITH SOCIAL LINKS */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="w-full"
          >
            <div
              className="bg-gray-900/60 backdrop-blur-md rounded-2xl p-6 sm:p-8 border border-gray-800/50 shadow-xl h-full"
              style={{
                boxShadow: "0 10px 30px -10px rgba(139, 92, 246, 0.2), 0 0 8px rgba(59, 130, 246, 0.3)",
              }}
            >
              <h2 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400 mb-6">
                Connect With Me
              </h2>
              
              <div className="space-y-6">
                {/* Location Information */}
                <div className="flex items-start">
                  <div className="flex-shrink-0 bg-purple-500/20 p-3 rounded-full mr-4">
                    <MapPin size={24} className="text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-200 mb-1">My Location</h3>
                    <p className="text-gray-400">
                      New York, NY 10001<br />
                      United States
                    </p>
                  </div>
                </div>
                
                {/* Email Information */}
                <div className="flex items-start">
                  <div className="flex-shrink-0 bg-blue-500/20 p-3 rounded-full mr-4">
                    <Mail size={24} className="text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-200 mb-1">Email Me</h3>
                    <p className="text-gray-400">
                      <a href="mailto:contact@example.com" className="text-blue-400 hover:underline">contact@example.com</a>
                    </p>
                  </div>
                </div>
                
                {/* Social Links */}
                <div>
                  <h3 className="text-xl font-semibold text-gray-200 mb-4">Follow Me</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {socialLinks.map((social, index) => (
                      <a 
                        key={index}
                        href={social.link}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center p-3 bg-gray-800/50 rounded-lg border border-gray-700/50 hover:bg-gray-700/50 transition-colors duration-300"
                      >
                        <div className="mr-3 text-blue-400">
                          {social.icon}
                        </div>
                        <span className="text-gray-300">{social.name}</span>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Map placeholder */}
              <div className="mt-8 rounded-lg overflow-hidden border border-gray-700/50">
                <div className="bg-gray-800/50 h-64 w-full flex items-center justify-center">
                  <div className="text-center px-4">
                    <div className="mb-3 text-blue-400">
                      <MapPin size={32} className="inline-block" />
                    </div>
                    <p className="text-gray-300 mb-2">
                      Interactive map would be displayed here
                    </p>
                    <a 
                      href="https://maps.google.com" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:underline inline-flex items-center"
                    >
                      View on Google Maps
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* FAQ Section - UPDATED WITH ACCORDION */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeIn}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-16 bg-gray-900/60 backdrop-blur-md rounded-2xl p-6 sm:p-8 border border-gray-800/50 shadow-xl"
          style={{
            boxShadow: "0 10px 30px -10px rgba(99, 102, 241, 0.2), 0 0 8px rgba(79, 70, 229, 0.3)",
          }}
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-blue-400 mb-8 text-center">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-4">
            {faqItems.map((item) => (
              <div 
                key={item.id}
                className="bg-gray-800/40 rounded-xl border border-gray-700/50 overflow-hidden"
              >
                <button
                  onClick={() => toggleFaq(item.id)}
                  className="w-full px-5 py-4 flex justify-between items-center text-left focus:outline-none"
                >
                  <h3 className="text-xl font-semibold text-gray-100">
                    {item.question}
                  </h3>
                  <div className="text-blue-400 flex-shrink-0 ml-4">
                    {expandedFaq === item.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </div>
                </button>
                
                {expandedFaq === item.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="px-5 pb-4"
                  >
                    <div className="border-t border-gray-700/50 pt-3 mt-1">
                      <p className="text-gray-400">{item.answer}</p>
                    </div>
                  </motion.div>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      </main>

    </div>
  )
}