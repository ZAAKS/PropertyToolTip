# 🛈 Property ToolTip

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![NuGet](https://img.shields.io/nuget/v/PropertyToolTip)](https://www.nuget.org/packages/PropertyToolTip/)
[![Umbraco](https://img.shields.io/badge/Umbraco-Backoffice-3544b1)](https://umbraco.com/)

**Property ToolTip** is a small Umbraco backoffice package that turns document type property descriptions into neat tooltip help text beside each property label.

You already wrote the helpful description. This package just gives it a cleaner place to live.

Instead of always showing description text below the property name, **Property ToolTip** adds a compact help icon next to the label. Editors can hover or focus the icon when they need help, and ignore it when they do not.

---

## 💡 Why This Exists

Umbraco property descriptions are genuinely useful. They help explain what a field is for, what format editors should use, or what effect a value has on the website.

But when a content type has many properties, those descriptions can quickly make the editing screen feel busy. Editors end up scrolling past helper text they already know, while the actual fields get pushed further down the page.

So the idea behind **Property ToolTip** is simple:

> Keep the guidance. Clean up the editing experience.

It is not trying to reinvent the Umbraco backoffice. It just makes existing descriptions feel a little more polished and less noisy.

---

## ✨ What it does

- 🛈 **Turns property descriptions into on-demand tooltips** next to the label (hover or keyboard focus).
- 🧼 **Keeps the document type description as the source of truth** and hides the default inline rendering.
- 🎛️ **Lets you tune the UI** (icon, size, tooltip placement/alignment, font size, min/max width) from a Settings dashboard.
- 🧩 **Uses Umbraco backoffice icons** via the built-in picker (supports `icon-…` and optional `color-…`).
- 🧩 **Runs as a backoffice extension** (no Umbraco core changes).

Implementation-wise it’s a backoffice entry point that scans for `umb-property-layout` elements with a description and replaces the default description rendering with a small help trigger that opens a tooltip.

---

## 📦 Installation

You can install via **NuGet**:

```powershell
Install-Package PropertyToolTip
```

Or grab it from the [NuGet Gallery](https://www.nuget.org/packages/PropertyToolTip/).

After installation, restart your Umbraco site and open the backoffice. Property descriptions in content editing screens will appear as tooltip help text beside the property labels.

---

## 📸 Screenshot

Here is a quick look at the idea:

![Screenshot](https://raw.githubusercontent.com/ZAAKS/PropertyToolTip//screenshot/property-tooltip.png)

---

## 🎯 Where It Helps

**Property ToolTip** is especially useful when your Umbraco project has:

* 🧱 Content types with many fields.
* 💬 Descriptions that are helpful but not needed every time.
* 🔎 SEO fields with guidance for editors.
* 🖼️ Image fields with size, crop, or usage notes.
* 🔘 Toggle fields that need a short explanation.
* 📌 Editorial reminders that should stay close to the field.

It is a small change, but on large content forms it can make the backoffice feel calmer and easier to scan.

---

## ⚙️ Configuration (Settings dashboard)

You can change Property ToolTip behavior from the Umbraco backoffice:

- Go to **Settings**
- Open the **Property ToolTip** dashboard/tab

### Configuration options

| Option | What it controls |
| --- | --- |
| **Icon** | The help icon shown beside each property label. Choose from Umbraco’s built-in icon picker (with optional color). |
| **Icon size** | The size of the help trigger beside the label (in pixels). |
| **Tooltip font size** | The text size used inside the tooltip (in pixels). |
| **Tooltip max width** | Maximum tooltip width before text wraps (in pixels). |
| **Tooltip min width** | Minimum tooltip width (in pixels). |
| **Tooltip vertical placement** | Where the tooltip appears relative to the icon: **auto**, **above**, or **below**. |
| **Tooltip horizontal alignment** | How the tooltip aligns horizontally: **start**, **center**, or **end**. |

### Settings screenshot

Add a screenshot of the Settings dashboard here:

![Settings dashboard screenshot](https://raw.githubusercontent.com/ZAAKS/PropertyToolTip//screenshot/property-tooltip-setting.png)

---

## 💜 Community Love

This package exists because small editor-experience improvements can make a real difference in day-to-day Umbraco work.

If you enjoy using **Property ToolTip**:

* ⭐ **Give it a star** on GitHub.
* 📣 **Share it** with other Umbraco developers.
* 🐛 **Open an issue** if you spot something that can be improved.
* 💡 **Suggest ideas** for making content editing even nicer.

Let us keep making the Umbraco backoffice cleaner, friendlier, and easier to use.

---

## 📄 License

This project is licensed under the **MIT License**.

---

## 🙏 Acknowledgments

Built with:
- ❤️ Love for the Umbraco community
- ☕ Lots of coffee

---

**Happy editing! 🎉**

*Not every backoffice improvement needs to be huge. Sometimes moving helpful text behind a tiny info icon is enough to make editors smile.*