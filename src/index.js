new EventSource("/esbuild").addEventListener("change", () => location.reload());
import "./index.css";
import "./instructions/instructions.js";

import p5 from "p5";
import Grid from "./grid";
import { PATH_COLORS, BACKGROUND_COLOR, GLOW_COLOR } from "./colors";
import { CURVED_CONNECTIONS } from "./connections";

const canvasWrapper = document.getElementById("p5sketch");
new p5(sketch, canvasWrapper);

function sketch(p) {
  let boardSize;
  let tileSize;
  let gridSize = 10;
  let grid = new Grid(gridSize);
  let gameEnded = false;

  function updateSketchSize() {
    boardSize = Math.min(p.windowWidth, p.windowHeight) * 0.95;
    tileSize = boardSize / gridSize;
  }

  p.setup = () => {
    updateSketchSize();
    p.createCanvas(boardSize, boardSize);

    while (grid.loops.length < 7) {
      grid.tryAddRandomLoop();
    }
    grid.squares.forEach((row) => {
      row.forEach((square) => {
        square.rotation = Math.floor(Math.random() * 4);
      });
    });

    drawGrid();
    updateTitleDisplay();
  };

  p.windowResized = () => {
    updateSketchSize();
    p.resizeCanvas(boardSize, boardSize);
    drawGrid();
  };

  p.mouseClicked = () => {
    if (!gameEnded) {
      const c = p.floor(p.mouseX / tileSize);
      const r = p.floor(p.mouseY / tileSize);
      if (grid._isOnBoard(r, c)) {
        grid.rotateSquare(r, c);
      }
    }

    checkLevelFinished();
    console.log(grid.squares.map((row) => row.map((sq) => sq.rotation)));
    drawGrid();
  };

  // FIXIT: logic duplicated
  p.touchStarted = () => {
    if (!gameEnded) {
      const { x, y } = p.touches.at(-1);
      const c = p.floor(x / tileSize);
      const r = p.floor(y / tileSize);
      if (grid._isOnBoard(r, c)) {
        grid.rotateSquare(r, c);
      }
    }

    checkLevelFinished();
    console.log(grid.squares.map((row) => row.map((sq) => sq.rotation)));
    drawGrid();
  };

  // TODO: write tests for this
  function checkLevelFinished() {
    for (const row of grid.squares) {
      for (const square of row) {
        const connections = Object.values(square.connections);
        // there are no connections through this square so its rotation doesn't matter
        if (connections.every((conn) => !conn)) {
          continue;
        }
        // if we're only using NS and EW connections then it looks the same when rotated 180 deg
        const noCurvedConnections = CURVED_CONNECTIONS.map(
          (conn) => square.connections[conn]
        ).every((conn) => !conn);
        if (noCurvedConnections && square.rotation % 2 == 0) {
          continue;
        }
        // we found a square with connections that isn't in the correct orientation
        if (square.rotation != 0) {
          return;
        }
      }
    }
    gameEnded = true;
    // TODO: should this call out to some other function instead of just doing it here?
    const title = document.getElementById("title");
    title.style.textShadow = `${GLOW_COLOR} 1px 0 5px`;
  }

  function drawGrid() {
    grid.squares.forEach((row, r) => {
      row.forEach((_, c) => {
        drawTile(r, c);
      });
    });

    // draw a border around the whole board to account for the
    // fact that the weights of the tile border strokes add
    p.stroke("white");
    p.strokeWeight(6);
    p.noFill();
    p.square(0, 0, boardSize);

    // draw a white border around each loop
    if (gameEnded) {
      grid.loops.forEach((loop) => {
        loop.forEach(({ r, c, connection }, i) => {
          //FIXIT? sneaky secret color
          drawConnection(r, c, connection, p.color("white"), true);
        });
      });
    }

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

      const halfwayPoint = Math.floor(loop.length / 2);
      loop.forEach(({ r, c, connection }, i) => {
        let connectionColor;
        if (i <= halfwayPoint) {
          connectionColor = p.lerpColor(
            loop.startColor,
            loop.endColor,
            i / halfwayPoint
          );
        } else {
          connectionColor = p.lerpColor(
            loop.endColor,
            loop.startColor,
            (i - halfwayPoint) / halfwayPoint
          );
        }
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

    p.stroke("white");
    p.strokeWeight(3);
    p.fill(p.color(...BACKGROUND_COLOR));
    p.square(x, y, tileSize);
  }

  function drawConnection(
    r,
    c,
    connection,
    connectionColor,
    isBackground = false
  ) {
    const x = c * tileSize;
    const y = r * tileSize;

    p.push();

    p.translate(x + tileSize / 2, y + tileSize / 2);
    p.rotate(grid.squares[r][c].rotation * p.HALF_PI);
    p.translate(-(x + tileSize / 2), -(y + tileSize / 2));

    p.noFill();
    p.strokeWeight(isBackground ? 25 : 8);
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

function updateTitleDisplay() {
  // TODO: think about the fact that this logic is duplicated here,
  //  in the css and in the sketch
  const sketchSize = Math.min(window.innerWidth, window.innerHeight) * 0.95;
  const remainingWidth = window.innerWidth - sketchSize;
  const title = document.getElementById("title");
  if (remainingWidth < 165) {
    title.style.display = "none";
  } else {
    title.style.display = "flex";
  }
}
addEventListener("resize", () => {
  updateTitleDisplay();
});
