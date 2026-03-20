<script lang="ts">
import { defineComponent, onMounted, onUnmounted, watch } from 'vue';
import { usePlot } from './composables/usePlot';

export interface WebsocketLayerProps {
  wsurl?: string;
  overrides?: Record<string, unknown>;
  options?: Record<string, unknown>;
}

/**
 * Wrapper around sigplot.Plot.overlay_websocket
 *
 *   <SigPlot>
 *     <WebsocketLayer wsurl="ws://localhost:8080" />
 *   </SigPlot>
 */
export default defineComponent({
  name: 'WebsocketLayer',
  props: {
    wsurl: {
      type: String,
      default: '',
    },
    overrides: {
      type: Object as () => Record<string, unknown> | undefined,
      default: undefined,
    },
    options: {
      type: Object as () => Record<string, unknown> | undefined,
      default: undefined,
    },
  },
  setup(props) {
    const plot = usePlot();
    let layer: number | null = null;
    let prevWsurl = props.wsurl;
    let prevOptions = props.options;

    onMounted(() => {
      layer = plot.overlay_websocket(
        props.wsurl,
        props.overrides,
        props.options,
      );
    });

    watch(
      () => [props.wsurl, props.options] as const,
      ([newWsurl, newOptions]) => {
        if (layer === null) return;

        if (newWsurl !== prevWsurl) {
          plot.deoverlay(layer);
          layer = plot.overlay_websocket(newWsurl, props.overrides, newOptions);
        } else if (newOptions !== prevOptions) {
          const l = plot.get_layer(layer);
          if (l && newOptions != null) {
            l.change_settings(newOptions);
          }
        }

        prevWsurl = newWsurl;
        prevOptions = newOptions;
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
