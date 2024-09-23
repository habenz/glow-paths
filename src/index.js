new EventSource("/esbuild").addEventListener("change", () => location.reload());
import "../public/index.css";

import p5 from "p5";
import Grid from "./grid";
import { PATH_COLORS, WHITE } from "./colors";

const canvasWrapper = document.getElementById("p5sketch");
new p5(sketch, canvasWrapper);

function sketch(p) {
  let boardSize;
  let tileSize;
  let gridSize = 10;
  let grid = new Grid(gridSize);

  function updateSketchSize() {
    boardSize = Math.min(p.windowWidth, p.windowHeight) * 0.95;
    tileSize = boardSize / gridSize;
  }

  p.setup = () => {
    updateSketchSize();
    p.createCanvas(boardSize, boardSize);
    for (let i = 0; i < 10; i++) {
      grid.tryAddRandomLoop();
    }
    drawGrid();
  };

  p.windowResized = () => {
    updateSketchSize();
    p.resizeCanvas(boardSize, boardSize);
    drawGrid();
  };

  p.mouseClicked = () => {
    const c = p.floor(p.mouseX / tileSize);
    const r = p.floor(p.mouseY / tileSize);
    if (grid._isOnBoard(r, c)) {
      grid.rotateSquare(r, c);
      // FIXIT: don't want this in the final game
    } else {
      grid.tryAddRandomLoop();
    }

    drawGrid();
  };

  function drawGrid() {
    grid.squares.forEach((row, r) => {
      row.forEach((_, c) => {
        drawTile(r, c);
      });
    });

    grid.loops.forEach((loop) => {
      // TODO: 1) picking colors for a loop can probably be its own func
      //       2) two loops shouldn't be the same colors so keep track of
      //          used pairs somehow or just generate all combos and pick
      //          randomly from those. This has the added benefit of being
      //          able to disqualify low contrast combos easily
      //        3) should you really be keeping a p5 color on the grid?
      if (!loop.startColor) {
        const startColorInd = Math.floor(Math.random() * PATH_COLORS.length);
        const offset = Math.ceil(Math.random() * (PATH_COLORS.length - 1));
        const endColorInd = (startColorInd + offset) % PATH_COLORS.length;

        loop.startColor = p.color(...PATH_COLORS[startColorInd].rgb);
        loop.endColor = p.color(...PATH_COLORS[endColorInd].rgb);
      }
      loop.forEach(({ r, c, connection }, i) => {
        const connectionColor = p.lerpColor(
          loop.startColor,
          loop.endColor,
          i / loop.length
        );
        drawConnection(r, c, connection, connectionColor);
      });
    });

    // grid.debugPath.forEach(({ r, c, connection }, i) => {
    //   drawConnection(r, c, connection, p.color(255, i * 30, 0, 100));
    // });
  }

  function drawTile(row, col) {
    const x = col * tileSize;
    const y = row * tileSize;

    p.fill(p.color(...WHITE));
    p.square(x, y, tileSize);
  }

  function drawConnection(r, c, connection, connectionColor) {
    const x = c * tileSize;
    const y = r * tileSize;

    p.push();
    p.strokeWeight(8);
    p.noFill();

    p.translate(x + tileSize / 2, y + tileSize / 2);
    p.rotate(grid.squares[r][c].rotation * p.HALF_PI);
    p.translate(-(x + tileSize / 2), -(y + tileSize / 2));

    p.stroke(connectionColor);
    _drawConnection(x, y, connection);
    p.pop();
  }

  function _drawConnection(topLeftX, topLeftY, type) {
    if (type == "NW") {
      p.arc(topLeftX, topLeftY, tileSize, tileSize, 0, p.HALF_PI);
    } else if (type == "NE") {
      p.arc(topLeftX + tileSize, topLeftY, tileSize, tileSize, p.HALF_PI, p.PI);
    } else if (type == "SW") {
      p.arc(topLeftX, topLeftY + tileSize, tileSize, tileSize, -p.HALF_PI, 0);
    } else if (type == "SE") {
      p.arc(
        topLeftX + tileSize,
        topLeftY + tileSize,
        tileSize,
        tileSize,
        p.PI,
        p.PI + p.HALF_PI
      );
    } else if (type == "NS") {
      p.line(
        topLeftX + tileSize / 2,
        topLeftY,
        topLeftX + tileSize / 2,
        topLeftY + tileSize
      );
    } else if (type == "EW") {
      p.line(
        topLeftX,
        topLeftY + tileSize / 2,
        topLeftX + tileSize,
        topLeftY + tileSize / 2
      );
    }
  }
}
