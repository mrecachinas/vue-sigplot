import { describe, it, expect, vi, afterEach } from 'vitest';
import { render } from '@testing-library/vue';
import { Plot } from 'sigplot';
import { defineComponent, h, nextTick } from 'vue';
import SigPlot from '../src/SigPlot.vue';
import ArrayLayer from '../src/ArrayLayer.vue';
import PipeLayer from '../src/PipeLayer.vue';
import HrefLayer from '../src/HrefLayer.vue';
import { usePlot } from '../src/composables/usePlot';

// Helper component to capture the Plot instance from context
let capturedPlot: Plot | null = null;
const PlotCapture = defineComponent({
  setup() {
    capturedPlot = usePlot();
    return () => null;
  },
});

describe('<SigPlot />', () => {
  afterEach(() => {
    capturedPlot = null;
    vi.restoreAllMocks();
  });

  it('renders with no child layer', async () => {
    const { container } = render(SigPlot, {
      props: {},
      slots: { default: () => h(PlotCapture) },
    });
    await nextTick();
    const div = container.firstElementChild as HTMLDivElement;
    expect(div.style.width).toBe('300px');
    expect(div.style.height).toBe('300px');
    expect(div.style.display).toBe('inline-block');
    expect(capturedPlot).not.toBeNull();
    expect(capturedPlot!._Gx.all).toBe(true);
    expect(capturedPlot!._Gx.expand).toBe(true);
    expect(capturedPlot!._Gx.autol).toBe(100);
    expect(capturedPlot!._Gx.autohide_panbars).toBe(true);
    expect(capturedPlot!._Gx.lyr).toHaveLength(0);
  });

  it('renders with no child layer with custom height and width', async () => {
    const { container } = render(SigPlot, {
      props: { height: 500, width: 800 },
      slots: { default: () => h(PlotCapture) },
    });
    await nextTick();
    const div = container.firstElementChild as HTMLDivElement;
    expect(div.style.width).toBe('800px');
    expect(div.style.height).toBe('500px');
    expect(div.style.display).toBe('inline-block');
    expect(capturedPlot).not.toBeNull();
    expect(capturedPlot!._Gx.all).toBe(true);
    expect(capturedPlot!._Gx.expand).toBe(true);
    expect(capturedPlot!._Gx.autol).toBe(100);
    expect(capturedPlot!._Gx.autohide_panbars).toBe(true);
    expect(capturedPlot!._Gx.lyr).toHaveLength(0);
  });

  it('handles changing custom height and width', async () => {
    const { container, rerender } = render(SigPlot, {
      props: { height: 500, width: 800 },
      slots: { default: () => h(PlotCapture) },
    });
    await nextTick();
    const div = container.firstElementChild as HTMLDivElement;
    expect(div.style.width).toBe('800px');
    expect(div.style.height).toBe('500px');

    const checkresizeSpy = vi.spyOn(Plot.prototype, 'checkresize');

    await rerender({ height: 200, width: 800 });
    expect(div.style.height).toBe('200px');
    expect(div.style.width).toBe('800px');
    expect(checkresizeSpy).toHaveBeenCalledTimes(1);

    await rerender({ height: 200, width: 100 });
    expect(div.style.width).toBe('100px');
    expect(div.style.height).toBe('200px');
    expect(checkresizeSpy).toHaveBeenCalledTimes(2);
  });

  it('handles changing plot options', async () => {
    const options = {
      all: true,
      expand: true,
      autol: 100,
      autohide_panbars: true,
    };
    const { rerender } = render(SigPlot, {
      props: { options },
      slots: { default: () => h(PlotCapture) },
    });
    await nextTick();
    expect(capturedPlot).not.toBeNull();
    expect(capturedPlot!._Gx.all).toBe(true);
    expect(capturedPlot!._Gx.expand).toBe(true);
    expect(capturedPlot!._Gx.autol).toBe(100);
    expect(capturedPlot!._Gx.autohide_panbars).toBe(true);

    const newOptions = {
      all: false,
      autol: 200,
    };
    await rerender({ options: newOptions });
    expect(capturedPlot!._Gx.all).toBe(false);
    expect(capturedPlot!._Gx.autol).toBe(200);
  });

  it('renders with no child layer with custom options and custom height and width', async () => {
    const options = {
      all: false,
      expand: false,
      autol: 1,
      autohide_panbars: false,
    };
    const { container } = render(SigPlot, {
      props: { height: 500, width: 800, options },
      slots: { default: () => h(PlotCapture) },
    });
    await nextTick();
    const div = container.firstElementChild as HTMLDivElement;
    expect(div.style.width).toBe('800px');
    expect(div.style.height).toBe('500px');
    expect(div.style.display).toBe('inline-block');
    expect(capturedPlot).not.toBeNull();
    expect(capturedPlot!._Gx.all).toBe(false);
    expect(capturedPlot!._Gx.expand).toBe(false);
    expect(capturedPlot!._Gx.autol).toBe(1);
    expect(capturedPlot!._Gx.autohide_panbars).toBe(false);
    expect(capturedPlot!._Gx.lyr).toHaveLength(0);
  });

  it('renders with 1D ArrayLayer with no data', async () => {
    const options = {
      all: true,
      expand: true,
      autol: 100,
      autohide_panbars: true,
    };
    const oneDimensionalData: number[] = [];

    const TestComp = defineComponent({
      setup() {
        return () =>
          h(SigPlot, { options }, () => [
            h(PlotCapture),
            h(ArrayLayer, { data: oneDimensionalData }),
          ]);
      },
    });

    render(TestComp);
    await nextTick();
    await nextTick();
    expect(capturedPlot).not.toBeNull();
    expect(capturedPlot!._Gx.all).toBe(true);
    expect(capturedPlot!._Gx.expand).toBe(true);
    expect(capturedPlot!._Gx.autol).toBe(100);
    expect(capturedPlot!._Gx.autohide_panbars).toBe(true);
    expect(capturedPlot!._Gx.lyr).toHaveLength(1);
    expect(capturedPlot!._Gx.lyr[0].ypoint).toBeNull();
  });

  it('renders with 2 1D ArrayLayers with no data', async () => {
    const options = {
      all: true,
      expand: true,
      autol: 100,
      autohide_panbars: true,
    };

    const TestComp = defineComponent({
      setup() {
        return () =>
          h(SigPlot, { options }, () => [
            h(PlotCapture),
            h(ArrayLayer, { data: [] }),
            h(ArrayLayer, { data: [] }),
          ]);
      },
    });

    render(TestComp);
    await nextTick();
    await nextTick();
    expect(capturedPlot).not.toBeNull();
    expect(capturedPlot!._Gx.lyr).toHaveLength(2);
    expect(capturedPlot!._Gx.lyr[0].ypoint).toBeNull();
    expect(capturedPlot!._Gx.lyr[1].ypoint).toBeNull();
  });

  it('renders with 1D ArrayLayer with data', async () => {
    const options = {
      all: true,
      expand: true,
      autol: 100,
      autohide_panbars: true,
    };
    const random: number[] = [];
    for (let i = 0; i <= 1000; i += 1) {
      random.push(i * 10);
    }

    const TestComp = defineComponent({
      setup() {
        return () =>
          h(SigPlot, { options }, () => [
            h(PlotCapture),
            h(ArrayLayer, { data: random }),
          ]);
      },
    });

    render(TestComp);
    await nextTick();
    await nextTick();
    expect(capturedPlot).not.toBeNull();
    expect(capturedPlot!._Gx.lyr).toHaveLength(1);
    expect(capturedPlot!._Gx.lyr[0].ypoint).toHaveLength(random.length);
    expect(capturedPlot!._Gx.lyr[0].ypoint).toEqual(
      new Float64Array(random),
    );
  });

  it('renders with 2 1D ArrayLayers with data', async () => {
    const options = {
      all: true,
      expand: true,
      autol: 100,
      autohide_panbars: true,
    };

    const random1: number[] = [];
    for (let i = 0; i <= 1000; i += 1) {
      random1.push(10 * i);
    }

    const random2: number[] = [];
    for (let i = 0; i <= 1000; i += 1) {
      random2.push(10 * i);
    }

    const TestComp = defineComponent({
      setup() {
        return () =>
          h(SigPlot, { options }, () => [
            h(PlotCapture),
            h(ArrayLayer, { data: random1 }),
            h(ArrayLayer, { data: random2 }),
          ]);
      },
    });

    render(TestComp);
    await nextTick();
    await nextTick();
    expect(capturedPlot).not.toBeNull();
    expect(capturedPlot!._Gx.lyr).toHaveLength(2);
    expect(capturedPlot!._Gx.lyr[0].ypoint).toHaveLength(random1.length);
    expect(capturedPlot!._Gx.lyr[0].ypoint).toEqual(
      new Float64Array(random1),
    );
    expect(capturedPlot!._Gx.lyr[1].ypoint).toHaveLength(random2.length);
    expect(capturedPlot!._Gx.lyr[1].ypoint).toEqual(
      new Float64Array(random2),
    );
  });

  it('renders with PipeLayer', async () => {
    const options = {
      all: true,
      expand: true,
      autol: 100,
      autohide_panbars: true,
    };
    const pipeOptions = { type: 2000, subsize: 1000 };

    const TestComp = defineComponent({
      setup() {
        return () =>
          h(SigPlot, { options }, () => [
            h(PlotCapture),
            h(PipeLayer, { options: pipeOptions }),
          ]);
      },
    });

    render(TestComp);
    await nextTick();
    await nextTick();
    expect(capturedPlot).not.toBeNull();
    expect(capturedPlot!._Gx.lyr).toHaveLength(1);
    expect(capturedPlot!._Gx.lyr[0].hcb.subsize).toBe(1000);
    expect(capturedPlot!._Gx.lyr[0].hcb.type).toBe(2000);
  });

  it('renders with HrefLayer', async () => {
    const overlayHrefSpy = vi
      .spyOn(Plot.prototype, 'overlay_href')
      .mockReturnValue(0);
    const options = {
      all: true,
      expand: true,
      autol: 100,
      autohide_panbars: true,
    };

    const TestComp = defineComponent({
      setup() {
        return () =>
          h(SigPlot, { options }, () => [
            h(PlotCapture),
            h(HrefLayer, { href: 'dat/penny.prm' }),
          ]);
      },
    });

    render(TestComp);
    await nextTick();
    await nextTick();
    expect(capturedPlot).not.toBeNull();
    expect(overlayHrefSpy).toHaveBeenCalledWith(
      'dat/penny.prm',
      null,
      undefined,
    );
  });
});
