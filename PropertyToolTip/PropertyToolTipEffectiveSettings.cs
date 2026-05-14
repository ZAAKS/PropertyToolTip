using System.Text.Json;
using Microsoft.AspNetCore.Hosting;

namespace PropertyToolTip;

/// <summary>
/// Loads and persists Property ToolTip settings from
/// <see cref="Constants.SettingsFileName"/> under the App_Plugins folder, with optional
/// legacy read from <see cref="Constants.LegacySettingsFileName"/>.
/// </summary>
public static class PropertyToolTipEffectiveSettings
{
    private static readonly JsonSerializerOptions ReadJsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        ReadCommentHandling = JsonCommentHandling.Skip,
        AllowTrailingCommas = true,
        PropertyNameCaseInsensitive = true,
    };

    private static readonly JsonSerializerOptions WriteJsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        WriteIndented = true,
    };

    public static PropertyToolTipOptions Resolve(IWebHostEnvironment webHostEnvironment)
    {
        var result = new PropertyToolTipOptions();

        var webRoot = webHostEnvironment.WebRootPath;
        if (!string.IsNullOrEmpty(webRoot))
        {
            var fromFile = TryReadFromPath(Path.Combine(webRoot, "App_Plugins", "PropertyToolTip", Constants.SettingsFileName))
                ?? TryReadFromPath(Path.Combine(webRoot, "App_Plugins", "PropertyToolTip", Constants.LegacySettingsFileName));
            if (fromFile is not null)
            {
                result = fromFile;
            }
        }

        return result;
    }

    private static PropertyToolTipOptions? TryReadFromPath(string path)
    {
        if (!File.Exists(path))
        {
            return null;
        }

        try
        {
            var json = File.ReadAllText(path);
            return JsonSerializer.Deserialize<PropertyToolTipOptions>(json, ReadJsonOptions);
        }
        catch
        {
            return null;
        }
    }

    public static void Clamp(PropertyToolTipOptions o)
    {
        o.Icon = string.IsNullOrWhiteSpace(o.Icon) ? "icon-help-alt" : o.Icon.Trim();

        var iconSize = o.IconSize == 0 ? 16 : o.IconSize;
        o.IconSize = Math.Clamp(iconSize, 12, 48);

        var tooltipFontSize = o.TooltipFontSize == 0 ? 13 : o.TooltipFontSize;
        o.TooltipFontSize = Math.Clamp(tooltipFontSize, 10, 24);

        var tooltipMaxWidth = o.TooltipMaxWidth == 0 ? 320 : o.TooltipMaxWidth;
        o.TooltipMaxWidth = Math.Clamp(tooltipMaxWidth, 160, 560);

        var tooltipMinWidth = o.TooltipMinWidth == 0 ? 180 : o.TooltipMinWidth;
        o.TooltipMinWidth = Math.Clamp(tooltipMinWidth, 120, 400);

        o.TooltipPlacement = o.TooltipPlacement?.ToLowerInvariant() switch
        {
            "below" or "above" or "auto" => o.TooltipPlacement!.ToLowerInvariant(),
            _ => "auto",
        };

        o.TooltipHorizontalAlign = o.TooltipHorizontalAlign?.ToLowerInvariant() switch
        {
            "start" or "center" or "end" => o.TooltipHorizontalAlign!.ToLowerInvariant(),
            _ => "start",
        };
    }

    public static async Task SaveAsync(
        IWebHostEnvironment webHostEnvironment,
        PropertyToolTipOptions options,
        CancellationToken cancellationToken = default)
    {
        var webRoot = webHostEnvironment.WebRootPath
            ?? throw new InvalidOperationException("Web root is not configured; cannot save Property ToolTip settings.");

        var dir = Path.Combine(webRoot, "App_Plugins", "PropertyToolTip");
        Directory.CreateDirectory(dir);

        var path = Path.Combine(dir, Constants.SettingsFileName);
        var json = JsonSerializer.Serialize(options, WriteJsonOptions);
        await File.WriteAllTextAsync(path, json, cancellationToken);
    }
}
