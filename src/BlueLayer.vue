<script lang="ts">
import { defineComponent, onMounted, onUnmounted, watch } from 'vue';
import { usePlot } from './composables/usePlot';

export interface BlueLayerProps {
  data?: unknown;
  options?: Record<string, unknown>;
  layerOptions?: Record<string, unknown>;
}

/**
 * BlueLayer wrapper for sigplot Bluefile format
 *
 *   <SigPlot>
 *     <BlueLayer :data="hcb" />
 *   </SigPlot>
 */
export default defineComponent({
  name: 'BlueLayer',
  props: {
    data: {
      type: undefined as unknown as () => unknown,
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
      layer = plot.overlay_bluefile(props.data, props.layerOptions);
    });

    watch(
      () => [props.data, props.options, props.layerOptions] as const,
      ([newData, newOptions, newLayerOptions]) => {
        if (layer === null) return;

        if (newData !== prevData) {
          plot.reload(layer, newData as number[], newOptions);
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
