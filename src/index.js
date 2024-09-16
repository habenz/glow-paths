new EventSource("/esbuild").addEventListener("change", () => location.reload());
import "../public/index.css";

import p5 from "p5";

const canvasWrapper = document.getElementById("p5sketch");
new p5(sketch, canvasWrapper);

function sketch(p) {
  let sketchWidth;
  let sketchHeight;

  function updateSketchSize() {
    console.log(p.windowWidth, p.windowHeight);
    sketchWidth = p.windowWidth * 0.95;
    sketchHeight = p.windowHeight * 0.95;
  }

  p.setup = () => {
    updateSketchSize();
    p.createCanvas(sketchWidth, sketchHeight);
  };

  p.draw = () => {
    p.background(20);
  };

  p.windowResized = () => {
    updateSketchSize();
    p.resizeCanvas(sketchWidth, sketchHeight);
  };
}
