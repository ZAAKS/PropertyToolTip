import { UMB_AUTH_CONTEXT as x } from "@umbraco-cms/backoffice/auth";
import { UMB_ICON_PICKER_MODAL as T } from "@umbraco-cms/backoffice/icon";
import { UmbLitElement as S } from "@umbraco-cms/backoffice/lit-element";
import { UMB_MODAL_MANAGER_CONTEXT as z } from "@umbraco-cms/backoffice/modal";
import { UMB_NOTIFICATION_CONTEXT as $ } from "@umbraco-cms/backoffice/notification";
import { css as C, state as v, customElement as E, html as k } from "@umbraco-cms/backoffice/external/lit";
import { D as P, c as N, l as g, s as A, S as M, p as O } from "./settings-gftmjg.js";
var I = Object.defineProperty, D = Object.getOwnPropertyDescriptor, b = (t) => {
  throw TypeError(t);
}, u = (t, i, e, o) => {
  for (var a = o > 1 ? void 0 : o ? D(i, e) : i, l = t.length - 1, s; l >= 0; l--)
    (s = t[l]) && (a = (o ? s(i, e, a) : s(a)) || a);
  return o && a && I(i, e, a), a;
}, h = (t, i, e) => i.has(t) || b("Cannot " + e), c = (t, i, e) => (h(t, i, "read from private field"), e ? e.call(t) : i.get(t)), f = (t, i, e) => i.has(t) ? b("Cannot add the same private member more than once") : i instanceof WeakSet ? i.add(t) : i.set(t, e), W = (t, i, e, o) => (h(t, i, "write to private field"), i.set(t, e), e), m = (t, i, e) => (h(t, i, "access private method"), e), r, d, w, _;
let n = class extends S {
  constructor() {
    super(), f(this, d), f(this, r), this._draft = { ...P }, this._saving = !1, this._notificationReady = !1, this.consumeContext($, (t) => {
      W(this, r, t), this._notificationReady = !0;
    });
  }
  async connectedCallback() {
    super.connectedCallback();
    try {
      const t = await this.getContext(x);
      N(async () => {
        if (t)
          return await t.getLatestToken();
      });
    } catch {
    }
    this._draft = await g();
  }
  render() {
    const t = this._draft, i = this._saving || !this._notificationReady;
    return k`
      <uui-box headline="Property ToolTip" style="margin: var(--uui-size-space-4);">
       <p class="intro">
          All settings are read and written from
          <code>/wwwroot/App_Plugins/PropertyToolTip/property-tooltip.config.json</code> only.<br/>Use
          <strong>Save</strong> to write changes to that file, or edit it directly with your preferred text editor.<br/>The icon control uses the same picker as elsewhere
          in the Umbraco backoffice (including document types).
        </p>

        <div class="form-rows">
          <div class="form-row">
            <uui-label class="row-label">Icon</uui-label>
            <div class="row-control">
              <div class="icon-row">
                <div class="icon-preview" aria-hidden="true">
                  <umb-icon .name=${t.icon}></umb-icon>
                </div>
                <code class="icon-alias" title="Stored value">${t.icon}</code>
                <uui-button
                  look="secondary"
                  label="Choose icon"
                  ?disabled=${this._saving}
                  @click=${m(this, d, _)}
                >
                  Choose icon…
                </uui-button>
              </div>
            </div>
          </div>

          <div class="form-row">
            <uui-label class="row-label" for="ptt-icon-size">Icon size (px)</uui-label>
            <div class="row-control">
              <uui-input
                id="ptt-icon-size"
                type="number"
                .value=${String(t.iconSize)}
                ?disabled=${this._saving}
                @change=${(e) => {
      const o = Number(e.target.value);
      this._draft = { ...this._draft, iconSize: Number.isFinite(o) ? o : t.iconSize };
    }}
              ></uui-input>
            </div>
          </div>

          <div class="form-row">
            <uui-label class="row-label" for="ptt-fs">Tooltip font size (px)</uui-label>
            <div class="row-control">
              <uui-input
                id="ptt-fs"
                type="number"
                .value=${String(t.tooltipFontSize)}
                ?disabled=${this._saving}
                @change=${(e) => {
      const o = Number(e.target.value);
      this._draft = { ...this._draft, tooltipFontSize: Number.isFinite(o) ? o : t.tooltipFontSize };
    }}
              ></uui-input>
            </div>
          </div>

          <div class="form-row">
            <uui-label class="row-label" for="ptt-max">Tooltip max width (px)</uui-label>
            <div class="row-control">
              <uui-input
                id="ptt-max"
                type="number"
                .value=${String(t.tooltipMaxWidth)}
                ?disabled=${this._saving}
                @change=${(e) => {
      const o = Number(e.target.value);
      this._draft = { ...this._draft, tooltipMaxWidth: Number.isFinite(o) ? o : t.tooltipMaxWidth };
    }}
              ></uui-input>
            </div>
          </div>

          <div class="form-row">
            <uui-label class="row-label" for="ptt-min">Tooltip min width (px)</uui-label>
            <div class="row-control">
              <uui-input
                id="ptt-min"
                type="number"
                .value=${String(t.tooltipMinWidth)}
                ?disabled=${this._saving}
                @change=${(e) => {
      const o = Number(e.target.value);
      this._draft = { ...this._draft, tooltipMinWidth: Number.isFinite(o) ? o : t.tooltipMinWidth };
    }}
              ></uui-input>
            </div>
          </div>

          <div class="form-row">
            <uui-label class="row-label" for="ptt-place">Tooltip vertical placement</uui-label>
            <div class="row-control">
              <select
                id="ptt-place"
                class="native-select"
                .value=${t.tooltipPlacement}
                ?disabled=${this._saving}
                @change=${(e) => {
      const o = e.target.value;
      this._draft = { ...this._draft, tooltipPlacement: o };
    }}
              >
                <option value="auto">Auto (prefer below)</option>
                <option value="below">Below</option>
                <option value="above">Above</option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <uui-label class="row-label" for="ptt-align">Tooltip horizontal alignment</uui-label>
            <div class="row-control">
              <select
                id="ptt-align"
                class="native-select"
                .value=${t.tooltipHorizontalAlign}
                ?disabled=${this._saving}
                @change=${(e) => {
      const o = e.target.value;
      this._draft = { ...this._draft, tooltipHorizontalAlign: o };
    }}
              >
                <option value="start">Start</option>
                <option value="center">Center</option>
                <option value="end">End</option>
              </select>
            </div>
          </div>
        </div>

        <div class="actions">
          <uui-button
            look="primary"
            color="positive"
            label="Save"
            ?disabled=${i}
            ?busy=${this._saving}
            @click=${m(this, d, w)}
          >
            Save
          </uui-button>
        </div>
      </uui-box>
    `;
  }
};
r = /* @__PURE__ */ new WeakMap();
d = /* @__PURE__ */ new WeakSet();
w = async function() {
  if (this._saving || !c(this, r)) return;
  this._saving = !0;
  const t = c(this, r).stay("default", {
    data: {
      headline: "Saving",
      message: "Writing Property ToolTip configuration to disk…"
    }
  });
  try {
    const i = await A(this._draft);
    t?.close(), i.ok ? (this._draft = await g(), c(this, r).peek("positive", {
      data: {
        headline: "Saved",
        message: "Settings were written to property-tooltip.config.json. Reload open content tabs to apply."
      }
    }), window.dispatchEvent(new CustomEvent(M))) : c(this, r).peek("danger", {
      data: {
        headline: "Save failed",
        message: i.message
      }
    });
  } catch (i) {
    t?.close(), c(this, r).peek("danger", {
      data: {
        headline: "Save failed",
        message: i instanceof Error ? i.message : "An unexpected error occurred."
      }
    });
  } finally {
    this._saving = !1;
  }
};
_ = async function() {
  if (!this._saving)
    try {
      const t = await this.getContext(z);
      if (!t) return;
      const i = O(this._draft.icon), e = i.name || "icon-help-alt", o = i.color ?? "text", l = await t.open(this, T, {
        data: {
          hideColors: !1,
          showEmptyOption: !1,
          placeholder: "icon-help-alt"
        },
        value: {
          icon: e,
          color: o
        }
      }).onSubmit(), s = l?.icon?.trim();
      if (s) {
        const p = l?.color?.trim(), y = p && p !== "text" ? `${s} color-${p}` : s;
        this._draft = { ...this._draft, icon: y };
      }
    } catch {
    }
};
n.styles = C`
    :host {
      display: block;
    }
    .intro {
      margin-top: 0;
      margin-bottom: var(--uui-size-space-5);
    }
    .form-rows {
      display: grid;
      gap: var(--uui-size-space-5);
    }
    .form-row {
      display: grid;
      gap: var(--uui-size-space-2);
      align-items: start;
    }
    .row-label {
      font-weight: 600;
    }
    @media (min-width: 900px) {
      .form-row {
        grid-template-columns: 240px minmax(0, 1fr);
        gap: var(--uui-size-space-6);
        align-items: center;
      }
    }
    uui-input {
      width: 100%;
      max-width: 420px;
    }
    .icon-row {
      width: 100%;
      max-width: 420px;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--uui-size-space-3);
    }
    .icon-row uui-button {
      flex: 0 0 auto;
    }
    .icon-preview {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      border: 1px solid var(--uui-color-border);
      border-radius: var(--uui-border-radius);
      background: var(--uui-color-surface-alt, var(--uui-color-surface));
    }
    .icon-preview umb-icon {
      font-size: 1.5rem;
    }
    .icon-alias {
      flex: 1 1 140px;
      min-width: 0;
      padding: var(--uui-size-space-2) var(--uui-size-space-3);
      border-radius: var(--uui-border-radius);
      background: var(--uui-color-surface-alt, var(--uui-color-surface));
      border: 1px solid var(--uui-color-border);
      font-size: 0.9rem;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .native-select {
      display: block;
      width: 100%;
      max-width: 420px;
      padding: var(--uui-size-space-2);
      border-radius: var(--uui-border-radius);
      border: 1px solid var(--uui-color-border);
      background: var(--uui-color-surface);
      color: var(--uui-color-text);
    }
    .fake-i {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 22px;
      height: 22px;
      border-radius: 50%;
      background: transparent;
      border: 1px solid var(--uui-color-border, rgba(27, 38, 79, 0.22));
      color: var(--uui-color-interactive, #3544b1);
      font-size: 12px;
      font-weight: 700;
    }
    .actions {
      display: flex;
      flex-wrap: wrap;
      gap: var(--uui-size-space-3);
      margin-top: var(--uui-size-space-5);
    }
    code {
      font-size: 0.95em;
    }
  `;
u([
  v()
], n.prototype, "_draft", 2);
u([
  v()
], n.prototype, "_saving", 2);
u([
  v()
], n.prototype, "_notificationReady", 2);
n = u([
  E("property-tooltip-settings-dashboard")
], n);
const X = n;
export {
  n as PropertyTooltipSettingsDashboardElement,
  X as default
};
//# sourceMappingURL=property-tooltip-dashboard-gftmjg.js.map
