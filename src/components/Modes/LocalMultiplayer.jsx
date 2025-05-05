"use client"

import { useEffect, useRef, useState } from "react"
import { Chess } from "chess.js"
import Chessboard from "chessboardjs"
import { Howl } from "howler"
import { Activity, Network, RotateCcw, Volume2, VolumeX, HelpCircle } from 'lucide-react'
import { motion } from "framer-motion"
import confetti from "canvas-confetti"
import moveSoundFile from "../../assets/sounds/move.mp3"
import captureSoundFile from "../../assets/sounds/capture.mp3"
import checkSoundFile from "../../assets/sounds/check.mp3"
import checkmateSoundFile from "../../assets/sounds/checkmate.mp3"
import pieceImages from "../pieceImages"
import GameOverModal from "../GameOverModal"

const moveSound = new Howl({ src: [moveSoundFile] })
const captureSound = new Howl({ src: [captureSoundFile] })
const checkSound = new Howl({ src: [checkSoundFile] })
const checkmateSound = new Howl({ src: [checkmateSoundFile] })

// Themed board colors
const themes = {
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
}

const debounce = (func, delay) => {
  let timeoutId
  return (...args) => {
    if (timeoutId) clearTimeout(timeoutId)
    timeoutId = setTimeout(() => {
      func(...args)
    }, delay)
  }
}

