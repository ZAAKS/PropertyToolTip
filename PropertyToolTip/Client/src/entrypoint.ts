import { UMB_AUTH_CONTEXT } from "@umbraco-cms/backoffice/auth";
import type { UmbEntryPointOnInit, UmbEntryPointOnUnload } from "@umbraco-cms/backoffice/extension-api";
import { applyUmbIconProperties } from "./icon-config.js";
import {
  configurePropertyTooltipAuth,
  DEFAULT_PROPERTY_TOOLTIP_SETTINGS,
  loadPropertyTooltipSettings,
  SETTINGS_CHANGED_EVENT,
  type PropertyTooltipSettings,
} from "./settings.js";

/** Extension host exposes the same context API as Lit elements (see ZaaksFormBuilder / OpenAPI client skill). */
type UmbEntryHost = {
  consumeContext: <T>(token: unknown, callback: (instance: T) => void) => void;
};

const HELP_ICON_ELEMENT_NAME = "property-tooltip-help-icon";
const HIDE_DESCRIPTION_STYLE_ID = "property-tooltip-description-style";
const ICON_SLOT_NAME = "ptt-icon";
const TOOLTIP_OFFSET = 8;

class PropertyTooltipHelpIconElement extends HTMLElement {
  static #nextId = 0;

  #description = "";
  #settings: PropertyTooltipSettings = DEFAULT_PROPERTY_TOOLTIP_SETTINGS;
  #tooltip?: HTMLSpanElement;
  #tooltipId = `property-tooltip-help-text-${PropertyTooltipHelpIconElement.#nextId++}`;
  #button?: HTMLButtonElement;

  set description(value: string) {
    this.#description = value;
    this.#updateTooltipContent();
    if (this.isConnected) this.#render();
  }

  get description() {
    return this.#description;
  }

  set settings(value: PropertyTooltipSettings) {
    this.#settings = value;
    if (this.isConnected) this.#render();
  }

  get settings() {
    return this.#settings;
  }

