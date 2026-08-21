# mark-portfolio

Mein Entwickler-Portfolio. Astro, Tailwind, zweisprachig (DE/EN), deployt auf
GitHub Pages.

**→ [mark1anthony.github.io/mark-portfolio](https://mark1anthony.github.io/mark-portfolio/)**

## Entwickeln

```bash
npm ci
npm run dev      # http://localhost:4321/mark-portfolio/
npm run build    # nach dist/
npm run preview  # gebautes Ergebnis ansehen
```

## Aufbau

```
src/
├── pages/
│   ├── index.astro        # Deutsch (Standardsprache, liegt auf /)
│   ├── en/index.astro     # Englisch, auf /en/
│   └── demos/             # statische Vorschauen der verlinkten Projekte
├── components/
│   ├── Page.astro         # setzt die Seite zusammen, bekommt die Sprache
│   ├── Nav · Hero · About · Capabilities · Skills · Projects · Contact · Footer
├── data/                  # projects, skills, capabilities
├── i18n/
│   ├── de.ts · en.ts      # alle übersetzbaren Strings
│   └── ui.ts              # useTranslations(lang), Sprachliste, Pfad-Helper
├── scripts/effects.ts     # Canvas-Hintergrund, Zähler, Projektvorschauen, Tilt
├── layouts/Layout.astro   # <html lang>, Meta, hreflang, Cursor, Scroll-Reveal
└── assets/mark.jpg        # Hero-Foto, über astro:assets eingebunden
```

## Zweisprachigkeit

Beide Sprachen sind **echte Routen**, keine clientseitige Textersetzung:

- `/` rendert Deutsch, `/en/` rendert Englisch
- Das `lang`-Attribut kommt aus der aktiven Locale, dazu `hreflang`-Alternates
  und ein Canonical im `<head>`
- Der Sprachumschalter sind zwei normale Links
- Die Strings liegen in `src/i18n/de.ts` und `en.ts`; Komponenten holen sie
  über `useTranslations(lang)` zur Buildzeit

Einen String ändern: in beiden Dateien anpassen. Einen neuen hinzufügen: Key in
`en.ts` und `de.ts` ergänzen, dann `t('mein.key')` in der Komponente. Fehlt ein
Key in einer Sprache, greift die Standardsprache.

## Styling

Tailwind 3 über `postcss.config.mjs` — bewusst **ohne** `@astrojs/tailwind`:
diese Integration unterstützt nur Astro 3–5 und erzwang sonst
`npm ci --legacy-peer-deps`. Farben und Schriften stehen in
`tailwind.config.mjs`.

## Deployment

GitHub Actions baut bei jedem Push auf `main` und veröffentlicht `dist/` auf
GitHub Pages (`.github/workflows/deploy.yml`). Der `base`-Pfad
`/mark-portfolio` steht in `astro.config.mjs`.

> **Hinweis:** Das Layout setzt derzeit `<meta name="robots" content="noindex,
> nofollow">`. Solange das drinsteht, indexiert keine Suchmaschine die Seite —
> auch die hreflang-Angaben laufen dann ins Leere.
