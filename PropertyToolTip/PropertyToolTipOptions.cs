namespace PropertyToolTip;

/// <summary>
/// Property ToolTip configuration model. Values are read from
/// <see cref="Constants.SettingsFileName"/> under the App_Plugins folder (see also
/// <see cref="Constants.LegacySettingsFileName"/>). Saving from the backoffice dashboard writes that JSON file.
/// </summary>
public class PropertyToolTipOptions
{
    /// <summary>
    /// Umbraco backoffice icon name (e.g. icon-help-alt). Use "letter" for the built-in "i" badge.
    /// </summary>
    public string Icon { get; set; } = "icon-help-alt";

    public int IconSize { get; set; } = 16;

    public int TooltipFontSize { get; set; } = 13;

    public int TooltipMaxWidth { get; set; } = 320;

    public int TooltipMinWidth { get; set; } = 180;

    /// <summary>below, above, or auto (flip when needed).</summary>
    public string TooltipPlacement { get; set; } = "auto";

    /// <summary>start, center, or end (relative to the trigger).</summary>
    public string TooltipHorizontalAlign { get; set; } = "start";
}
