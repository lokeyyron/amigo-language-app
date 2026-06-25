# Amigo Asset Placement

Export Figma assets into these folders so the app can use them later.

## Brand

Put logo and mascot files here:

```txt
public/assets/brand/amigo-logo.png
public/assets/brand/amigo-mascot.png
```

Transparent PNG is easiest for the current prototype. SVG is also okay.

## Fonts

If your team has permission to use the Figma fonts, export or add web font files here with these exact names:

```txt
public/assets/fonts/Talina DEMO.woff2
public/assets/fonts/AirbnbCereal_W_Bd.woff2
```

The app already checks these paths. If they are missing, it falls back to system fonts.

## Icons

Put exported language/category icons here:

```txt
public/assets/icons/fire.png
public/assets/icons/leaf.png
public/assets/icons/wave.png
public/assets/icons/mountain.png
public/assets/icons/anchor.png
public/assets/icons/clover.png
public/assets/icons/city.png
```

The bottom navigation uses PNG image files:

```txt
public/assets/icons/nav-home.png
public/assets/icons/nav-translate.png
public/assets/icons/nav-progress.png
public/assets/icons/nav-profile.png
```

The profile page also checks for these optional top-right icon files. If they are missing, the app shows a simple CSS fallback icon:

```txt
public/assets/icons/alert.png
public/assets/icons/settings.png
```

## Language Icons

Put the small icons used on the language cards here:

```txt
public/assets/language-icons/bisaya.png
public/assets/language-icons/maguindanaon.png
public/assets/language-icons/maranao.png
public/assets/language-icons/tausug.png
public/assets/language-icons/dabawenyo.png
public/assets/language-icons/chavacano.png
```

## UI Decorations

Put extra Figma decorations here, such as the faint script background used inside the Bisaya lesson card:

```txt
public/assets/ui/bisaya-script.png
public/assets/ui/card-bubbles.png
public/assets/ui/play-button.png
```

## Badges

Put profile/progress badge icons here:

```txt
public/assets/badges/fire.png
public/assets/badges/wave.png
public/assets/badges/mountain.png
public/assets/badges/leaf.png
```

## Audio

Put recorded Bisaya lesson audio here:

```txt
public/audio/bisaya/maayong-buntag.mp3
public/audio/bisaya/kumusta-ka.mp3
public/audio/bisaya/taga-asa-ka.mp3
```

Short `.mp3` files are best for the web demo.
