import { render } from '@testing-library/vue';
import { Plot } from 'sigplot';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { defineComponent, h, nextTick, ref, shallowRef } from 'vue';
import ArrayLayer from '../src/ArrayLayer.vue';
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

describe('<ArrayLayer />', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('reloads plot on data prop change', async () => {
    const element = document.createElement('div');
    const plot = new Plot(element, {});

    const random: number[] = [];
    for (let i = 0; i <= 1000; i += 1) {
      random.push(i * 10);
    }

    const data = ref<number[]>(random);

    const TestComp = defineComponent({
      setup() {
        return () => h(ArrayLayer, { data: data.value });
      },
    });

    renderWithPlot(plot, TestComp);

    expect(plot._Gx.lyr).toHaveLength(1);
    expect(plot._Gx.lyr[0].ypoint).toHaveLength(random.length);
    expect(plot._Gx.lyr[0].ypoint).toEqual(new Float64Array(random));

    const random2: number[] = [];
    for (let i = 0; i <= 1000; i += 1) {
      random2.push(i * 10);
    }

    data.value = random2;
    await nextTick();

    expect(plot._Gx.lyr).toHaveLength(1);
    expect(plot._Gx.lyr[0].ypoint).toHaveLength(random2.length);
    expect(plot._Gx.lyr[0].ypoint).toEqual(new Float64Array(random2));
  });

  it("doesn't do anything when props change but remain the same", async () => {
    const element = document.createElement('div');
    const options = { framesize: 1000 };
    const plot = new Plot(element, options);

    const random: number[] = [];
    for (let i = 0; i <= 1000; i += 1) {
      random.push(i * 10);
    }

    const counter = ref(0);

    const TestComp = defineComponent({
      setup() {
        // Access counter to trigger re-render
        const _ = counter.value;
        return () => h(ArrayLayer, { data: random, layerOptions: options });
      },
    });

    renderWithPlot(plot, TestComp);

    expect(plot._Gx.lyr).toHaveLength(1);
    expect(plot._Gx.lyr[0].size).toBe(1000);

    counter.value++;
    await nextTick();

    expect(plot._Gx.lyr[0].size).toBe(1000);
  });

  it('changes layer settings on layerOptions prop change', async () => {
    const element = document.createElement('div');
    const options = { framesize: 1000 };
    const plot = new Plot(element, options);

    const random: number[] = [];
    for (let i = 0; i <= 1000; i += 1) {
      random.push(i * 10);
    }

    const layerOpts = ref<Record<string, unknown>>({ framesize: 1000 });

    const TestComp = defineComponent({
      setup() {
        return () =>
          h(ArrayLayer, { data: random, layerOptions: layerOpts.value });
      },
    });

    renderWithPlot(plot, TestComp);

    expect(plot._Gx.lyr).toHaveLength(1);
    expect(plot._Gx.lyr[0].size).toBe(1000);

    layerOpts.value = { framesize: 50 };
    await nextTick();

    expect(plot._Gx.lyr[0].size).toBe(50);
  });

  it('headermods plot on options prop change', async () => {
    const element = document.createElement('div');
    const plot = new Plot(element, {});

    const overlayArraySpy = vi.spyOn(Plot.prototype, 'overlay_array');
    const reloadSpy = vi.spyOn(Plot.prototype, 'reload');
    const headermodSpy = vi.spyOn(Plot.prototype, 'headermod');

    const random: number[] = [];
    for (let i = 0; i <= 1000; i += 1) {
      random.push(i * 10);
    }

    const opts = ref<Record<string, unknown>>({});

    const TestComp = defineComponent({
      setup() {
        return () => h(ArrayLayer, { data: random, options: opts.value });
      },
    });

    renderWithPlot(plot, TestComp);

    expect(plot._Gx.lyr).toHaveLength(1);
    expect(plot._Gx.lyr[0].ypoint).toHaveLength(random.length);
    expect(plot._Gx.lyr[0].ypoint).toEqual(new Float64Array(random));
    expect(overlayArraySpy).toHaveBeenCalledTimes(1);
    expect(reloadSpy).toHaveBeenCalledTimes(0);
    expect(headermodSpy).toHaveBeenCalledTimes(0);

    opts.value = { subsize: 100 };
    await nextTick();

    expect(plot._Gx.lyr[0].hcb.subsize).toBe(100);
    expect(overlayArraySpy).toHaveBeenCalledTimes(1);
    expect(reloadSpy).toHaveBeenCalledTimes(0);
    expect(headermodSpy).toHaveBeenCalledTimes(1);
  });
});
