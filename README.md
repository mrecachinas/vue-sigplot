# vue-sigplot

Vue 3 wrapper for [SigPlot](https://github.com/LGSInnovations/SigPlot).

![Example image](example.png)

## Installation

```bash
npm install vue-sigplot sigplot
```

**Peer dependencies:** Vue 3.5+, sigplot 2.x

## Usage

```vue
<template>
  <SigPlot :height="400" :width="600">
    <ArrayLayer :data="[1, 2, 3, 4, 5]" />
  </SigPlot>
</template>

<script setup>
import { SigPlot, ArrayLayer } from 'vue-sigplot';
</script>
```

## Components

### `<SigPlot>`

Container component that creates a `sigplot.Plot` instance and provides it to child layers via Vue's `provide/inject`.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `height` | `number` | `300` | Plot height in pixels |
| `width` | `number` | `300` | Plot width in pixels |
| `display` | `string` | `'inline-block'` | CSS display property |
| `styles` | `CSSProperties` | — | Additional CSS styles |
| `options` | `object` | `{ all: true, expand: true, autol: 100, autohide_panbars: true }` | SigPlot options |

### `<ArrayLayer>`

Overlays static 1D/2D array data.

| Prop | Type | Description |
|------|------|-------------|
| `data` | `number[] \| number[][] \| ArrayBuffer` | Array data to plot |
| `options` | `object` | Data header options |
| `layerOptions` | `object` | Layer display settings |

### `<PipeLayer>`

Streaming data layer for real-time 1D or 2D raster plots.

| Prop | Type | Description |
|------|------|-------------|
| `data` | `number[] \| ArrayBuffer` | Data to push |
| `options` | `object` | Header options (e.g., `{ type: 2000, subsize: 1000 }`) |
| `layerOptions` | `object` | Layer display settings |

### `<HrefLayer>`

Loads data from a URL/file path.

| Prop | Type | Description |
|------|------|-------------|
| `href` | `string` | URL or path to data file |
| `onload` | `function` | Callback on data load |
| `options` | `object` | Layer options |

### `<BlueLayer>`

Overlays Bluefile format data.

| Prop | Type | Description |
|------|------|-------------|
| `data` | `unknown` | HCB (header container buffer) |
| `options` | `object` | Data header options |
| `layerOptions` | `object` | Layer display settings |

### `<WebsocketLayer>`

Streams data from a WebSocket.

| Prop | Type | Description |
|------|------|-------------|
| `wsurl` | `string` | WebSocket URL |
| `overrides` | `object` | Override options |
| `options` | `object` | Layer options |

### `<Plugin>`

Adds a SigPlot plugin.

| Prop | Type | Description |
|------|------|-------------|
| `plugin` | `unknown` | Plugin instance (required) |
| `pluginOptions` | `object` | Plugin options |

## Composables

### `usePlot()`

Returns the parent `Plot` instance. Must be used within a `<SigPlot>` component.

```ts
import { usePlot } from 'vue-sigplot';

const plot = usePlot();
```

## Development

```bash
npm install
npm run dev        # Dev server with hot-reload
npm run build      # Build library (ESM + UMD)
npm run test       # Run tests
npm run test:watch # Watch mode
npm run typecheck  # TypeScript checking
```

## License

Apache-2.0
