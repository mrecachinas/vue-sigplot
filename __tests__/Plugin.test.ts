import { render } from '@testing-library/vue';
import { Plot } from 'sigplot';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { defineComponent, h, shallowRef } from 'vue';
import { SIGPLOT_KEY } from '../src/composables/usePlot';
import Plugin from '../src/Plugin.vue';

function renderWithPlot(
  plot: Plot,
  component: ReturnType<typeof defineComponent>,
) {
  return render(component, {
    global: {
      provide: {
        [SIGPLOT_KEY as symbol]: shallowRef(plot),
      },
    },
  });
}

describe('<Plugin />', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('adds plugin on mount', () => {
    const element = document.createElement('div');
    const plot = new Plot(element, {});

    const addPluginSpy = vi.spyOn(Plot.prototype, 'add_plugin');

    const mockPlugin = { init: vi.fn(), dispose: vi.fn() };
    const pluginOptions = { display: true };

    const TestComp = defineComponent({
      setup() {
        return () => h(Plugin, { plugin: mockPlugin, pluginOptions });
      },
    });

    renderWithPlot(plot, TestComp);

    expect(addPluginSpy).toHaveBeenCalledTimes(1);
    expect(addPluginSpy.mock.calls[0][0]).toBe(mockPlugin);
    expect(addPluginSpy.mock.calls[0][1]).toBe(pluginOptions);
  });

  it('removes plugin on unmount', () => {
    const element = document.createElement('div');
    const plot = new Plot(element, {});

    const removePluginSpy = vi.spyOn(Plot.prototype, 'remove_plugin');

    const mockPlugin = { init: vi.fn(), dispose: vi.fn() };

    const TestComp = defineComponent({
      setup() {
        return () => h(Plugin, { plugin: mockPlugin });
      },
    });

    const { unmount } = renderWithPlot(plot, TestComp);

    unmount();
    expect(removePluginSpy).toHaveBeenCalledTimes(1);
    expect(removePluginSpy.mock.calls[0][0]).toBe(mockPlugin);
  });
});
