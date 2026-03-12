import { inject, type InjectionKey, type Ref } from 'vue';
import type { Plot } from 'sigplot';

export const SIGPLOT_KEY: InjectionKey<Ref<Plot | null>> = Symbol('sigplot');

export function usePlot(): Plot {
  const plotRef = inject(SIGPLOT_KEY);
  if (!plotRef?.value) {
    throw new Error('usePlot must be used within a <SigPlot> component');
  }
  return plotRef.value;
}
