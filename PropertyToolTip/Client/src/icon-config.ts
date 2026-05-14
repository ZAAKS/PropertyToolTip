/** Default when setting is missing or badge mode is "letter". */
export const DEFAULT_UMB_ICON_NAME = "icon-help-alt";

/** Minimal typing for Lit `umb-icon` (property `name`, not only attribute). */
export type UmbIconElementLike = Element & { name: string };

/**
 * Split stored icon string (from settings / icon picker) for the icon picker modal value.
 * Picker persists non-default colors as `"<icon-alias> color-<alias>"` (e.g. `icon-help-alt color-danger`).
 */
export function parseTooltipIcon(stored: string): { name: string; color?: string } {
  const t = stored.trim();
  if (!t || t.toLowerCase() === "letter") {
    return { name: DEFAULT_UMB_ICON_NAME };
  }

  const tokens = t.split(/\s+/).filter(Boolean);
  const colorTokens = tokens.filter((x) => x.startsWith("color-"));
  const nameTokens = tokens.filter((x) => !x.startsWith("color-"));
  const name = nameTokens.join(" ").trim() || DEFAULT_UMB_ICON_NAME;

  let color: string | undefined;
  if (colorTokens.length > 0) {
    const raw = colorTokens[colorTokens.length - 1].slice("color-".length);
    if (raw && raw !== "text") {
      color = raw;
    }
  }

  return { name, color };
}

/**
 * Drive `umb-icon` via its Lit `name` property so `_icon` / `uui-icon` update reliably.
 * Pass the same string stored in settings (may include ` color-*`), matching Umbraco's icon picker.
 */
export function applyUmbIconProperties(el: Element, stored: string): void {
  const icon = el as UmbIconElementLike;
  const t = stored.trim();
  if (!t || t.toLowerCase() === "letter") {
    icon.name = DEFAULT_UMB_ICON_NAME;
    return;
  }
  icon.name = t;
}
