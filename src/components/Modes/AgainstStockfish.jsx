"use client"

import { useEffect, useRef, useState } from "react"
import { Chess } from "chess.js"
import Chessboard from "chessboardjs"
import axios from "axios"
import { Howl } from "howler"
import { motion } from "framer-motion"
import confetti from "canvas-confetti"
import { Award, Shield, RotateCcw, Volume2, VolumeX, HelpCircle } from "lucide-react"
import pieceImages from "../pieceImages"
import moveSoundFile from "../../assets/sounds/move.mp3"
import captureSoundFile from "../../assets/sounds/capture.mp3"
import checkSoundFile from "../../assets/sounds/check.mp3"
import checkmateSoundFile from "../../assets/sounds/checkmate.mp3"
import { BASE_URL } from "../../url"
import GameOverModal from "../GameOverModal"
import HelpModal from "./HelpModal"

// Add these styles for better mobile responsiveness
const styles = {
  container: `relative w-screen min-h-screen overflow-x-hidden bg-gray-950 font-mono`,
  chessboardContainer: `relative backdrop-blur-sm bg-black/30 p-2 sm:p-4 rounded-lg border-2 border-blue-600`,
  chessboard: `w-full max-width-none mx-auto`,
  mobileInfo: `mt-4 p-3 bg-black/50 text-white text-center rounded-lg border border-blue-600 text-sm`,
  gamePanel: `h-full flex flex-col`,
  movesList: `bg-black/30 rounded-lg p-2 max-h-[200px] sm:max-h-[300px] overflow-y-auto border-2 border-blue-600`,
  controlsContainer: `mt-4 flex flex-wrap justify-center gap-2 sm:gap-3`,
  controlButton: `text-xs sm:text-sm px-2 sm:px-4 py-1 sm:py-2 rounded-md font-semibold shadow-md flex items-center gap-1 sm:gap-2`,
}

const moveSound = new Howl({ src: [moveSoundFile] })
const captureSound = new Howl({ src: [captureSoundFile] })
const checkSound = new Howl({ src: [checkSoundFile] })
const checkmateSound = new Howl({ src: [checkmateSoundFile] })

const debounce = (func, delay) => {
  let timeoutId
  return (...args) => {
    if (timeoutId) clearTimeout(timeoutId)
    timeoutId = setTimeout(() => {
      func(...args)
    }, delay)
  }
}

