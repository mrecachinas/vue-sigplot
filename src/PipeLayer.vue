<script lang="ts">
import { defineComponent, onMounted, onUnmounted, watch } from 'vue';
import { usePlot } from './composables/usePlot';

export interface PipeLayerProps {
  data?: number[] | ArrayBuffer;
  options?: Record<string, unknown>;
  layerOptions?: Record<string, unknown>;
}

/**
 * Wrapper around sigplot.Plot.overlay_pipe
 *
 * For streaming 1-D plots or 2-D raster waterfall plots.
 *
 *   <SigPlot>
 *     <PipeLayer :options="options" :data="data" />
 *   </SigPlot>
 */
export default defineComponent({
  name: 'PipeLayer',
  props: {
    data: {
      type: [Array, ArrayBuffer] as unknown as () =>
        | number[]
        | ArrayBuffer
        | undefined,
      default: undefined,
    },
    options: {
      type: Object as () => Record<string, unknown> | undefined,
      default: undefined,
    },
    layerOptions: {
      type: Object as () => Record<string, unknown> | undefined,
      default: undefined,
    },
  },
  setup(props) {
    const plot = usePlot();
    let layer: number | null = null;
    let prevData = props.data;
    let prevOptions = props.options;
    let prevLayerOptions = props.layerOptions;

    onMounted(() => {
      layer = plot.overlay_pipe(props.options, props.layerOptions);

      const data = props.data;
      if (
        data !== undefined &&
        (Array.isArray(data) ? data.length > 0 : data instanceof ArrayBuffer)
      ) {
        plot.push(layer, data);
      }
    });

    watch(
      () => [props.data, props.options, props.layerOptions] as const,
      ([newData, newOptions, newLayerOptions]) => {
        if (layer === null) return;

        if (newData && newData !== prevData) {
          plot.push(layer, newData, newOptions);
        }
        if (newOptions !== prevOptions) {
          plot.headermod(layer, newOptions);
        }
        if (newLayerOptions !== prevLayerOptions && newLayerOptions != null) {
          plot.get_layer(layer).change_settings(newLayerOptions);
        }

        prevData = newData;
        prevOptions = newOptions;
        prevLayerOptions = newLayerOptions;
      },
    );

    onUnmounted(() => {
      if (layer !== null) {
        plot.remove_layer(layer);
      }
    });

    return () => null;
  },
});
</script>
