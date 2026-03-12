<template>
  <div id="app">
    <SigPlot :options="{ xi: !btnToggle }" :height="400" :width="400">
      <ArrayLayer :data="random" />
    </SigPlot>
    <SigPlot :height="400" :width="400">
      <HrefLayer :href="hrefData" />
    </SigPlot>
    <SigPlot :height="400" :width="400">
      <PipeLayer :data="random" :options="{ type: 2000, subsize: 1000 }" />
    </SigPlot>
    <button id="toggler" @click="btnToggle = !btnToggle">Toggle Data</button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import SigPlot from './SigPlot.vue';
import ArrayLayer from './ArrayLayer.vue';
import HrefLayer from './HrefLayer.vue';
import PipeLayer from './PipeLayer.vue';

const btnToggle = ref(false);
const href1 = 'https://sigplot.lgsinnovations.com/dat/penny.prm';
const href2 = 'https://sigplot.lgsinnovations.com/dat/sin.tmp';
const random = ref<number[]>([]);
let generateDataInterval: ReturnType<typeof setInterval> | undefined;

const hrefData = computed(() => (btnToggle.value ? href1 : href2));

function generateData() {
  generateDataInterval = setInterval(() => {
    const data: number[] = [];
    for (let i = 0; i < 1000; i += 1) {
      data.push(Math.random());
    }
    random.value = data;
  }, 16);
}

onMounted(() => {
  generateData();
});

onUnmounted(() => {
  clearInterval(generateDataInterval);
});
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

#app .sigplot {
  display: inline-block;
  height: 400px;
  width: 400px;
  margin: 10px;
}

#toggler {
  height: 30px;
  width: 100px;
  display: block;
  background: none;
  border: 1px solid gray;
  border-radius: 3px;
}

#toggler:active {
  box-shadow: inset 0 2px 3px 0 black;
}

#toggler:focus {
  outline: none;
}
</style>
