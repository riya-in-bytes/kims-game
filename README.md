# Kim's Game

A memory and observation game for Android, built with Expo (React Native + TypeScript).

## Modes

| Mode | What you do |
| --- | --- |
| **Total Recall** | Study the tray, then pick out every object you saw from a larger set. |
| **What's Missing?** | Objects are removed while the tray is covered. Pick the ones that have gone. |
| **What Changed?** | Objects are swapped for new ones. Tap the impostors on the tray. |

Every mode has endless levels: more objects, less study time, more targets. Three
imperfect rounds end the game. Best score, best level and games played are saved
per mode on the device.

## Project layout

```
src/
  app/              Expo Router screens (index = home, play/[mode] = game)
  components/       UI building blocks (tiles, grid, buttons, HUD, countdown)
  game/
    types.ts        Core types: GameItem, ItemPack, ModeDefinition, Round
    engine.ts       Game state machine (useGame hook + pure reducer)
    scoring.ts      Points and lives
    random.ts       Shuffle / sample helpers (RNG is injectable for tests)
    items/          Item packs. Phase 1 ships an emoji pack.
    modes/          One file per mode; register new modes in modes/index.ts
  storage/          AsyncStorage persistence
  theme/tokens.ts   Colours, spacing, radii, type scale
```

### Extending

- **New item pack:** add a file in `src/game/items/` exporting an `ItemPack`
  and register it in `items/index.ts`. Items with `kind: 'image'` render
  through `ItemVisual` — add new `kind`s there.
- **New mode:** implement `ModeDefinition` (level curve + round builder) and add
  it to `MODES` in `modes/index.ts`. The engine and play screen are mode-agnostic.

## Development

Requires Node 22 (`nvm use` picks it up from `.nvmrc`) and Java 21 plus the
Android SDK for native builds.

```bash
npm install
npx expo start            # dev server (scan QR in Expo Go, or press a for Android)
npx tsc --noEmit          # typecheck
npx expo lint             # lint
```

## Building for your phone

```bash
export ANDROID_HOME=/opt/homebrew/share/android-commandlinetools
export JAVA_HOME=/opt/homebrew/opt/openjdk@21

npx expo run:android --variant release   # builds, installs on a connected device
```

The unsigned release APK lands in `android/app/build/outputs/apk/release/`.
For the Play Store, use `npx eas-cli@latest build --platform android`, which
handles signing and produces an AAB.