const AgainstStockfish = () => {
  const fetchBestMove = async (FEN) => {
    try {
      const response = await axios.get(`${BASE_URL}/stockfish`, {
        params: {
          fen: FEN,
          depth: 10,
        },
      })
      console.log("Response from server:", response.data)
      return response.data.bestMove
    } catch (error) {
      console.error("Error fetching move from stockfish:", error)
      return null
    }
  }

  const chessRef = useRef(null)
  const boardRef = useRef(null)
  const [currentStatus, setCurrentStatus] = useState(null)
  const [moves, setMoves] = useState([])
  const gameRef = useRef(new Chess())
  const [promotionPiece, setPromotionPiece] = useState("q")
  const [isGameOver, setIsGameOver] = useState(false)
  const [gameOverMessage, setGameOverMessage] = useState("")
  const [mobileMode, setMobileMode] = useState(false)
  const [visualHints, setVisualHints] = useState(true)
  const [theme, setTheme] = useState("forest")
  const [showMovesList, setShowMovesList] = useState(false)
  const [lastMove, setLastMove] = useState(null)
  const [selectedSquare, setSelectedSquare] = useState(null)
  const [possibleMoves, setPossibleMoves] = useState([])
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [showHelpModal, setShowHelpModal] = useState(false)
  const [boardInitialized, setBoardInitialized] = useState(false)

  useEffect(() => {
    window.scrollTo(0, 0)
    document.title = "Chess Master: Play Against Stockfish | Improve Your Chess Skills Online"

    let metaDescription = document.querySelector('meta[name="description"]')
    if (!metaDescription) {
      metaDescription = document.createElement("meta")
      metaDescription.name = "description"
      document.head.appendChild(metaDescription)
    }
    metaDescription.content =
      "Challenge the Stockfish chess engine and improve your skills. Adjust difficulty levels and track your progress in this interactive chess game."

    let canonicalLink = document.querySelector('link[rel="canonical"]')
    if (!canonicalLink) {
      canonicalLink = document.createElement("link")
      canonicalLink.rel = "canonical"
      document.head.appendChild(canonicalLink)
    }
    canonicalLink.href = window.location.origin + "/stockfish"

    const structuredData = {
      "@context": "https://schema.org",
      "@type": "Game",
      name: "Chess Master - Play Against Stockfish",
      description:
        "Challenge the Stockfish chess engine and improve your skills. Adjust difficulty levels and track your progress in this interactive chess game.",
      genre: "Board Game",
      gamePlatform: "Web Browser",
      applicationCategory: "GameApplication",
    }

    let scriptTag = document.querySelector('script[type="application/ld+json"]')
    if (!scriptTag) {
      scriptTag = document.createElement("script")
      scriptTag.type = "application/ld+json"
      document.head.appendChild(scriptTag)
    }
    scriptTag.textContent = JSON.stringify(structuredData)

    return () => {
      document.title = "Chess Master | Online Chess Training & Games"
    }
  }, [])

  const handleCheckboxChange = () => {
    setMobileMode((prev) => {
      const newMode = !prev

      if (newMode) {
        document.body.style.overflow = "hidden"
        document.documentElement.style.overflow = "hidden"
        document.body.style.position = "fixed"
        document.body.style.touchAction = "none"
      } else {
        document.body.style.overflow = "auto"
        document.documentElement.style.overflow = "auto"
        document.body.style.position = "static"
        document.body.style.touchAction = "auto"
      }
      return newMode
    })
  }

  const removeHighlights = () => {
    const squares = document.querySelectorAll(".square-55d63")
    squares.forEach((square) => {
      square.classList.remove("highlight-square", "possible-move", "last-move")
      square.style.background = ""
    })
  }

  const highlightSquare = (square, type = "highlight") => {
    const squareEl = document.querySelector(`.square-${square}`)
    if (squareEl) {
      if (type === "highlight") {
        squareEl.classList.add("highlight-square")
      } else if (type === "possible") {
        squareEl.classList.add("possible-move")
      } else if (type === "last-move") {
        squareEl.classList.add("last-move")
      }
    }
  }

  const highlightLastMove = (from, to) => {
    if (!visualHints) return

    removeHighlights()
    highlightSquare(from, "last-move")
    highlightSquare(to, "last-move")
    setLastMove({ from, to })
  }

  const triggerWinCelebration = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#ffb347", "#ffcc33", "#fff"],
    })
  }

  const playSound = (sound) => {
    if (soundEnabled) {
      sound.play()
    }
  }

  useEffect(() => {
    const game = gameRef.current

    const onDragStart = (source, piece, position, orientation) => {
      if (game.isGameOver()) {
        return false
      }

      if (game.turn() === "b") {
        return false
      }

      if ((game.turn() === "w" && piece.search(/^b/) !== -1) || (game.turn() === "b" && piece.search(/^w/) !== -1)) {
        return false
      }

      if (visualHints) {
        removeHighlights()
        highlightSquare(source)

        const moves = game.moves({
          square: source,
          verbose: true,
        })

        for (let i = 0; i < moves.length; i++) {
          highlightSquare(moves[i].to, "possible")
        }
      }
    }

    const onDrop = async (source, target) => {
      removeHighlights()

      let move = game.move({
        from: source,
        to: target,
        promotion: promotionPiece,
      })

      if (move === null) return "snapback"

      setMoves((prevMoves) => [...prevMoves, { from: move.from, to: move.to }])

      highlightLastMove(source, target)

      if (move.captured) {
        playSound(captureSound)
      } else {
        playSound(moveSound)
      }

      updateStatus()

      if (game.turn() === "b" && !game.isGameOver()) {
        try {
          const fen = game.fen()
          console.log(fen)

          const bestMoveResponse = await fetchBestMove(fen)

          if (bestMoveResponse) {
            console.log(bestMoveResponse)
            const bestMove = bestMoveResponse.split(" ")[1].trim()

            move = game.move({
              from: bestMove.slice(0, 2),
              to: bestMove.slice(2, 4),
              promotion: promotionPiece,
            })

            if (move !== null) {
              setMoves((prevMoves) => [...prevMoves, { from: move.from, to: move.to }])
              boardRef.current.position(game.fen())

              highlightLastMove(bestMove.slice(0, 2), bestMove.slice(2, 4))

              if (move.captured) {
                playSound(captureSound)
              } else {
                playSound(moveSound)
              }

              updateStatus()
            }
          }
        } catch (error) {
          console.error("Error fetching move from stockfish:", error)
        }
      }
    }

    const onMouseoverSquare = (square, piece) => {
      if (!visualHints) return

      const moves = game.moves({
        square: square,
        verbose: true,
      })

      if (moves.length === 0) return

      highlightSquare(square)

      for (let i = 0; i < moves.length; i++) {
        highlightSquare(moves[i].to, "possible")
      }
    }

    const onMouseoutSquare = (square, piece) => {
      if (!visualHints) return

      if (lastMove) {
        removeHighlights()
        highlightSquare(lastMove.from, "last-move")
        highlightSquare(lastMove.to, "last-move")
      } else {
        removeHighlights()
      }
    }

    const onSnapEnd = () => {
      boardRef.current.position(game.fen())
    }

    const config = {
      draggable: !mobileMode,
      position: "start",
      onDragStart: onDragStart,
      onDrop: onDrop,
      onMouseoverSquare: onMouseoverSquare,
      onMouseoutSquare: onMouseoutSquare,
      onSnapEnd: onSnapEnd,
      pieceTheme: (piece) => pieceImages[piece],
      snapbackSpeed: 300,
      snapSpeed: 100,
    }

    boardRef.current = Chessboard(chessRef.current, config)
    setBoardInitialized(true)
    updateStatus()

    const handleResize = () => {
      if (boardRef.current) {
        boardRef.current.resize()
      }
    }

    window.addEventListener("resize", handleResize)

    return () => {
      if (boardRef.current) {
        boardRef.current.destroy()
      }
      window.removeEventListener("resize", handleResize)
    }
  }, [mobileMode, visualHints, promotionPiece, theme, soundEnabled])

  useEffect(() => {
    const resizeBoard = () => {
      if (boardRef.current && boardInitialized) {
        const container = chessRef.current
        if (container) {
          // Make the board responsive based on container width
          const containerWidth = container.clientWidth
          const optimalSize = Math.min(containerWidth, 600)

          // Apply the size to the board
          boardRef.current.resize()
        }
      }
    }

    // Initial resize
    resizeBoard()

    // Add event listener for window resize
    window.addEventListener("resize", resizeBoard)

    // Clean up
    return () => {
      window.removeEventListener("resize", resizeBoard)
    }
  }, [boardInitialized])

  useEffect(() => {
    if (!mobileMode) {
      return
    }

    const handleMobileSquareClick = (event) => {
      event.preventDefault()

      const squareEl = event.currentTarget
      const squareClass = [...squareEl.classList].find((cls) => cls.startsWith("square-") && cls !== "square-55d63")

      if (!squareClass) return

      const clickedSquare = squareClass.replace("square-", "")
      const game = gameRef.current

      if (game.isGameOver()) return

      removeHighlights()

      if (selectedSquare) {
        if (possibleMoves.some((move) => move.to === clickedSquare)) {
          try {
            const move = game.move({
              from: selectedSquare,
              to: clickedSquare,
              promotion: promotionPiece,
            })

            boardRef.current.position(game.fen())

            move.captured ? playSound(captureSound) : playSound(moveSound)

            highlightLastMove(selectedSquare, clickedSquare)

            setMoves((prevMoves) => [...prevMoves, { from: move.from, to: move.to }])

            setSelectedSquare(null)
            setPossibleMoves([])

            updateStatus()

            if (!game.isGameOver() && game.turn() === "b") {
              setTimeout(async () => {
                try {
                  const fen = game.fen()
                  const bestMoveResponse = await fetchBestMove(fen)

                  if (bestMoveResponse) {
                    const bestMove = bestMoveResponse.split(" ")[1].trim()

                    const move = game.move({
                      from: bestMove.slice(0, 2),
                      to: bestMove.slice(2, 4),
                      promotion: promotionPiece,
                    })

                    if (move !== null) {
                      setMoves((prevMoves) => [...prevMoves, { from: move.from, to: move.to }])
                      boardRef.current.position(game.fen())

                      highlightLastMove(bestMove.slice(0, 2), bestMove.slice(2, 4))

                      move.captured ? playSound(captureSound) : playSound(moveSound)

                      updateStatus()
                    }
                  }
                } catch (error) {
                  console.error("Error fetching move from stockfish:", error)
                }
              }, 500)
            }
          } catch (error) {
            console.error("Invalid move:", error)
          }
        } else {
          const piece = game.get(clickedSquare)
          if (piece && piece.color === game.turn()) {
            selectNewSquare(clickedSquare)
          } else {
            setSelectedSquare(null)
            setPossibleMoves([])
          }
        }
      } else {
        const piece = game.get(clickedSquare)
        if (piece && piece.color === game.turn()) {
          selectNewSquare(clickedSquare)
        }
      }
    }

    const selectNewSquare = (square) => {
      const game = gameRef.current
      const moves = game.moves({
        square: square,
        verbose: true,
      })

      if (moves.length === 0) return

      setSelectedSquare(square)
      setPossibleMoves(moves)

      highlightSquare(square)

      moves.forEach((move) => {
        highlightSquare(move.to, "possible")
      })
    }

    const squares = document.querySelectorAll(".square-55d63")
    squares.forEach((square) => {
      square.addEventListener("touchend", handleMobileSquareClick)
      square.addEventListener("touchstart", (e) => e.preventDefault())
    })

    return () => {
      squares.forEach((square) => {
        square.removeEventListener("touchend", handleMobileSquareClick)
        square.removeEventListener("touchstart", (e) => e.preventDefault())
      })
    }
  }, [mobileMode, selectedSquare, possibleMoves, visualHints, promotionPiece, theme, soundEnabled])

  useEffect(() => {
    const applyTheme = () => {
      const currentTheme = {
        classic: {
          light: "#f0d9b5",
          dark: "#b58863",
          highlight: "#aed581",
          possible: "#90caf9",
          accent: "#ff9800",
        },
        forest: {
          light: "#e8f5e9",
          dark: "#388e3c",
          highlight: "#c5e1a5",
          possible: "#81c784",
          accent: "#ffeb3b",
        },
        ocean: {
          light: "#e3f2fd",
          dark: "#1976d2",
          highlight: "#bbdefb",
          possible: "#64b5f6",
          accent: "#ff5722",
        },
        night: {
          light: "#ffffff",
          dark: "#212121",
          highlight: "#636363",
          possible: "#757575",
          accent: "#f44336",
        },
        royal: {
          light: "#f3e5f5",
          dark: "#6a1b9a",
          highlight: "#ce93d8",
          possible: "#9575cd",
          accent: "#ffc107",
        },
      }[theme]

      const styleSheet = document.createElement("style")
      styleSheet.id = "chess-theme"

      const css = `
        .white-1e1d7 { background-color: ${currentTheme.light} !important; }
        .black-3c85d { background-color: ${currentTheme.dark} !important; }
        .highlight-square { background-color: ${currentTheme.highlight} !important; }
        .possible-move { background-color: ${currentTheme.possible} !important; }
        .last-move { box-shadow: inset 0 0 0 4px ${currentTheme.accent} !important; }
        
        /* Mobile responsiveness fixes */
        .square-55d63 {
          width: 12.5% !important;
          height: 0 !important;
          padding-bottom: 12.5% !important;
          position: relative !important;
        }
        
        .piece-417db {
          width: 100% !important;
          height: auto !important;
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
          right: 0 !important;
          bottom: 0 !important;
          margin: auto !important;
        }
        
        /* Responsive grid layout */
        @media (max-width: 640px) {
          .square-55d63 {
            width: 12.5% !important;
          }
        }
      `

      styleSheet.textContent = css

      const existingStyle = document.getElementById("chess-theme")
      if (existingStyle) {
        existingStyle.remove()
      }

      document.head.appendChild(styleSheet)
    }

    applyTheme()
  }, [theme])

  const handleRestart = () => {
    setIsGameOver(false)
    setGameOverMessage("")
    gameRef.current.reset()
    boardRef.current.position("start")
    setMoves([])
    setCurrentStatus("Your move")
    setSelectedSquare(null)
    setPossibleMoves([])
    removeHighlights()
    setLastMove(null)
  }

  const updateStatus = debounce(() => {
    const game = gameRef.current
    const moveColor = game.turn() === "w" ? "White" : "Black"

    if (game.isCheckmate()) {
      const winner = moveColor === "White" ? "Computer" : "You"
      setIsGameOver(true)
      setGameOverMessage(`${winner} wins by checkmate!`)
      playSound(checkmateSound)

      if (winner === "You") {
        triggerWinCelebration()
      }
    } else if (game.isStalemate()) {
      setIsGameOver(true)
      setGameOverMessage("It's a draw! Stalemate.")
    } else if (game.isThreefoldRepetition()) {
      setIsGameOver(true)
      setGameOverMessage("It's a draw! Threefold repetition.")
    } else if (game.isInsufficientMaterial()) {
      setIsGameOver(true)
      setGameOverMessage("It's a draw! Insufficient material.")
    } else if (game.isDraw()) {
      setIsGameOver(true)
      setGameOverMessage("It's a draw!")
    } else {
      setCurrentStatus(`${moveColor === "White" ? "Your" : "Computer's"} move`)
      if (game.inCheck()) {
        setCurrentStatus(`${moveColor === "White" ? "You are" : "Computer is"} in check!`)
        playSound(checkSound)
      }
    }
  }, 100)

  return (
    <div className={styles.container}>
      <div className="fixed inset-0 z-0 perspective-1000">
        <div
          className="absolute inset-0 transform-style-3d rotate-x-60 scale-150"
          style={{
            backgroundImage: `linear-gradient(to right, transparent 0%, transparent 12.5%, #222 12.5%, #222 25%, 
                             transparent 25%, transparent 37.5%, #222 37.5%, #222 50%,
                             transparent 50%, transparent 62.5%, #222 62.5%, #222 75%,
                             transparent 75%, transparent 87.5%, #222 87.5%, #222 100%)`,
            backgroundSize: "200px 100px",
            opacity: 0.15,
          }}
        ></div>
      </div>

      <div className="relative z-10 py-16 min-h-screen flex flex-col">
        <div className="w-full bg-gradient-to-r from-indigo-900 via-blue-800 to-indigo-900 border-b-4 border-yellow-500 shadow-lg py-4">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-yellow-400 mb-2 pixelated drop-shadow-md">
              STOCKFISH CHALLENGE
            </h1>
            <div className="h-1 w-32 mx-auto bg-yellow-500 mb-4"></div>
            <p className="text-lg text-blue-100">Test your skills against the powerful Stockfish engine!</p>
          </div>
        </div>

        <div className="flex-grow px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full"
              >
                <div className="bg-gray-900 border-2 border-blue-700 rounded-lg p-4 sm:p-6 shadow-lg game-panel">
                  <div className="bg-blue-800 -mt-8 -mx-6 mb-6 py-2 px-4 border-b-2 border-yellow-500">
                    <h2 className="text-2xl font-bold text-yellow-400 uppercase">Chess Board</h2>
                  </div>

                  <div className={styles.chessboardContainer}>
                    <div
                      ref={chessRef}
                      className={styles.chessboard}
                      style={{
                        width: "100%",
                        maxWidth: "min(100%, 600px)",
                        margin: "0 auto",
                        touchAction: mobileMode ? "manipulation" : "auto",
                      }}
                    ></div>
                  </div>

                  <div className="mt-4">
                    <motion.div
                      initial={{ scale: 0.95 }}
                      animate={{ scale: 1 }}
                      transition={{
                        type: "spring",
                        stiffness: 260,
                        damping: 20,
                      }}
                      className="rounded-lg text-center p-3 bg-gradient-to-r from-blue-600/80 to-purple-600/80 text-white border border-white/30 shadow-lg"
                    >
                      <p className="text-xl font-semibold">{currentStatus || "Your move"}</p>
                    </motion.div>
                  </div>

                  {mobileMode && (
                    <div className={styles.mobileInfo}>
                      {selectedSquare ? "Tap a highlighted square to move" : "Tap a piece to select"}
                    </div>
                  )}

                  <div className={styles.controlsContainer}>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleRestart}
                      className={`${styles.controlButton} bg-gradient-to-r from-red-600 to-red-400 text-white`}
                    >
                      <RotateCcw size={16} />
                      Restart
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSoundEnabled(!soundEnabled)}
                      className={`${styles.controlButton} ${
                        soundEnabled
                          ? "bg-gradient-to-r from-purple-600 to-purple-400 text-white"
                          : "bg-gradient-to-r from-gray-700 to-gray-600 text-gray-300"
                      }`}
                    >
                      {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                      {soundEnabled ? "Sound On" : "Sound Off"}
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowHelpModal(true)}
                      className={`${styles.controlButton} bg-gradient-to-r from-blue-600 to-blue-400 text-white`}
                    >
                      <HelpCircle size={16} />
                      Help
                    </motion.button>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="w-full"
              >
                <div className="bg-gray-900 border-2 border-blue-700 rounded-lg p-6 shadow-lg game-panel h-full">
                  <div className="bg-blue-800 -mt-8 -mx-6 mb-6 py-2 px-4 border-b-2 border-yellow-500">
                    <h2 className="text-2xl font-bold text-yellow-400 uppercase">Game Info</h2>
                  </div>

                  <div className="space-y-6">
                    <div className="grid grid-cols-1 gap-4">
                      <div className="bg-black/30 rounded-lg p-4 border-2 border-blue-600 flex items-center">
                        <div className="mr-4 bg-blue-900 p-3 rounded-full border-2 border-yellow-500">
                          <Shield size={24} className="text-yellow-400" />
                        </div>
                        <div>
                          <div className="text-lg font-bold text-yellow-400">Stockfish Engine</div>
                          <div className="text-blue-200">One of the strongest chess engines in the world</div>
                        </div>
                      </div>

                      <div className="bg-black/30 rounded-lg p-4 border-2 border-blue-600 flex items-center">
                        <div className="mr-4 bg-blue-900 p-3 rounded-full border-2 border-yellow-500">
                          <Award size={24} className="text-yellow-400" />
                        </div>
                        <div>
                          <div className="text-lg font-bold text-yellow-400">Moves</div>
                          <div className="text-blue-200">{moves.length}</div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-semibold text-yellow-400">Move History</h3>
                        <button
                          onClick={() => setShowMovesList(!showMovesList)}
                          className="text-white bg-blue-600/80 px-3 py-1 rounded-md text-sm border border-blue-400"
                        >
                          {showMovesList ? "Hide" : "Show"}
                        </button>
                      </div>

                      {showMovesList && (
                        <div className={styles.movesList}>
                          {moves.length > 0 ? (
                            <table className="w-full border-collapse text-xs sm:text-sm">
                              <thead>
                                <tr className="text-white border-b border-white/20">
                                  <th className="p-1 sm:p-2 text-left">#</th>
                                  <th className="p-1 sm:p-2 text-left">From</th>
                                  <th className="p-1 sm:p-2 text-left">To</th>
                                </tr>
                              </thead>
                              <tbody>
                                {moves.map((move, index) => (
                                  <tr key={index} className={`text-white ${index % 2 === 0 ? "bg-white/5" : ""}`}>
                                    <td className="p-1 sm:p-2">{index + 1}</td>
                                    <td className="p-1 sm:p-2">{move.from}</td>
                                    <td className="p-1 sm:p-2">{move.to}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          ) : (
                            <div className="text-center py-4 text-blue-300">No moves yet</div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="bg-black/30 rounded-lg p-4 border-2 border-blue-600">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-bold text-yellow-400">Mobile Mode</h3>
                          <p className="text-blue-300 text-sm">Tap to select and move pieces</p>
                        </div>
                        <div className="flex flex-col items-end">
                          <label className="relative inline-flex items-center cursor-pointer mb-1">
                            <input
                              type="checkbox"
                              checked={mobileMode}
                              onChange={handleCheckboxChange}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                          <span className="text-sm font-medium text-yellow-400">
                            {mobileMode ? "Enabled" : "Disabled"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-black/30 rounded-lg p-4 border-2 border-blue-600">
                      <h3 className="text-xl font-bold text-yellow-400 mb-3">Board Theme</h3>
                      <p className="text-blue-300 text-sm mb-4">Choose your preferred board style</p>
                      <select
                        value={theme}
                        onChange={(e) => setTheme(e.target.value)}
                        className="w-full bg-gray-800 text-blue-100 p-3 rounded-md border-2 border-blue-500 focus:border-yellow-500 focus:outline-none"
                      >
                        <option value="classic">Classic</option>
                        <option value="forest">Forest</option>
                        <option value="ocean">Ocean</option>
                        <option value="night">Night</option>
                        <option value="royal">Royal</option>
                      </select>
                    </div>

                    <div className="bg-black/30 rounded-lg p-4 border-2 border-blue-600">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-bold text-yellow-400">Visual Hints</h3>
                          <p className="text-blue-300 text-sm">Show possible moves and highlights</p>
                        </div>
                        <div className="flex flex-col items-end">
                          <label className="relative inline-flex items-center cursor-pointer mb-1">
                            <input
                              type="checkbox"
                              checked={visualHints}
                              onChange={() => setVisualHints(!visualHints)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                          <span className="text-sm font-medium text-yellow-400">
                            {visualHints ? "Enabled" : "Disabled"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        <div className="w-full bg-gray-900 border-t-4 border-blue-800 py-8 px-4 mt-8">
          <div className="max-w-3xl mx-auto text-center">
            <div className="bg-gradient-to-b from-blue-900 to-blue-950 border-4 border-yellow-500 rounded-lg p-6 shadow-lg">
              <h2 className="text-3xl font-bold text-yellow-400 mb-4 uppercase">Challenge Stockfish!</h2>

              <p className="text-blue-100 mb-6">
                Test your skills against one of the strongest chess engines in the world.
              </p>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleRestart}
                className="px-8 py-4 bg-yellow-500 text-blue-900 text-xl font-bold uppercase rounded-lg hover:bg-yellow-400 transition-colors shadow-lg border-2 border-yellow-700"
              >
                START NEW GAME
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      <HelpModal showHelpModal={showHelpModal} setShowHelpModal={setShowHelpModal} />

      <GameOverModal isOpen={isGameOver} message={gameOverMessage} onRestart={handleRestart} />
    </div>
  )
}

export default AgainstStockfish