  connectedCallback() {
    this.addEventListener("pointerenter", this.#showTooltip);
    this.addEventListener("focusin", this.#showTooltip);
    this.addEventListener("pointerleave", this.#hideTooltip);
    this.addEventListener("focusout", this.#hideTooltip);
    this.#render();
  }

  disconnectedCallback() {
    this.removeEventListener("pointerenter", this.#showTooltip);
    this.removeEventListener("focusin", this.#showTooltip);
    this.removeEventListener("pointerleave", this.#hideTooltip);
    this.removeEventListener("focusout", this.#hideTooltip);
    this.#hideTooltip();
    this.querySelector(`:scope > umb-icon[slot="${ICON_SLOT_NAME}"]`)?.remove();
  }

  #render() {
    if (!this.isConnected) return;

    this.querySelector(`:scope > umb-icon[slot="${ICON_SLOT_NAME}"]`)?.remove();

    const root = this.shadowRoot ?? this.attachShadow({ mode: "open" });
    root.replaceChildren();

    const size = this.#settings.iconSize;
    const style = document.createElement("style");
    style.textContent = `
      :host {
        --ptt-icon-size: ${size}px;
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
        font-size: ${Math.max(9, Math.round(size * 0.58))}px;
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

    const button = document.createElement("button");
    button.type = "button";
    const useLetter = this.#settings.icon.toLowerCase() === "letter";
    if (useLetter) {
      button.textContent = "i";
      button.dataset.kind = "letter";
    } else {
      button.dataset.kind = "icon";
      const slotEl = document.createElement("slot");
      slotEl.name = ICON_SLOT_NAME;
      button.append(slotEl);
      const umbIcon = document.createElement("umb-icon");
      umbIcon.slot = ICON_SLOT_NAME;
      this.append(umbIcon);
      applyUmbIconProperties(umbIcon, this.#settings.icon);
    }

    button.setAttribute("aria-label", this.#description);
    button.setAttribute("aria-describedby", this.#tooltipId);
    button.addEventListener("mouseenter", this.#showTooltip);
    button.addEventListener("pointerenter", this.#showTooltip);
    button.addEventListener("focus", this.#showTooltip);
    button.addEventListener("mouseleave", this.#hideTooltip);
    button.addEventListener("pointerleave", this.#hideTooltip);
    button.addEventListener("blur", this.#hideTooltip);

    this.#button = button;
    root.append(style, button);
  }

  #showTooltip = () => {
    if (!this.#description || !this.#button) return;

    this.#tooltip ??= this.#createTooltip();
    this.#applyTooltipChrome();
    this.#updateTooltipContent();

    if (!this.#tooltip.isConnected) {
      document.body.append(this.#tooltip);
    }

    this.#showTooltipPopover();
    this.#positionTooltip();
    window.addEventListener("resize", this.#positionTooltip);
    document.addEventListener("scroll", this.#positionTooltip, true);
  };

  #hideTooltip = () => {
    this.#hideTooltipPopover();
    this.#tooltip?.remove();
    window.removeEventListener("resize", this.#positionTooltip);
    document.removeEventListener("scroll", this.#positionTooltip, true);
  };

  #applyTooltipChrome() {
    if (!this.#tooltip) return;
    const s = this.#settings;
    this.#tooltip.style.fontSize = `${s.tooltipFontSize}px`;
    this.#tooltip.style.maxWidth = `min(${s.tooltipMaxWidth}px, calc(100vw - 48px))`;
    this.#tooltip.style.minWidth = `${s.tooltipMinWidth}px`;
  }

  #positionTooltip = () => {
    if (!this.#tooltip || !this.#button) return;

    const buttonRect = this.#button.getBoundingClientRect();
    const tooltipRect = this.#tooltip.getBoundingClientRect();
    const viewportWidth = document.documentElement.clientWidth;
    const viewportHeight = document.documentElement.clientHeight;
    const placement = this.#settings.tooltipPlacement;
    const align = this.#settings.tooltipHorizontalAlign;

    const fitsBelow = buttonRect.bottom + TOOLTIP_OFFSET + tooltipRect.height <= viewportHeight - TOOLTIP_OFFSET;
    const fitsAbove = buttonRect.top - TOOLTIP_OFFSET - tooltipRect.height >= TOOLTIP_OFFSET;

    let top: number;
    if (placement === "below") {
      top = buttonRect.bottom + TOOLTIP_OFFSET;
    } else if (placement === "above") {
      top = buttonRect.top - tooltipRect.height - TOOLTIP_OFFSET;
    } else {
      if (fitsBelow) top = buttonRect.bottom + TOOLTIP_OFFSET;
      else if (fitsAbove) top = buttonRect.top - tooltipRect.height - TOOLTIP_OFFSET;
      else top = buttonRect.bottom + TOOLTIP_OFFSET;
    }

    let left: number;
    const w = tooltipRect.width;
    if (align === "center") {
      left = buttonRect.left + buttonRect.width / 2 - w / 2;
    } else if (align === "end") {
      left = buttonRect.right - w;
    } else {
      left = buttonRect.left;
    }

    left = Math.min(Math.max(TOOLTIP_OFFSET, left), viewportWidth - w - TOOLTIP_OFFSET);
    top = Math.min(Math.max(TOOLTIP_OFFSET, top), viewportHeight - tooltipRect.height - TOOLTIP_OFFSET);

    this.#tooltip.style.left = `${left}px`;
    this.#tooltip.style.top = `${top}px`;
  };

  #createTooltip() {
    const tooltip = document.createElement("span");
    tooltip.id = this.#tooltipId;
    tooltip.role = "tooltip";
    tooltip.setAttribute("popover", "manual");
    tooltip.style.background = "var(--uui-color-surface, #fff)";
    tooltip.style.border = "1px solid var(--uui-color-border, #d8d7d9)";
    tooltip.style.borderRadius = "var(--uui-border-radius, 3px)";
    tooltip.style.boxShadow = "var(--uui-shadow-depth-3, 0 6px 18px rgba(0, 0, 0, 0.18))";
    tooltip.style.color = "var(--uui-color-text, #1b264f)";
    tooltip.style.fontWeight = "400";
    tooltip.style.lineHeight = "1.45";
    tooltip.style.padding = "var(--uui-size-space-3, 12px)";
    tooltip.style.position = "fixed";
    tooltip.style.inset = "auto";
    tooltip.style.margin = "0";
    tooltip.style.overflow = "visible";
    tooltip.style.whiteSpace = "normal";
    tooltip.style.zIndex = "2147483647";
    return tooltip;
  }

  #showTooltipPopover() {
    if (!this.#tooltip) return;

    try {
      (this.#tooltip as HTMLElement & { showPopover?: () => void }).showPopover?.();
    } catch {
      // The tooltip can already be open when hover and focus overlap.
    }
  }

  #hideTooltipPopover() {
    if (!this.#tooltip) return;

    try {
      (this.#tooltip as HTMLElement & { hidePopover?: () => void }).hidePopover?.();
    } catch {
      // Ignore if the browser already closed it.
    }
  }

  #updateTooltipContent() {
    if (this.#button) {
      this.#button.setAttribute("aria-label", this.#description);
    }

    if (this.#tooltip) {
      this.#tooltip.textContent = this.#description;
    }
  }
}

class PropertyTooltipController {
  #observer?: MutationObserver;
  #processedLayouts = new Set<HTMLElement>();
  #observedRoots = new WeakSet<Node>();
  #disposed = false;
  #nativeAttachShadow?: Element["attachShadow"];
  #patchedAttachShadow?: Element["attachShadow"];
  #settings: PropertyTooltipSettings;

  constructor(settings: PropertyTooltipSettings) {
    this.#settings = settings;
  }

  start() {
    this.#disposed = false;

    if (!customElements.get(HELP_ICON_ELEMENT_NAME)) {
      customElements.define(HELP_ICON_ELEMENT_NAME, PropertyTooltipHelpIconElement);
    }

    this.#patchAttachShadow();
    this.#observeRoot(document);
    this.#scanRoot(document);

    void customElements.whenDefined("umb-property-layout").then(() => {
      if (!this.#disposed) {
        this.#scanRoot(document);
      }
    });
  }

  stop() {
    this.#disposed = true;
    this.#observer?.disconnect();
    this.#observer = undefined;
    this.#restoreAttachShadow();

    this.#processedLayouts.forEach((layout) => {
      this.#findHelpIcon(layout)?.remove();
      layout.shadowRoot?.getElementById(HIDE_DESCRIPTION_STYLE_ID)?.remove();
    });
    this.#processedLayouts.clear();
  }

  #patchAttachShadow() {
    if (this.#nativeAttachShadow) return;

    const controller = this;
    const nativeAttachShadow = Element.prototype.attachShadow;
    const patchedAttachShadow: Element["attachShadow"] = function (this: Element, init: ShadowRootInit) {
      const root = nativeAttachShadow.call(this, init);

      queueMicrotask(() => {
        if (!controller.#disposed) {
          controller.#observeRoot(root);
          controller.#scanRoot(root);
        }
      });

      return root;
    };

    this.#nativeAttachShadow = nativeAttachShadow;
    this.#patchedAttachShadow = patchedAttachShadow;
    Element.prototype.attachShadow = patchedAttachShadow;
  }

  #restoreAttachShadow() {
    if (this.#nativeAttachShadow && Element.prototype.attachShadow === this.#patchedAttachShadow) {
      Element.prototype.attachShadow = this.#nativeAttachShadow;
    }

    this.#nativeAttachShadow = undefined;
    this.#patchedAttachShadow = undefined;
  }

  #observeRoot(root: Document | ShadowRoot) {
    if (this.#disposed) return;
    if (this.#observedRoots.has(root)) return;

    this.#observedRoots.add(root);
    this.#observer ??= new MutationObserver((mutations) => {
      if (this.#disposed) return;

      for (const mutation of mutations) {
        const root = mutation.target.getRootNode();
        if (root instanceof ShadowRoot && root.host.localName === "umb-property-layout") {
          this.#enhanceLayout(root.host as HTMLElement);
        }

        for (const node of mutation.addedNodes) {
          this.#scanNode(node);
        }
      }
    });

    this.#observer.observe(root, { attributes: true, characterData: true, childList: true, subtree: true });
  }

  #scanRoot(root: Document | ShadowRoot) {
    if (this.#disposed) return;

    this.#forEachLayout((layout) => this.#enhanceLayout(layout), root);

    root.querySelectorAll("*").forEach((element) => {
      if (element.shadowRoot) {
        this.#observeRoot(element.shadowRoot);
        this.#scanRoot(element.shadowRoot);
      }
    });
  }

  #scanNode(node: Node) {
    if (this.#disposed) return;
    if (!(node instanceof Element)) return;

    if (node.localName === "umb-property-layout") {
      this.#enhanceLayout(node as HTMLElement);
    }

    node.querySelectorAll("umb-property-layout").forEach((layout) => this.#enhanceLayout(layout as HTMLElement));

    if (node.shadowRoot) {
      this.#observeRoot(node.shadowRoot);
      this.#scanRoot(node.shadowRoot);
    }

    node.querySelectorAll("*").forEach((element) => {
      if (element.shadowRoot) {
        this.#observeRoot(element.shadowRoot);
        this.#scanRoot(element.shadowRoot);
      }
    });
  }

  #findHelpIcon(layout: HTMLElement): PropertyTooltipHelpIconElement | null {
    const fromShadow = layout.shadowRoot?.querySelector(HELP_ICON_ELEMENT_NAME);
    if (fromShadow) return fromShadow as PropertyTooltipHelpIconElement;
    return layout.querySelector(HELP_ICON_ELEMENT_NAME) as PropertyTooltipHelpIconElement | null;
  }

  #enhanceLayout(layout: HTMLElement) {
    const description = this.#getDescription(layout);

    if (!description) {
      this.#findHelpIcon(layout)?.remove();
      return;
    }

    this.#hideDefaultDescription(layout);

    const icon =
      this.#findHelpIcon(layout) ??
      (() => {
        const el = document.createElement(HELP_ICON_ELEMENT_NAME) as PropertyTooltipHelpIconElement;
        el.settings = this.#settings;
        const label = layout.shadowRoot?.getElementById("label");
        if (label) {
          label.append(el);
        } else {
          layout.append(el);
          el.slot = "description";
        }
        return el;
      })();

    icon.settings = this.#settings;
    icon.description = description;
    this.#processedLayouts.add(layout);
  }

  #hideDefaultDescription(layout: HTMLElement) {
    const root = layout.shadowRoot;
    if (!root || root.getElementById(HIDE_DESCRIPTION_STYLE_ID)) return;

    const style = document.createElement("style");
    style.id = HIDE_DESCRIPTION_STYLE_ID;
    style.textContent = `
      #label {
        display: inline-flex;
        align-items: center;
        flex-wrap: wrap;
        gap: var(--uui-size-space-2, 6px);
      }

      #description {
        display: none !important;
      }
    `;
    root.append(style);
  }

  #getDescription(layout: HTMLElement) {
    const value = (layout as HTMLElement & { description?: string }).description;
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }

    const renderedDescription = layout.shadowRoot?.getElementById("description")?.textContent?.trim();
    if (renderedDescription) {
      return renderedDescription;
    }

    const slottedDescription = layout.querySelector<HTMLElement>("[slot='description']")?.textContent?.trim();
    return slottedDescription ?? "";
  }

  #forEachLayout(callback: (layout: HTMLElement) => void, root: Document | ShadowRoot = document) {
    root.querySelectorAll("umb-property-layout").forEach((layout) => callback(layout as HTMLElement));
  }
}

let propertyTooltipController: PropertyTooltipController | undefined;

async function restartPropertyTooltipFromSettings() {
  propertyTooltipController?.stop();
  const settings = await loadPropertyTooltipSettings();
  propertyTooltipController = new PropertyTooltipController(settings);
  propertyTooltipController.start();
}

const onSettingsChanged = () => {
  void restartPropertyTooltipFromSettings();
};

export const onInit: UmbEntryPointOnInit = (host) => {
  window.removeEventListener(SETTINGS_CHANGED_EVENT, onSettingsChanged);

  let bootstrapped = false;
  const bootstrap = () => {
    if (bootstrapped) {
      void restartPropertyTooltipFromSettings();
      return;
    }
    bootstrapped = true;
    void restartPropertyTooltipFromSettings();
  };

  (host as UmbEntryHost).consumeContext(UMB_AUTH_CONTEXT, (authContext: { getLatestToken: () => Promise<string> } | undefined) => {
    configurePropertyTooltipAuth(
      authContext
        ? async () => {
            try {
              return await authContext.getLatestToken();
            } catch {
              return undefined;
            }
          }
        : undefined,
    );
    bootstrap();
  });

  window.setTimeout(() => {
    if (!bootstrapped) {
      configurePropertyTooltipAuth(undefined);
      bootstrap();
    }
  }, 250);

  window.addEventListener(SETTINGS_CHANGED_EVENT, onSettingsChanged);
};

export const onUnload: UmbEntryPointOnUnload = () => {
  configurePropertyTooltipAuth(undefined);
  window.removeEventListener(SETTINGS_CHANGED_EVENT, onSettingsChanged);
  propertyTooltipController?.stop();
  propertyTooltipController = undefined;
};
