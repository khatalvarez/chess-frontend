import React, { useEffect, useRef, useState } from "react";
import { Chess } from "chess.js";
import Chessboard from "chessboardjs";
import { Howl } from "howler";
import moveSoundFile from "../../assets/sounds/move.mp3";
import captureSoundFile from "../../assets/sounds/capture.mp3";
import checkSoundFile from "../../assets/sounds/check.mp3";
import checkmateSoundFile from "../../assets/sounds/checkmate.mp3";
import pieceImages from "../pieceImages";
import bg from "../../assets/images/bgprofile.webp";
import GameOverModal from "../GameOverModal";

const moveSound = new Howl({ src: [moveSoundFile] });
const captureSound = new Howl({ src: [captureSoundFile] });
const checkSound = new Howl({ src: [checkSoundFile] });
const checkmateSound = new Howl({ src: [checkmateSoundFile] });

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
  const removeGreySquares = () => {
    const squares = document.querySelectorAll(".square-55d63");
    squares.forEach((square) => (square.style.background = ""));
  };

  const greySquare = (square) => {
    const squareEl = document.querySelector(`.square-${square}`);
    if (squareEl) {
      const isBlack = squareEl.classList.contains("black-3c85d");
      squareEl.style.background = isBlack ? "#696969" : "#a9a9a9";
    }
  };

  useEffect(() => {
    const game = gameRef.current;

    const onDragStart = (source, piece, position, orientation) => {
      // Do not pick up pieces if the game is over
      if (game.isGameOver()) {
        console.log("Start a new game from the menu");
        return false;
      }

      // Only pick up pieces for the side to move
      if (
        (game.turn() === "w" && piece.search(/^b/) !== -1) ||
        (game.turn() === "b" && piece.search(/^w/) !== -1)
      ) {
        return false;
      }
    };

    const makeRandomMove = () => {
      if (game.isGameOver()) return;

      let possibleMoves = game.moves();
      if (possibleMoves.length === 0) return; // No moves left

      const randomIdx = Math.floor(Math.random() * possibleMoves.length);
      try {
        const move = game.move(possibleMoves[randomIdx]);
        boardRef.current.position(game.fen());

        // Play sound based on move type
        move.captured ? captureSound.play() : moveSound.play();

        // Update moves
        setMoves((prevMoves) => [...prevMoves, { from: move.from, to: move.to }]);

        updateStatus(); // Check if game is over
      } catch (error) {
        console.error("Error making AI move:", error);
      }
    };

    const onDrop = (source, target) => {
      try {
        let move = game.move({ from: source, to: target, promotion: "q" });

        if (!move) return "snapback";

        move.captured ? captureSound.play() : moveSound.play();
        setMoves((prevMoves) => [...prevMoves, { from: move.from, to: move.to }]);

        updateStatus(); // Check game status

        if (!game.isGameOver() && game.turn() === "b") {
          setTimeout(makeRandomMove, 500); // AI moves after a delay
        }
      } catch (error) {
        return "snapback";
      }
    };

    const onMouseoverSquare = (square, piece) => {
      // Get list of possible moves for this square
      const moves = game.moves({
        square: square,
        verbose: true,
      });

      // Exit if there are no moves available for this square
      if (moves.length === 0) return;

      // Highlight the square they moused over
      greySquare(square);

      // Highlight the possible squares for this piece
      for (let i = 0; i < moves.length; i++) {
        greySquare(moves[i].to);
      }
    };

    const onMouseoutSquare = (square, piece) => {
      removeGreySquares();
    };

    const onSnapEnd = () => {
      boardRef.current.position(game.fen());
    };

    const updateStatus = () => {
      const moveColor = game.turn() === "w" ? "White" : "Black";
    
      if (game.isCheckmate()) {
        // Determine winner based on who delivered checkmate
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
      snapbackSpeed: 500,
      snapSpeed: 100,
    };

    // Initialize Chessboard.js
    boardRef.current = Chessboard(chessRef.current, config);
    updateStatus();

    // Cleanup function to destroy the chessboard instance
    return () => {
      if (boardRef.current) {
        boardRef.current.destroy();
      }
    };
  }, [mobileMode]);

  useEffect(() => {
    if (!mobileMode) {
      setSelectedSquare(null);
      setPossibleMoves([]);
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
      removeGreySquares();
      
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
            
            // Update moves list
            setMoves(prevMoves => [...prevMoves, { from: move.from, to: move.to }]);
            
            // Check status after the move
            updateStatus();
            
            // Clear selection
            setSelectedSquare(null);
            setPossibleMoves([]);
            
            // Make computer move after a delay
            if (!game.isGameOver() && game.turn() === 'b') {
              setTimeout(() => {
                makeRandomMoveForMobile();
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
      greySquare(square);
      
      // Highlight possible destinations
      moves.forEach(move => {
        greySquare(move.to);
      });
    };
    
    const makeRandomMoveForMobile = () => {
      const game = gameRef.current;
      if (game.isGameOver()) return;
      
      let possibleMoves = game.moves();
      if (possibleMoves.length === 0) return;
      
      const randomIdx = Math.floor(Math.random() * possibleMoves.length);
      try {
        const move = game.move(possibleMoves[randomIdx]);
        boardRef.current.position(game.fen());
        
        // Play sound
        move.captured ? captureSound.play() : moveSound.play();
        
        // Update moves
        setMoves(prevMoves => [...prevMoves, { from: move.from, to: move.to }]);
        
        updateStatus();
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
  }, [mobileMode, selectedSquare, possibleMoves]);

  const updateStatus = () => {
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
  };

  const handleRestart = () => {
    setIsGameOver(false);
    setGameOverMessage("");
    gameRef.current.reset(); // Reset the chess game state
    boardRef.current.position("start"); // Reset the board position
    setMoves([]);
    setCurrentStatus("Your move");
    setSelectedSquare(null);
    setPossibleMoves([]);
    removeGreySquares();
  };


  return (
    <div className="w-screen min-h-screen bg-cover bg-no-repeat bg-center flex items-center justify-center">
      <img
        src={bg}
        sizes="(max-width: 600px) 400px, 800px"
        loading="lazy"
        alt="Chess background"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="flex h-fit py-32 items-center justify-center w-screen relative">
        <div className="w-screen flex flex-col lg:flex-row lg:flex-row mx-auto my-auto">
          <div className="lg:mx-16 w-full mx-auto mb-10 lg:w-1/2">
            <div ref={chessRef} style={{ width: window.innerWidth > 1028 ? "40vw" : "100vw" }}></div>
            <div className="mt-6 flex items-center justify-between">
              <label className="inline-flex items-center gap-2 text-black font-semibold bg-gray-300 p-2 rounded-md">
                <input type="checkbox" checked={mobileMode} onChange={handleCheckboxChange} />
                Mobile Mode
              </label>
              {mobileMode && (
                <div className="bg-gray-800 text-white p-2 rounded-md">
                  {selectedSquare ? 'Tap a highlighted square to move' : 'Tap a piece to select'}
                </div>
              )}
              {mobileMode && (
                <button
                  onClick={handleRestart}
                  className="bg-red-600 text-white px-4 py-2 rounded-md mr-4"
                >
                  Restart
                </button>
              )}
            </div>
          </div>
          {!mobileMode && (
            <div className="bg-gray-900 bg-opacity-80 backdrop-filter backdrop-blur-xl border border-gray-200 lg:p-4 rounded-xl shadow-lg w-11/12 max-w-md lg:max-w-lg mx-auto">
              <div className="lg:mx-4 w-fit mx-6 mt-8 mb-10">
                <div className="rounded-xl shadow-lg text-center p-8 px-8 lg:w-full text-xl lg:text-2xl lg:text-3xl bg-gradient-to-r from-green-500 to-blue-600 bg-opacity-30 text-white border border-gray-200 flex-shrink-0">
                  Current Status: {currentStatus ? currentStatus : "Your move"}
                </div>
                <div className="mt-8">
                  <p className="text-weight-500 mx-2 mt-3 text-center text-xl text-green-400">
                    Always promotes to queen.
                  </p>

                  <table className="mt-10 w-full border-collapse border border-gray-700 rounded-lg overflow-hidden">
                    <thead>
                      <tr className="bg-gray-800 text-center text-white">
                        <th className="border border-gray-700 px-6 py-3">Move</th>
                        <th className="border border-gray-700 px-6 py-3">From</th>
                        <th className="border border-gray-700 px-6 py-3">To</th>
                      </tr>
                    </thead>
                    <tbody>
                      {moves.map((move, index) => (
                        <tr
                          key={index}
                          className={
                            index % 2 === 0
                              ? "bg-gray-700 text-white text-center"
                              : "bg-gray-600 text-gray-200 text-center"
                          }
                        >
                          <td className="border border-gray-700 px-6 py-4">
                            {index + 1}
                          </td>
                          <td className="border border-gray-700 px-6 py-4">
                            {move.from}
                          </td>
                          <td className="border border-gray-700 px-6 py-4">
                            {move.to}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="mt-8 text-white text-center">
                <button
                  onClick={handleRestart}
                  className="bg-gradient-to-r from-red-600 to-blue-700 bg-opacity-30 text-white border border-gray-200 px-6 py-3 rounded-lg w-full text-lg lg:text-xl"
                >
                  Restart
                </button>
              </div>
            </div>
          )}
        </div>
        <GameOverModal isOpen={isGameOver} message={gameOverMessage} onRestart={handleRestart} />
      </div>
    </div>
  );
};

export default ChessboardComponent;