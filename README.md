# Sienna

## EmulatorJS auto-start behavior

All EmulatorJS-based games now auto-start without showing the built-in Start button. This is configured centrally by defaulting `startOnLoad` to `true` in `static/apps/emulatorjs/data/loader.js`.

- To keep the Start button for a specific game, set `EJS_startOnLoaded = false;` in that page before including `loader.js`.
- Example per-game override:

```html
<script>
  EJS_player = '#game';
  EJS_core = 'gba';
  EJS_gameUrl = 'game.gba';
  EJS_pathtodata = '/static/apps/emulatorjs/data';
  EJS_startOnLoaded = false; // keep Start button for this game
</script>
<script src='/static/apps/emulatorjs/data/loader.js'></script>
```

Note: On some browsers, audio may remain muted until the first user interaction even when auto-starting. This is due to browser autoplay policies.
