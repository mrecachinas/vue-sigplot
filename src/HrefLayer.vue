<script lang="ts">
import { defineComponent, watch, onMounted, onUnmounted } from 'vue';
import { usePlot } from './composables/usePlot';

export interface HrefLayerProps {
  href?: string;
  onload?: ((hcb: unknown) => void) | null;
  options?: Record<string, unknown>;
}

/**
 * Wrapper around sigplot.Plot.overlay_href
 *
 *   <SigPlot>
 *     <HrefLayer href="/path/to/file.tmp" />
 *   </SigPlot>
 */
export default defineComponent({
  name: 'HrefLayer',
  props: {
    href: {
      type: String,
      default: '',
    },
    onload: {
      type: Function as unknown as () =>
        | ((hcb: unknown) => void)
        | null
        | undefined,
      default: null,
    },
    options: {
      type: Object as () => Record<string, unknown> | undefined,
      default: undefined,
    },
  },
  setup(props) {
    const plot = usePlot();
    let layer: number | null = null;
    let prevHref = props.href;
    let prevOptions = props.options;

    onMounted(() => {
      layer = plot.overlay_href(props.href, props.onload, props.options);
    });

    watch(
      () => [props.href, props.options] as const,
      ([newHref, newOptions]) => {
        if (layer === null) return;

        if (newHref !== prevHref) {
          plot.deoverlay(layer);
          layer = plot.overlay_href(newHref, props.onload, newOptions);
        } else if (newOptions !== prevOptions) {
          const l = plot.get_layer(layer);
          if (l && newOptions != null) {
            l.change_settings(newOptions);
          }
        }

        prevHref = newHref;
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
