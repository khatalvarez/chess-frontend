"use client"

import { useEffect, useRef, useState } from "react"
import { Chess } from "chess.js"
import { io } from "socket.io-client"
import { useSelector } from "react-redux"
import WaitQueue from "../WaitQueue"
import { useNavigate } from "react-router-dom"
import pieceImages from "../pieceImages"
import axios from "axios"
import { Howl } from "howler"
import moveSoundFile from "../../assets/sounds/move.mp3"
import captureSoundFile from "../../assets/sounds/capture.mp3"
import checkSoundFile from "../../assets/sounds/check.mp3"
import checkmateSoundFile from "../../assets/sounds/checkmate.mp3"
import boardbg from "../../assets/images/bgboard.webp"
import { BASE_URL } from "../../url"
import { Maximize2, Minimize2, Volume2, VolumeX } from "lucide-react"

// Initialize sound effects
const moveSound = new Howl({ src: [moveSoundFile] })
const captureSound = new Howl({ src: [captureSoundFile] })
const checkSound = new Howl({ src: [checkSoundFile] })
const checkmateSound = new Howl({ src: [checkmateSoundFile] })

const GlobalMultiplayer = () => {
  const addMatchToHistory = async (userId, opponentName, status) => {
    try {
      console.log("Sending data:", { userId, opponentName, status })
      const response = await axios.post(`${BASE_URL}/user/${userId}/match-history`, {
        opponent: opponentName,
        status,
      })
      console.log("Match history added:", response.data)
    } catch (error) {
      console.error("Error adding match to history:", error.response?.data || error.message)
    }
  }

  const user = useSelector((state) => state.auth.userData)
  const navigate = useNavigate()

  // Game state
  const [game, setGame] = useState(null)
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

  // Refs
  const chessboardRef = useRef(null)
  const socketRef = useRef(null)
  const gameRef = useRef(null)
  const boardContainerRef = useRef(null)

  // Connect to socket server when component mounts
  useEffect(() => {
    if (!user) return

    // Create socket connection
    const socket = io(BASE_URL, {
      query: { user: JSON.stringify(user) },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    })

    socketRef.current = socket

    // Debug connection status
    socket.on("connect", () => {
      console.log("Connected to server with ID:", socket.id)
    })

    socket.on("connect_error", (error) => {
      console.error("Connection error:", error)
    })

    socket.on("waiting", (isWaiting) => {
      console.log("Waiting status:", isWaiting)
      setWaitingForOpponent(isWaiting)
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

    socket.on("opponentDisconnected", () => {
      alert("Opponent has disconnected")
      navigate("/modeselector")
    })

    // Cleanup on unmount
    return () => {
      if (socket) {
        socket.disconnect()
      }
      if (board) {
        board.destroy()
      }
    }
  }, [user, navigate, board])

  // Initialize chess game
  useEffect(() => {
    const newGame = new Chess()
    setGame(newGame)
    gameRef.current = newGame
  }, [])

  // Handle socket move events and initialize board after player color is set
  useEffect(() => {
    if (!socketRef.current || !playerColor || !gameRef.current || !chessboardRef.current) return

    // Listen for opponent moves
    socketRef.current.on("move", ({ from, to, obtainedPromotion }) => {
      try {
        console.log("Received move:", from, to, obtainedPromotion)
        const move = gameRef.current.move({
          from,
          to,
          promotion: obtainedPromotion,
        })

        if (move) {
          // Update board position
          if (board) {
            board.position(gameRef.current.fen())
          }

          // Update game state
          updateStatus()
          setMoves((prevMoves) => [
            ...prevMoves,
            {
              from: move.from,
              to: move.to,
              promotion: obtainedPromotion,
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
          }
        }
      } catch (error) {
        console.error("Invalid move received:", error)
      }
    })

    // Initialize chessboard
    try {
      // Make sure we're using a library that's available in the browser
      // This is a placeholder for the actual initialization
      if (typeof window !== "undefined" && window.Chessboard) {
        const newBoard = window.Chessboard(chessboardRef.current, {
          position: "start",
          orientation: playerColor,
          draggable: true,
          pieceTheme: (piece) => pieceImages[piece],
          onDragStart: onDragStart,
          onDrop: onDrop,
          onSnapEnd: onSnapEnd,
        })

        setBoard(newBoard)
        console.log("Chessboard initialized with orientation:", playerColor)
      } else {
        console.error("Chessboard library not available")
      }
    } catch (error) {
      console.error("Error initializing chessboard:", error)
    }

    // Cleanup
    return () => {
      if (socketRef.current) {
        socketRef.current.off("move")
      }
    }
  }, [playerColor, board, soundEnabled])

  // Drag start handler - only allow dragging pieces if it's the player's turn
  const onDragStart = (source, piece) => {
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

    return true
  }

  // Drop handler - attempt to make a move when a piece is dropped
  const onDrop = (source, target) => {
    const game = gameRef.current
    if (!game) return "snapback"

    try {
      // Attempt to make the move
      const move = game.move({
        from: source,
        to: target,
        promotion: promotionPiece,
      })

      // If the move is invalid, return 'snapback'
      if (!move) return "snapback"

      // Update game state
      updateStatus()

      // Send move to server
      if (socketRef.current) {
        socketRef.current.emit("move", {
          from: source,
          to: target,
          obtainedPromotion: promotionPiece,
        })
      }

      // Add move to history
      setMoves((prevMoves) => [
        ...prevMoves,
        {
          from: move.from,
          to: move.to,
          promotion: promotionPiece,
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

    if (game.isCheckmate()) {
      const winner = turn === "White" ? "Black" : "White"
      status = `Game over, ${winner} wins by checkmate.`

      // Record match result
      if (user && opponent) {
        const userWon =
          (playerColor === "white" && winner === "White") || (playerColor === "black" && winner === "Black")
        addMatchToHistory(user.userId, opponent.username, userWon ? "win" : "lose")
      }
    } else if (game.isDraw()) {
      status = "Game over, draw."

      if (user && opponent) {
        addMatchToHistory(user.userId, opponent.username, "draw")
      }
    } else {
      status = `${turn} to move`
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
    setIsTableCollapsed(!isTableCollapsed)
  }

  // Toggle mobile mode
  const handleMobileModeChange = () => {
    setMobileMode(!mobileMode)
  }

  // Handle promotion piece change
  const handlePromotionChange = (e) => {
    setPromotionPiece(e.target.value)
  }

  // If waiting for opponent, show wait queue
  if (waitingForOpponent) {
    return <WaitQueue socket={socketRef.current} />
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
        <div className="lg:mx-16 w-full lg:w-1/2" ref={boardContainerRef}>
          {opponent && (
            <div className="flex justify-between text-center mr-8 text-lg lg:text-xl xl:text-2xl text-white">
              <p>Opponent: {opponent.username?.split(" ")[0] || "Opponent"}</p>
              <p>Rating: {calculateRating(opponent.wins || 0, opponent.loses || 0, opponent.draws || 0)}</p>
            </div>
          )}

          <div className="relative mx-auto" style={{ width: window.innerWidth > 1028 ? "40vw" : "90vw" }}>
            <div className="absolute top-2 right-2 z-10 flex space-x-2">
              <button
                onClick={toggleSound}
                className="p-2 bg-gray-800 bg-opacity-70 rounded-full text-white hover:bg-opacity-100 transition-all"
              >
                {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
              </button>
              <button
                onClick={toggleFullscreen}
                className="p-2 bg-gray-800 bg-opacity-70 rounded-full text-white hover:bg-opacity-100 transition-all"
              >
                {fullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
              </button>
            </div>
            <div ref={chessboardRef} className="mx-auto"></div>
          </div>

          {user && (
            <div className="flex text-lg lg:text-xl xl:text-2xl justify-between text-center mr-8 mb-4 text-white">
              <p>You ({user.username || "Player"})</p>
              <p>Rating: {calculateRating(user.wins || 0, user.loses || 0, user.draws || 0)}</p>
            </div>
          )}

          <div className="mb-4">
            <label className="flex items-center space-x-2 cursor-pointer text-white">
              <input
                type="checkbox"
                checked={mobileMode}
                onChange={handleMobileModeChange}
                className="form-checkbox h-5 w-5"
              />
              <span>Mobile Mode</span>
            </label>
          </div>
        </div>

        {!mobileMode && (
          <div className="w-11/12 mx-auto lg:w-1/3">
            <div className="flex flex-col justify-between text-center text-xl">
              <label className="mt-2 text-gray-100">Promotion piece</label>
              <select
                className="mt-2 text-gray-800 py-2 w-full text-center text-xl bg-gray-200 border border-gray-400 rounded"
                value={promotionPiece}
                onChange={handlePromotionChange}
              >
                <option value="q">Queen</option>
                <option value="r">Rook</option>
                <option value="b">Bishop</option>
                <option value="n">Knight</option>
              </select>
            </div>

            <div className="text-center text-2xl mb-4 mt-8 text-white">
              {currentStatus ? currentStatus : "White to move"}
            </div>

            <button
              onClick={toggleTable}
              className="mb-4 w-full bg-gray-200 text-black py-2 px-4 rounded shadow-md hover:bg-gray-300"
            >
              {isTableCollapsed ? "Show Moves" : "Hide Moves"}
            </button>

            {!isTableCollapsed && (
              <table className="table-auto text-lg font-semibold w-full bg-gray-800 text-white">
                <thead>
                  <tr>
                    <th className="px-4 py-2">Move #</th>
                    <th className="px-4 py-2">From</th>
                    <th className="px-4 py-2">To</th>
                  </tr>
                </thead>
                <tbody>
                  {moves.map((move, index) => (
                    <tr key={index}>
                      <td className="border px-4 py-2">{index + 1}</td>
                      <td className="border px-4 py-2">{move.from}</td>
                      <td className="border px-4 py-2">{move.to}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default GlobalMultiplayer

