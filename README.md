# NebulaDice Browser Edition

Static browser build of NebulaDice.

## What it includes

- React + Vite interface
- Browser-native game runtime that mirrors the NebulaDice API contract
- Quest progression, movement, interaction, combat, resonance, and local save support
- Random-seed **New** runs, fixed-seed **Demo** runs, and a reliable latest-autosave loader
- No separate Python backend required for hosted play

## Local development

```powershell
npm install
npm run dev
```

## Production build

```powershell
npm run build
npm run preview
```

## Notes

- The original Python engine still lives in the main NebulaDice repository.
- This browser edition is designed for simple static hosting such as GitHub Pages or Vercel.
