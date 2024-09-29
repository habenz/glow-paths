import html from "./instructions.html";
import css from "./instructions.module.css";

class Modal extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    const container = document.createElement("div");
    container.innerHTML = `<style>${css}</style>${html}`;

    const shadowRoot = this.attachShadow({ mode: "open" });
    shadowRoot.appendChild(container);
  }
}

window.customElements.define("game-instructions", Modal);
