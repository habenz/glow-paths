new EventSource("/esbuild").addEventListener("change", () => location.reload());
import "./index.css";

import p5 from "p5";

const canvasWrapper = document.getElementById("p5sketch");
new p5(sketch, canvasWrapper);

function sketch(p) {
  p.setup = () => {
    p.createCanvas(400, 400);
  };

  p.draw = () => {
    p.background(200);
  };
}
