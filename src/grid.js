import { CONNECTIONS } from "./connections";

export default class Grid {
  constructor(size) {
    this.size = size;
    this.squares = [...Array(size)].map((_) =>
      [...Array(size)].map((_) => new GridSquare())
    );
    this.loops = [];
  }

  rotateSquare(r, c) {
    const currRotation = this.squares[r][c].rotation;
    this.squares[r][c].rotation = currRotation + Math.PI / 2;
  }

  // TODO: consider moving this out of this class
  _pathStepStringify({ r, c, connection }) {
    return `(${r}, ${c}, ${connection})`;
  }

  getValidNextSteps(visited, current) {
    const nextSteps = [];
    const directions = CONNECTIONS[current.connection].connects;
    // this looks in both directions of the connection which is silly
    // since only the start of a path will have the option of two directions
    directions.forEach(([dr, dc]) => {
      const nextR = current.r + dr;
      const nextC = current.c + dc;
      // check if it's on the grid
      if (
        nextR < 0 ||
        nextR >= this.squares.length ||
        nextC < 0 ||
        nextC >= this.squares.length
      ) {
        return;
      }
      // check that the path doesn't already go through it
      // TODO: consider pulling this out for testing
      const wouldRetread = Object.keys(CONNECTIONS)
        .map((c) =>
          visited.has(
            this._pathStepStringify({ r: nextR, c: nextC, connection: c })
          )
        )
        .reduce((acc, curr) => acc || curr, false);
      if (wouldRetread) {
        return;
      }
      // otherwise, find all the available compatible connections in the next square
      Object.entries(this.squares[nextR][nextC].connections).forEach(
        ([type, isUsed]) => {
          if (isUsed) {
            return;
          }
          // if you can get back to current from the next via some available
          // connection then this a valid next step
          CONNECTIONS[type].connects.forEach((coordDeltas) => {
            if (
              nextR + coordDeltas[0] == current.r &&
              nextC + coordDeltas[1] == current.c
            ) {
              nextSteps.push({ r: nextR, c: nextC, connection: type });
            }
          });
        }
      );
    });
    return nextSteps;
  }
}

class GridSquare {
  constructor() {
    this.connections = {
      NS: false,
      EW: false,
      NW: false,
      NE: false,
      SW: false,
      SE: false,
    };

    this.rotation = 0;
  }
}
