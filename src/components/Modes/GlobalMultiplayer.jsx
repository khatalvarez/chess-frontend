"use client"

import { useEffect, useRef, useState } from "react"
import { Chess } from "chess.js"
import { useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { Howl } from "howler"
import { Maximize2, Minimize2, Volume2, VolumeX, LogOut } from "lucide-react"
import axios from "axios"
import { motion } from "framer-motion"
import confetti from "canvas-confetti"
import WaitQueue from "../WaitQueue"
import pieceImages from "../pieceImages"
import GameOverModal from "../GameOverModal"
import moveSoundFile from "../../assets/sounds/move.mp3"
import captureSoundFile from "../../assets/sounds/capture.mp3"
import checkSoundFile from "../../assets/sounds/check.mp3"
import checkmateSoundFile from "../../assets/sounds/checkmate.mp3"
import boardbg from "../../assets/images/bgboard.webp"
import { BASE_URL } from "../../url"
import { io } from "socket.io-client"

// Initialize sound effects
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

const GlobalMultiplayer = () => {
  const user = useSelector((state) => state.auth.userData)
  const navigate = useNavigate()

  // Game state
  const [game, setGame] = useState(new Chess())
  const [board, setBoard] = useState(null)
  const [playerColor, setPlayerColor] = useState(null)
  const [opponent, setOpponent] = useState(null)
  const [waitingForOpponent, setWaitingForOpponent] = useState(true)
  const [currentStatus, setCurrentStatus] = useState("Waiting for opponent...")
  const [moves, setMoves] = useState([])
  const [isTableCollapsed, setIsTableCollapsed] = useState(false)
  const [mobileMode, setMobileMode] = useState(false)
  const [promotionPiece, setPromotionPiece] = useState("q")
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [fullscreen, setFullscreen] = useState(false)
  const [isGameOver, setIsGameOver] = useState(false)
  const [gameOverMessage, setGameOverMessage] = useState("")
  const [boardInitialized, setBoardInitialized] = useState(false)
  const [showLeaveConfirmation, setShowLeaveConfirmation] = useState(false)
  const [selectedSquare, setSelectedSquare] = useState(null)
  const [possibleMoves, setPossibleMoves] = useState([])
  const [theme, setTheme] = useState("forest") // Default theme
  const [visualHints, setVisualHints] = useState(true)
  const [lastMove, setLastMove] = useState(null)
  const [showMovesList, setShowMovesList] = useState(false)
  const [gameId, setGameId] = useState(null)
  const [connectionError, setConnectionError] = useState(false)
  const [reconnecting, setReconnecting] = useState(false)
  const [inactivityTimer, setInactivityTimer] = useState(null)

  // Refs
  const chessboardRef = useRef(null)
  const socketRef = useRef(null)
  const gameRef = useRef(null)
  const boardContainerRef = useRef(null)
  const reconnectAttemptsRef = useRef(0)
  const lastActivityRef = useRef(Date.now())
  const inactivityTimeoutRef = useRef(null)

  // Add match to history function
  const addMatchToHistory = async (userId, opponentName, status) => {
    try {
      console.log("Sending match data:", { userId, opponentName, status })
      const response = await axios.post(
        `${BASE_URL}/user/${userId}/match-history`,
        {
          opponent: opponentName,
          status,
        },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        },
      )
      console.log("Match history added:", response.data)
      return response.data
    } catch (error) {
      console.error("Error adding match to history:", error.response?.data || error.message)
      // Implement retry logic
      setTimeout(() => {
        console.log("Retrying match history update...")
        addMatchToHistory(userId, opponentName, status)
      }, 3000)
      return null
    }
  }

  // Utility functions for highlighting moves
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

  // Celebration effect when player wins
  const triggerWinCelebration = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#ffb347", "#ffcc33", "#fff"],
    })
  }

  // Reset inactivity timer
  const resetInactivityTimer = () => {
    lastActivityRef.current = Date.now()

    if (inactivityTimeoutRef.current) {
      clearTimeout(inactivityTimeoutRef.current)
    }

    // Set new inactivity timeout - 15 seconds as requested
    inactivityTimeoutRef.current = setTimeout(() => {
      if (socketRef.current && opponent && !isGameOver) {
        console.log("User inactive for 15 seconds, handling as leave")
        handleLeaveGame()
      }
    }, 15000)
  }

  // Track user activity
  useEffect(() => {
    const handleActivity = () => {
      resetInactivityTimer()
    }

    // Add event listeners for user activity
    window.addEventListener("mousemove", handleActivity)
    window.addEventListener("keydown", handleActivity)
    window.addEventListener("click", handleActivity)
    window.addEventListener("touchstart", handleActivity)

    // Initialize inactivity timer
    resetInactivityTimer()

    return () => {
      window.removeEventListener("mousemove", handleActivity)
      window.removeEventListener("keydown", handleActivity)
      window.removeEventListener("click", handleActivity)
      window.removeEventListener("touchstart", handleActivity)

      if (inactivityTimeoutRef.current) {
        clearTimeout(inactivityTimeoutRef.current)
      }
    }
  }, [opponent, isGameOver])

  // Connect to socket server when component mounts
  useEffect(() => {
    if (!user) return

    // Create socket connection
    const socketUrl = BASE_URL.startsWith("http") ? BASE_URL : `http://${BASE_URL}`
    console.log("Connecting to socket server at:", socketUrl)

    // Store gameId from localStorage if it exists
    const storedGameId = localStorage.getItem("chessGameId")
    if (storedGameId) {
      setGameId(storedGameId)
      setReconnecting(true)
      console.log("Found stored game ID:", storedGameId)
    }

    const socket = io(socketUrl, {
      query: {
        user: JSON.stringify(user),
        lastGameId: storedGameId || null,
      },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      transports: ["websocket", "polling"],
    })

    socketRef.current = socket

    // Debug connection status
    socket.on("connect", () => {
      console.log("Connected to server with ID:", socket.id)
      setConnectionError(false)
      reconnectAttemptsRef.current = 0
    })

    socket.on("connect_error", (error) => {
      console.error("Connection error:", error)
      setConnectionError(true)

      // Implement exponential backoff for reconnection
      if (reconnectAttemptsRef.current < 5) {
        const timeout = Math.min(1000 * 2 ** reconnectAttemptsRef.current, 30000)
        console.log(`Retrying connection in ${timeout / 1000} seconds...`)

        setTimeout(() => {
          console.log("Attempting to reconnect...")
          socket.connect()
          reconnectAttemptsRef.current += 1
        }, timeout)
      } else {
        console.error("Failed to connect after multiple attempts")
        // Show error to user or navigate back to menu
        navigate("/modeselector")
      }
    })

    socket.on("waiting", (isWaiting) => {
      console.log("Waiting status:", isWaiting)
      setWaitingForOpponent(isWaiting)

      if (!isWaiting && reconnecting) {
        setReconnecting(false)
      }
    })

    socket.on("color", (color) => {
      console.log("Received color:", color)
      setPlayerColor(color)
      setWaitingForOpponent(false)
    })

    socket.on("opponent", (obtainedOpponent) => {
      console.log("Opponent received:", obtainedOpponent)
      setOpponent(obtainedOpponent)
    })

    socket.on("gameAssigned", (id) => {
      console.log("Game ID assigned:", id)
      setGameId(id)
      localStorage.setItem("chessGameId", id)
    })

    socket.on("opponentDisconnected", (opponentName) => {
      console.log("Opponent disconnected:", opponentName || "Opponent")

      if (user) {
        // Record win due to opponent disconnection
        addMatchToHistory(user.userId, opponent?.username || "Opponent", "win").then(() => {
          console.log("Match recorded as win due to opponent disconnection")
          // Trigger celebration for win
          triggerWinCelebration()
        })
      }

      // Show game over modal
      setGameOverMessage(`You win! ${opponentName || "Opponent"} has disconnected.`)
      setIsGameOver(true)

      // Clear game ID from storage
      localStorage.removeItem("chessGameId")
    })

    socket.on("opponentReconnected", (opponentName) => {
      console.log("Opponent reconnected:", opponentName)
      setCurrentStatus(`${opponentName} has reconnected. Game continues.`)
    })

    // Initialize chess game
    const newGame = new Chess()
    setGame(newGame)
    gameRef.current = newGame

    // Cleanup on unmount
    return () => {
      if (socket) {
        socket.disconnect()
      }
      if (board) {
        board.destroy()
      }

      // Clear inactivity timer
      if (inactivityTimeoutRef.current) {
        clearTimeout(inactivityTimeoutRef.current)
      }
    }
  }, [user, navigate, reconnecting])

  // Add a separate useEffect to ensure the board is initialized when playerColor changes
  useEffect(() => {
    // This effect runs when playerColor changes
    if (playerColor && !boardInitialized && chessboardRef.current) {
      console.log("PlayerColor changed, initializing chessboard...")
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        initializeChessboard()
      }, 100)
    }
  }, [playerColor])

  // Add a useEffect to check if the board needs to be reinitialized after component is fully mounted
  useEffect(() => {
    // This runs once after the component is mounted
    const checkBoardTimer = setTimeout(() => {
      if (!boardInitialized && chessboardRef.current && playerColor) {
        console.log("Board not initialized after mount, retrying...")
        initializeChessboard()
      }
    }, 1000)

    return () => clearTimeout(checkBoardTimer)
  }, [])

  // Modify the useEffect that handles board initialization to ensure it runs when needed

  // Handle socket move events and initialize board after player color is set
  useEffect(() => {
    if (!socketRef.current) return

    console.log("Board initialization check - playerColor:", playerColor, "boardInitialized:", boardInitialized)

    // Initialize chessboard if not already initialized and we have a player color
    if (playerColor && !boardInitialized && chessboardRef.current) {
      console.log("Initializing chessboard now...")
      initializeChessboard()
    }

    // Listen for opponent moves
    socketRef.current.on("move", ({ from, to, obtainedPromotion, fen }) => {
      try {
        console.log("Received move from opponent:", from, to, obtainedPromotion, fen)
        resetInactivityTimer()

        // Make sure game ref is initialized
        if (!gameRef.current) {
          console.error("Game reference is null")
          gameRef.current = new Chess()
        }

        // If FEN is provided, use it to sync game state
        if (fen) {
          console.log("Syncing game state with FEN:", fen)
          gameRef.current.load(fen)

          // Update the board position with animation
          if (board) {
            board.position(fen, true) // Use true for animation
          } else {
            console.error("Board is null, cannot update position")
            // Try to reinitialize the board if it's null
            if (!boardInitialized && chessboardRef.current) {
              console.log("Attempting to reinitialize board...")
              initializeChessboard()
              // After initialization, set the position
              setTimeout(() => {
                if (board) {
                  board.position(fen, false)
                }
              }, 500)
            }
          }

          // Highlight the opponent's move
          highlightLastMove(from, to)

          // Update game state
          updateStatus()

          // Add move to history
          setMoves((prevMoves) => [
            ...prevMoves,
            {
              from: from,
              to: to,
              promotion: obtainedPromotion,
              player: "opponent",
            },
          ])

          // Play sound based on move type
          if (soundEnabled) {
            // Check if it was a capture by comparing piece counts before and after
            const piecesBefore = gameRef.current.history().length
            const move = gameRef.current.move({
              from,
              to,
              promotion: obtainedPromotion || "q",
            })
            gameRef.current.undo() // Undo the move we just made for checking

            if (move && move.captured) {
              captureSound.play()
            } else {
              moveSound.play()
            }

            if (gameRef.current.inCheck()) {
              checkSound.play()
            }

            if (gameRef.current.isCheckmate()) {
              checkmateSound.play()
            }
          }

          return
        }

        // Otherwise make the move normally (fallback)
        const move = gameRef.current.move({
          from,
          to,
          promotion: obtainedPromotion || "q",
        })

        if (move) {
          console.log("Successfully applied opponent's move:", move)

          // Update board position
          if (board) {
            board.position(gameRef.current.fen(), true) // Use true for animation
          } else {
            console.error("Board is null, cannot update position")
            // Try to reinitialize the board if it's null
            if (!boardInitialized && chessboardRef.current) {
              initializeChessboard()
              // After initialization, set the position
              setTimeout(() => {
                if (board) {
                  board.position(gameRef.current.fen(), false)
                }
              }, 500)
            }
          }

          // Highlight the opponent's move
          highlightLastMove(from, to)

          // Update game state
          updateStatus()
          setMoves((prevMoves) => [
            ...prevMoves,
            {
              from: move.from,
              to: move.to,
              promotion: obtainedPromotion,
              player: "opponent",
            },
          ])

          // Play sound based on move type
          if (soundEnabled) {
            if (move.captured) {
              captureSound.play()
            } else {
              moveSound.play()
            }

            if (gameRef.current.inCheck()) {
              checkSound.play()
            }

            if (gameRef.current.isCheckmate()) {
              checkmateSound.play()
            }
          }
        } else {
          console.error("Invalid move received from opponent:", from, to, obtainedPromotion)
          // Request current game state
          socketRef.current.emit("requestGameState")
        }
      } catch (error) {
        console.error("Error processing opponent's move:", error)
        // Request current game state on error
        socketRef.current.emit("requestGameState")
      }
    })

    socketRef.current.on("gameState", (fen) => {
      try {
        console.log("Received game state:", fen)
        if (!gameRef.current) {
          gameRef.current = new Chess()
        }

        if (gameRef.current && fen) {
          gameRef.current.load(fen)
          if (board) {
            board.position(fen, false) // Use false to avoid animation for syncing
          } else if (!boardInitialized && chessboardRef.current) {
            // Try to initialize the board if it doesn't exist
            initializeChessboard()
            // After initialization, set the position
            setTimeout(() => {
              if (board) {
                board.position(fen, false)
              }
            }, 500)
          }
          updateStatus()
        }
      } catch (error) {
        console.error("Error loading game state:", error)
      }
    })

    // Cleanup
    return () => {
      if (socketRef.current) {
        socketRef.current.off("move")
        socketRef.current.off("gameState")
      }
    }
  }, [playerColor, soundEnabled, board, boardInitialized, visualHints])

  // Apply theme colors to the board
  useEffect(() => {
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
  }, [theme])

  // Function to initialize the chessboard
  const initializeChessboard = () => {
    try {
      // Make sure we're using a library that's available in the browser
      if (typeof window !== "undefined" && window.Chessboard) {
        // Define the board configuration with all required handlers
        const config = {
          position: "start",
          orientation: playerColor || "white", // Default to white if playerColor is null
          draggable: !mobileMode,
          pieceTheme: (piece) => pieceImages[piece],
          onDragStart: onDragStart,
          onDrop: onDrop,
          onSnapEnd: onSnapEnd,
          onMouseoverSquare: onMouseoverSquare,
          onMouseoutSquare: onMouseoutSquare,
          onSquareClick: onSquareClick, // Add click handler for mobile mode
          snapbackSpeed: 500,
          snapSpeed: 100,
        }

        console.log("Initializing chessboard with config:", config)

        // Ensure the chessboard element exists
        if (!chessboardRef.current) {
          console.error("Chessboard ref is null, cannot initialize board")
          return
        }

        const newBoard = window.Chessboard(chessboardRef.current, config)
        setBoard(newBoard)
        setBoardInitialized(true)
        console.log("Chessboard initialized with orientation:", playerColor || "white")

        // Handle window resize for mobile
        const handleResize = () => {
          if (newBoard) {
            newBoard.resize()
          }
        }

        window.addEventListener("resize", handleResize)

        return () => {
          window.removeEventListener("resize", handleResize)
        }
      } else {
        console.error("Chessboard library not available")
        // Add a fallback or retry mechanism
        const checkBoardInterval = setInterval(() => {
          if (window.Chessboard) {
            clearInterval(checkBoardInterval)
            initializeChessboard()
          }
        }, 1000)

        // Clear interval after 10 seconds to prevent infinite checking
        setTimeout(() => clearInterval(checkBoardInterval), 10000)
      }
    } catch (error) {
      console.error("Error initializing chessboard:", error)
    }
  }

  // Handle square clicks for mobile mode
  const onSquareClick = (square) => {
    if (!mobileMode) return
    resetInactivityTimer()

    const game = gameRef.current
    if (!game) return

    // Check if it's the player's turn
    if ((playerColor === "white" && game.turn() === "b") || (playerColor === "black" && game.turn() === "w")) {
      return
    }

    // If no square is selected yet, select this one if it has a piece of the player's color
    if (!selectedSquare) {
      const piece = game.get(square)
      if (
        piece &&
        ((playerColor === "white" && piece.color === "w") || (playerColor === "black" && piece.color === "b"))
      ) {
        setSelectedSquare(square)

        // Show possible moves
        if (visualHints) {
          removeHighlights()
          highlightSquare(square)

          const moves = game.moves({
            square: square,
            verbose: true,
          })

          for (let i = 0; i < moves.length; i++) {
            highlightSquare(moves[i].to, "possible")
          }

          setPossibleMoves(moves.map((move) => move.to))
        }
      }
      return
    }

    // If a square is already selected
    if (selectedSquare) {
      // If clicking the same square, deselect it
      if (square === selectedSquare) {
        setSelectedSquare(null)
        setPossibleMoves([])
        removeHighlights()
        if (lastMove) {
          highlightSquare(lastMove.from, "last-move")
          highlightSquare(lastMove.to, "last-move")
        }
        return
      }

      // Try to make a move from the selected square to this square
      try {
        const move = game.move({
          from: selectedSquare,
          to: square,
          promotion: promotionPiece,
        })

        if (move) {
          // Move was successful
          if (board) {
            board.position(game.fen())
          }

          // Highlight the move
          highlightLastMove(selectedSquare, square)

          // Update game state
          updateStatus()

          // Send move to server
          if (socketRef.current) {
            const moveData = {
              from: selectedSquare,
              to: square,
              obtainedPromotion: promotionPiece,
              fen: game.fen(),
            }

            console.log("Sending move to server:", moveData)
            socketRef.current.emit("move", moveData)
          }

          // Add move to history
          setMoves((prevMoves) => [
            ...prevMoves,
            {
              from: move.from,
              to: move.to,
              promotion: promotionPiece,
              player: "player",
            },
          ])

          // Play sound
          if (soundEnabled) {
            if (move.captured) {
              captureSound.play()
            } else {
              moveSound.play()
            }

            if (game.inCheck()) {
              checkSound.play()
            }

            if (game.isCheckmate()) {
              checkmateSound.play()
            }
          }
        }
      } catch (error) {
        console.error("Invalid move:", error)
      }

      // Reset selection regardless of move validity
      setSelectedSquare(null)
      setPossibleMoves([])
      removeHighlights()
      if (lastMove) {
        highlightSquare(lastMove.from, "last-move")
        highlightSquare(lastMove.to, "last-move")
      }
    }
  }

  // Highlight legal moves
  const onMouseoverSquare = (square, piece) => {
    if (!visualHints || mobileMode) return

    // Get list of possible moves for this square
    const game = gameRef.current
    if (!game) return

    // Don't show moves if it's not the player's turn
    if ((playerColor === "white" && game.turn() === "b") || (playerColor === "black" && game.turn() === "w")) {
      return
    }

    const moves = game.moves({
      square: square,
      verbose: true,
    })

    // Exit if there are no moves available for this square
    if (moves.length === 0) return

    // Highlight the square they moused over
    highlightSquare(square)

    // Highlight the possible squares for this piece
    for (let i = 0; i < moves.length; i++) {
      highlightSquare(moves[i].to, "possible")
    }
  }

  const onMouseoutSquare = () => {
    if (!visualHints || mobileMode) return

    // Don't remove highlights if we're showing the last move
    if (lastMove) {
      removeHighlights()
      highlightSquare(lastMove.from, "last-move")
      highlightSquare(lastMove.to, "last-move")
    } else {
      removeHighlights()
    }
  }

  // Drag start handler - only allow dragging pieces if it's the player's turn
  const onDragStart = (source, piece) => {
    resetInactivityTimer()
    const game = gameRef.current
    if (!game) return false

    // Check if the game is over
    if (game.isGameOver()) return false

    // Check if it's the player's turn
    if (
      (playerColor === "white" && piece.search(/^b/) !== -1) ||
      (playerColor === "black" && piece.search(/^w/) !== -1)
    ) {
      return false
    }

    // Check if it's the player's turn based on game state
    if ((playerColor === "white" && game.turn() === "b") || (playerColor === "black" && game.turn() === "w")) {
      return false
    }

    // Show possible moves when piece is picked up
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

    return true
  }

  // Drop handler - attempt to make a move when a piece is dropped
  const onDrop = (source, target) => {
    resetInactivityTimer()
    const game = gameRef.current
    if (!game) return "snapback"

    // Remove highlighted squares
    removeHighlights()

    try {
      // Check if it's the player's turn
      const playerTurn = playerColor === "white" ? "w" : "b"
      if (game.turn() !== playerTurn) {
        console.warn("Not your turn")
        return "snapback"
      }

      // Attempt to make the move
      const move = game.move({
        from: source,
        to: target,
        promotion: promotionPiece,
      })

      // If the move is invalid, return 'snapback'
      if (!move) {
        console.warn("Invalid move attempted:", source, target)
        return "snapback"
      }

      console.log("Valid move made:", move)

      // Highlight the move
      highlightLastMove(source, target)

      // Update game state
      updateStatus()

      // Send move to server with current FEN for state synchronization
      if (socketRef.current) {
        const moveData = {
          from: source,
          to: target,
          obtainedPromotion: promotionPiece,
          fen: game.fen(), // Include FEN for state synchronization
        }

        console.log("Sending move to server:", moveData)
        socketRef.current.emit("move", moveData)
      }

      // Add move to history
      setMoves((prevMoves) => [
        ...prevMoves,
        {
          from: move.from,
          to: move.to,
          promotion: promotionPiece,
          player: "player",
        },
      ])

      // Play sound based on move type
      if (soundEnabled) {
        if (move.captured) {
          captureSound.play()
        } else {
          moveSound.play()
        }

        if (game.inCheck()) {
          checkSound.play()
        }

        if (game.isCheckmate()) {
          checkmateSound.play()
        }
      }

      return undefined // Move is valid
    } catch (error) {
      console.error("Error making move:", error)
      return "snapback"
    }
  }

  // Snap end handler - ensure board position matches game state
  const onSnapEnd = () => {
    if (board && gameRef.current) {
      board.position(gameRef.current.fen())
    }
  }

  // Update game status text
  const updateStatus = () => {
    const game = gameRef.current
    if (!game) return

    let status = ""
    const turn = game.turn() === "w" ? "White" : "Black"
    const isPlayerTurn = (playerColor === "white" && turn === "White") || (playerColor === "black" && turn === "Black")

    if (game.isCheckmate()) {
      const winner = turn === "White" ? "Black" : "White"
      status = `Game over, ${winner} wins by checkmate.`

      // Record match result
      if (user && opponent) {
        const userWon =
          (playerColor === "white" && winner === "White") || (playerColor === "black" && winner === "Black")

        console.log("Recording match result:", {
          userWon,
          playerColor,
          winner,
          user: user.userId,
          opponent: opponent.username,
        })

        addMatchToHistory(user.userId, opponent.username, userWon ? "win" : "lose").then(() => {
          // Force refresh profile data after match
          if (socketRef.current) {
            socketRef.current.emit("matchCompleted", {
              winner: userWon ? user.userId : opponent.userId,
              loser: userWon ? opponent.userId : user.userId,
            })
          }

          // Show game over modal
          setGameOverMessage(userWon ? "You win!" : "You lose!")
          setIsGameOver(true)

          // Clear game ID from storage
          localStorage.removeItem("chessGameId")

          // Trigger celebration if player wins
          if (userWon) {
            triggerWinCelebration()
          }
        })
      }
    } else if (game.isDraw()) {
      status = "Game over, draw."

      if (user && opponent) {
        console.log("Recording draw result")
        addMatchToHistory(user.userId, opponent.username, "draw").then(() => {
          // Force refresh profile data after match
          if (socketRef.current) {
            socketRef.current.emit("matchCompleted", {
              draw: true,
              players: [user.userId, opponent.userId],
            })
          }

          // Show game over modal
          setGameOverMessage("It's a draw!")
          setIsGameOver(true)

          // Clear game ID from storage
          localStorage.removeItem("chessGameId")
        })
      }
    } else {
      status = `${turn} to move${isPlayerTurn ? " (Your turn)" : ""}`
      if (game.inCheck()) {
        status += ", check!"
      }
    }

    setCurrentStatus(status)
  }

  // Calculate player rating
  const calculateRating = (wins, loses, draws) => {
    const totalGames = wins + loses + draws
    if (totalGames === 0) return 0
    const winRatio = wins / totalGames
    const baseRating = 900
    return Math.round(baseRating + winRatio * 2100)
  }

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!boardContainerRef.current) return

    if (!fullscreen) {
      if (boardContainerRef.current.requestFullscreen) {
        boardContainerRef.current.requestFullscreen()
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      }
    }

    setFullscreen(!fullscreen)
  }

  // Toggle sound
  const toggleSound = () => {
    setSoundEnabled(!soundEnabled)
  }

  // Toggle moves table
  const toggleTable = () => {
    setShowMovesList(!showMovesList)
  }

  // Toggle mobile mode
  const handleMobileModeChange = () => {
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

      // Reinitialize the board with the new draggable setting
      if (boardInitialized && board) {
        board.destroy()
        setTimeout(() => {
          initializeChessboard()
        }, 100)
      }

      return newMode
    })
  }

  // Handle promotion piece change
  const handlePromotionChange = (e) => {
    setPromotionPiece(e.target.value)
  }

  // Handle theme change
  const handleThemeChange = (e) => {
    setTheme(e.target.value)
  }

  // Toggle visual hints
  const toggleVisualHints = () => {
    setVisualHints(!visualHints)

    // Clear highlights if turning off
    if (visualHints) {
      removeHighlights()
    } else if (lastMove) {
      // Restore last move highlight if turning on
      highlightLastMove(lastMove.from, lastMove.to)
    }
  }

  // Show leave confirmation modal
  const confirmLeaveGame = () => {
    setShowLeaveConfirmation(true)
  }

  // Handle leave game
  const handleLeaveGame = () => {
    if (user && opponent) {
      // Record loss due to leaving
      addMatchToHistory(user.userId, opponent.username, "lose").then(() => {
        console.log("Match recorded as loss due to leaving")

        // Notify opponent
        if (socketRef.current) {
          socketRef.current.emit("playerLeft", {
            userId: user.userId,
            username: user.username,
            opponentId: opponent.userId,
          })
        }

        // Clear game ID from storage
        localStorage.removeItem("chessGameId")

        // Navigate back to mode selector
        navigate("/modeselector")
      })
    } else {
      // Clear game ID from storage
      localStorage.removeItem("chessGameId")
      navigate("/modeselector")
    }
  }

  // Cancel leave game
  const cancelLeaveGame = () => {
    setShowLeaveConfirmation(false)
  }

  // Handle game restart
  const handleRestart = () => {
    setIsGameOver(false)
    // Clear game ID from storage
    localStorage.removeItem("chessGameId")
    navigate("/modeselector")
  }

  // If waiting for opponent, show wait queue
  if (waitingForOpponent) {
    return <WaitQueue socket={socketRef.current} />
  }

  // If there's a connection error, show error message
  if (connectionError && !waitingForOpponent) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900">
        <div className="bg-red-900/50 p-8 rounded-lg text-white max-w-md text-center">
          <h2 className="text-2xl font-bold mb-4">Connection Error</h2>
          <p className="mb-6">
            Unable to connect to the game server. Please check your internet connection and try again.
          </p>
          <button
            onClick={() => navigate("/modeselector")}
            className="bg-white text-red-900 px-6 py-2 rounded-md font-semibold hover:bg-gray-200"
          >
            Return to Menu
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      className="flex min-h-screen overflow-auto items-center justify-center w-screen"
      style={{
        backgroundImage: `url(${boardbg})`,
        backgroundSize: "cover",
      }}
    >
      <div className="w-screen mt-16 flex flex-col lg:flex-row mx-auto my-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="lg:mx-8 w-full mx-auto mb-6 lg:mb-0 lg:w-1/2"
          ref={boardContainerRef}
        >
          {opponent && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex justify-between text-center mr-8 mb-4 text-lg lg:text-xl xl:text-2xl text-white backdrop-blur-sm bg-black/30 p-3 rounded-lg"
            >
              <p>Opponent: {opponent.username?.split(" ")[0] || "Opponent"}</p>
              <p>Rating: {calculateRating(opponent.wins || 0, opponent.loses || 0, opponent.draws || 0)}</p>
            </motion.div>
          )}

          <div
            className="relative mx-auto backdrop-blur-sm bg-white/10 p-4 shadow-xl rounded-lg"
            style={{ width: window.innerWidth > 1028 ? "40vw" : "90vw" }}
          >
            <div className="absolute top-2 right-2 z-10 flex space-x-2">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={toggleSound}
                className="p-2 bg-gray-800 bg-opacity-70 rounded-full text-white hover:bg-opacity-100 transition-all"
              >
                {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={toggleFullscreen}
                className="p-2 bg-gray-800 bg-opacity-70 rounded-full text-white hover:bg-opacity-100 transition-all"
              >
                {fullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={confirmLeaveGame}
                className="p-2 bg-red-600 bg-opacity-70 rounded-full text-white hover:bg-opacity-100 transition-all"
                title="Leave Game (counts as a loss)"
              >
                <LogOut size={20} />
              </motion.button>
            </div>
            <div ref={chessboardRef} className="mx-auto"></div>
          </div>

          {user && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex text-lg lg:text-xl xl:text-2xl justify-between text-center mr-8 mt-4 mb-4 text-white backdrop-blur-sm bg-black/30 p-3 rounded-lg"
            >
              <p>You ({user.username || "Player"})</p>
              <p>Rating: {calculateRating(user.wins || 0, user.loses || 0, user.draws || 0)}</p>
            </motion.div>
          )}

          <div className="mt-4 p-4 backdrop-blur-sm bg-white/10 border-2 border-white/30 rounded-xl shadow-lg">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex items-center gap-2">
                <label className="flex items-center gap-2 text-white font-semibold bg-blue-600/80 p-2 rounded-md">
                  <input type="checkbox" checked={mobileMode} onChange={handleMobileModeChange} className="w-4 h-4" />
                  <span>Mobile Mode</span>
                </label>
              </motion.div>

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex items-center gap-2">
                <label className="flex items-center gap-2 text-white font-semibold bg-purple-600/80 p-2 rounded-md">
                  <input type="checkbox" checked={visualHints} onChange={toggleVisualHints} className="w-4 h-4" />
                  <span>Visual Hints</span>
                </label>
              </motion.div>

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <select
                  value={theme}
                  onChange={handleThemeChange}
                  className="bg-amber-600/80 text-white p-2 rounded-md font-semibold"
                >
                  <option value="classic">Classic</option>
                  <option value="forest">Forest</option>
                  <option value="ocean">Ocean</option>
                  <option value="night">Night</option>
                  <option value="royal">Royal</option>
                </select>
              </motion.div>

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <select
                  value={promotionPiece}
                  onChange={handlePromotionChange}
                  className="bg-green-600/80 text-white p-2 rounded-md font-semibold"
                >
                  <option value="q">Queen</option>
                  <option value="r">Rook</option>
                  <option value="b">Bishop</option>
                  <option value="n">Knight</option>
                </select>
              </motion.div>
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
                <p className="text-xl font-semibold">{currentStatus}</p>
              </motion.div>
            </div>

            {/* Help text for mobile mode */}
            {mobileMode && (
              <div className="mt-4 p-3 bg-black/50 text-white text-center rounded-lg">
                {selectedSquare ? "Tap a highlighted square to move" : "Tap a piece to select"}
              </div>
            )}
          </div>
        </motion.div>

        {/* Game info sidebar */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="lg:w-1/2 w-full lg:mx-8 mx-auto"
        >
          <div className="bg-black/50 backdrop-blur-xl border border-white/30 rounded-xl shadow-lg overflow-hidden">
            <div className="p-4">
              <motion.div
                whileHover={{ scale: 1.01 }}
                className="rounded-xl shadow-lg text-center p-6 bg-gradient-to-r from-blue-600/80 to-purple-600/80 text-white border border-white/30"
              >
                <h2 className="text-3xl font-bold mb-2">Global Multiplayer</h2>
                <p className="text-lg">Playing against: {opponent?.username || "Opponent"}</p>
              </motion.div>

              <div className="mt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-white">Move History</h3>
                  <button onClick={toggleTable} className="text-white bg-blue-600/80 px-3 py-1 rounded-md text-sm">
                    {showMovesList ? "Hide" : "Show"}
                  </button>
                </div>

                {showMovesList && (
                  <div className="bg-black/30 rounded-lg p-2 max-h-[300px] overflow-y-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="text-white border-b border-white/20">
                          <th className="p-2 text-left">#</th>
                          <th className="p-2 text-left">From</th>
                          <th className="p-2 text-left">To</th>
                          <th className="p-2 text-left">Player</th>
                        </tr>
                      </thead>
                      <tbody>
                        {moves.map((move, index) => (
                          <tr key={index} className={`text-white ${index % 2 === 0 ? "bg-white/5" : ""}`}>
                            <td className="p-2">{index + 1}</td>
                            <td className="p-2">{move.from}</td>
                            <td className="p-2">{move.to}</td>
                            <td className="p-2">{move.player === "player" ? "You" : "Opponent"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={confirmLeaveGame}
                className="mt-6 w-full bg-gradient-to-r from-red-600 to-red-400 text-white py-3 px-4 rounded-md font-semibold shadow-md"
              >
                Leave Game (Counts as Loss)
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Game Over Modal */}
      <GameOverModal isOpen={isGameOver} message={gameOverMessage} onRestart={handleRestart} />

      {/* Leave Confirmation Modal */}
      {showLeaveConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full"
          >
            <h2 className="text-xl font-bold text-white mb-4">Are you sure?</h2>
            <p className="text-gray-300 mb-6">Leaving the game will count as a loss. Are you sure you want to quit?</p>
            <div className="flex justify-end space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={cancelLeaveGame}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                No, Continue Playing
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLeaveGame}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Yes, Quit Game
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default GlobalMultiplayer
