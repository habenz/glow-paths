export default class Grid {
  constructor(size) {
    this.size = size;
    this.squares = [...Array(size)].map((_) =>
      [...Array(size)].map((_) => new GridSquare())
    );
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
