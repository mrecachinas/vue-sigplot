import { describe, it, expect, vi, afterEach } from 'vitest';
import { render } from '@testing-library/vue';
import { Plot } from 'sigplot';
import { defineComponent, ref, h, nextTick, shallowRef } from 'vue';
import WebsocketLayer from '../src/WebsocketLayer.vue';
import { SIGPLOT_KEY } from '../src/composables/usePlot';

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

describe('<WebsocketLayer />', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("doesn't reload plot on same wsurl change", async () => {
    const element = document.createElement('div');
    const plot = new Plot(element, {});

    const deoverlaySpy = vi.spyOn(Plot.prototype, 'deoverlay');
    const overlayWsSpy = vi.spyOn(Plot.prototype, 'overlay_websocket');

    const options = { framesize: 1000 };
    const websocketURL = 'ws://0.0.0.0';
    const counter = ref(0);

    const TestComp = defineComponent({
      setup() {
        // Access counter to trigger re-render
        const _ = counter.value;
        return () =>
          h(WebsocketLayer, { wsurl: websocketURL, options });
      },
    });

    renderWithPlot(plot, TestComp);

    expect(plot._Gx.lyr).toHaveLength(1);
    const overlayCountAfterMount = overlayWsSpy.mock.calls.length;

    counter.value++;
    await nextTick();

    // No additional overlay_websocket calls since wsurl is same
    expect(overlayWsSpy.mock.calls.length).toBe(overlayCountAfterMount);
    expect(deoverlaySpy).toHaveBeenCalledTimes(0);
  });

  it('reloads plot on wsurl prop change', async () => {
    const element = document.createElement('div');
    const plot = new Plot(element, {});

    const deoverlaySpy = vi.spyOn(Plot.prototype, 'deoverlay');
    const overlayWsSpy = vi.spyOn(Plot.prototype, 'overlay_websocket');

    const options = { framesize: 1000 };
    const wsurl = ref('ws://0.0.0.0');

    const TestComp = defineComponent({
      setup() {
        return () =>
          h(WebsocketLayer, { wsurl: wsurl.value, options });
      },
    });

    renderWithPlot(plot, TestComp);

    expect(plot._Gx.lyr).toHaveLength(1);

    wsurl.value = 'ws://0.0.0.0/foo';
    await nextTick();

    expect(deoverlaySpy).toHaveBeenCalled();
    expect(overlayWsSpy.mock.calls.at(-1)?.[0]).toBe('ws://0.0.0.0/foo');
    expect(plot._Gx.lyr).toHaveLength(1);
  });

  it('throws an error on empty URL', () => {
    const originalError = console.error;
    console.error = vi.fn();

    expect(() => {
      const element = document.createElement('div');
      const plot = new Plot(element, {});

      const TestComp = defineComponent({
        setup() {
          return () => h(WebsocketLayer, { wsurl: '' });
        },
      });

      renderWithPlot(plot, TestComp);
    }).toThrow();

    console.error = originalError;
  });

  it('changes settings on options prop change', async () => {
    const element = document.createElement('div');
    const plot = new Plot(element, {});

    const opts = ref<Record<string, unknown>>({
      drawmode: 'scrolling',
      framesize: 1000,
    });
    const websocketURL = 'ws://0.0.0.0';

    const deoverlaySpy = vi.spyOn(Plot.prototype, 'deoverlay');
    const overlayWsSpy = vi.spyOn(Plot.prototype, 'overlay_websocket');

    const TestComp = defineComponent({
      setup() {
        return () =>
          h(WebsocketLayer, { wsurl: websocketURL, options: opts.value });
      },
    });

    renderWithPlot(plot, TestComp);

    expect(plot._Gx.lyr).toHaveLength(1);
    expect(plot._Gx.lyr[0].drawmode).toBe('scrolling');

    opts.value = { drawmode: 'righttoleft' };
    await nextTick();

    expect(deoverlaySpy).toHaveBeenCalledTimes(0);
    expect(overlayWsSpy).toHaveBeenCalledTimes(1);
    expect(plot._Gx.lyr[0].drawmode).toBe('righttoleft');
  });
});
