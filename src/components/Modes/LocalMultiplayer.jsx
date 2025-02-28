import React, { useEffect, useRef, useState } from "react";
import { Chess } from "chess.js";
import Chessboard from "chessboardjs";
import { Howl } from "howler";
import moveSoundFile from "../../assets/sounds/move.mp3";
import captureSoundFile from "../../assets/sounds/capture.mp3";
import checkSoundFile from "../../assets/sounds/check.mp3";
import checkmateSoundFile from "../../assets/sounds/checkmate.mp3";
import pieceImages from "../pieceImages";
import bg from "../../assets/images/bgprofile.webp"
import GameOverModal from "../GameOverModal"

const moveSound = new Howl({ src: [moveSoundFile] });
const captureSound = new Howl({ src: [captureSoundFile] });
const checkSound = new Howl({ src: [checkSoundFile] });
const checkmateSound = new Howl({ src: [checkmateSoundFile] });

const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
};

const LocalMultiplayer = () => {
  const chessRef = useRef(null);
  const boardRef = useRef(null);
  const [currentStatus, setCurrentStatus] = useState(null);
  const [moves, setMoves] = useState([]);
  const gameRef = useRef(new Chess());
  const [isTableCollapsed, setIsTableCollapsed] = useState(false);
  const [promotionPiece, setPromotionPiece] = useState("q");
  const [mobileMode, setMobileMode] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false)
  const [gameOverMessage, setGameOverMessage] = useState("")

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
    const game = gameRef.current;

    const onDragStart = (source, piece, position, orientation) => {
      if (game.isGameOver()) {
        console.log("Start a new game from the menu");
        return false;
      }

      if (
        (game.turn() === "w" && piece.search(/^b/) !== -1) ||
        (game.turn() === "b" && piece.search(/^w/) !== -1)
      ) {
        return false;
      }
    };

    const onDrop = async (source, target) => {
      removeGreySquares();

      let move = game.move({
        from: source,
        to: target,
        promotion: promotionPiece, // Use the selected promotion piece
      });

      if (move === null) return "snapback";

      setMoves((prevMoves) => [...prevMoves, { from: move.from, to: move.to }]);
      updateStatus();

      // Play sound based on move type
      if (move.captured) {
        captureSound.play();
      } else {
        moveSound.play();
      }
    };

    const onMouseoverSquare = (square, piece) => {
      const moves = game.moves({
        square: square,
        verbose: true,
      });

      if (moves.length === 0) return;

      greySquare(square);

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

    const updateStatus = debounce(() => {
      let status = "";
      let moveColor = game.turn() === "w" ? "White" : "Black";

      if (game.isCheckmate()) {
        status = `${moveColor === "White" ? "Black" : "White"} wins!`;
        setIsGameOver(true);
        setGameOverMessage(status);
        checkmateSound.play();
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
          checkSound.play();
        }
      }
      setCurrentStatus(status);
    }, 100);

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

    boardRef.current = Chessboard(chessRef.current, config);

    return () => {
      if (boardRef.current) {
        boardRef.current.destroy();
      }
    };
  }, [promotionPiece]);

  const toggleTable = () => {
    setIsTableCollapsed(!isTableCollapsed);
  };

  const handlePromotionChange = (e) => {
    setPromotionPiece(e.target.value);
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
          <div className="mt-6">
            <label className="inline-flex items-center gap-2 text-black font-semibold bg-gray-300 p-2 rounded-md">
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
              <div className="mt-4">
                <label className="mr-2 text-white text-lg lg:text-xl">Promotion Piece:</label>
                <select
                  value={promotionPiece}
                  onChange={handlePromotionChange}
                  className="bg-gradient-to-r from-green-500 to-blue-600 bg-opacity-30 text-white px-4 py-2 rounded-lg w-full text-base lg:text-lg"
                >
                  <option value="q" className="bg-blue-900 bg-opacity-50 bg-transparent text-white">
                    Queen
                  </option>
                  <option value="r" className="bg-blue-900 bg-opacity-50 bg-transparent text-white">
                    Rook
                  </option>
                  <option value="b" className="bg-blue-900 bg-opacity-50 bg-transparent text-white">
                    Bishop
                  </option>
                  <option value="n" className="bg-blue-900 bg-opacity-50 bg-transparent text-white">
                    Knight
                  </option>
                </select>
              </div>
              <div className="mx-2 mt-8 text-center border border-gray-800 text-lg lg:text-xl text-red-500 font-semibold bg-gray-100 p-4 rounded-lg">
                If the game goes to start after promotion piece change, just
                attempt an illegal move, it will get OK so relax
              </div>
              <button
                onClick={toggleTable}
                className="mt-8 bg-gradient-to-r from-green-500 to-blue-600 bg-opacity-30 text-white border border-gray-200 px-6 py-3 rounded-lg w-full text-lg lg:text-xl"
              >
                {isTableCollapsed ? "Show Moves" : "Hide Moves"}
              </button>
              <div
                style={{
                  maxHeight: isTableCollapsed ? "0" : "40vh",
                  transition: "max-height 0.3s ease-in-out",
                  overflow: "scroll",
                }}
              >
                <div style={{ height: "100%", overflowY: "auto" }}>
                  <table className="w-full border-collapse border border-gray-700 rounded-lg bg-gray-400 bg-opacity-30 text-white">
                    <thead>
                      <tr className="bg-gray-800 bg-opacity-30 text-center text-white">
                        <th className="border border-gray-400 px-6 py-3 text-lg lg:text-xl">
                          Move
                        </th>
                        <th className="border border-gray-400 px-6 py-3 text-lg lg:text-xl">
                          From
                        </th>
                        <th className="border border-gray-400 px-6 py-3 text-lg lg:text-xl">
                          To
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {moves.map((move, index) => (
                        <tr
                          key={index}
                          className={
                            index % 2 === 0
                              ? "bg-gray-700 bg-opacity-30 text-white text-center"
                              : "bg-gray-600 bg-opacity-30 text-gray-200 text-center"
                          }
                        >
                          <td className="border border-gray-400 px-6 py-4 text-lg lg:text-xl">
                            {index + 1}
                          </td>
                          <td className="border border-gray-400 px-6 py-4 text-lg lg:text-xl">
                            {move.from}
                          </td>
                          <td className="border border-gray-400 px-6 py-4 text-lg lg:text-xl">
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
          </div>
        )}
      </div>
      <GameOverModal isOpen={isGameOver} message={gameOverMessage} onRestart={handleRestart} />
    </div>
    </div>
  );
};

export default LocalMultiplayer;