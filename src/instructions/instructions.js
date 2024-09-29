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

    const overlay = this.shadowRoot.querySelector(".overlay");
    overlay.addEventListener("click", (e) => {
      e.stopPropagation();
      this._toggleVisibility();
    });

    document.addEventListener("keydown", (e) => {
      const modal = this.shadowRoot.querySelector(".modal");
      if (e.key == "Escape" && modal.classList.contains("visible")) {
        this._toggleVisibility();
      }
    });
  }

  _toggleVisibility() {
    const overlay = this.shadowRoot.querySelector(".overlay");
    overlay.classList.toggle("visible");
    const modal = this.shadowRoot.querySelector(".modal");
    modal.classList.toggle("visible");
  }
}

window.customElements.define("game-instructions", Modal);
