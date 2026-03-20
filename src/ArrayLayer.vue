<script lang="ts">
import { defineComponent, onMounted, onUnmounted, watch } from 'vue';
import { usePlot } from './composables/usePlot';

export interface ArrayLayerProps {
  data?: number[] | number[][] | ArrayBuffer;
  options?: Record<string, unknown>;
  layerOptions?: Record<string, unknown>;
}

/**
 * ArrayLayer wrapper for sigplot.layer1d and sigplot.layer2d
 *
 * For static 1D and 2D JS arrays/ArrayBuffers.
 *
 *   <SigPlot>
 *     <ArrayLayer :data="[1, 2, 3]" />
 *   </SigPlot>
 */
export default defineComponent({
  name: 'ArrayLayer',
  props: {
    data: {
      type: [Array, ArrayBuffer] as unknown as () =>
        | number[]
        | number[][]
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
      layer = plot.overlay_array(props.data, props.options, props.layerOptions);
    });

    watch(
      () => [props.data, props.options, props.layerOptions] as const,
      ([newData, newOptions, newLayerOptions]) => {
        if (layer === null) return;

        if (newData !== prevData) {
          plot.reload(layer, newData, newOptions);
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
