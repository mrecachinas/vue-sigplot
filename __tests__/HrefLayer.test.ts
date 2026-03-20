import { render } from '@testing-library/vue';
import { Plot } from 'sigplot';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { defineComponent, h, nextTick, ref, shallowRef } from 'vue';
import { SIGPLOT_KEY } from '../src/composables/usePlot';
import HrefLayer from '../src/HrefLayer.vue';

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

describe('<HrefLayer />', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('reloads plot on href prop change', async () => {
    const element = document.createElement('div');
    const plot = new Plot(element, {});

    const deoverlaySpy = vi.spyOn(Plot.prototype, 'deoverlay');
    const overlayHrefSpy = vi
      .spyOn(Plot.prototype, 'overlay_href')
      .mockReturnValue(0);

    const href = ref('');

    const TestComp = defineComponent({
      setup() {
        return () => h(HrefLayer, { href: href.value });
      },
    });

    renderWithPlot(plot, TestComp);

    expect(deoverlaySpy).toHaveBeenCalledTimes(0);
    expect(overlayHrefSpy).toHaveBeenCalledTimes(1);
    expect(overlayHrefSpy.mock.calls[0][0]).toBe('');

    href.value = 'dat/penny.prm';
    await nextTick();

    expect(deoverlaySpy).toHaveBeenCalledTimes(1);
    expect(overlayHrefSpy).toHaveBeenCalledTimes(2);
    expect(overlayHrefSpy.mock.calls[1][0]).toBe('dat/penny.prm');
  });

  it("doesn't do anything when props change, but stay the same", async () => {
    const element = document.createElement('div');
    const plot = new Plot(element, {});

    const deoverlaySpy = vi.spyOn(Plot.prototype, 'deoverlay');
    const overlayHrefSpy = vi
      .spyOn(Plot.prototype, 'overlay_href')
      .mockReturnValue(0);

    const hrefOne = 'dat/penny.prm';
    const options = {};
    const counter = ref(0);

    const TestComp = defineComponent({
      setup() {
        // Access counter to trigger re-render
        const _ = counter.value;
        return () => h(HrefLayer, { href: hrefOne, options });
      },
    });

    renderWithPlot(plot, TestComp);

    expect(deoverlaySpy).toHaveBeenCalledTimes(0);
    expect(overlayHrefSpy).toHaveBeenCalledTimes(1);

    counter.value++;
    await nextTick();

    expect(deoverlaySpy).toHaveBeenCalledTimes(0);
    expect(overlayHrefSpy).toHaveBeenCalledTimes(1);
  });

  it('changes settings on options prop change', async () => {
    const element = document.createElement('div');
    const plot = new Plot(element, {});

    const overlayHrefSpy = vi
      .spyOn(Plot.prototype, 'overlay_href')
      .mockReturnValue(0);

    const hrefOne = '';
    const opts = ref<Record<string, unknown> | undefined>(undefined);

    const TestComp = defineComponent({
      setup() {
        return () => h(HrefLayer, { href: hrefOne, options: opts.value });
      },
    });

    renderWithPlot(plot, TestComp);

    expect(overlayHrefSpy).toHaveBeenCalledTimes(1);

    opts.value = { drawmode: 'righttoleft' };
    await nextTick();

    // Href didn't change, so no additional overlay_href call
    expect(overlayHrefSpy).toHaveBeenCalledTimes(1);
  });
});
