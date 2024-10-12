new EventSource("/esbuild").addEventListener("change", () => location.reload());
import "./index.css";
import "./instructions/instructions.js";

import p5 from "p5";
import Grid from "./grid";
import { PATH_COLORS, BACKGROUND_COLOR, GLOW_COLOR } from "./colors";

const canvasWrapper = document.getElementById("p5sketch");
// Mark the element that contains the sketch as clickable so Safari on iOS will
// respect touch-action: manipulation and disable double tap to zoom as per
// https://bugs.webkit.org/show_bug.cgi?id=149854#c25
canvasWrapper.onclick = () => {};
new p5(sketch, canvasWrapper);

let gridSize = 10;
let grid = new Grid(gridSize);
let gameEnded = false;
let hint = null;
const hintLength = 1400;

const hintButton = document.createElement("button");
hintButton.innerText = "Hint";
hintButton.onclick = () => {
  // pick a random square that still needs to be rotated
  const hintCandidates = [];
  for (let r = 0; r < grid.squares.length; r++) {
    for (let c = 0; c < grid.squares[r].length; c++) {
      const square = grid.squares[r][c];
      if (!square.isCorrectlyOriented()) {
        hintCandidates.push({ r, c });
      }
    }
  }
  const randIndex = Math.floor(hintCandidates.length * Math.random());
  hint = hintCandidates[randIndex];
  // disable the button so more than one hint is never shown at the same time
  hintButton.disabled = true;
  setTimeout(() => {
    hint = null;
    hintButton.disabled = false;
  }, hintLength);
};
const disableHint = () => {
  hintButton.disabled = true;
};
document.querySelector(".side_panel").append(hintButton);

function sketch(p) {
  let boardSize;
  let tileSize;

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
    for (const row of grid.squares) {
      for (const square of row) {
        // only scramble squares with connections through them (dev convenience)
        if (!square.isEmpty()) {
          square.rotation = Math.floor(Math.random() * 4);
        }
      }
    }

    drawGrid();
    updateTitleDisplay();
  };

  p.draw = () => drawGrid();

  p.windowResized = () => {
    updateSketchSize();
    p.resizeCanvas(boardSize, boardSize);
  };

  // mouseClicked and touchEnded defined so interactions
  // work on both desktop and mobile
  p.mouseClicked = () => interactWithTileAt(p.mouseX, p.mouseY);

  p.touchEnded = () => {
    const { x, y } = p.touches.at(-1);
    interactWithTileAt(x, y);
  };

  function interactWithTileAt(x, y) {
    if (!gameEnded) {
      const c = p.floor(x / tileSize);
      const r = p.floor(y / tileSize);
      if (grid._isOnBoard(r, c)) {
        grid.rotateSquare(r, c);
      }
      checkLevelFinished();
      console.log(grid.squares.map((row) => row.map((sq) => sq.rotation)));
    }
  }

  // TODO: write tests for this
  function checkLevelFinished() {
    for (const row of grid.squares) {
      for (const square of row) {
        if (!square.isCorrectlyOriented()) {
          return;
        }
      }
    }
    gameEnded = p.millis();
    disableHint();
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

    drawHint();

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

  function drawHint() {
    if (!hint) {
      return;
    }
    if (!hint.startTime) {
      hint.startTime = p.millis();
    }

    const x = hint.c * tileSize;
    const y = hint.r * tileSize;

    p.push();

    const lightest = p.color(255);
    const darkest = p.color(GLOW_COLOR);
    const currentColor = p.lerpColor(
      lightest,
      darkest,
      (p.sin((p.millis() - hint.startTime) / 200) + 1) / 2
    );

    p.drawingContext.shadowColor = currentColor;
    p.stroke(currentColor);

    p.drawingContext.shadowBlur = 4;
    p.strokeWeight(2);
    p.noFill();
    p.square(x, y, tileSize);
    p.pop();
  }

  function drawTile(row, col) {
    const x = col * tileSize;
    const y = row * tileSize;

    p.push();
    p.stroke("white");
    p.strokeWeight(3);
    p.fill(p.color(...BACKGROUND_COLOR));
    p.square(x, y, tileSize);
    p.pop();
  }

  function drawConnection(r, c, connection, connectionColor) {
    const x = c * tileSize;
    const y = r * tileSize;

    p.push();

    p.translate(x + tileSize / 2, y + tileSize / 2);
    p.rotate(grid.squares[r][c].rotation * p.HALF_PI);
    p.translate(-(x + tileSize / 2), -(y + tileSize / 2));

    if (gameEnded) {
      p.drawingContext.shadowBlur = getGlowSize();
      p.drawingContext.shadowColor = connectionColor;
    }

    p.noFill();
    p.strokeWeight(8);
    p.stroke(connectionColor);
    _drawConnection(x, y, connection);

    p.pop();
  }

  function getGlowSize() {
    const maxGlow = 35;
    const finalGlow = 15;
    // Fade in glow for 1.5s, then fade out in 0.5 sec
    if (p.millis() - gameEnded < 1500) {
      return p.lerp(0, maxGlow, (p.millis() - gameEnded) / 1500);
    } else if (p.millis() - gameEnded < 2000) {
      return p.lerp(maxGlow, finalGlow, (p.millis() - gameEnded - 1500) / 500);
    }
    return finalGlow;
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
