import { useEffect, useRef, useState } from "react"
import { Chess } from "chess.js"
import Chessboard from "chessboardjs"
import axios from "axios"
import { Howl } from "howler"
import { motion } from "framer-motion"
import confetti from "canvas-confetti"
import pieceImages from "../pieceImages"
import moveSoundFile from "../../assets/sounds/move.mp3"
import captureSoundFile from "../../assets/sounds/capture.mp3"
import checkSoundFile from "../../assets/sounds/check.mp3"
import checkmateSoundFile from "../../assets/sounds/checkmate.mp3"
import bg from "../../assets/images/bgprofile.webp"
import { BASE_URL } from "../../url"
import GameOverModal from "../GameOverModal"

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

      // Highlight the move
      highlightLastMove(source, target)

      // Play sound based on move type
      if (move.captured) {
        captureSound.play()
      } else {
        moveSound.play()
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

              // Highlight the AI's move
              highlightLastMove(bestMove.slice(0, 2), bestMove.slice(2, 4))

              // Play sound based on move type
              if (move.captured) {
                captureSound.play()
              } else {
                moveSound.play()
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

      // Highlight the square they moused over
      highlightSquare(square)

      // Highlight the possible squares for this piece
      for (let i = 0; i < moves.length; i++) {
        highlightSquare(moves[i].to, "possible")
      }
    }

    const onMouseoutSquare = (square, piece) => {
      if (!visualHints) return

      // Don't remove highlights if we're showing the last move
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

    const updateStatus = debounce(() => {
      const game = gameRef.current
      const moveColor = game.turn() === "w" ? "White" : "Black"

      if (game.isCheckmate()) {
        const winner = moveColor === "White" ? "Computer" : "You"
        setIsGameOver(true)
        setGameOverMessage(winner === "You" ? "You win!" : "You lose!")
        checkmateSound.play()

        // Trigger celebration if player wins
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
          checkSound.play()
        }
      }
    }, 100)

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
      boardSize: "100%",
    }

    // Initialize Chessboard.js
    boardRef.current = Chessboard(chessRef.current, config)
    updateStatus()

    // Responsive board size
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
  }, [mobileMode, visualHints, promotionPiece, theme])

  useEffect(() => {
    if (!mobileMode) {
      // setSelectedSquare(null)
      // setPossibleMoves([])
      return
    }

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
              promotion: promotionPiece, // Use the selected promotion piece
            })

            // Update the board display
            boardRef.current.position(game.fen())

            // Play sound based on move type
            move.captured ? captureSound.play() : moveSound.play()

            // Highlight the move
            highlightLastMove(selectedSquare, clickedSquare)

            // Update moves list
            setMoves((prevMoves) => [...prevMoves, { from: move.from, to: move.to }])

            // Clear selection
            setSelectedSquare(null)
            setPossibleMoves([])

            // Check status after the move
            updateStatus()

            // Make computer move after a delay
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

                      // Highlight the AI's move
                      highlightLastMove(bestMove.slice(0, 2), bestMove.slice(2, 4))

                      // Play sound based on move type
                      move.captured ? captureSound.play() : moveSound.play()

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

    // Add touch event listeners to the squares
    const squares = document.querySelectorAll(".square-55d63")
    squares.forEach((square) => {
      square.addEventListener("touchend", handleMobileSquareClick)
      // Prevent default touch behavior to avoid scrolling/zooming
      square.addEventListener("touchstart", (e) => e.preventDefault())
    })

    // Clean up listeners when component unmounts or mobileMode changes
    return () => {
      squares.forEach((square) => {
        square.removeEventListener("touchend", handleMobileSquareClick)
        square.removeEventListener("touchstart", (e) => e.preventDefault())
      })
    }
  }, [mobileMode, selectedSquare, possibleMoves, visualHints, promotionPiece, theme])

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

  const handleRestart = () => {
    setIsGameOver(false)
    setGameOverMessage("")
    gameRef.current.reset() // Reset the chess game state
    boardRef.current.position("start") // Reset the board position
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
      checkmateSound.play()

      // Trigger celebration if player wins
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
        checkSound.play()
      }
    }
  }, 100)

  return (
    <div className="w-screen min-h-screen bg-cover bg-no-repeat bg-center flex items-center justify-center">
      <img
        src={bg || "/placeholder.svg"}
        sizes="(max-width: 600px) 400px, 800px"
        loading="lazy"
        alt="Chess background"
        className="absolute inset-0 w-full h-full object-cover filter brightness-75"
      />
      <div className="flex h-fit py-32 items-center justify-center w-screen relative">
        <div className="w-screen flex flex-col lg:flex-row lg:flex-row mx-auto my-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:mx-8 w-full mx-auto mb-6 lg:mb-0 lg:w-1/2"
          >
            {/* Chess board container with stylish border */}
            <div className="relative backdrop-blur-sm bg-white/10 p-4 shadow-xl">
              <div ref={chessRef} style={{ width: "100%", maxWidth: "600px", margin: "0 auto" }}></div>
            </div>

            {/* Controls below the board */}
            <div className="mt-4 p-4 backdrop-blur-sm bg-white/10 border-2 border-white/30 rounded-xl shadow-lg">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex items-center gap-2">
                  <label className="flex items-center gap-2 text-white font-semibold bg-blue-600/80 p-2 rounded-md">
                    <input type="checkbox" checked={mobileMode} onChange={handleCheckboxChange} className="w-4 h-4" />
                    <span>Mobile Mode</span>
                  </label>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex items-center gap-2">
                  <label className="flex items-center gap-2 text-white font-semibold bg-purple-600/80 p-2 rounded-md">
                    <input
                      type="checkbox"
                      checked={visualHints}
                      onChange={() => setVisualHints(!visualHints)}
                      className="w-4 h-4"
                    />
                    <span>Visual Hints</span>
                  </label>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <select
                    value={promotionPiece}
                    onChange={(e) => setPromotionPiece(e.target.value)}
                    className="bg-green-600/80 text-white p-2 rounded-md font-semibold"
                  >
                    <option value="q">Queen</option>
                    <option value="r">Rook</option>
                    <option value="b">Bishop</option>
                    <option value="n">Knight</option>
                  </select>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <select
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                    className="bg-amber-600/80 text-white p-2 rounded-md font-semibold"
                  >
                    <option value="classic">Classic</option>
                    <option value="forest">Forest</option>
                    <option value="ocean">Ocean</option>
                    <option value="night">Night</option>
                    <option value="royal">Royal</option>
                  </select>
                </motion.div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleRestart}
                  className="bg-gradient-to-r from-red-600 to-red-400 text-white px-4 py-2 rounded-md font-semibold shadow-md"
                >
                  Restart Game
                </motion.button>
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
                  <p className="text-xl font-semibold">{currentStatus || "Your move"}</p>
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

          {/* Move history and game info sidebar */}
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
                  <h2 className="text-3xl font-bold mb-2">Stockfish Chess</h2>
                  <p className="text-lg">Play against the powerful Stockfish engine!</p>
                </motion.div>

                <div className="mt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-white">Move History</h3>
                    <button
                      onClick={() => setShowMovesList(!showMovesList)}
                      className="text-white bg-blue-600/80 px-3 py-1 rounded-md text-sm"
                    >
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
                    </div>
                  )}
                </div>

                <div className="mt-6">
                  <h3 className="text-xl font-semibold text-white mb-4">Game Settings</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-black/30 rounded-lg p-4">
                      <h4 className="text-white font-medium mb-2">Theme</h4>
                      <p className="text-gray-300 text-sm mb-2">Choose your board style</p>
                      <select
                        value={theme}
                        onChange={(e) => setTheme(e.target.value)}
                        className="w-full bg-white/10 text-white p-2 rounded-md"
                      >
                        <option value="classic">Classic</option>
                        <option value="forest">Forest</option>
                        <option value="ocean">Ocean</option>
                        <option value="night">Night</option>
                        <option value="royal">Royal</option>
                      </select>
                    </div>

                    <div className="bg-black/30 rounded-lg p-4">
                      <h4 className="text-white font-medium mb-2">Promotion</h4>
                      <p className="text-gray-300 text-sm mb-2">Choose promotion piece</p>
                      <select
                        value={promotionPiece}
                        onChange={(e) => setPromotionPiece(e.target.value)}
                        className="w-full bg-white/10 text-white p-2 rounded-md"
                      >
                        <option value="q">Queen</option>
                        <option value="r">Rook</option>
                        <option value="b">Bishop</option>
                        <option value="n">Knight</option>
                      </select>
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-black/30 text-white text-center rounded-lg">
                    <p className="text-amber-400 font-medium">Playing against Stockfish</p>
                    <p className="text-sm mt-1">Stockfish is one of the strongest chess engines in the world!</p>
                  </div>

                  <div className="mt-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleRestart}
                      className="w-full bg-gradient-to-r from-red-600 to-purple-600 text-white p-3 rounded-lg font-semibold shadow-lg"
                    >
                      Restart Game
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      <GameOverModal isOpen={isGameOver} message={gameOverMessage} onRestart={handleRestart} />
    </div>
  )
}

export default AgainstStockfish

