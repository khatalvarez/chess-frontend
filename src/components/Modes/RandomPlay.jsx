import React, { useEffect, useRef, useState } from "react";
import { Chess } from "chess.js";
import Chessboard from "chessboardjs";
import { Howl } from "howler";
import moveSoundFile from "../../assets/sounds/move.mp3";
import captureSoundFile from "../../assets/sounds/capture.mp3";
import checkSoundFile from "../../assets/sounds/check.mp3";
import checkmateSoundFile from "../../assets/sounds/checkmate.mp3";
import pieceImages from "../pieceImages";
import bg from "../../assets/images/bgprofile.jpg";
import GameOverModal from "../GameOverModal";

// Initialize sound effects
const moveSound = new Howl({ src: [moveSoundFile] });
const captureSound = new Howl({ src: [captureSoundFile] });
const checkSound = new Howl({ src: [checkSoundFile] });
const checkmateSound = new Howl({ src: [checkmateSoundFile] });

const ChessboardComponent = () => {
  const chessRef = useRef(null); // Reference to the DOM element for the chessboard
  const boardRef = useRef(null); // Reference to the Chessboard instance
  const gameRef = useRef(new Chess());
  const [currentStatus, setCurrentStatus] = useState(null); // State to hold the current game status
  const [moves, setMoves] = useState([]); // State to hold the list of moves
  const [mobileMode, setMobileMode] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [gameOverMessage, setGameOverMessage] = useState("");

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

useEffect(() => {
    const game = new Chess(); // Create a new Chess instance

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

    // Add touchstart listeners to each square on the board
    const squares = document.querySelectorAll(".square-55d63");
    squares.forEach(square => {
      square.addEventListener("touchstart", handleTouchStart);
    });

    // Cleanup the event listeners on unmount or mobileMode change
    return () => {
      squares.forEach(square => {
        square.removeEventListener("touchstart", handleTouchStart);
      });
    };
  }
}, [mobileMode]);


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
        const winner = moveColor === "White" ? "Black" : "White";
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
        setCurrentStatus(`${moveColor} to move`);
        if (game.inCheck()) {
          setCurrentStatus(`${moveColor} is in check!`);
          checkSound.play();
        }
      }
    };

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

    const config = {
      draggable: true,
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

    // Cleanup function to destroy the chessboard instance
    return () => {
      if (boardRef.current) {
        boardRef.current.destroy();
      }
    };
  }, []);

useEffect(() => {
  if (mobileMode) {
    const handleTouchStart = (event) => {
      const squareEl = event.currentTarget;
      // Extract the square identifier from the element's classes (e.g., "square-e4")
      const squareClass = [...squareEl.classList].find(cls => cls.startsWith("square-") && cls !== "square-55d63");
      if (squareClass) {
        const square = squareClass.replace("square-", "");
        // Highlight the tapped square
        greySquare(square);
        // Highlight its legal moves
        const moves = gameRef.current.moves({ square, verbose: true });
        moves.forEach(move => greySquare(move.to));
      }
    };

  const handleRestart = () => {
  setIsGameOver(false);
  setGameOverMessage("");
  gameRef.current.reset(); // Reset the chess game state
  boardRef.current.position("start"); // Reset the board position
  setMoves([]);
  setCurrentStatus("White to move");
};


  return (
    <div
      className="flex h-fit py-32 items-center justify-center w-screen"
      style={{ backgroundImage: `url(${bg})`, backgroundSize: "contain" }}
    >
      <div className="w-screen flex flex-col lg:flex-row lg:flex-row mx-auto my-auto">
        <div className="lg:mx-16 w-full mx-auto mb-10 lg:w-1/2">
          <div
            ref={chessRef}
            style={{ width: window.innerWidth > 1028 ? "40vw" : "100vw" }}
          ></div> 
          <div className="mt-6">
            <label className="inline-flex items-center gap-2 font-semibold bg-gradient-to-r from-green-500 to-blue-600 bg-opacity-30 text-white p-2 rounded-md">
              <input type="checkbox" checked={mobileMode} onChange={handleCheckboxChange} />
              Mobile Mode
            </label>
          </div>
        </div>

        {!mobileMode && (
          <div className="bg-gray-900 bg-opacity-80 backdrop-filter backdrop-blur-xl border border-gray-200 lg:p-4 rounded-xl shadow-lg w-11/12 max-w-md lg:max-w-lg mx-auto">
            <div className="lg:mx-4 w-fit mx-6 mt-8 mb-10">
              <div className="rounded-xl shadow-lg text-center p-8 px-8 lg:w-full text-xl lg:text-2xl lg:text-3xl bg-gradient-to-r from-green-500 to-blue-600 bg-opacity-30 text-white border border-gray-200 flex-shrink-0">
                Current Status: {currentStatus ? currentStatus : "White to move"}
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
  );
};

export default ChessboardComponent;