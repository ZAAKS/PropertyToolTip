import { UMB_AUTH_CONTEXT as x } from "@umbraco-cms/backoffice/auth";
import { S as v, c as b, l as S, D as L, a as T } from "./settings-gftmjg.js";
const l = "property-tooltip-help-icon", m = "property-tooltip-description-style", u = "ptt-icon", s = 8;
class w extends HTMLElement {
  static #l = 0;
  #i = "";
  #o = L;
  #t;
  #a = `property-tooltip-help-text-${w.#l++}`;
  #s;
  set description(t) {
    this.#i = t, this.#u(), this.isConnected && this.#h();
  }
  get description() {
    return this.#i;
  }
  set settings(t) {
    this.#o = t, this.isConnected && this.#h();
  }
  get settings() {
    return this.#o;
  }
  connectedCallback() {
    this.addEventListener("pointerenter", this.#r), this.addEventListener("focusin", this.#r), this.addEventListener("pointerleave", this.#n), this.addEventListener("focusout", this.#n), this.#h();
  }
  disconnectedCallback() {
    this.removeEventListener("pointerenter", this.#r), this.removeEventListener("focusin", this.#r), this.removeEventListener("pointerleave", this.#n), this.removeEventListener("focusout", this.#n), this.#n(), this.querySelector(`:scope > umb-icon[slot="${u}"]`)?.remove();
  }
  #h() {
    if (!this.isConnected) return;
    this.querySelector(`:scope > umb-icon[slot="${u}"]`)?.remove();
    const t = this.shadowRoot ?? this.attachShadow({ mode: "open" });
    t.replaceChildren();
    const e = this.#o.iconSize, i = document.createElement("style");
    i.textContent = `
      :host {
        --ptt-icon-size: ${e}px;
        --ptt-trigger-padding: 4px;
        --ptt-trigger-size: calc(var(--ptt-icon-size) + (var(--ptt-trigger-padding) * 2));
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        margin: 0 0 0 var(--uui-size-space-1, 4px);
        vertical-align: middle;
        line-height: 0;
      }

      button {
        align-items: center;
        background: transparent;
        border: 1px solid var(--uui-color-border, rgba(27, 38, 79, 0.22));
        border-radius: 50%;
        color: var(--uui-color-interactive, #3544b1);
        cursor: help;
        display: inline-flex;
        font: inherit;
        font-size: ${Math.max(9, Math.round(e * 0.58))}px;
        font-weight: 700;
        height: var(--ptt-trigger-size);
        width: var(--ptt-trigger-size);
        justify-content: center;
        line-height: 1;
        padding: 0;
        box-sizing: border-box;
      }

      button[data-kind="icon"] {
        font-size: unset;
        font-weight: unset;
        color: inherit;
      }

      button[data-kind="icon"] > slot::slotted(umb-icon) {
        font-size: calc(var(--ptt-icon-size) * 0.72);
        line-height: 1;
      }

      button:hover {
        background: var(--uui-color-surface-alt, rgba(27, 38, 79, 0.06));
        border-color: var(--uui-color-interactive, #3544b1);
      }

      button:focus-visible {
        outline: 2px solid var(--uui-color-focus, currentColor);
        outline-offset: 2px;
        background: var(--uui-color-surface-alt, rgba(27, 38, 79, 0.06));
      }
    `;
    const o = document.createElement("button");
    if (o.type = "button", this.#o.icon.toLowerCase() === "letter")
      o.textContent = "i", o.dataset.kind = "letter";
    else {
      o.dataset.kind = "icon";
      const h = document.createElement("slot");
      h.name = u, o.append(h);
      const c = document.createElement("umb-icon");
      c.slot = u, this.append(c), T(c, this.#o.icon);
    }
    o.setAttribute("aria-label", this.#i), o.setAttribute("aria-describedby", this.#a), o.addEventListener("mouseenter", this.#r), o.addEventListener("pointerenter", this.#r), o.addEventListener("focus", this.#r), o.addEventListener("mouseleave", this.#n), o.addEventListener("pointerleave", this.#n), o.addEventListener("blur", this.#n), this.#s = o, t.append(i, o);
  }
  #r = () => {
    !this.#i || !this.#s || (this.#t ??= this.#f(), this.#c(), this.#u(), this.#t.isConnected || document.body.append(this.#t), this.#p(), this.#e(), window.addEventListener("resize", this.#e), document.addEventListener("scroll", this.#e, !0));
  };
  #n = () => {
    this.#d(), this.#t?.remove(), window.removeEventListener("resize", this.#e), document.removeEventListener("scroll", this.#e, !0);
  };
  #c() {
    if (!this.#t) return;
    const t = this.#o;
    this.#t.style.fontSize = `${t.tooltipFontSize}px`, this.#t.style.maxWidth = `min(${t.tooltipMaxWidth}px, calc(100vw - 48px))`, this.#t.style.minWidth = `${t.tooltipMinWidth}px`;
  }
  #e = () => {
    if (!this.#t || !this.#s) return;
    const t = this.#s.getBoundingClientRect(), e = this.#t.getBoundingClientRect(), i = document.documentElement.clientWidth, o = document.documentElement.clientHeight, n = this.#o.tooltipPlacement, h = this.#o.tooltipHorizontalAlign, c = t.bottom + s + e.height <= o - s, E = t.top - s - e.height >= s;
    let r;
    n === "below" ? r = t.bottom + s : n === "above" ? r = t.top - e.height - s : c ? r = t.bottom + s : E ? r = t.top - e.height - s : r = t.bottom + s;
    let a;
    const f = e.width;
    h === "center" ? a = t.left + t.width / 2 - f / 2 : h === "end" ? a = t.right - f : a = t.left, a = Math.min(Math.max(s, a), i - f - s), r = Math.min(Math.max(s, r), o - e.height - s), this.#t.style.left = `${a}px`, this.#t.style.top = `${r}px`;
  };
  #f() {
    const t = document.createElement("span");
    return t.id = this.#a, t.role = "tooltip", t.setAttribute("popover", "manual"), t.style.background = "var(--uui-color-surface, #fff)", t.style.border = "1px solid var(--uui-color-border, #d8d7d9)", t.style.borderRadius = "var(--uui-border-radius, 3px)", t.style.boxShadow = "var(--uui-shadow-depth-3, 0 6px 18px rgba(0, 0, 0, 0.18))", t.style.color = "var(--uui-color-text, #1b264f)", t.style.fontWeight = "400", t.style.lineHeight = "1.45", t.style.padding = "var(--uui-size-space-3, 12px)", t.style.position = "fixed", t.style.inset = "auto", t.style.margin = "0", t.style.overflow = "visible", t.style.whiteSpace = "normal", t.style.zIndex = "2147483647", t;
  }
  #p() {
    if (this.#t)
      try {
        this.#t.showPopover?.();
      } catch {
      }
  }
  #d() {
    if (this.#t)
      try {
        this.#t.hidePopover?.();
      } catch {
      }
  }
  #u() {
    this.#s && this.#s.setAttribute("aria-label", this.#i), this.#t && (this.#t.textContent = this.#i);
  }
}
class R {
  #l;
  #i = /* @__PURE__ */ new Set();
  #o = /* @__PURE__ */ new WeakSet();
  #t = !1;
  #a;
  #s;
  #h;
  constructor(t) {
    this.#h = t;
  }
  start() {
    this.#t = !1, customElements.get(l) || customElements.define(l, w), this.#r(), this.#c(document), this.#e(document), customElements.whenDefined("umb-property-layout").then(() => {
      this.#t || this.#e(document);
    });
  }
  stop() {
    this.#t = !0, this.#l?.disconnect(), this.#l = void 0, this.#n(), this.#i.forEach((t) => {
      this.#p(t)?.remove(), t.shadowRoot?.getElementById(m)?.remove();
    }), this.#i.clear();
  }
  #r() {
    if (this.#a) return;
    const t = this, e = Element.prototype.attachShadow, i = function(o) {
      const n = e.call(this, o);
      return queueMicrotask(() => {
        t.#t || (t.#c(n), t.#e(n));
      }), n;
    };
    this.#a = e, this.#s = i, Element.prototype.attachShadow = i;
  }
  #n() {
    this.#a && Element.prototype.attachShadow === this.#s && (Element.prototype.attachShadow = this.#a), this.#a = void 0, this.#s = void 0;
  }
  #c(t) {
    this.#t || this.#o.has(t) || (this.#o.add(t), this.#l ??= new MutationObserver((e) => {
      if (!this.#t)
        for (const i of e) {
          const o = i.target.getRootNode();
          o instanceof ShadowRoot && o.host.localName === "umb-property-layout" && this.#d(o.host);
          for (const n of i.addedNodes)
            this.#f(n);
        }
    }), this.#l.observe(t, { attributes: !0, characterData: !0, childList: !0, subtree: !0 }));
  }
  #e(t) {
    this.#t || (this.#v((e) => this.#d(e), t), t.querySelectorAll("*").forEach((e) => {
      e.shadowRoot && (this.#c(e.shadowRoot), this.#e(e.shadowRoot));
    }));
  }
  #f(t) {
    this.#t || t instanceof Element && (t.localName === "umb-property-layout" && this.#d(t), t.querySelectorAll("umb-property-layout").forEach((e) => this.#d(e)), t.shadowRoot && (this.#c(t.shadowRoot), this.#e(t.shadowRoot)), t.querySelectorAll("*").forEach((e) => {
      e.shadowRoot && (this.#c(e.shadowRoot), this.#e(e.shadowRoot));
    }));
  }
  #p(t) {
    const e = t.shadowRoot?.querySelector(l);
    return e || t.querySelector(l);
  }
  #d(t) {
    const e = this.#m(t);
    if (!e) {
      this.#p(t)?.remove();
      return;
    }
    this.#u(t);
    const i = this.#p(t) ?? (() => {
      const o = document.createElement(l);
      o.settings = this.#h;
      const n = t.shadowRoot?.getElementById("label");
      return n ? n.append(o) : (t.append(o), o.slot = "description"), o;
    })();
    i.settings = this.#h, i.description = e, this.#i.add(t);
  }
  #u(t) {
    const e = t.shadowRoot;
    if (!e || e.getElementById(m)) return;
    const i = document.createElement("style");
    i.id = m, i.textContent = `
      #label {
        display: inline-flex;
        align-items: center;
        flex-wrap: wrap;
        gap: var(--uui-size-space-2, 6px);
      }

      #description {
        display: none !important;
      }
    `, e.append(i);
  }
  #m(t) {
    const e = t.description;
    if (typeof e == "string" && e.trim())
      return e.trim();
    const i = t.shadowRoot?.getElementById("description")?.textContent?.trim();
    return i || (t.querySelector("[slot='description']")?.textContent?.trim() ?? "");
  }
  #v(t, e = document) {
    e.querySelectorAll("umb-property-layout").forEach((i) => t(i));
  }
}
let d;
async function g() {
  d?.stop();
  const p = await S();
  d = new R(p), d.start();
}
const y = () => {
  g();
}, z = (p) => {
  window.removeEventListener(v, y);
  let t = !1;
  const e = () => {
    if (t) {
      g();
      return;
    }
    t = !0, g();
  };
  p.consumeContext(x, (i) => {
    b(
      i ? async () => {
        try {
          return await i.getLatestToken();
        } catch {
          return;
        }
      } : void 0
    ), e();
  }), window.setTimeout(() => {
    t || (b(void 0), e());
  }, 250), window.addEventListener(v, y);
}, I = () => {
  b(void 0), window.removeEventListener(v, y), d?.stop(), d = void 0;
};
export {
  z as onInit,
  I as onUnload
};
//# sourceMappingURL=property-tooltip-gftmjg.js.map
