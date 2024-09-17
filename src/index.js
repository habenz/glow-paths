new EventSource("/esbuild").addEventListener("change", () => location.reload());
import "../public/index.css";

import p5 from "p5";
import Grid from "./grid";

const canvasWrapper = document.getElementById("p5sketch");
new p5(sketch, canvasWrapper);

function sketch(p) {
  let boardSize;
  let grid = new Grid(10);

  function updateSketchSize() {
    boardSize = Math.min(p.windowWidth, p.windowHeight) * 0.95;
  }

  p.setup = () => {
    updateSketchSize();
    p.createCanvas(boardSize, boardSize);
    drawGrid();
  };

  p.windowResized = () => {
    updateSketchSize();
    p.resizeCanvas(boardSize, boardSize);
    drawGrid();
  };

  function drawGrid() {
    grid.squares.forEach((row, r) => {
      row.forEach((square, c) => {
        drawTile(square, r, c);
      });
    });
  }

  function drawTile(square, row, col) {
    const tileSize = boardSize / 10;
    const x = col * tileSize;
    const y = row * tileSize;

    p.square(x, y, tileSize);

    p.push();
    p.strokeWeight(4);
    p.noFill();
    p.translate(x + tileSize / 2, y + tileSize / 2);
    p.rotate(square.rotation);
    p.translate(-(x + tileSize / 2), -(y + tileSize / 2));

    Object.entries(square.connections).forEach(([type, isConnected]) => {
      drawConnection(x, y, type, isConnected);
    });
    p.pop();
  }

  function drawConnection(topLeftX, topLeftY, type, isConnected) {
    const tileSize = boardSize / 10;

    if (type == "NE") {
      p.arc(topLeftX, topLeftY, tileSize, tileSize, 0, p.HALF_PI);
    }
    // TODO: specify how to draw all other connections
  }
}
