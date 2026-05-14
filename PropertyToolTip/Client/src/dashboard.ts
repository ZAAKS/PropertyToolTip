import { UMB_AUTH_CONTEXT } from "@umbraco-cms/backoffice/auth";
import { UMB_ICON_PICKER_MODAL } from "@umbraco-cms/backoffice/icon";
import { UmbLitElement } from "@umbraco-cms/backoffice/lit-element";
import { UMB_MODAL_MANAGER_CONTEXT } from "@umbraco-cms/backoffice/modal";
import { UMB_NOTIFICATION_CONTEXT } from "@umbraco-cms/backoffice/notification";
import { css, customElement, html, state } from "@umbraco-cms/backoffice/external/lit";
import { parseTooltipIcon } from "./icon-config.js";
import {
  configurePropertyTooltipAuth,
  DEFAULT_PROPERTY_TOOLTIP_SETTINGS,
  loadPropertyTooltipSettings,
  savePropertyTooltipSettingsToServer,
  SETTINGS_CHANGED_EVENT,
  type PropertyTooltipSettings,
  type TooltipHorizontalAlign,
  type TooltipPlacement,
} from "./settings.js";

@customElement("property-tooltip-settings-dashboard")
export class PropertyTooltipSettingsDashboardElement extends UmbLitElement {
  #notification?: typeof UMB_NOTIFICATION_CONTEXT.TYPE;

  @state()
  private _draft: PropertyTooltipSettings = { ...DEFAULT_PROPERTY_TOOLTIP_SETTINGS };

  @state()
  private _saving = false;

  @state()
  private _notificationReady = false;

  constructor() {
    super();
    this.consumeContext(UMB_NOTIFICATION_CONTEXT, (context) => {
      this.#notification = context;
      this._notificationReady = true;
    });
  }

  async connectedCallback() {
    super.connectedCallback();
    try {
      const authContext = await this.getContext(UMB_AUTH_CONTEXT);
      configurePropertyTooltipAuth(async () => {
        if (!authContext) return undefined;
        return await authContext.getLatestToken();
      });
    } catch {
      /* same as ZaaksFormBuilder: token required for API; entry point may have configured already */
    }
    this._draft = await loadPropertyTooltipSettings();
  }

  async #save() {
    if (this._saving || !this.#notification) return;

    this._saving = true;
    const pending = this.#notification.stay("default", {
      data: {
        headline: "Saving",
        message: "Writing Property ToolTip configuration to disk…",
      },
    });

    try {
      const result = await savePropertyTooltipSettingsToServer(this._draft);
      pending?.close();

      if (result.ok) {
        this._draft = await loadPropertyTooltipSettings();
        this.#notification.peek("positive", {
          data: {
            headline: "Saved",
            message: "Settings were written to property-tooltip.config.json. Reload open content tabs to apply.",
          },
        });
        window.dispatchEvent(new CustomEvent(SETTINGS_CHANGED_EVENT));
      } else {
        this.#notification.peek("danger", {
          data: {
            headline: "Save failed",
            message: result.message,
          },
        });
      }
    } catch (e) {
      pending?.close();
      this.#notification.peek("danger", {
        data: {
          headline: "Save failed",
          message: e instanceof Error ? e.message : "An unexpected error occurred.",
        },
      });
    } finally {
      this._saving = false;
    }
  }

  async #openIconPicker() {
    if (this._saving) return;
    try {
      const modalManager = await this.getContext(UMB_MODAL_MANAGER_CONTEXT);
      if (!modalManager) return;

      const parsed = parseTooltipIcon(this._draft.icon);
      const preselectIcon = parsed.name || "icon-help-alt";
      const preselectColor = parsed.color ?? "text";

      const modalContext = modalManager.open(this, UMB_ICON_PICKER_MODAL, {
        data: {
          hideColors: false,
          showEmptyOption: false,
          placeholder: "icon-help-alt",
        },
        value: {
          icon: preselectIcon,
          color: preselectColor,
        },
      });
      const result = (await modalContext.onSubmit()) as { icon?: string; color?: string };
      const picked = result?.icon?.trim();
      if (picked) {
        const color = result?.color?.trim();
        const iconValue =
          color && color !== "text" ? `${picked} color-${color}` : picked;
        this._draft = { ...this._draft, icon: iconValue };
      }
    } catch {
      /* picker closed without submit */
    }
  }

  render() {
    const d = this._draft;
    const saveDisabled = this._saving || !this._notificationReady;
    return html`
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
                  <umb-icon .name=${d.icon}></umb-icon>
                </div>
                <code class="icon-alias" title="Stored value">${d.icon}</code>
                <uui-button
                  look="secondary"
                  label="Choose icon"
                  ?disabled=${this._saving}
                  @click=${this.#openIconPicker}
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
                .value=${String(d.iconSize)}
                ?disabled=${this._saving}
                @change=${(e: Event) => {
                  const n = Number((e.target as HTMLInputElement).value);
                  this._draft = { ...this._draft, iconSize: Number.isFinite(n) ? n : d.iconSize };
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
                .value=${String(d.tooltipFontSize)}
                ?disabled=${this._saving}
                @change=${(e: Event) => {
                  const n = Number((e.target as HTMLInputElement).value);
                  this._draft = { ...this._draft, tooltipFontSize: Number.isFinite(n) ? n : d.tooltipFontSize };
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
                .value=${String(d.tooltipMaxWidth)}
                ?disabled=${this._saving}
                @change=${(e: Event) => {
                  const n = Number((e.target as HTMLInputElement).value);
                  this._draft = { ...this._draft, tooltipMaxWidth: Number.isFinite(n) ? n : d.tooltipMaxWidth };
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
                .value=${String(d.tooltipMinWidth)}
                ?disabled=${this._saving}
                @change=${(e: Event) => {
                  const n = Number((e.target as HTMLInputElement).value);
                  this._draft = { ...this._draft, tooltipMinWidth: Number.isFinite(n) ? n : d.tooltipMinWidth };
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
                .value=${d.tooltipPlacement}
                ?disabled=${this._saving}
                @change=${(e: Event) => {
                  const v = (e.target as HTMLSelectElement).value as TooltipPlacement;
                  this._draft = { ...this._draft, tooltipPlacement: v };
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
                .value=${d.tooltipHorizontalAlign}
                ?disabled=${this._saving}
                @change=${(e: Event) => {
                  const v = (e.target as HTMLSelectElement).value as TooltipHorizontalAlign;
                  this._draft = { ...this._draft, tooltipHorizontalAlign: v };
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
            ?disabled=${saveDisabled}
            ?busy=${this._saving}
            @click=${this.#save}
          >
            Save
          </uui-button>
        </div>
      </uui-box>
    `;
  }

  static styles = css`
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
}

export default PropertyTooltipSettingsDashboardElement;

declare global {
  interface HTMLElementTagNameMap {
    "property-tooltip-settings-dashboard": PropertyTooltipSettingsDashboardElement;
  }
}
