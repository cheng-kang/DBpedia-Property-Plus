<template>
  <div id="app">
    <!-- <router-view></router-view> -->
    <input-card></input-card>
    <div style="text-align: center; color: #8492A6; padding: 4px;">
      ⟱
    </div>
    <result-card></result-card>
  </div>
</template>

<script>
import InputCard from './components/InputCard'
import ResultCard from './components/ResultCard'
export default {
  name: 'app',
  components: {
    InputCard, ResultCard
  }
}
</script>

<style>
#app {
  overflow: auto;
  font-weight: 400;
  -webkit-font-smoothing: antialiased;
  margin: 0 auto;
  width: 300px;
  height: 100vh;
  padding: 10px;
}
</style>
