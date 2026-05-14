namespace PropertyToolTip
{
    public class Constants
    {
        public const string ApiName = "propertytooltip";

        /// <summary>Editable settings JSON under <c>wwwroot/App_Plugins/PropertyToolTip/</c>.</summary>
        public const string SettingsFileName = "property-tooltip.config.json";

        /// <summary>Previous file name; still read if present so upgrades keep working.</summary>
        public const string LegacySettingsFileName = "property-tooltip.defaults.json";
    }
}
