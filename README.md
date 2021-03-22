# Startup company auto augmentation mod

## Initialization

```bash
pnpm i // install dependencies
```

## Sources

Mod feature is located in src/start.ts

To use within the game, build the sources

## Build

```bash
pnpm build
```

In development use `pnpm watch`

You'll need to make a symlink of the mod to your Startup Company mods folder (`Startup Company\resources\app\mods\auto_accept_augmentations`) with the name "auto_accept_augmentations" to the builded source in `dist` folder

`...\auto_accept_augmentations\dist` -> `Startup Company\resources\app\mods\auto_accept_augmentations`
