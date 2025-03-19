import { useEffect, useRef, useState } from "react"
import { Chess } from "chess.js"
import Chessboard from "chessboardjs"
import { Howl } from "howler"
import moveSoundFile from "../../assets/sounds/move.mp3"
import captureSoundFile from "../../assets/sounds/capture.mp3"
import checkSoundFile from "../../assets/sounds/check.mp3"
import checkmateSoundFile from "../../assets/sounds/checkmate.mp3"
import pieceImages from "../pieceImages"
import bg from "../../assets/images/bgprofile.webp"
import GameOverModal from "../GameOverModal"
import { motion } from "framer-motion"
import confetti from "canvas-confetti"

const moveSound = new Howl({ src: [moveSoundFile] })
const captureSound = new Howl({ src: [captureSoundFile] })
const checkSound = new Howl({ src: [checkSoundFile] })
const checkmateSound = new Howl({ src: [checkmateSoundFile] })

const ChessboardComponent = () => {
  const chessRef = useRef(null);
  const boardRef = useRef(null); 
  const gameRef = useRef(new Chess());
  const [currentStatus, setCurrentStatus] = useState(null);
  const [moves, setMoves] = useState([]);
  const [mobileMode, setMobileMode] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [gameOverMessage, setGameOverMessage] = useState("");
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [possibleMoves, setPossibleMoves] = useState([]);
  const [theme, setTheme] = useState("forest"); // Default theme
  const [difficulty, setDifficulty] = useState("easy"); // Default difficulty
  const [visualHints, setVisualHints] = useState(true);
  const [lastMove, setLastMove] = useState(null);
  const [showMovesList, setShowMovesList] = useState(false);

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
  };

  const handleCheckboxChange = () => {
    setMobileMode((prev) => {
      const newMode = !prev;

      if (newMode) {
        document.body.style.overflow = "hidden";
        document.documentElement.style.overflow = "hidden";
        document.body.style.position = "fixed";
        document.body.style.touchAction = "none";
      } else {
        document.body.style.overflow = "auto";
        document.documentElement.style.overflow = "auto";
        document.body.style.position = "static";
        document.body.style.touchAction = "auto";
      }
      return newMode;
    });
  };

  // Utility functions for highlighting moves
  const removeHighlights = () => {
    const squares = document.querySelectorAll(".square-55d63");
    squares.forEach((square) => {
      square.classList.remove("highlight-square", "possible-move", "last-move");
      square.style.background = "";
    });
  };

  const highlightSquare = (square, type = "highlight") => {
    const squareEl = document.querySelector(`.square-${square}`);
    if (squareEl) {
      if (type === "highlight") {
        squareEl.classList.add("highlight-square");
      } else if (type === "possible") {
        squareEl.classList.add("possible-move");
      } else if (type === "last-move") {
        squareEl.classList.add("last-move");
      }
    }
  };

  const highlightLastMove = (from, to) => {
    if (!visualHints) return;
    
    removeHighlights();
    highlightSquare(from, "last-move");
    highlightSquare(to, "last-move");
    setLastMove({ from, to });
  };

  // Celebration effect when player wins
  const triggerWinCelebration = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#ffb347", "#ffcc33", "#fff"]
    });
  };

  useEffect(() => {
    const game = gameRef.current;

    const onDragStart = (source, piece, position, orientation) => {
      // Do not pick up pieces if the game is over
      if (game.isGameOver()) return false;

      // Only pick up pieces for the side to move
      if (
        (game.turn() === "w" && piece.search(/^b/) !== -1) ||
        (game.turn() === "b" && piece.search(/^w/) !== -1)
      ) {
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
    };

    const makeAiMove = () => {
      if (game.isGameOver()) return;

      const possibleMoves = game.moves({ verbose: true });
      if (possibleMoves.length === 0) return;

      let move;
      
      // Different difficulty levels
      if (difficulty === "easy") {
        // Random move selection
        const randomIdx = Math.floor(Math.random() * possibleMoves.length);
        move = possibleMoves[randomIdx];
      } else if (difficulty === "medium") {
        // Prioritize captures and checks
        const captureMoves = possibleMoves.filter(m => m.captured);
        const checkMoves = possibleMoves.filter(m => m.san.includes('+'));
        
        if (checkMoves.length > 0) {
          move = checkMoves[Math.floor(Math.random() * checkMoves.length)];
        } else if (captureMoves.length > 0) {
          move = captureMoves[Math.floor(Math.random() * captureMoves.length)];
        } else {
          move = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
        }
      } else {
        // Hard - use a simple piece value evaluation
        const pieceValues = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };
        let bestScore = Number.NEGATIVE_INFINITY;
        let bestMoves = [];
        
        for (const move of possibleMoves) {
          let score = 0;
          // If capturing, add value of captured piece
          if (move.captured) {
            score += pieceValues[move.captured];
          }
          // If checking, add bonus
          if (move.san.includes('+')) {
            score += 1;
          }
          // If promotion, add value of promoted piece
          if (move.promotion) {
            score += pieceValues[move.promotion] - pieceValues.p;
          }
          
          if (score > bestScore) {
            bestScore = score;
            bestMoves = [move];
          } else if (score === bestScore) {
            bestMoves.push(move);
          }
        }
        
        // If no good moves found, choose randomly
        if (bestMoves.length === 0) {
          move = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
        } else {
          move = bestMoves[Math.floor(Math.random() * bestMoves.length)];
        }
      }
      
      try {
        const result = game.move({
          from: move.from,
          to: move.to,
          promotion: move.promotion || 'q'
        });
        
        boardRef.current.position(game.fen());

        // Play sound based on move type
        result.captured ? captureSound.play() : moveSound.play();

        // Highlight the AI's move
        highlightLastMove(move.from, move.to);
        
        // Update moves
        setMoves((prevMoves) => [...prevMoves, { from: move.from, to: move.to }]);

        updateStatus(); // Check if game is over
      } catch (error) {
        console.error("Error making AI move:", error);
      }
    };

    const onDrop = (source, target) => {
      removeHighlights();
      
      try {
        const move = game.move({ from: source, to: target, promotion: "q" });

        if (!move) return "snapback";

        // Play sound based on move type
        move.captured ? captureSound.play() : moveSound.play();
        
        // Highlight the move
        highlightLastMove(source, target);
        
        setMoves((prevMoves) => [...prevMoves, { from: move.from, to: move.to }]);

        updateStatus(); // Check game status

        if (!game.isGameOver() && game.turn() === "b") {
          setTimeout(makeAiMove, 500); // AI moves after a delay
        }
      } catch (error) {
        return "snapback";
      }
    };

    const onMouseoverSquare = (square, piece) => {
      if (!visualHints) return;
      
      // Get list of possible moves for this square
      const moves = game.moves({
        square: square,
        verbose: true,
      });

      // Exit if there are no moves available for this square
      if (moves.length === 0) return;

      // Highlight the square they moused over
      highlightSquare(square);

      // Highlight the possible squares for this piece
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
      boardRef.current.position(game.fen());
    };

    const updateStatus = () => {
      const game = gameRef.current;
      const moveColor = game.turn() === "w" ? "White" : "Black";

      if (game.isCheckmate()) {
        const winner = moveColor === "White" ? "Computer" : "You";
        setIsGameOver(true);
        setGameOverMessage(`${winner} wins by checkmate!`);
        checkmateSound.play();
        
        // Trigger celebration if player wins
        if (winner === "You") {
          triggerWinCelebration();
        }
      } else if (game.isStalemate()) {
        setIsGameOver(true);
        setGameOverMessage("It's a draw! Stalemate.");
      } else if (game.isThreefoldRepetition()) {
        setIsGameOver(true);
        setGameOverMessage("It's a draw! Threefold repetition.");
      } else if (game.isInsufficientMaterial()) {
        setIsGameOver(true);
        setGameOverMessage("It's a draw! Insufficient material.");
      } else if (game.isDraw()) {
        setIsGameOver(true);
        setGameOverMessage("It's a draw!");
      } else {
        setCurrentStatus(`${moveColor === 'White' ? 'Your' : 'Computer\'s'} move`);
        if (game.inCheck()) {
          setCurrentStatus(`${moveColor === 'White' ? 'You are' : 'Computer is'} in check!`);
          checkSound.play();
        }
      }
    };

    const config = {
      draggable: !mobileMode, // Disable dragging in mobile mode
      position: "start",
      onDragStart: onDragStart,
      onDrop: onDrop,
      onMouseoverSquare: onMouseoverSquare,
      onMouseoutSquare: onMouseoutSquare,
      onSnapEnd: onSnapEnd,
      pieceTheme: (piece) => pieceImages[piece],
      snapbackSpeed: 300,
      snapSpeed: 100,
      boardSize: '100%',
    };

    // Initialize Chessboard.js
    boardRef.current = Chessboard(chessRef.current, config);
    updateStatus();

    // Responsive board size
    const handleResize = () => {
      if (boardRef.current) {
        boardRef.current.resize();
      }
    };

    window.addEventListener('resize', handleResize);

    // Cleanup function to destroy the chessboard instance
    return () => {
      if (boardRef.current) {
        boardRef.current.destroy();
      }
      window.removeEventListener('resize', handleResize);
    };
  }, [mobileMode, visualHints, difficulty, theme]);

  useEffect(() => {
    if (!mobileMode) {
      // setSelectedSquare(null);
      // setPossibleMoves([]);
      return;
    }

    const handleMobileSquareClick = (event) => {
      event.preventDefault();
      
      // Find the clicked square from the event target's class list
      const squareEl = event.currentTarget;
      const squareClass = [...squareEl.classList].find(cls => cls.startsWith("square-") && cls !== "square-55d63");
      
      if (!squareClass) return;
      
      const clickedSquare = squareClass.replace("square-", "");
      const game = gameRef.current;
      
      // If game is over, do nothing
      if (game.isGameOver()) return;
      
      // Clear previous highlights
      removeHighlights();
      
      // If we already have a selected square, try to make a move
      if (selectedSquare) {
        // Check if the clicked square is a valid destination
        if (possibleMoves.some(move => move.to === clickedSquare)) {
          try {
            // Make the move
            const move = game.move({
              from: selectedSquare,
              to: clickedSquare,
              promotion: 'q' // Always promote to queen
            });
            
            // Update the board display
            boardRef.current.position(game.fen());
            
            // Play sound based on move type
            move.captured ? captureSound.play() : moveSound.play();
            
            // Highlight the move
            highlightLastMove(selectedSquare, clickedSquare);
            
            // Update moves list
            setMoves(prevMoves => [...prevMoves, { from: move.from, to: move.to }]);
            
            // Check status after the move
            // updateStatus();  
            
            // Clear selection
            setSelectedSquare(null);
            setPossibleMoves([]);
            
            // Make computer move after a delay
            if (!game.isGameOver() && game.turn() === 'b') {
              setTimeout(() => {
                makeAiMoveForMobile();
              }, 500);
            }
          } catch (error) {
            console.error("Invalid move:", error);
          }
        } else {
          // If clicked on a different piece of the same color, select that piece instead
          const piece = game.get(clickedSquare);
          if (piece && piece.color === game.turn()) {
            selectNewSquare(clickedSquare);
          } else {
            // If clicked on an invalid square, clear selection
            setSelectedSquare(null);
            setPossibleMoves([]);
          }
        }
      } else {
        // If no square is selected yet, select this one if it has a piece of the correct color
        const piece = game.get(clickedSquare);
        if (piece && piece.color === game.turn()) {
          selectNewSquare(clickedSquare);
        }
      }
    };
    
    const selectNewSquare = (square) => {
      const game = gameRef.current;
      const moves = game.moves({
        square: square,
        verbose: true,
      });
      
      if (moves.length === 0) return;
      
      setSelectedSquare(square);
      setPossibleMoves(moves);
      
      // Highlight the selected square
      highlightSquare(square);
      
      // Highlight possible destinations
      moves.forEach(move => {
        highlightSquare(move.to, "possible");
      });
    };
    
    const makeAiMoveForMobile = () => {
      const game = gameRef.current;
      if (game.isGameOver()) return;
      
      const possibleMoves = game.moves({ verbose: true });
      if (possibleMoves.length === 0) return;
      
      let move;
      
      // Different difficulty levels
      if (difficulty === "easy") {
        // Random move selection
        const randomIdx = Math.floor(Math.random() * possibleMoves.length);
        move = possibleMoves[randomIdx];
      } else if (difficulty === "medium") {
        // Prioritize captures and checks
        const captureMoves = possibleMoves.filter(m => m.captured);
        const checkMoves = possibleMoves.filter(m => m.san.includes('+'));
        
        if (checkMoves.length > 0) {
          move = checkMoves[Math.floor(Math.random() * checkMoves.length)];
        } else if (captureMoves.length > 0) {
          move = captureMoves[Math.floor(Math.random() * captureMoves.length)];
        } else {
          move = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
        }
      } else {
        // Hard - use a simple piece value evaluation
        const pieceValues = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };
        let bestScore = Number.NEGATIVE_INFINITY;
        let bestMoves = [];
        
        for (const move of possibleMoves) {
          let score = 0;
          // If capturing, add value of captured piece
          if (move.captured) {
            score += pieceValues[move.captured];
          }
          // If checking, add bonus
          if (move.san.includes('+')) {
            score += 1;
          }
          // If promotion, add value of promoted piece
          if (move.promotion) {
            score += pieceValues[move.promotion] - pieceValues.p;
          }
          
          if (score > bestScore) {
            bestScore = score;
            bestMoves = [move];
          } else if (score === bestScore) {
            bestMoves.push(move);
          }
        }
        
        // If no good moves found, choose randomly
        if (bestMoves.length === 0) {
          move = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
        } else {
          move = bestMoves[Math.floor(Math.random() * bestMoves.length)];
        }
      }
      
      try {
        const result = game.move({
          from: move.from,
          to: move.to,
          promotion: move.promotion || 'q'
        });
        
        boardRef.current.position(game.fen());
        
        // Play sound
        result.captured ? captureSound.play() : moveSound.play();
        
        // Highlight the AI's move
        highlightLastMove(move.from, move.to);
        
        // Update moves
        setMoves(prevMoves => [...prevMoves, { from: move.from, to: move.to }]);
        
        // updateStatus();
      } catch (error) {
        console.error("Error making AI move:", error);
      }
    };

    // Add touch event listeners to the squares
    const squares = document.querySelectorAll(".square-55d63");
    squares.forEach(square => {
      square.addEventListener("touchend", handleMobileSquareClick);
      // Prevent default touch behavior to avoid scrolling/zooming
      square.addEventListener("touchstart", (e) => e.preventDefault());
    });
    
    // Clean up listeners when component unmounts or mobileMode changes
    return () => {
      squares.forEach(square => {
        square.removeEventListener("touchend", handleMobileSquareClick);
        square.removeEventListener("touchstart", (e) => e.preventDefault());
      });
    };
  }, [mobileMode, selectedSquare, possibleMoves, visualHints, difficulty, theme]);

  useEffect(() => {
    const game = gameRef.current;
    const moveColor = game.turn() === "w" ? "White" : "Black";
  
    if (game.isCheckmate()) {
      const winner = moveColor === "White" ? "Computer" : "You";
      setIsGameOver(true);
      setGameOverMessage(`${winner} wins by checkmate!`);
      checkmateSound.play();
    } else if (game.isStalemate()) {
      setIsGameOver(true);
      setGameOverMessage("It's a draw! Stalemate.");
    } else if (game.isThreefoldRepetition()) {
      setIsGameOver(true);
      setGameOverMessage("It's a draw! Threefold repetition.");
    } else if (game.isInsufficientMaterial()) {
      setIsGameOver(true);
      setGameOverMessage("It's a draw! Insufficient material.");
    } else if (game.isDraw()) {
      setIsGameOver(true);
      setGameOverMessage("It's a draw!");
    } else {
      setCurrentStatus(`${moveColor === 'White' ? 'Your' : 'Computer\'s'} move`);
      if (game.inCheck()) {
        setCurrentStatus(`${moveColor === 'White' ? 'You are' : 'Computer is'} in check!`);
        checkSound.play();
      }
    }
  }, []);

  // Apply theme colors to the board
  useEffect(() => {
    const applyTheme = () => {
      const currentTheme = themes[theme];
      const styleSheet = document.createElement("style");
      styleSheet.id = "chess-theme";
      
      const css = `
        .white-1e1d7 { background-color: ${currentTheme.light} !important; }
        .black-3c85d { background-color: ${currentTheme.dark} !important; }
        .highlight-square { background-color: ${currentTheme.highlight} !important; }
        .possible-move { background-color: ${currentTheme.possible} !important; }
        .last-move { box-shadow: inset 0 0 0 4px ${currentTheme.accent} !important; }
      `;
      
      styleSheet.textContent = css;
      
      // Remove existing theme stylesheet if it exists
      const existingStyle = document.getElementById("chess-theme");
      if (existingStyle) {
        existingStyle.remove();
      }
      
      document.head.appendChild(styleSheet);
    };
    
    applyTheme();
  }, [theme]);

  const handleRestart = () => {
    setIsGameOver(false);
    setGameOverMessage("");
    gameRef.current.reset(); // Reset the chess game state
    boardRef.current.position("start"); // Reset the board position
    setMoves([]);
    setCurrentStatus("Your move");
    setSelectedSquare(null);
    setPossibleMoves([]);
    removeHighlights();
    setLastMove(null);
  };


  return (
    <div className="w-screen min-h-screen bg-cover bg-no-repeat bg-center flex items-center justify-center">
      <img
        src={bg || "/placeholder.svg"}
        sizes="(max-width: 600px) 400px, 800px"
        loading="lazy"
        alt="Chess background"
        className="absolute inset-0 w-full h-full object-cover filter brightness-75"
      />
      <div className="flex h-fit py-8 lg:py-16 items-center justify-center w-screen relative">
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
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2"
                >
                  <label className="flex items-center gap-2 text-white font-semibold bg-blue-600/80 p-2 rounded-md">
                    <input 
                      type="checkbox" 
                      checked={mobileMode} 
                      onChange={handleCheckboxChange}
                      className="w-4 h-4" 
                    />
                    <span>Mobile Mode</span>
                  </label>
                </motion.div>
                
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2"
                >
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
                
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="bg-green-600/80 text-white p-2 rounded-md font-semibold"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </motion.div>
                
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
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
              </div >
              
              {/* Status display */}
              <div className="mt-4">
                <motion.div
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                  transition={{ 
                    type: "spring",
                    stiffness: 260,
                    damping: 20
                  }}
                  className="rounded-lg text-center p-3 bg-gradient-to-r from-blue-600/80 to-purple-600/80 text-white border border-white/30 shadow-lg"
                >
                  <p className="text-xl font-semibold">
                    {currentStatus}
                  </p>
                </motion.div>
              </div>
              
              {/* Help text for mobile mode */}
              {mobileMode && (
                <div className="mt-4 p-3 bg-black/50 text-white text-center rounded-lg">
                  {selectedSquare ? 'Tap a highlighted square to move' : 'Tap a piece to select'}
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
                  <h2 className="text-3xl font-bold mb-2">Chess Game</h2>
                  <p className="text-lg">Play against the computer!</p>
                </motion.div>
                
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-white">Move History</h3>
                    <button 
                      onClick={() => setShowMovesList(!showMovesList)}
                      className="text-white bg-blue-600/80 px-3 py-1 rounded-md text-sm"
                    >
                      {showMovesList ? 'Hide' : 'Show'}
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
                            <tr 
                              key={index} 
                              className={`text-white ${index % 2 === 0 ? 'bg-white/5' : ''}`}
                            >
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
                      <h4 className="text-white font-medium mb-2">Difficulty</h4>
                      <p className="text-gray-300 text-sm mb-2">Set AI opponent level</p>
                    <select
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value)}
                      className="w-full bg-white/10 text-white p-2 rounded-md"
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
      <GameOverModal isOpen={isGameOver} message={gameOverMessage} onRestart={handleRestart} />
    </div>
  </div>
 );
};

export default ChessboardComponent;