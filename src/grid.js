export default class Grid {
  constructor(size) {
    this.size = size;
    this.squares = [...Array(size)].map((_) =>
      [...Array(size)].map((_) => new GridSquare())
    );
  }

  rotateSquare(r, c) {
    const currRotation = this.squares[r][c].rotation;
    this.squares[r][c].rotation = currRotation + Math.PI / 2;
  }
}

class GridSquare {
  constructor() {
    this.connections = {
      NS: false,
      EW: false,
      NW: false,
      NE: true,
      SW: false,
      SE: false,
    };
    this.rotation = 0;
  }
}
