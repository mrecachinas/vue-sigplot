import { describe, it, expect, vi, afterEach } from 'vitest';
import { render } from '@testing-library/vue';
import { Plot } from 'sigplot';
import { defineComponent, ref, h, nextTick, shallowRef } from 'vue';
import BlueLayer from '../src/BlueLayer.vue';
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

describe('<BlueLayer />', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('overlays bluefile data on mount', () => {
    const element = document.createElement('div');
    const plot = new Plot(element, {});

    const overlayBluefileSpy = vi.spyOn(Plot.prototype, 'overlay_bluefile');

    const data = { buf: new ArrayBuffer(128), type: 1000, subsize: 64 };

    const TestComp = defineComponent({
      setup() {
        return () => h(BlueLayer, { data });
      },
    });

    renderWithPlot(plot, TestComp);

    expect(overlayBluefileSpy).toHaveBeenCalledTimes(1);
    expect(overlayBluefileSpy.mock.calls[0][0]).toBe(data);
  });

  it('reloads on data prop change', async () => {
    const element = document.createElement('div');
    const plot = new Plot(element, {});

    const reloadSpy = vi.spyOn(plot, 'reload').mockImplementation(() => {});

    const data1 = { buf: new ArrayBuffer(128) };
    const data2 = { buf: new ArrayBuffer(256) };

    const currentData = ref(data1);

    const TestComp = defineComponent({
      setup() {
        return () => h(BlueLayer, { data: currentData.value });
      },
    });

    renderWithPlot(plot, TestComp);

    expect(reloadSpy).toHaveBeenCalledTimes(0);

    currentData.value = data2;
    await nextTick();

    expect(reloadSpy).toHaveBeenCalledTimes(1);
  });

  it('headermods on options prop change', async () => {
    const element = document.createElement('div');
    const plot = new Plot(element, {});

    const headermodSpy = vi
      .spyOn(plot, 'headermod')
      .mockImplementation(() => {});

    const data = { buf: new ArrayBuffer(128) };
    const opts = ref<Record<string, unknown>>({});

    const TestComp = defineComponent({
      setup() {
        return () => h(BlueLayer, { data, options: opts.value });
      },
    });

    renderWithPlot(plot, TestComp);

    opts.value = { subsize: 100 };
    await nextTick();

    expect(headermodSpy).toHaveBeenCalledTimes(1);
  });

  it('does nothing when props stay the same', async () => {
    const element = document.createElement('div');
    const plot = new Plot(element, {});

    const reloadSpy = vi.spyOn(Plot.prototype, 'reload');
    const headermodSpy = vi.spyOn(Plot.prototype, 'headermod');

    const data = { buf: new ArrayBuffer(128) };
    const counter = ref(0);

    const TestComp = defineComponent({
      setup() {
        // Access counter to trigger re-render
        const _ = counter.value;
        return () => h(BlueLayer, { data });
      },
    });

    renderWithPlot(plot, TestComp);

    counter.value++;
    await nextTick();

    expect(reloadSpy).toHaveBeenCalledTimes(0);
    expect(headermodSpy).toHaveBeenCalledTimes(0);
  });

  it('removes layer on unmount', () => {
    const element = document.createElement('div');
    const plot = new Plot(element, {});

    const removeLayerSpy = vi.spyOn(Plot.prototype, 'remove_layer');

    const data = { buf: new ArrayBuffer(128) };

    const TestComp = defineComponent({
      setup() {
        return () => h(BlueLayer, { data });
      },
    });

    const { unmount } = renderWithPlot(plot, TestComp);

    unmount();
    expect(removeLayerSpy).toHaveBeenCalled();
  });
});
