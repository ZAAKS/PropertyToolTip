const p = "icon-help-alt";
function y(t) {
  const o = t.trim();
  if (!o || o.toLowerCase() === "letter")
    return { name: p };
  const i = o.split(/\s+/).filter(Boolean), n = i.filter((e) => e.startsWith("color-")), c = i.filter((e) => !e.startsWith("color-")).join(" ").trim() || p;
  let r;
  if (n.length > 0) {
    const e = n[n.length - 1].slice(6);
    e && e !== "text" && (r = e);
  }
  return { name: c, color: r };
}
function A(t, o) {
  const i = t, n = o.trim();
  if (!n || n.toLowerCase() === "letter") {
    i.name = p;
    return;
  }
  i.name = n;
}
const P = "propertytooltip:settings-changed", f = "/umbraco/propertytooltip/api/v1.0/settings", S = "/App_Plugins/PropertyToolTip/property-tooltip.config.json", s = {
  icon: "icon-help-alt",
  iconSize: 16,
  tooltipFontSize: 13,
  tooltipMaxWidth: 320,
  tooltipMinWidth: 180,
  tooltipPlacement: "auto",
  tooltipHorizontalAlign: "start"
};
let m;
function M(t) {
  m = t;
}
async function h(t) {
  const o = { Accept: "application/json" };
  t && (o["Content-Type"] = "application/json");
  const i = await m?.();
  return i && (o.Authorization = `Bearer ${i}`), o;
}
function l(t, o, i) {
  return Math.min(i, Math.max(o, t));
}
function z(t) {
  return t === "below" || t === "above" || t === "auto" ? t : s.tooltipPlacement;
}
function d(t) {
  return t === "start" || t === "center" || t === "end" ? t : s.tooltipHorizontalAlign;
}
function T(t) {
  const o = s;
  return {
    icon: typeof t.icon == "string" && t.icon.trim() ? t.icon.trim() : o.icon,
    iconSize: l(Number(t.iconSize) || o.iconSize, 12, 48),
    tooltipFontSize: l(Number(t.tooltipFontSize) || o.tooltipFontSize, 10, 24),
    tooltipMaxWidth: l(Number(t.tooltipMaxWidth) || o.tooltipMaxWidth, 160, 560),
    tooltipMinWidth: l(Number(t.tooltipMinWidth) || o.tooltipMinWidth, 120, 400),
    tooltipPlacement: z(t.tooltipPlacement),
    tooltipHorizontalAlign: d(t.tooltipHorizontalAlign)
  };
}
function g(t) {
  const o = t.icon ?? t.Icon, i = t.iconSize ?? t.IconSize, n = t.tooltipFontSize ?? t.TooltipFontSize, a = t.tooltipMaxWidth ?? t.TooltipMaxWidth, c = t.tooltipMinWidth ?? t.TooltipMinWidth, r = t.tooltipPlacement ?? t.TooltipPlacement, e = t.tooltipHorizontalAlign ?? t.TooltipHorizontalAlign;
  return {
    icon: typeof o == "string" ? o : void 0,
    iconSize: typeof i == "number" ? i : void 0,
    tooltipFontSize: typeof n == "number" ? n : void 0,
    tooltipMaxWidth: typeof a == "number" ? a : void 0,
    tooltipMinWidth: typeof c == "number" ? c : void 0,
    tooltipPlacement: typeof r == "string" ? r : void 0,
    tooltipHorizontalAlign: typeof e == "string" ? e : void 0
  };
}
async function u() {
  try {
    const t = await fetch(S, {
      credentials: "omit",
      cache: "no-cache",
      headers: { Accept: "application/json" }
    });
    if (!t.ok) return {};
    const o = await t.json();
    return g(o);
  } catch {
    return {};
  }
}
async function W() {
  let t = {};
  try {
    const o = await fetch(f, {
      credentials: "same-origin",
      cache: "no-store",
      headers: await h(!1)
    });
    if (o.ok) {
      const i = await o.json();
      t = g(i);
    } else
      t = await u();
  } catch {
    t = await u();
  }
  return T({
    ...s,
    ...t
  });
}
async function w(t) {
  const o = T(t);
  try {
    const i = await fetch(f, {
      method: "POST",
      credentials: "same-origin",
      headers: await h(!0),
      body: JSON.stringify(o)
    });
    return i.status === 204 || i.ok ? { ok: !0 } : { ok: !1, message: await i.text() || `${i.status} ${i.statusText}` };
  } catch (i) {
    return {
      ok: !1,
      message: i instanceof Error ? i.message : "Network error"
    };
  }
}
export {
  s as D,
  P as S,
  A as a,
  M as c,
  W as l,
  y as p,
  w as s
};
//# sourceMappingURL=settings-gftmjg.js.map
