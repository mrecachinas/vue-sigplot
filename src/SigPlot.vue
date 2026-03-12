<template>
  <div ref="elementRef" :style="containerStyle">
    <slot v-if="plot" />
  </div>
</template>

<script lang="ts">
export interface SigPlotProps {
  height?: number;
  width?: number;
  display?: string;
  styles?: CSSProperties;
  options?: Record<string, unknown>;
}

const DEFAULT_OPTIONS: Record<string, unknown> = {
  all: true,
  expand: true,
  autol: 100,
  autohide_panbars: true,
};
</script>

<script setup lang="ts">
import {
  ref,
  computed,
  watch,
  onMounted,
  onUnmounted,
  provide,
  type CSSProperties,
} from 'vue';
import { Plot } from 'sigplot';
import { SIGPLOT_KEY } from './composables/usePlot';

const props = withDefaults(defineProps<SigPlotProps>(), {
  height: 300,
  width: 300,
  display: 'inline-block',
  styles: undefined,
  options: () => DEFAULT_OPTIONS,
});

const elementRef = ref<HTMLDivElement | null>(null);
const plot = ref<Plot | null>(null);

const containerStyle = computed<CSSProperties>(() => ({
  height: `${props.height}px`,
  width: `${props.width}px`,
  display: props.display,
  ...props.styles,
}));

provide(SIGPLOT_KEY, plot);

let prevHeight = props.height;
let prevWidth = props.width;
let prevOptions = props.options;

watch(
  () => [props.height, props.width, props.options] as const,
  ([newHeight, newWidth, newOptions]) => {
    if (!plot.value) return;

    if (newHeight !== prevHeight || newWidth !== prevWidth) {
      plot.value.checkresize();
    }

    if (newOptions !== prevOptions) {
      plot.value.change_settings(newOptions);
    }

    prevHeight = newHeight;
    prevWidth = newWidth;
    prevOptions = newOptions;
  },
);

onMounted(() => {
  if (elementRef.value) {
    plot.value = new Plot(elementRef.value, props.options);
  }
});

onUnmounted(() => {
  // sigplot's cleanup() is a no-op, so manually remove injected canvases
  if (elementRef.value) {
    while (elementRef.value.firstChild) {
      elementRef.value.removeChild(elementRef.value.firstChild);
    }
  }
  plot.value = null;
});
</script>
