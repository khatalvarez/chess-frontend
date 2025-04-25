"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { Chess } from "chess.js"
import { useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { Howl } from "howler"
import { Maximize2, Minimize2, Volume2, VolumeX, LogOut, MessageSquare } from "lucide-react"
import axios from "axios"
import { motion } from "framer-motion"
import confetti from "canvas-confetti"
import WaitQueue from "../WaitQueue"
import pieceImages from "../pieceImages"
import GameOverModal from "../GameOverModal"
import ChatModal from "../ChatModal"
import ReconnectModal from "../ReconnectModal"
import moveSoundFile from "../../assets/sounds/move.mp3"
import captureSoundFile from "../../assets/sounds/capture.mp3"
import checkSoundFile from "../../assets/sounds/check.mp3"
import checkmateSoundFile from "../../assets/sounds/checkmate.mp3"
import boardbg from "../../assets/images/bgboard.webp"
import { BASE_URL } from "../../url"
import { io } from "socket.io-client"

// Initialize sound effects with preloading to avoid delays
const moveSound = new Howl({ src: [moveSoundFile], preload: true })
const captureSound = new Howl({ src: [captureSoundFile], preload: true })
const checkSound = new Howl({ src: [checkSoundFile], preload: true })
const checkmateSound = new Howl({ src: [checkmateSoundFile], preload: true })

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
  const [reconnecting, setReconnecting] = useState(false)
  const [showReconnectModal, setShowReconnectModal] = useState(false)
  const [availableGames, setAvailableGames] = useState([])
  const [connectionStatus, setConnectionStatus] = useState("connecting")
  const [showChatModal, setShowChatModal] = useState(false)
  const [chatMessages, setChatMessages] = useState([])
  const [unreadMessages, setUnreadMessages] = useState(0)
  const [playAgainRequested, setPlayAgainRequested] = useState(false)
  const [opponentPlayAgainRequested, setOpponentPlayAgainRequested] = useState(false)
  const [playAgainCountdown, setPlayAgainCountdown] = useState(null)
  const [inactivityTimer, setInactivityTimer] = useState(null)

  // Refs
  const chessboardRef = useRef(null)
  const socketRef = useRef(null)
  const gameRef = useRef(null)
  const boardContainerRef = useRef(null)
  const reconnectAttemptsRef = useRef(0)
  const maxReconnectAttempts = 5
  const reconnectTimeoutRef = useRef(null)
  const inactivityTimeoutRef = useRef(null)
  const playAgainTimeoutRef = useRef(null)
  const lastActivityRef = useRef(Date.now())
  const currentStatusRef = useRef("Waiting for opponent...")
  const isComponentMountedRef = useRef(true)
  const socketInitializedRef = useRef(false)

  // Celebration effect when player wins
  const triggerWinCelebration = useCallback(() => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#ffb347", "#ffcc33", "#fff"],
    })

    // Second burst for more effect
    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.6 },
      })

      confetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.6 },
      })
    }, 500)
  }, [])

  // Utility functions for highlighting moves
  const removeHighlights = useCallback(() => {
    const squares = document.querySelectorAll(".square-55d63")
    squares.forEach((square) => {
      square.classList.remove("highlight-square", "possible-move", "last-move")
      square.style.background = ""
    })
  }, [])

  const highlightSquare = useCallback((square, type = "highlight") => {
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
  }, [])

  const highlightLastMove = useCallback(
    (from, to) => {
      if (!visualHints) return

      removeHighlights()
      highlightSquare(from, "last-move")
      highlightSquare(to, "last-move")
      setLastMove({ from, to })
    },
    [visualHints, removeHighlights, highlightSquare],
  )

  // Reset game state for a new game
  const resetGameState = useCallback(() => {
    const newGame = new Chess()
    setGame(newGame)
    gameRef.current = newGame
    setMoves([])
    setLastMove(null)
    setIsGameOver(false)
    setGameOverMessage("")
    setCurrentStatus("Game starting...")
    currentStatusRef.current = "Game starting..."
    removeHighlights()
  }, [removeHighlights])

  // Add match to history function
  const addMatchToHistory = useCallback(
    async (userId, opponentName, status) => {
      try {
        console.log("Sending match data:", { userId, opponentName, status })
        const response = await axios.post(
          `${BASE_URL}/user/${userId}/match-history`,
          {
            opponent: opponentName,
            status,
            gameId: gameId || "unknown",
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
        // Implement retry logic with exponential backoff
        return new Promise((resolve) => {
          setTimeout(() => {
            console.log("Retrying match history update...")
            resolve(addMatchToHistory(userId, opponentName, status))
          }, 3000)
        })
      }
    },
    [gameId],
  )

  // Update game status text
  const updateStatus = useCallback(() => {
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
          if (socketRef.current && socketRef.current.connected) {
            socketRef.current.emit("matchCompleted", {
              winner: userWon ? user.userId : opponent.userId,
              loser: userWon ? opponent.userId : user.userId,
              gameId: gameId,
            })
          }

          // Show game over modal
          setGameOverMessage(userWon ? "You win!" : "You lose!")
          setIsGameOver(true)

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
          if (socketRef.current && socketRef.current.connected) {
            socketRef.current.emit("matchCompleted", {
              draw: true,
              players: [user.userId, opponent.userId],
              gameId: gameId,
            })
          }

          // Show game over modal
          setGameOverMessage("It's a draw!")
          setIsGameOver(true)
        })
      }
    } else {
      status = `${turn} to move${isPlayerTurn ? " (Your turn)" : ""}`
      if (game.inCheck()) {
        status += ", check!"
      }
    }

    // Only update state if status has changed
    if (status !== currentStatusRef.current) {
      currentStatusRef.current = status
      setCurrentStatus(status)
    }
  }, [gameId, opponent, playerColor, triggerWinCelebration, user, addMatchToHistory])

  // Handle leave game
  const handleLeaveGame = useCallback(
    (autoForfeit = false) => {
      if (user && opponent) {
        // Record loss due to leaving
        addMatchToHistory(user.userId, opponent.username, "lose").then(() => {
          console.log("Match recorded as loss due to leaving")

          // Notify opponent
          if (socketRef.current && socketRef.current.connected) {
            socketRef.current.emit("playerLeft", {
              userId: user.userId,
              username: user.username,
              opponentId: opponent.userId,
              gameId: gameId,
              autoForfeit: autoForfeit,
            })
          }

          // Navigate back to mode selector
          navigate("/modeselector")
        })
      } else {
        navigate("/modeselector")
      }
    },
    [user, opponent, addMatchToHistory, navigate, gameId],
  )

  // Reset inactivity timer on any user action
  const resetInactivityTimer = useCallback(() => {
    lastActivityRef.current = Date.now()

    // Clear existing timeout
    if (inactivityTimeoutRef.current) {
      clearTimeout(inactivityTimeoutRef.current)
    }

    // Set new timeout - warn user after 5 minutes of inactivity
    inactivityTimeoutRef.current = setTimeout(
      () => {
        if (!isGameOver && opponent) {
          setInactivityTimer(60) // 60 second countdown

          // Start countdown
          let timeLeft = 60
          const countdownInterval = setInterval(() => {
            timeLeft -= 1
            setInactivityTimer(timeLeft)

            if (timeLeft <= 0) {
              clearInterval(countdownInterval)
              setInactivityTimer(null)
              // Auto-forfeit the game
              handleLeaveGame(true)
            }
          }, 1000)

          // Clear countdown if user becomes active
          const clearCountdown = () => {
            clearInterval(countdownInterval)
            setInactivityTimer(null)
            document.removeEventListener("mousemove", clearCountdown)
            document.removeEventListener("keydown", clearCountdown)
            document.removeEventListener("click", clearCountdown)
            document.removeEventListener("touchstart", clearCountdown)
          }

          document.addEventListener("mousemove", clearCountdown)
          document.addEventListener("keydown", clearCountdown)
          document.addEventListener("click", clearCountdown)
          document.addEventListener("touchstart", clearCountdown)
        }
      },
      5 * 60 * 1000,
    ) // 5 minutes
  }, [isGameOver, opponent, handleLeaveGame])

  // Drag start handler - only allow dragging pieces if it's the player's turn
  const onDragStart = useCallback(
    (source, piece) => {
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
    },
    [playerColor, visualHints, removeHighlights, highlightSquare],
  )

  // Drop handler - attempt to make a move when a piece is dropped
  const onDrop = useCallback(
    (source, target) => {
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
        if (socketRef.current && socketRef.current.connected) {
          const moveData = {
            from: source,
            to: target,
            obtainedPromotion: promotionPiece,
            fen: game.fen(),
            gameId: gameId,
            player: user?.userId,
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
    },
    [removeHighlights, playerColor, promotionPiece, highlightLastMove, updateStatus, gameId, user, soundEnabled],
  )

  // Snap end handler - ensure board position matches game state
  const onSnapEnd = useCallback(() => {
    if (board && gameRef.current) {
      board.position(gameRef.current.fen())
    }
  }, [board])

  // Highlight legal moves
  const onMouseoverSquare = useCallback(
    (square, piece) => {
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
    },
    [visualHints, mobileMode, playerColor, highlightSquare],
  )

  const onMouseoutSquare = useCallback(() => {
    if (!visualHints || mobileMode) return

    // Don't remove highlights if we're showing the last move
    if (lastMove) {
      removeHighlights()
      highlightSquare(lastMove.from, "last-move")
      highlightSquare(lastMove.to, "last-move")
    } else {
      removeHighlights()
    }
  }, [visualHints, mobileMode, lastMove, removeHighlights, highlightSquare])

  // Handle square click for mobile mode
  const onSquareClick = useCallback(
    (square) => {
      if (!mobileMode || isGameOver) return

      const game = gameRef.current
      if (!game) return

      // Check if it's the player's turn
      const playerTurn = playerColor === "white" ? "w" : "b"
      if (game.turn() !== playerTurn) {
        return
      }

      // If no square is selected yet, check if the clicked square has a piece that can be moved
      if (!selectedSquare) {
        const piece = game.get(square)
        if (
          piece &&
          ((playerColor === "white" && piece.color === "w") || (playerColor === "black" && piece.color === "b"))
        ) {
          // Get possible moves for this piece
          const moves = game.moves({
            square: square,
            verbose: true,
          })

          if (moves.length > 0) {
            setSelectedSquare(square)
            setPossibleMoves(moves)

            // Highlight the selected square and possible moves
            removeHighlights()
            highlightSquare(square)
            moves.forEach((move) => {
              highlightSquare(move.to, "possible")
            })
          }
        }
      } else {
        // A square is already selected, check if the clicked square is a valid destination
        const isValidMove = possibleMoves.some((move) => move.to === square)

        if (isValidMove) {
          // Make the move
          const move = game.move({
            from: selectedSquare,
            to: square,
            promotion: promotionPiece,
          })

          if (move) {
            // Update board position
            if (board) {
              board.position(game.fen())
            }

            // Highlight the move
            highlightLastMove(selectedSquare, square)

            // Update game state
            updateStatus()

            // Send move to server
            if (socketRef.current && socketRef.current.connected) {
              const moveData = {
                from: selectedSquare,
                to: square,
                obtainedPromotion: promotionPiece,
                fen: game.fen(),
                gameId: gameId,
                player: user?.userId,
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
          }

          // Reset selection state
          setSelectedSquare(null)
          setPossibleMoves([])
        } else if (square === selectedSquare) {
          // Clicked the same square again, deselect it
          setSelectedSquare(null)
          setPossibleMoves([])
          removeHighlights()

          // Restore last move highlight if there was one
          if (lastMove) {
            highlightLastMove(lastMove.from, lastMove.to)
          }
        } else {
          // Clicked a different invalid square, check if it has a player's piece
          const piece = game.get(square)
          if (
            piece &&
            ((playerColor === "white" && piece.color === "w") || (playerColor === "black" && piece.color === "b"))
          ) {
            // Select this new piece instead
            const moves = game.moves({
              square: square,
              verbose: true,
            })

            if (moves.length > 0) {
              setSelectedSquare(square)
              setPossibleMoves(moves)

              // Highlight the selected square and possible moves
              removeHighlights()
              highlightSquare(square)
              moves.forEach((move) => {
                highlightSquare(move.to, "possible")
              })
            }
          } else {
            // Clicked an empty square or opponent's piece, deselect
            setSelectedSquare(null)
            setPossibleMoves([])
            removeHighlights()

            // Restore last move highlight if there was one
            if (lastMove) {
              highlightLastMove(lastMove.from, lastMove.to)
            }
          }
        }
      }
    },
    [
      mobileMode,
      isGameOver,
      playerColor,
      selectedSquare,
      possibleMoves,
      board,
      promotionPiece,
      gameId,
      user,
      soundEnabled,
      removeHighlights,
      highlightSquare,
      highlightLastMove,
      lastMove,
      updateStatus,
    ],
  )

  // Function to initialize the chessboard
  const initializeChessboard = useCallback(() => {
    try {
      // Make sure we're using a library that's available in the browser
      if (typeof window !== "undefined" && window.Chessboard) {
        // Define the board configuration with all required handlers
        const config = {
          position: "start",
          orientation: playerColor,
          draggable: !mobileMode,
          pieceTheme: (piece) => pieceImages[piece],
          onDragStart: onDragStart,
          onDrop: onDrop,
          onSnapEnd: onSnapEnd,
          onMouseoverSquare: onMouseoverSquare,
          onMouseoutSquare: onMouseoutSquare,
          onSquareClick: mobileMode ? onSquareClick : undefined,
          snapbackSpeed: 500,
          snapSpeed: 100,
        }

        const newBoard = window.Chessboard(chessboardRef.current, config)
        setBoard(newBoard)
        setBoardInitialized(true)
        console.log("Chessboard initialized with orientation:", playerColor)

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
  }, [playerColor, mobileMode, onDragStart, onDrop, onSnapEnd, onMouseoverSquare, onMouseoutSquare, onSquareClick])

  // Handle reconnection logic
  const handleReconnection = useCallback(() => {
    if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
      console.log("Max reconnection attempts reached")
      setConnectionStatus("failed")

      // If we were in a game, show game over
      if (gameId && opponent) {
        setGameOverMessage("Connection lost. Unable to reconnect to the game.")
        setIsGameOver(true)
      }
      return
    }

    reconnectAttemptsRef.current += 1
    console.log(`Attempting to reconnect (${reconnectAttemptsRef.current}/${maxReconnectAttempts})...`)

    // Clear any existing timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
    }

    // Set reconnecting state
    setReconnecting(true)
    setConnectionStatus("reconnecting")

    // Exponential backoff for reconnection
    const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current - 1), 10000)

    reconnectTimeoutRef.current = setTimeout(() => {
      setupSocket()
    }, delay)
  }, [gameId, opponent])

  // Setup socket connection
  const setupSocket = useCallback(() => {
    if (!user || !isComponentMountedRef.current) return null

    // Only create a new socket if we don't have one or it's not connected
    if (socketRef.current && socketRef.current.connected && !reconnecting) {
      console.log("Using existing socket connection")
      return socketRef.current
    }

    // Cleanup any existing socket
    if (socketRef.current) {
      socketRef.current.disconnect()
    }

    // Create socket connection
    const socketUrl = BASE_URL.includes("://") ? BASE_URL : `https://${BASE_URL}`
    console.log("Connecting to socket server at:", socketUrl)

    try {
      const socket = io(socketUrl, {
        query: {
          user: JSON.stringify(user),
          reconnecting: reconnecting,
          gameId: gameId,
        },
        reconnection: true,
        reconnectionAttempts: maxReconnectAttempts,
        reconnectionDelay: 1000,
        timeout: 10000,
        transports: ["websocket", "polling"],
      })

      socketRef.current = socket
      socketInitializedRef.current = true

      // Debug connection status
      socket.on("connect", () => {
        console.log("Connected to server with ID:", socket.id)
        setConnectionStatus("connected")
        reconnectAttemptsRef.current = 0

        // Add error handling
        try {
          // If we were reconnecting, request current game state
          if (reconnecting && gameId) {
            console.log("Requesting game state after reconnection for game:", gameId)
            socket.emit("rejoinGame", { gameId, userId: user.userId })
          }
        } catch (error) {
          console.error("Error during reconnection:", error)
        }
      })

      socket.on("connect_error", (error) => {
        console.error("Connection error:", error)
        setConnectionStatus("error")
        handleReconnection()
      })

      socket.on("disconnect", (reason) => {
        console.log("Disconnected from server:", reason)
        setConnectionStatus("disconnected")

        // Don't attempt to reconnect if the game is over
        if (!isGameOver && isComponentMountedRef.current) {
          handleReconnection()
        }
      })

      socket.on("waiting", (isWaiting) => {
        console.log("Waiting status:", isWaiting)
        if (isComponentMountedRef.current) {
          setWaitingForOpponent(isWaiting)
        }
      })

      socket.on("gameCreated", (data) => {
        console.log("Game created:", data)
        if (isComponentMountedRef.current) {
          setGameId(data.gameId)
        }
      })

      socket.on("color", (color) => {
        console.log("Received color:", color)
        if (isComponentMountedRef.current) {
          setPlayerColor(color)
          setWaitingForOpponent(false)
        }
      })

      socket.on("opponent", (obtainedOpponent) => {
        console.log("Opponent received:", obtainedOpponent)
        if (isComponentMountedRef.current) {
          setOpponent(obtainedOpponent)
          setReconnecting(false)
          setShowReconnectModal(false)
        }
      })

      socket.on("opponentDisconnected", (data) => {
        const { opponentName, temporary } = data
        console.log("Opponent disconnected:", opponentName || "Opponent", "Temporary:", temporary)

        if (!isComponentMountedRef.current) return

        if (temporary) {
          // Opponent might reconnect
          setCurrentStatus(`${opponentName || "Opponent"} disconnected. Waiting for reconnection...`)
          currentStatusRef.current = `${opponentName || "Opponent"} disconnected. Waiting for reconnection...`
        } else {
          // Opponent has fully disconnected
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
        }
      })

      socket.on("opponentReconnected", (opponentData) => {
        console.log("Opponent reconnected:", opponentData)
        if (!isComponentMountedRef.current) return

        setCurrentStatus(`${opponentData.username || "Opponent"} has reconnected. Game continues.`)
        currentStatusRef.current = `${opponentData.username || "Opponent"} has reconnected. Game continues.`

        // Update opponent data if needed
        if (opponentData && (!opponent || opponent.userId !== opponentData.userId)) {
          setOpponent(opponentData)
        }
      })

      socket.on("availableGames", (games) => {
        console.log("Available games to rejoin:", games)
        if (!isComponentMountedRef.current) return

        setAvailableGames(games)

        if (games.length > 0 && !gameId) {
          setShowReconnectModal(true)
        }
      })

      socket.on("gameState", (data) => {
        try {
          console.log("Received game state:", data)
          if (!isComponentMountedRef.current) return

          const {
            fen,
            gameId: receivedGameId,
            playerColor: receivedColor,
            opponent: receivedOpponent,
            moves: gameMoves,
          } = data

          // Update game ID if provided
          if (receivedGameId) {
            setGameId(receivedGameId)
          }

          // Update player color if provided
          if (receivedColor) {
            setPlayerColor(receivedColor)
          }

          // Update opponent if provided
          if (receivedOpponent) {
            setOpponent(receivedOpponent)
          }

          // Update moves history if provided
          if (gameMoves && Array.isArray(gameMoves)) {
            setMoves(gameMoves)
          }

          // Update game state with FEN
          if (gameRef.current && fen) {
            gameRef.current.load(fen)
            if (board) {
              board.position(fen, false) // Use false to avoid animation for syncing
            }
            updateStatus()

            // If there are moves, highlight the last one
            if (gameMoves && gameMoves.length > 0) {
              const lastGameMove = gameMoves[gameMoves.length - 1]
              highlightLastMove(lastGameMove.from, lastGameMove.to)
            }
          }

          // No longer waiting for opponent or reconnecting
          setWaitingForOpponent(false)
          setReconnecting(false)
          setShowReconnectModal(false)
        } catch (error) {
          console.error("Error loading game state:", error)
        }
      })

      socket.on("move", ({ from, to, obtainedPromotion, fen, player }) => {
        try {
          console.log("Received move:", from, to, obtainedPromotion, "from player:", player)
          if (!isComponentMountedRef.current) return

          // If FEN is provided, use it to sync game state
          if (fen) {
            console.log("Syncing game state with FEN:", fen)
            gameRef.current.load(fen)
            if (board) {
              board.position(fen, false) // Use false to avoid animation for syncing
            }
            updateStatus()
            return
          }

          // Otherwise make the move normally
          const move = gameRef.current.move({
            from,
            to,
            promotion: obtainedPromotion || "q",
          })

          if (move) {
            console.log("Successfully applied move:", move)

            // Update board position
            if (board) {
              board.position(gameRef.current.fen(), true) // Use true for animation
            }

            // Highlight the move
            highlightLastMove(from, to)

            // Update game state
            updateStatus()

            // Only add to moves history if it's from the opponent
            // (our own moves are added in onDrop)
            if (player !== user?.userId) {
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
            }
          } else {
            console.error("Invalid move received:", from, to, obtainedPromotion)
            // Request current game state
            socket.emit("requestGameState", { gameId })
          }
        } catch (error) {
          console.error("Error processing move:", error)
          // Request current game state on error
          socket.emit("requestGameState", { gameId })
        }
      })

      // Chat message handling
      socket.on("chatMessage", (message) => {
        console.log("Received chat message:", message)
        if (!isComponentMountedRef.current) return

        setChatMessages((prev) => [...prev, message])

        // Increment unread count if chat is not open
        if (!showChatModal) {
          setUnreadMessages((prev) => prev + 1)
        }

        // Play notification sound if enabled
        if (soundEnabled) {
          // You could add a chat notification sound here
        }
      })

      // Play again request handling
      socket.on("playAgainRequest", (requestingUserId) => {
        console.log("Received play again request from:", requestingUserId)
        if (!isComponentMountedRef.current) return

        if (requestingUserId !== user?.userId) {
          setOpponentPlayAgainRequested(true)

          // Auto-decline after 30 seconds
          if (playAgainTimeoutRef.current) {
            clearTimeout(playAgainTimeoutRef.current)
          }

          playAgainTimeoutRef.current = setTimeout(() => {
            setOpponentPlayAgainRequested(false)
          }, 30000)
        }
      })

      socket.on("playAgainAccepted", (newGameData) => {
        console.log("Play again accepted, new game data:", newGameData)
        if (!isComponentMountedRef.current) return

        // Reset game state
        resetGameState()

        // Set new game data
        setGameId(newGameData.gameId)
        setPlayerColor(newGameData.playerColor)
        setOpponent(newGameData.opponent)
        setWaitingForOpponent(false)

        // Reset play again state
        setPlayAgainRequested(false)
        setOpponentPlayAgainRequested(false)
        if (playAgainTimeoutRef.current) {
          clearTimeout(playAgainTimeoutRef.current)
        }

        // Initialize new board
        if (board) {
          board.destroy()
        }
        setTimeout(() => {
          initializeChessboard()
        }, 100)
      })

      socket.on("playAgainDeclined", () => {
        console.log("Play again request declined")
        if (!isComponentMountedRef.current) return

        setPlayAgainRequested(false)
        setPlayAgainCountdown(null)

        // Show message in game over modal
        setGameOverMessage((prev) => prev + " Opponent declined to play again.")
      })

      return socket
    } catch (error) {
      console.error("Error setting up socket:", error)
      setConnectionStatus("error")
      return null
    }
  }, [
    user,
    gameId,
    reconnecting,
    opponent,
    isGameOver,
    board,
    highlightLastMove,
    soundEnabled,
    updateStatus,
    triggerWinCelebration,
    resetGameState,
    initializeChessboard,
    handleReconnection,
    addMatchToHistory,
    showChatModal,
    maxReconnectAttempts,
  ])

  // Connect to socket server when component mounts
  useEffect(() => {
    if (!user) {
      navigate("/login")
      return
    }

    isComponentMountedRef.current = true

    // Setup socket connection
    const socket = setupSocket()

    // Initialize chess game
    const newGame = new Chess()
    setGame(newGame)
    gameRef.current = newGame

    // Setup activity tracking
    resetInactivityTimer()

    // Add event listeners for activity tracking
    const handleActivity = () => resetInactivityTimer()
    document.addEventListener("mousemove", handleActivity)
    document.addEventListener("keydown", handleActivity)
    document.addEventListener("click", handleActivity)
    document.addEventListener("touchstart", handleActivity)

    // Cleanup on unmount
    return () => {
      isComponentMountedRef.current = false

      if (socket) {
        socket.disconnect()
      }
      if (board) {
        board.destroy()
      }

      // Clear all timeouts and intervals
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      if (inactivityTimeoutRef.current) {
        clearTimeout(inactivityTimeoutRef.current)
      }
      if (playAgainTimeoutRef.current) {
        clearTimeout(playAgainTimeoutRef.current)
      }

      // Remove event listeners
      document.removeEventListener("mousemove", handleActivity)
      document.removeEventListener("keydown", handleActivity)
      document.removeEventListener("click", handleActivity)
      document.removeEventListener("touchstart", handleActivity)
    }
  }, [user, navigate, setupSocket, resetInactivityTimer])

  // Handle socket move events and initialize board after player color is set
  useEffect(() => {
    if (!playerColor || !gameRef.current || !chessboardRef.current || !isComponentMountedRef.current) return

    // Initialize chessboard if not already initialized
    if (!boardInitialized && playerColor) {
      initializeChessboard()
    }
  }, [playerColor, boardInitialized, initializeChessboard])

  // Apply theme colors to the board
  useEffect(() => {
    if (!isComponentMountedRef.current) return

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

    // Cleanup on theme change
    return () => {
      const existingStyle = document.getElementById("chess-theme")
      if (existingStyle) {
        existingStyle.remove()
      }
    }
  }, [theme])

  // Reset unread messages when chat modal is opened
  useEffect(() => {
    if (showChatModal && isComponentMountedRef.current) {
      setUnreadMessages(0)
    }
  }, [showChatModal])

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

  // Cancel leave game
  const cancelLeaveGame = () => {
    setShowLeaveConfirmation(false)
  }

  // Handle game restart
  const handleRestart = () => {
    setIsGameOver(false)
    navigate("/modeselector")
  }

  // Handle play again request
  const requestPlayAgain = () => {
    if (!socketRef.current || !socketRef.current.connected || !gameId || !opponent) return

    setPlayAgainRequested(true)

    // Start countdown
    let countdown = 30
    setPlayAgainCountdown(countdown)

    const countdownInterval = setInterval(() => {
      countdown -= 1
      setPlayAgainCountdown(countdown)

      if (countdown <= 0) {
        clearInterval(countdownInterval)
        setPlayAgainRequested(false)
        setPlayAgainCountdown(null)
      }
    }, 1000)

    // Send request to server
    socketRef.current.emit("requestPlayAgain", {
      gameId: gameId,
      userId: user.userId,
      opponentId: opponent.userId,
    })

    // Store interval for cleanup
    playAgainTimeoutRef.current = countdownInterval
  }

  // Handle accepting play again request
  const acceptPlayAgain = () => {
    if (!socketRef.current || !socketRef.current.connected || !gameId || !opponent) return

    socketRef.current.emit("acceptPlayAgain", {
      gameId: gameId,
      userId: user.userId,
      opponentId: opponent.userId,
    })

    setOpponentPlayAgainRequested(false)
  }

  // Handle declining play again request
  const declinePlayAgain = () => {
    if (!socketRef.current || !socketRef.current.connected || !gameId || !opponent) return

    socketRef.current.emit("declinePlayAgain", {
      gameId: gameId,
      userId: user.userId,
      opponentId: opponent.userId,
    })

    setOpponentPlayAgainRequested(false)
  }

  // Handle sending chat message
  const sendChatMessage = (message) => {
    if (!socketRef.current || !socketRef.current.connected || !gameId || !opponent || !message.trim()) return

    const chatMessage = {
      sender: user.userId,
      senderName: user.username,
      message: message.trim(),
      timestamp: new Date().toISOString(),
      gameId: gameId,
    }

    socketRef.current.emit("chatMessage", chatMessage)

    // Add to local chat messages
    setChatMessages((prev) => [...prev, chatMessage])
  }

  // Handle rejoining a specific game
  const handleRejoinGame = (selectedGameId) => {
    if (!socketRef.current) return

    setGameId(selectedGameId)
    setReconnecting(true)

    socketRef.current.emit("rejoinGame", {
      gameId: selectedGameId,
      userId: user.userId,
    })

    setShowReconnectModal(false)
  }

  // Handle declining to rejoin games
  const declineRejoinGames = () => {
    if (!socketRef.current) return

    // Inform server user doesn't want to rejoin
    socketRef.current.emit("declineRejoinGames", {
      userId: user.userId,
      gameIds: availableGames.map((game) => game.gameId),
    })

    setShowReconnectModal(false)
    setAvailableGames([])
  }

  // If waiting for opponent, show wait queue
  if (waitingForOpponent) {
    return <WaitQueue socket={socketRef.current} />
  }

  // If reconnecting and showing reconnect modal
  if (showReconnectModal && availableGames.length > 0) {
    return <ReconnectModal games={availableGames} onRejoin={handleRejoinGame} onDecline={declineRejoinGames} />
  }

  return (
    <div
      className="flex min-h-screen overflow-auto items-center justify-center w-screen"
      style={{
        backgroundImage: `url(${boardbg})`,
        backgroundSize: "cover",
      }}
    >
      {/* Connection status indicator */}
      {connectionStatus !== "connected" && (
        <div
          className={`fixed top-0 left-0 right-0 z-50 p-2 text-center text-white ${
            connectionStatus === "reconnecting"
              ? "bg-yellow-600"
              : connectionStatus === "error"
                ? "bg-red-600"
                : connectionStatus === "failed"
                  ? "bg-red-800"
                  : "bg-blue-600"
          }`}
        >
          {connectionStatus === "connecting" && "Connecting to server..."}
          {connectionStatus === "reconnecting" &&
            `Reconnecting to server (Attempt ${reconnectAttemptsRef.current}/${maxReconnectAttempts})...`}
          {connectionStatus === "error" && "Connection error. Attempting to reconnect..."}
          {connectionStatus === "disconnected" && "Disconnected from server. Attempting to reconnect..."}
          {connectionStatus === "failed" && "Failed to connect to server. Please refresh the page."}
        </div>
      )}

      {/* Inactivity warning */}
      {inactivityTimer && (
        <div className="fixed top-12 left-0 right-0 z-50 p-2 text-center text-white bg-red-600">
          Warning: You will forfeit the game due to inactivity in {inactivityTimer} seconds. Move a piece to continue.
        </div>
      )}

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
                title={soundEnabled ? "Mute sounds" : "Enable sounds"}
              >
                {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={toggleFullscreen}
                className="p-2 bg-gray-800 bg-opacity-70 rounded-full text-white hover:bg-opacity-100 transition-all"
                title={fullscreen ? "Exit fullscreen" : "Enter fullscreen"}
              >
                {fullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowChatModal(true)}
                className="p-2 bg-gray-800 bg-opacity-70 rounded-full text-white hover:bg-opacity-100 transition-all relative"
                title="Chat with opponent"
              >
                <MessageSquare size={20} />
                {unreadMessages > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadMessages}
                  </span>
                )}
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
                {gameId && <p className="text-sm mt-1">Game ID: {gameId}</p>}
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
      <GameOverModal
        isOpen={isGameOver}
        message={gameOverMessage}
        onRestart={handleRestart}
        onPlayAgain={requestPlayAgain}
        playAgainRequested={playAgainRequested}
        playAgainCountdown={playAgainCountdown}
        opponentPlayAgainRequested={opponentPlayAgainRequested}
        onAcceptPlayAgain={acceptPlayAgain}
        onDeclinePlayAgain={declinePlayAgain}
      />

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

      {/* Chat Modal */}
      <ChatModal
        isOpen={showChatModal}
        onClose={() => setShowChatModal(false)}
        messages={chatMessages}
        onSendMessage={sendChatMessage}
        currentUser={user}
      />
    </div>
  )
}

export default GlobalMultiplayer