const LocalMultiplayer = () => {
  const chessRef = useRef(null)
  const boardRef = useRef(null)
  const [currentStatus, setCurrentStatus] = useState(null)
  const [moves, setMoves] = useState([])
  const gameRef = useRef(new Chess())
  const [mobileMode, setMobileMode] = useState(false)
  const [promotionPiece, setPromotionPiece] = useState("q")
  const [isGameOver, setIsGameOver] = useState(false)
  const [gameOverMessage, setGameOverMessage] = useState("")
  const [selectedSquare, setSelectedSquare] = useState(null)
  const [possibleMoves, setPossibleMoves] = useState([])
  const [theme, setTheme] = useState("royal")
  const [visualHints, setVisualHints] = useState(true)
  const [lastMove, setLastMove] = useState(null)
  const [showMovesList, setShowMovesList] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [showHelpModal, setShowHelpModal] = useState(false)
  const [boardInitialized, setBoardInitialized] = useState(false)
  const [activeTab, setActiveTab] = useState("game")

  // Play sound with check for sound enabled
  const playSound = (sound) => {
    if (soundEnabled) {
      sound.play()
    }
  }

  // Utility functions for highlighting moves
  const removeHighlights = () => {
    try {
      const squares = document.querySelectorAll(".square-55d63")
      if (!squares || squares.length === 0) return

      squares.forEach((square) => {
        square.classList.remove("highlight-square", "possible-move", "last-move")
        square.style.background = ""
      })
    } catch (error) {
      console.error("Error removing highlights:", error)
    }
  }

  const highlightSquare = (square, type = "highlight") => {
    try {
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
    } catch (error) {
      console.error("Error highlighting square:", error)
    }
  }

  const highlightLastMove = (from, to) => {
    if (!visualHints) return

    try {
      removeHighlights()
      highlightSquare(from, "last-move")
      highlightSquare(to, "last-move")
      setLastMove({ from, to })
    } catch (error) {
      console.error("Error highlighting last move:", error)
    }
  }

  // Celebration effect when player wins
  const triggerWinCelebration = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#ffb347", "#ffcc33", "#fff"],
    })
  }

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

  // Apply theme colors to the board
  useEffect(() => {
    if (!boardInitialized) return

    const applyTheme = () => {
      const currentTheme = themes[theme]
      const styleSheet = document.createElement("style")
      styleSheet.id = "chess-theme"

      const css = `
        .white-1e1d7 { background-color: ${currentTheme.light} !important; }
        .black-3c85d { background-color: ${currentTheme.dark} !important; }
        .highlight-square { background-color: ${currentTheme.highlight} !important; }
        .possible-move { background-color: ${currentTheme.possible} !important; }
        .last-move { box-shadow: inset 0 0 0 4px ${currentTheme.accent} !important; }
      `

      styleSheet.textContent = css

      // Remove existing theme stylesheet if it exists
      const existingStyle = document.getElementById("chess-theme")
      if (existingStyle) {
        existingStyle.remove()
      }

      document.head.appendChild(styleSheet)
    }

    applyTheme()

    return () => {
      // Clean up theme stylesheet
      const existingStyle = document.getElementById("chess-theme")
      if (existingStyle) {
        existingStyle.remove()
      }
    }
  }, [theme, boardInitialized])

  useEffect(() => {
    const game = gameRef.current;

    const onDragStart = (source, piece, position, orientation) => {
      if (game.isGameOver()) {
        console.log("Start a new game from the menu");
        return false;
      }

      if ((game.turn() === "w" && piece.search(/^b/) !== -1) || (game.turn() === "b" && piece.search(/^w/) !== -1)) {
        return false;
      }

      // Show possible moves when piece is picked up
      if (visualHints) {
        removeHighlights();
        highlightSquare(source);

        const moves = game.moves({
          square: source,
          verbose: true,
        });

        for (let i = 0; i < moves.length; i++) {
          highlightSquare(moves[i].to, "possible");
        }
      }

      return true;
    };

    const onDrop = async (source, target) => {
      removeHighlights();

      const move = game.move({
        from: source,
        to: target,
        promotion: promotionPiece,
      });

      if (move === null) return "snapback";

      setMoves((prevMoves) => [...prevMoves, { from: move.from, to: move.to }]);
      updateStatus();

      // Highlight the move
      highlightLastMove(source, target);

      // Play sound based on move type
      if (move.captured) {
        playSound(captureSound);
      } else {
        playSound(moveSound);
      }
    };

    const onMouseoverSquare = (square, piece) => {
      if (!visualHints) return;

      const moves = game.moves({
        square: square,
        verbose: true,
      });

      if (moves.length === 0) return;

      highlightSquare(square);

      for (let i = 0; i < moves.length; i++) {
        highlightSquare(moves[i].to, "possible");
      }
    };

    const onMouseoutSquare = (square, piece) => {
      if (!visualHints) return;

      // Don't remove highlights if we're showing the last move
      if (lastMove) {
        removeHighlights();
        highlightSquare(lastMove.from, "last-move");
        highlightSquare(lastMove.to, "last-move");
      } else {
        removeHighlights();
      }
    };

    const onSnapEnd = () => {
      if (boardRef.current) {
        boardRef.current.position(game.fen());
      }
    };

    const updateStatus = debounce(() => {
      let status = "";
      const moveColor = game.turn() === "w" ? "White" : "Black";

      if (game.isCheckmate()) {
        status = `${moveColor === "White" ? "Black" : "White"} wins!`;
        setIsGameOver(true);
        setGameOverMessage(status);
        playSound(checkmateSound);

        // Trigger celebration for the winner
        if (moveColor === "White") {
          triggerWinCelebration();
        }
      } else if (game.isStalemate()) {
        status = "It's a draw! Stalemate.";
        setIsGameOver(true);
        setGameOverMessage(status);
      } else if (game.isThreefoldRepetition()) {
        status = "It's a draw! Threefold repetition.";
        setIsGameOver(true);
        setGameOverMessage(status);
      } else if (game.isInsufficientMaterial()) {
        status = "It's a draw! Insufficient material.";
        setIsGameOver(true);
        setGameOverMessage(status);
      } else if (game.isDraw()) {
        status = "It's a draw!";
        setIsGameOver(true);
        setGameOverMessage(status);
      } else {
        status = `${moveColor} to move`;
        if (game.inCheck()) {
          status += `, ${moveColor} is in check!`;
          playSound(checkSound);
        }
      }
      setCurrentStatus(status);
    }, 100);

    // Only initialize the board if it doesn't exist yet and we're on the game tab
    if (!boardRef.current && chessRef.current) {
      const config = {
        draggable: !mobileMode,
        position: "start",
        onDragStart: onDragStart,
        onDrop: onDrop,
        onMouseoverSquare: onMouseoverSquare,
        onMouseoutSquare: onMouseoutSquare,
        onSnapEnd: onSnapEnd,
        pieceTheme: (piece) => pieceImages[piece],
        snapbackSpeed: 500,
        snapSpeed: 100,
      };

      boardRef.current = Chessboard(chessRef.current, config);
      setBoardInitialized(true);
      updateStatus();
    }

    // Handle window resize
    const handleResize = () => {
      if (boardRef.current && typeof boardRef.current.resize === "function") {
        try {
          boardRef.current.resize();
        } catch (error) {
          console.error("Error resizing board:", error);
        }
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      // Don't destroy the board when switching tabs
      // Only destroy when unmounting the component
      if (boardRef.current && !chessRef.current) {
        boardRef.current.destroy();
        boardRef.current = null;
      }
    };
  }, [promotionPiece, visualHints, mobileMode, soundEnabled, activeTab]);

  // Handle mobile mode touch events
  useEffect(() => {
    if (!mobileMode || !boardInitialized) return

    let squares = []
    let listeners = []

    const handleMobileSquareClick = (event) => {
      event.preventDefault()

      // Find the clicked square from the event target's class list
      const squareEl = event.currentTarget
      const squareClass = [...squareEl.classList].find((cls) => cls.startsWith("square-") && cls !== "square-55d63")

      if (!squareClass) return

      const clickedSquare = squareClass.replace("square-", "")
      const game = gameRef.current

      // If game is over, do nothing
      if (game.isGameOver()) return

      // Clear previous highlights
      removeHighlights()

      // If we already have a selected square, try to make a move
      if (selectedSquare) {
        // Check if the clicked square is a valid destination
        if (possibleMoves.some((move) => move.to === clickedSquare)) {
          try {
            // Make the move
            const move = game.move({
              from: selectedSquare,
              to: clickedSquare,
              promotion: promotionPiece, // Always promote to queen
            })

            // Update the board display
            if (boardRef.current) {
              boardRef.current.position(game.fen())
            }

            // Play sound based on move type
            move.captured ? playSound(captureSound) : playSound(moveSound)

            // Highlight the move
            highlightLastMove(selectedSquare, clickedSquare)

            // Update moves list
            setMoves((prevMoves) => [...prevMoves, { from: move.from, to: move.to }])

            // Check status after the move
            updateStatus()

            // Clear selection
            setSelectedSquare(null)
            setPossibleMoves([])
          } catch (error) {
            console.error("Invalid move:", error)
          }
        } else {
          // If clicked on a different piece of the same color, select that piece instead
          const piece = game.get(clickedSquare)
          if (piece && piece.color === game.turn()) {
            selectNewSquare(clickedSquare)
          } else {
            // If clicked on an invalid square, clear selection
            setSelectedSquare(null)
            setPossibleMoves([])
          }
        }
      } else {
        // If no square is selected yet, select this one if it has a piece of the correct color
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

      // Highlight the selected square
      highlightSquare(square)

      // Highlight possible destinations
      moves.forEach((move) => {
        highlightSquare(move.to, "possible")
      })
    }

    const updateStatus = () => {
      let status = ""
      const moveColor = gameRef.current.turn() === "w" ? "White" : "Black"

      if (gameRef.current.isCheckmate()) {
        status = `${moveColor === "White" ? "Black" : "White"} wins!`
        setIsGameOver(true)
        setGameOverMessage(status)
        playSound(checkmateSound)

        // Trigger celebration for the winner
        if (moveColor === "White") {
          triggerWinCelebration()
        }
      } else if (gameRef.current.isStalemate()) {
        status = "It's a draw! Stalemate."
        setIsGameOver(true)
        setGameOverMessage(status)
      } else if (gameRef.current.isThreefoldRepetition()) {
        status = "It's a draw! Threefold repetition."
        setIsGameOver(true)
        setGameOverMessage(status)
      } else if (gameRef.current.isInsufficientMaterial()) {
        status = "It's a draw! Insufficient material."
        setIsGameOver(true)
        setGameOverMessage(status)
      } else if (gameRef.current.isDraw()) {
        status = "It's a draw!"
        setIsGameOver(true)
        setGameOverMessage(status)
      } else {
        status = `${moveColor} to move`
        if (gameRef.current.inCheck()) {
          status += `, ${moveColor} is in check!`
          playSound(checkSound)
        }
      }
      setCurrentStatus(status)
    }

    // Clean up previous listeners
    listeners.forEach(({ element, listener }) => {
      if (element) {
        element.removeEventListener("touchend", listener)
        element.removeEventListener("touchstart", (e) => e.preventDefault())
      }
    })
    listeners = []

    // Add touch event listeners to the squares
    squares = document.querySelectorAll(".square-55d63")
    if (squares && squares.length > 0) {
      squares.forEach((square) => {
        // Create a unique listener for each square
        const listener = (e) => handleMobileSquareClick(e)
        square.addEventListener("touchend", listener)
        square.addEventListener("touchstart", (e) => e.preventDefault())

        // Store the element and its listener for cleanup
        listeners.push({ element: square, listener })
      })
    }

    // Clean up listeners when component unmounts or mobileMode changes
    return () => {
      listeners.forEach(({ element, listener }) => {
        if (element) {
          element.removeEventListener("touchend", listener)
          element.removeEventListener("touchstart", (e) => e.preventDefault())
        }
      })
    }
  }, [mobileMode, selectedSquare, possibleMoves, boardInitialized, visualHints, soundEnabled, promotionPiece])

  const toggleMovesList = () => {
    setShowMovesList(!showMovesList)
  }

  const handlePromotionChange = (e) => {
    setPromotionPiece(e.target.value)
  }

  const handleThemeChange = (e) => {
    setTheme(e.target.value)
  }

  const toggleVisualHints = () => {
    setVisualHints(!visualHints)
  }

  const toggleSound = () => {
    setSoundEnabled(!soundEnabled)
  }

  const handleRestart = () => {
    setIsGameOver(false)
    setGameOverMessage("")
    gameRef.current.reset() // Reset the chess game state
    boardRef.current.position("start") // Reset the board position
    setMoves([])
    setCurrentStatus("White to move")
    setSelectedSquare(null)
    setPossibleMoves([])
    removeHighlights()
    setLastMove(null)
  }

  // Help modal content
  const HelpModal = () => (
    <div className={`fixed inset-0 z-50 flex items-center justify-center ${showHelpModal ? "block" : "hidden"}`}>
      <div className="absolute inset-0 bg-black/70" onClick={() => setShowHelpModal(false)}></div>
      <div className="relative bg-gray-900 border-2 border-blue-700 rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-blue-800 -mt-6 -mx-6 mb-6 py-2 px-4 border-b-2 border-yellow-500">
          <h2 className="text-2xl font-bold text-yellow-400 uppercase">How to Play</h2>
        </div>

        <div className="space-y-4 text-blue-100">
          <div>
            <h3 className="text-lg font-bold text-yellow-400 mb-1">Mobile Mode</h3>
            <p>Tap a piece to select it, then tap a highlighted square to move. Perfect for touchscreens.</p>
          </div>

          <div>
            <h3 className="text-lg font-bold text-yellow-400 mb-1">Desktop Mode</h3>
            <p>Drag and drop pieces to make moves. Hover over pieces to see possible moves.</p>
          </div>

          <div>
            <h3 className="text-lg font-bold text-yellow-400 mb-1">Local Multiplayer</h3>
            <p>Two players can play on the same device, taking turns. White moves first, then Black.</p>
          </div>

          <div>
            <h3 className="text-lg font-bold text-yellow-400 mb-1">Visual Hints</h3>
            <p>Toggle to show or hide move suggestions and highlights.</p>
          </div>
        </div>

        <button
          onClick={() => setShowHelpModal(false)}
          className="mt-6 w-full bg-yellow-500 text-blue-900 font-bold py-2 rounded-md hover:bg-yellow-400"
        >
          Got it!
        </button>
      </div>
    </div>
  )

  return (
    <div className="relative w-screen min-h-screen overflow-x-hidden bg-gray-950 font-mono">
      {/* Chess board background with perspective */}
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

      {/* Game UI Container */}
      <div className="relative z-10 py-8 md:py-16 min-h-screen flex flex-col">
        {/* Game Header Banner */}
        <div className="w-full bg-gradient-to-r from-indigo-900 via-blue-800 to-indigo-900 border-b-4 border-yellow-500 shadow-lg py-4">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-yellow-400 mb-2 pixelated drop-shadow-md">
              LOCAL MULTIPLAYER
            </h1>
            <div className="h-1 w-32 mx-auto bg-yellow-500 mb-4"></div>
            <p className="text-lg text-blue-100">Play chess with a friend on the same device</p>
          </div>
        </div>

        {/* Game Menu Tabs */}
        <nav className="bg-gray-900 border-b-2 border-blue-800 shadow-md">
          <div className="max-w-6xl mx-auto px-4 py-2 flex justify-center overflow-x-auto">
            {["game", "settings", "help"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 mx-2 text-lg font-bold uppercase transition-all ${
                  activeTab === tab
                    ? "bg-blue-800 text-yellow-400 border-2 border-yellow-500 shadow-yellow-400/20 shadow-md"
                    : "text-blue-300 hover:bg-blue-900 border-2 border-transparent"
                }`}
              >
                {tab === "game" && "Game"}
                {tab === "settings" && "Settings"}
                {tab === "help" && "Help"}
              </button>
            ))}
          </div>
        </nav>

        {/* Main Content Area - Game Panel Style */}
        <div className="flex-grow px-4 py-8">
          <div className="max-w-6xl mx-auto">
            {/* Game Tab Content */}
            {activeTab === "game" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Chess board container with stylish border */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="w-full"
                >
                  <div className="bg-gray-900 border-2 border-blue-700 rounded-lg p-6 shadow-lg game-panel">
                    <div className="bg-blue-800 -mt-8 -mx-6 mb-6 py-2 px-4 border-b-2 border-yellow-500">
                      <h2 className="text-2xl font-bold text-yellow-400 uppercase">Chess Board</h2>
                    </div>

                    <div className="relative backdrop-blur-sm bg-black/30 p-4 rounded-lg border-2 border-blue-600">
                      <div ref={chessRef} style={{ width: "100%", maxWidth: "600px", margin: "0 auto" }}></div>
                    </div>

                    {/* Status display */}
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
                        <p className="text-xl font-semibold">{currentStatus ? currentStatus : "White to move"}</p>
                      </motion.div>
                    </div>

                    {/* Help text for mobile mode */}
                    {mobileMode && (
                      <div className="mt-4 p-3 bg-black/50 text-white text-center rounded-lg border border-blue-600">
                        {selectedSquare ? "Tap a highlighted square to move" : "Tap a piece to select"}
                      </div>
                    )}

                    {/* Quick controls */}
                    <div className="mt-4 flex flex-wrap justify-center gap-3">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleRestart}
                        className="bg-gradient-to-r from-red-600 to-red-400 text-white px-4 py-2 rounded-md font-semibold shadow-md flex items-center gap-2"
                      >
                        <RotateCcw size={18} />
                        Restart
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={toggleSound}
                        className={`px-4 py-2 rounded-md font-semibold shadow-md flex items-center gap-2 ${
                          soundEnabled
                            ? "bg-gradient-to-r from-purple-600 to-purple-400 text-white"
                            : "bg-gradient-to-r from-gray-700 to-gray-600 text-gray-300"
                        }`}
                      >
                        {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
                        {soundEnabled ? "Sound On" : "Sound Off"}
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowHelpModal(true)}
                        className="bg-gradient-to-r from-blue-600 to-blue-400 text-white px-4 py-2 rounded-md font-semibold shadow-md flex items-center gap-2"
                      >
                        <HelpCircle size={18} />
                        How to Play
                      </motion.button>
                    </div>
                  </div>
                </motion.div>

                {/* Game info and controls */}
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
                      {/* Game stats */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-black/30 rounded-lg p-4 border-2 border-blue-600 flex items-center">
                          <div className="mr-4 bg-blue-900 p-3 rounded-full border-2 border-yellow-500">
                            <Network size={24} className="text-yellow-400" />
                          </div>
                          <div>
                            <div className="text-lg font-bold text-yellow-400">Mode</div>
                            <div className="text-blue-200">Local Multiplayer</div>
                          </div>
                        </div>

                        <div className="bg-black/30 rounded-lg p-4 border-2 border-blue-600 flex items-center">
                          <div className="mr-4 bg-blue-900 p-3 rounded-full border-2 border-yellow-500">
                            <Activity size={24} className="text-yellow-400" />
                          </div>
                          <div>
                            <div className="text-lg font-bold text-yellow-400">Moves</div>
                            <div className="text-blue-200">{moves.length}</div>
                          </div>
                        </div>
                      </div>

                      {/* Promotion piece selector */}
                      <div className="bg-black/30 rounded-lg p-4 border-2 border-blue-600">
                        <h3 className="text-xl font-bold text-yellow-400 mb-3">Promotion Piece</h3>
                        <p className="text-blue-300 text-sm mb-4">Choose which piece to promote pawns to</p>
                        <select
                          value={promotionPiece}
                          onChange={handlePromotionChange}
                          className="w-full bg-gray-800 text-blue-100 p-3 rounded-md border-2 border-blue-500 focus:border-yellow-500 focus:outline-none"
                        >
                          <option value="q">Queen</option>
                          <option value="r">Rook</option>
                          <option value="b">Bishop</option>
                          <option value="n">Knight</option>
                        </select>
                      </div>

                      {/* Move history */}
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-xl font-semibold text-yellow-400">Move History</h3>
                          <button
                            onClick={toggleMovesList}
                            className="text-white bg-blue-600/80 px-3 py-1 rounded-md text-sm border border-blue-400"
                          >
                            {showMovesList ? "Hide" : "Show"}
                          </button>
                        </div>

                        {showMovesList && (
                          <div className="bg-black/30 rounded-lg p-2 max-h-[300px] overflow-y-auto border-2 border-blue-600">
                            {moves.length > 0 ? (
                              <table className="w-full border-collapse">
                                <thead>
                                  <tr className="text-white border-b border-white/20">
                                    <th className="p-2 text-left">#</th>
                                    <th className="p-2 text-left">From</th>
                                    <th className="p-2 text-left">To</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {moves.map((move, index) => (
                                    <tr key={index} className={`text-white ${index % 2 === 0 ? "bg-white/5" : ""}`}>
                                      <td className="p-2">{index + 1}</td>
                                      <td className="p-2">{move.from}</td>
                                      <td className="p-2">{move.to}</td>
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

                      {/* Mobile mode toggle */}
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

                      <div className="mt-8 text-white text-center">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleRestart}
                          className="bg-gradient-to-r from-red-600 to-blue-700 bg-opacity-30 text-white border border-gray-200 px-6 py-3 rounded-lg w-full text-lg lg:text-xl"
                        >
                          Restart Game
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}

            {/* Settings Tab Content */}
            {activeTab === "settings" && (
              <div className="bg-gray-900 border-2 border-blue-700 rounded-lg p-6 shadow-lg game-panel">
                <div className="bg-blue-800 -mt-8 -mx-6 mb-6 py-2 px-4 border-b-2 border-yellow-500">
                  <h2 className="text-2xl font-bold text-yellow-400 uppercase">Game Settings</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-black/30 rounded-lg p-4 border-2 border-blue-600">
                    <h3 className="text-xl font-bold text-yellow-400 mb-3">Board Theme</h3>
                    <p className="text-blue-300 text-sm mb-4">Choose your preferred board style</p>
                    <select
                      value={theme}
                      onChange={handleThemeChange}
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
                        <h3 className="text-xl font-bold text-yellow-400">Visual Hints</h3>
                        <p className="text-blue-300 text-sm">Show possible moves and highlights</p>
                      </div>
                      <div className="flex flex-col items-end">
                        <label className="relative inline-flex items-center cursor-pointer mb-1">
                          <input
                            type="checkbox"
                            checked={visualHints}
                            onChange={toggleVisualHints}
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

                  <div className="bg-black/30 rounded-lg p-4 border-2 border-blue-600">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-yellow-400">Sound Effects</h3>
                        <p className="text-blue-300 text-sm">Enable or disable game sounds</p>
                      </div>
                      <div className="flex flex-col items-end">
                        <label className="relative inline-flex items-center cursor-pointer mb-1">
                          <input
                            type="checkbox"
                            checked={soundEnabled}
                            onChange={toggleSound}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                        <span className="text-sm font-medium text-yellow-400">
                          {soundEnabled ? "Enabled" : "Disabled"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-black/30 rounded-lg p-4 border-2 border-blue-600">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-yellow-400">Mobile Mode</h3>
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
                </div>
              </div>
            )}

            {/* Help Tab Content */}
            {activeTab === "help" && (
              <div className="bg-gray-900 border-2 border-blue-700 rounded-lg p-6 shadow-lg game-panel">
                <div className="bg-blue-800 -mt-8 -mx-6 mb-6 py-2 px-4 border-b-2 border-yellow-500">
                  <h2 className="text-2xl font-bold text-yellow-400 uppercase">How to Play</h2>
                </div>

                <div className="space-y-6">
                  <div className="bg-black/30 rounded-lg p-4 border-2 border-blue-600">
                    <h3 className="text-xl font-bold text-yellow-400 mb-3">Basic Rules</h3>
                    <ul className="space-y-3 text-blue-100">
                      <li className="flex items-start">
                        <div className="h-6 w-6 rounded-full bg-blue-800 flex items-center justify-center text-yellow-400 mr-3 mt-0.5 flex-shrink-0 border border-yellow-500">
                          1
                        </div>
                        <p>Two players take turns moving pieces on the board.</p>
                      </li>
                      <li className="flex items-start">
                        <div className="h-6 w-6 rounded-full bg-blue-800 flex items-center justify-center text-yellow-400 mr-3 mt-0.5 flex-shrink-0 border border-yellow-500">
                          2
                        </div>
                        <p>White always moves first, followed by Black.</p>
                      </li>
                      <li className="flex items-start">
                        <div className="h-6 w-6 rounded-full bg-blue-800 flex items-center justify-center text-yellow-400 mr-3 mt-0.5 flex-shrink-0 border border-yellow-500">
                          3
                        </div>
                        <p>The goal is to checkmate your opponent's king.</p>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-black/30 rounded-lg p-4 border-2 border-blue-600">
                    <h3 className="text-xl font-bold text-yellow-400 mb-3">Controls</h3>
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-lg font-semibold text-blue-200 mb-2">Desktop Mode</h4>
                        <p className="text-blue-100 mb-2">
                          Click and drag pieces to make moves. Hover over pieces to see possible moves when visual hints
                          are enabled.
                        </p>
                      </div>

                      <div>
                        <h4 className="text-lg font-semibold text-blue-200 mb-2">Mobile Mode</h4>
                        <p className="text-blue-100 mb-2">
                          Tap a piece to select it, then tap a highlighted square to move. This mode is perfect for
                          touchscreens.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-black/30 rounded-lg p-4 border-2 border-blue-600">
                    <h3 className="text-xl font-bold text-yellow-400 mb-3">Special Moves</h3>
                    <ul className="space-y-3 text-blue-100">
                      <li className="flex items-start">
                        <div className="h-6 w-6 rounded-full bg-blue-800 flex items-center justify-center text-yellow-400 mr-3 mt-0.5 flex-shrink-0 border border-yellow-500 text-xs">
                          P
                        </div>
                        <p>
                          Pawn Promotion: When a pawn reaches the opposite end of the board, it can be promoted to a
                          Queen, Rook, Bishop, or Knight.
                        </p>
                      </li>
                      <li className="flex items-start">
                        <div className="h-6 w-6 rounded-full bg-blue-800 flex items-center justify-center text-yellow-400 mr-3 mt-0.5 flex-shrink-0 border border-yellow-500 text-xs">
                          C
                        </div>
                        <p>
                          Castling: The king can move two squares toward a rook, and the rook moves to the square the
                          king crossed.
                        </p>
                      </li>
                      <li className="flex items-start">
                        <div className="h-6 w-6 rounded-full bg-blue-800 flex items-center justify-center text-yellow-400 mr-3 mt-0.5 flex-shrink-0 border border-yellow-500 text-xs">
                          E
                        </div>
                        <p>
                          En Passant: A pawn can capture an opponent's pawn that has just moved two squares forward.
                        </p>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Call to Action - Game Button Style */}
        <div className="w-full bg-gray-900 border-t-4 border-blue-800 py-8 px-4 mt-8">
          <div className="max-w-3xl mx-auto text-center">
            <div className="bg-gradient-to-b from-blue-900 to-blue-950 border-4 border-yellow-500 rounded-lg p-6 shadow-lg">
              <h2 className="text-3xl font-bold text-yellow-400 mb-4 uppercase">Enjoy Your Game!</h2>

              <p className="text-blue-100 mb-6">
                Challenge a friend to a game of chess and see who has the better strategy.
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

      {/* Help Modal */}
      <HelpModal />

      {/* Game Over Modal */}
      <GameOverModal isOpen={isGameOver} message={gameOverMessage} onRestart={handleRestart} />

      {/* Game UI CSS */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
  .game-panel {
    position: relative;
    box-shadow: 0 0 0 2px rgba(30, 64, 175, 0.5), 0 0 15px rgba(0, 0, 0, 0.5);
  }
  
  .perspective-1000 {
    perspective: 1000px;
  }
  
  .transform-style-3d {
    transform-style: preserve-3d;
  }
  
  .rotate-x-60 {
    transform: rotateX(60deg);
  }
  
  .pixelated {
    letter-spacing: 2px;
    text-shadow: 
      2px 2px 0 rgba(0,0,0,0.5),
      4px 4px 0 rgba(0,0,0,0.25);
  }

  /* Button press effect */
  button:active:not(:disabled) {
    transform: translateY(2px);
  }
  
  /* Responsive board sizing */
  @media (max-width: 640px) {
    .square-55d63 {
      width: 40px !important;
      height: 40px !important;
    }
  }
  
  /* Improve piece visibility */
  img {
    user-select: none;
    -webkit-user-drag: none;
  }
  
  /* Improve mobile touch targets */
  .square-55d63 {
    touch-action: none;
    -webkit-tap-highlight-color: transparent;
  }
  `,
        }}
      />
    </div>
  )
}

export default LocalMultiplayer
