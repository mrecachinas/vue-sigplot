import { describe, it, expect, vi, afterEach } from 'vitest';
import { render } from '@testing-library/vue';
import { Plot } from 'sigplot';
import { defineComponent, ref, h, nextTick, shallowRef } from 'vue';
import PipeLayer from '../src/PipeLayer.vue';
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

describe('<PipeLayer />', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('modifies the header on options prop change', async () => {
    const element = document.createElement('div');
    const plot = new Plot(element, {});

    const headermodSpy = vi.spyOn(Plot.prototype, 'headermod');

    const data: number[] = [];
    const opts = ref<Record<string, unknown>>({
      framesize: 1000,
      type: 2000,
      subsize: 1000,
    });

    const TestComp = defineComponent({
      setup() {
        return () => h(PipeLayer, { data, options: opts.value });
      },
    });

    renderWithPlot(plot, TestComp);

    expect(plot._Gx.lyr).toHaveLength(1);

    headermodSpy.mockClear();

    opts.value = { framesize: 2000 };
    await nextTick();

    expect(headermodSpy).toHaveBeenCalledTimes(1);
  });

  it('modifies settings on layerOptions prop change', async () => {
    const element = document.createElement('div');
    const plot = new Plot(element, {});

    const data: number[] = [];
    const layerOpts = ref<Record<string, unknown>>({ drawmode: 'scrolling' });
    const options = { framesize: 1000, type: 2000, subsize: 1000 };

    const TestComp = defineComponent({
      setup() {
        return () =>
          h(PipeLayer, {
            data,
            options,
            layerOptions: layerOpts.value,
          });
      },
    });

    renderWithPlot(plot, TestComp);

    expect(plot._Gx.lyr).toHaveLength(1);
    expect(plot._Gx.lyr[0].drawmode).toBe('scrolling');

    layerOpts.value = { drawmode: 'righttoleft' };
    await nextTick();

    expect(plot._Gx.lyr[0].drawmode).toBe('righttoleft');
  });

  it('pushes new data to plot on data prop change', async () => {
    const element = document.createElement('div');
    const plot = new Plot(element, {});

    const twoDimensionalData: number[] = [];
    const options = { framesize: 1000, type: 2000, subsize: 1000 };
    const data = ref<number[]>(twoDimensionalData);

    const TestComp = defineComponent({
      setup() {
        return () => h(PipeLayer, { data: data.value, options });
      },
    });

    renderWithPlot(plot, TestComp);

    expect(plot._Gx.lyr).toHaveLength(1);
    expect(plot._Gx.lyr[0].hcb.subsize).toBe(1000);
    expect(plot._Gx.lyr[0].hcb.type).toBe(2000);

    const random: number[] = [];
    for (let i = 0; i <= 1000; i += 1) {
      random.push(i * 10);
    }
    data.value = random;
    await nextTick();

    expect(plot._Gx.lyr).toHaveLength(1);
    expect(plot._Gx.lyr[0].hcb.subsize).toBe(1000);
    expect(plot._Gx.lyr[0].hcb.type).toBe(2000);
  });

  it("doesn't replot the same data on data prop change", async () => {
    const element = document.createElement('div');
    const plot = new Plot(element, {});

    const pushSpy = vi.spyOn(Plot.prototype, 'push');

    const random: number[] = [];
    for (let i = 0; i <= 1000; i += 1) {
      random.push(i * 10);
    }

    const options = { framesize: 1000, type: 2000, subsize: 1000 };
    const counter = ref(0);

    const TestComp = defineComponent({
      setup() {
        // Access counter to trigger re-render
        const _ = counter.value;
        return () => h(PipeLayer, { data: random, options });
      },
    });

    renderWithPlot(plot, TestComp);

    expect(plot._Gx.lyr).toHaveLength(1);
    const pushCountAfterMount = pushSpy.mock.calls.length;

    // Same reference, should not push again
    counter.value++;
    await nextTick();

    expect(pushSpy.mock.calls.length).toBe(pushCountAfterMount);
  });
});
