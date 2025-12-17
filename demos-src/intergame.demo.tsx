import { createRoot } from "react-dom/client";
import { cartesianProduct, range, Vec2, Vec4 } from "../src";
import React, { useState } from "react";

type GameState = {
  positions: string[];
  team: Team;
};

const InitGame: GameState = {
  positions: [
    "O",
    "O",
    "O",
    " ", //
    " ",
    " ",
    " ",
    " ", //
    " ",
    " ",
    " ",
    " ", //
    " ",
    "X",
    "X",
    "X", //
  ],
  team: "X",
};

type Team = "X" | "O";

const root = document.createElement("div");
document.body.appendChild(root);

createRoot(root).render(<Game></Game>);

const CSS = `
.game-board {
display: grid;
font-size: 72px;
font-family: monospace;
grid-template-columns: repeat(4, 1fr);
grid-template-rows: repeat(4, 1fr);
width: fit-content;
}

.game-cell {
  width: 100px;
  height: 100px;
  border: 1px solid black;
  margin-bottom: -1px;
  margin-right: -1px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.move-candidate {
  background-color: #eee;
}

.winner {
  font-size: 72px;
}
`;

function Game() {
  const [board, setBoard] = useState(InitGame);

  const [chosenPiece, setChosenPiece] = useState<Vec2 | undefined>(undefined);

  const [winner, setWinner] = useState<Team | undefined>(undefined);

  return (
    <>
      {winner ? <div className="winner">{winner} wins!</div> : <></>}
      <style>{CSS}</style>
      <div>
        <div>{board.team}'s turn</div>
        <GameBoard
          winner={winner}
          board={board}
          chosenPiece={chosenPiece}
          setChosenPiece={setChosenPiece}
          move={(v) => {
            const winner = isWinner(v, board.team);
            if (winner) {
              setWinner(winner);
            }
            setBoard(v);
            setChosenPiece(undefined);
          }}
        ></GameBoard>
      </div>
    </>
  );
}

function isAdjacent(a: Vec2, b: Vec2) {
  return Math.abs(a[0] - b[0]) <= 1 && Math.abs(a[1] - b[1]) <= 1;
}

function GameBoard(props: {
  board: GameState;
  chosenPiece: Vec2 | undefined;
  setChosenPiece: (v: Vec2 | undefined) => void;
  move: (game: GameState) => void;
  winner: Team | undefined;
}) {
  return (
    <div className="game-board" style={{ opacity: props.winner ? "0.5" : "1" }}>
      {props.board.positions.map((p, i) => {
        const pos: Vec2 = [i % 4, Math.floor(i / 4)];

        const isMoveCandidate =
          p === " " && props.chosenPiece && isAdjacent(pos, props.chosenPiece);

        return (
          <div
            className={
              isMoveCandidate ? "game-cell move-candidate" : "game-cell"
            }
            key={i}
            onClick={(e) => {
              if (props.winner) return;

              if (props.board.team === p) {
                props.setChosenPiece(pos);
              } else if (isMoveCandidate) {
                let newgame = props.board.positions;

                newgame[props.chosenPiece[1] * 4 + props.chosenPiece[0]] = " ";
                newgame[i] = props.board.team;

                props.move({
                  positions: newgame,
                  team: props.board.team === "X" ? "O" : "X",
                });
              }
            }}
          >
            {p}
          </div>
        );
      })}
    </div>
  );
}

function isRowFull(game: GameState, row: Vec4): boolean {
  return (
    game.positions[row[0]] !== " " &&
    game.positions[row[1]] !== " " &&
    game.positions[row[2]] !== " " &&
    game.positions[row[3]] !== " "
  );
}

function isWinner(game: GameState, lastTeam: Team): Team | undefined {
  const didWin =
    isRowFull(game, [0, 1, 2, 3]) ||
    isRowFull(game, [4, 5, 6, 7]) ||
    isRowFull(game, [8, 9, 10, 11]) ||
    isRowFull(game, [12, 13, 14, 15]) ||
    isRowFull(game, [0, 4, 8, 12]) ||
    isRowFull(game, [1, 5, 9, 13]) ||
    isRowFull(game, [2, 6, 10, 14]) ||
    isRowFull(game, [3, 7, 11, 15]) ||
    isRowFull(game, [0, 5, 10, 15]) ||
    isRowFull(game, [3, 6, 9, 12]);
  if (didWin) {
    return lastTeam;
  } else {
    return undefined;
  }
}
