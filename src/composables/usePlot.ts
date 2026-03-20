import type { Plot } from 'sigplot';
import { type InjectionKey, inject, type Ref } from 'vue';

export const SIGPLOT_KEY: InjectionKey<Ref<Plot | null>> = Symbol('sigplot');

export function usePlot(): Plot {
  const plotRef = inject(SIGPLOT_KEY);
  if (!plotRef?.value) {
    throw new Error('usePlot must be used within a <SigPlot> component');
  }
  return plotRef.value;
}
