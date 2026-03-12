<script lang="ts">
import { defineComponent, onMounted, onUnmounted } from 'vue';
import { usePlot } from './composables/usePlot';

export interface PluginProps {
  plugin: unknown;
  pluginOptions?: Record<string, unknown>;
}

/**
 * Plugin wrapper for sigplot plugins
 *
 * Adds a plugin to the plot on mount and removes it on unmount.
 */
export default defineComponent({
  name: 'SigPlotPlugin',
  props: {
    plugin: {
      type: undefined as unknown as () => unknown,
      required: true,
    },
    pluginOptions: {
      type: Object as () => Record<string, unknown> | undefined,
      default: undefined,
    },
  },
  setup(props) {
    const plot = usePlot();

    onMounted(() => {
      plot.add_plugin(props.plugin, props.pluginOptions);
    });

    onUnmounted(() => {
      plot.remove_plugin(props.plugin);
    });

    return () => null;
  },
});
</script>
