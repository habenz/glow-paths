import { CONNECTIONS } from "./connections";
import { randomElement, randomIntInRange, tileStringify } from "./utils";

export default class Grid {
  constructor(size) {
    this.size = size;
    // TODO: consider testing grid connection generation
    this.squares = [...Array(size)].map((_, r) =>
      [...Array(size)].map(
        (_, c) => new GridSquare(this._validGridConnections(r, c))
      )
    );
    this.loops = [];
  }

  rotateSquare(r, c) {
    const currRotation = this.squares[r][c].rotation;
    this.squares[r][c].rotation = currRotation + Math.PI / 2;
  }

  _isOnBoard(r, c) {
    if (r < 0 || r >= this.size || c < 0 || c >= this.size) {
      return false;
    }

    return true;
  }

  _validGridConnections(r, c) {
    return Object.values(CONNECTIONS)
      .filter(({ connects }) => {
        const firstEnd = connects[0];
        const secondEnd = connects[1];
        const firstEndOnBoard = this._isOnBoard(
          r + firstEnd[0],
          c + firstEnd[1]
        );
        const secondEndOnBoard = this._isOnBoard(
          r + secondEnd[0],
          c + secondEnd[1]
        );
        return firstEndOnBoard && secondEndOnBoard;
      })
      .map(({ name }) => name);
  }

  getValidNextSteps(visited, current) {
    const nextSteps = [];
    const directions = CONNECTIONS[current.connection].connects;
    // this looks in both directions of the connection which is a bit silly
    // since only the start of a path will have the option of two directions
    directions.forEach(([dr, dc]) => {
      const nextR = current.r + dr;
      const nextC = current.c + dc;
      // check if it's on the grid
      if (!this._isOnBoard(nextR, nextC)) {
        return;
      }

      // check that the path doesn't already go through it
      const wouldRetread = visited.has(tileStringify({ r: nextR, c: nextC }));
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

  _getStartSquare() {
    // choose a random start (assumption grid is square)
    const startR = Math.floor(Math.random() * this.size);
    const startC = Math.floor(Math.random() * this.size);
    // try to choose a random first connection
    const possibleConnections = this.squares[startR][startC].connections;
    const availableConnections = Object.entries(possibleConnections)
      .filter(([_, isUsed]) => !isUsed)
      .map(([type, _]) => type);

    // If there are no available connections through the tile, try again
    if (!availableConnections.length) {
      return this._getStartSquare();
    }

    const startConnection = randomElement(availableConnections);
    const firstStep = { r: startR, c: startC, connection: startConnection };
    const visited = new Set([tileStringify(firstStep)]);
    const possibleNextSteps = this.getValidNextSteps(visited, firstStep);
    const adjacentTiles = new Set(possibleNextSteps.map(tileStringify));

    // If the start connection can't access two different tiles then it can't
    // possibly be part of a loop, so try again
    if (adjacentTiles.size < 2) {
      return this._getStartSquare();
    }

    return [firstStep, possibleNextSteps];
  }

  tryAddRandomLoop() {
    const [firstStep, stack] = this._getStartSquare();
    // here "length" is actually just a lower bound on the length of the
    // loop we're going to try to produce
    const length = randomIntInRange(5, 20);

    // first just try to find any random hamiltonian walk of length length
    const path = [firstStep];
    const visited = new Set([tileStringify(firstStep)]);

    while (path.length < length) {
      // TODO: think about handling the scenario where the stack is empty
      const next = stack.pop();
      const possibleNextSteps = this.getValidNextSteps(visited, next);

      // If no valid next steps, we don't want next in the path
      if (!possibleNextSteps.length) {
        // if the thing on the stack after "next" isn't in the same tile then the last
        // thing in the path had next steps that all led to dead ends. So we want to remove
        // all the steps in the path that conflict with taking the next option on the stack
        if (tileStringify(next) != tileStringify(stack.at(-1))) {
          // pop off the path until it's possible to take the next thing off the stack
          const nextOption = stack.at(-1);
          while (tileStringify(path.at(-1)) != tileStringify(nextOption)) {
            const stepToUndo = path.pop();
            visited.delete(tileStringify(stepToUndo));
          }
          const lastStepToUndo = path.pop();
          visited.delete(tileStringify(lastStepToUndo));

          // old bad code
          //   const lastStepToUndo = path.pop();
          //   visited.delete(tileStringify(lastStepToUndo));
        }
        continue;
      }

      //If there are next steps then we'll accept next as the next step in the path
      path.push(next);
      // Push the possible next steps onto the stack in a random order
      // should be fine performance-wise bc there can be max 6 neighbors
      while (possibleNextSteps.length) {
        const randIndex = Math.floor(Math.random() * possibleNextSteps.length);
        stack.push(...possibleNextSteps.splice(randIndex, 1));
      }
      // Mark it as a visited tile
      visited.add(tileStringify(next));
    }

    // Test code: Make the partial path show up in the drawing of the grid
    this.loops.push(path);
    path.forEach(({ r, c, connection }) => {
      this.squares[r][c].connections[connection] = true;
    });
  }
}

class GridSquare {
  constructor(validConnections) {
    this.connections = {};
    validConnections.forEach((type) => (this.connections[type] = false));

    this.rotation = 0;
  }
}
