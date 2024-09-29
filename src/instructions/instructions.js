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

    const buttons = this.shadowRoot.querySelectorAll("button");
    for (const b of buttons) {
      b.addEventListener("click", () => this._toggleVisibility());
    }
  }

  _toggleVisibility() {
    const modal = this.shadowRoot.querySelector(".wrapper");
    modal.classList.toggle("visible");
  }
}

window.customElements.define("game-instructions", Modal);
