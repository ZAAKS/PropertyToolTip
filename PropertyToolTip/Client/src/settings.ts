export type TooltipPlacement = "below" | "above" | "auto";

export type TooltipHorizontalAlign = "start" | "center" | "end";

export interface PropertyTooltipSettings {
  icon: string;
  iconSize: number;
  tooltipFontSize: number;
  tooltipMaxWidth: number;
  tooltipMinWidth: number;
  tooltipPlacement: TooltipPlacement;
  tooltipHorizontalAlign: TooltipHorizontalAlign;
}

export const SETTINGS_CHANGED_EVENT = "propertytooltip:settings-changed";

/** Relative to the backoffice origin (reads the App_Plugins JSON file via the API). */
export const SETTINGS_API_PATH = "/umbraco/propertytooltip/api/v1.0/settings";

/** Static file fallback when the API is unavailable (same file POST writes to). */
export const SETTINGS_CONFIG_JSON_PATH = "/App_Plugins/PropertyToolTip/property-tooltip.config.json";

export const DEFAULT_PROPERTY_TOOLTIP_SETTINGS: PropertyTooltipSettings = {
  icon: "icon-help-alt",
  iconSize: 16,
  tooltipFontSize: 13,
  tooltipMaxWidth: 320,
  tooltipMinWidth: 180,
  tooltipPlacement: "auto",
  tooltipHorizontalAlign: "start",
};

/** Same pattern as ZaaksFormBuilder: backoffice APIs require a Bearer token from `UMB_AUTH_CONTEXT`. */
let getBackofficeToken: (() => Promise<string | undefined>) | undefined;

export function configurePropertyTooltipAuth(getter: (() => Promise<string | undefined>) | undefined): void {
  getBackofficeToken = getter;
}

async function buildApiHeaders(includeJsonContentType: boolean): Promise<Record<string, string>> {
  const headers: Record<string, string> = { Accept: "application/json" };
  if (includeJsonContentType) {
    headers["Content-Type"] = "application/json";
  }
  const token = await getBackofficeToken?.();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function normalizePlacement(v: unknown): TooltipPlacement {
  if (v === "below" || v === "above" || v === "auto") return v;
  return DEFAULT_PROPERTY_TOOLTIP_SETTINGS.tooltipPlacement;
}

function normalizeAlign(v: unknown): TooltipHorizontalAlign {
  if (v === "start" || v === "center" || v === "end") return v;
  return DEFAULT_PROPERTY_TOOLTIP_SETTINGS.tooltipHorizontalAlign;
}

export function sanitizeSettings(p: Partial<PropertyTooltipSettings>): PropertyTooltipSettings {
  const d = DEFAULT_PROPERTY_TOOLTIP_SETTINGS;
  return {
    icon: typeof p.icon === "string" && p.icon.trim() ? p.icon.trim() : d.icon,
    iconSize: clamp(Number(p.iconSize) || d.iconSize, 12, 48),
    tooltipFontSize: clamp(Number(p.tooltipFontSize) || d.tooltipFontSize, 10, 24),
    tooltipMaxWidth: clamp(Number(p.tooltipMaxWidth) || d.tooltipMaxWidth, 160, 560),
    tooltipMinWidth: clamp(Number(p.tooltipMinWidth) || d.tooltipMinWidth, 120, 400),
    tooltipPlacement: normalizePlacement(p.tooltipPlacement),
    tooltipHorizontalAlign: normalizeAlign(p.tooltipHorizontalAlign),
  };
}

function readPartialFromApiJson(data: Record<string, unknown>): Partial<PropertyTooltipSettings> {
  const icon = data.icon ?? data.Icon;
  const iconSize = data.iconSize ?? data.IconSize;
  const tooltipFontSize = data.tooltipFontSize ?? data.TooltipFontSize;
  const tooltipMaxWidth = data.tooltipMaxWidth ?? data.TooltipMaxWidth;
  const tooltipMinWidth = data.tooltipMinWidth ?? data.TooltipMinWidth;
  const tooltipPlacement = data.tooltipPlacement ?? data.TooltipPlacement;
  const tooltipHorizontalAlign = data.tooltipHorizontalAlign ?? data.TooltipHorizontalAlign;

  return {
    icon: typeof icon === "string" ? icon : undefined,
    iconSize: typeof iconSize === "number" ? iconSize : undefined,
    tooltipFontSize: typeof tooltipFontSize === "number" ? tooltipFontSize : undefined,
    tooltipMaxWidth: typeof tooltipMaxWidth === "number" ? tooltipMaxWidth : undefined,
    tooltipMinWidth: typeof tooltipMinWidth === "number" ? tooltipMinWidth : undefined,
    tooltipPlacement: typeof tooltipPlacement === "string" ? (tooltipPlacement as TooltipPlacement) : undefined,
    tooltipHorizontalAlign:
      typeof tooltipHorizontalAlign === "string" ? (tooltipHorizontalAlign as TooltipHorizontalAlign) : undefined,
  };
}

async function fetchConfigJson(): Promise<Partial<PropertyTooltipSettings>> {
  try {
    const res = await fetch(SETTINGS_CONFIG_JSON_PATH, {
      credentials: "omit",
      cache: "no-cache",
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return {};
    const json = (await res.json()) as Record<string, unknown>;
    return readPartialFromApiJson(json);
  } catch {
    return {};
  }
}

export async function loadPropertyTooltipSettings(): Promise<PropertyTooltipSettings> {
  let fromServer: Partial<PropertyTooltipSettings> = {};
  try {
    const res = await fetch(SETTINGS_API_PATH, {
      credentials: "same-origin",
      cache: "no-store",
      headers: await buildApiHeaders(false),
    });
    if (res.ok) {
      const json = (await res.json()) as Record<string, unknown>;
      fromServer = readPartialFromApiJson(json);
    } else {
      fromServer = await fetchConfigJson();
    }
  } catch {
    fromServer = await fetchConfigJson();
  }

  return sanitizeSettings({
    ...DEFAULT_PROPERTY_TOOLTIP_SETTINGS,
    ...fromServer,
  });
}

export type SavePropertyTooltipResult = { ok: true } | { ok: false; message: string };

export async function savePropertyTooltipSettingsToServer(settings: PropertyTooltipSettings): Promise<SavePropertyTooltipResult> {
  const body = sanitizeSettings(settings);
  try {
    const res = await fetch(SETTINGS_API_PATH, {
      method: "POST",
      credentials: "same-origin",
      headers: await buildApiHeaders(true),
      body: JSON.stringify(body),
    });
    if (res.status === 204 || res.ok) {
      return { ok: true };
    }
    const text = await res.text();
    return { ok: false, message: text || `${res.status} ${res.statusText}` };
  } catch (e) {
    return {
      ok: false,
      message: e instanceof Error ? e.message : "Network error",
    };
  }
}
