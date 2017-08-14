<template>
  <div id="app">
    <el-card class="box-card" style="margin-bottom: 8px;">
      <span style="color: #003048; font-weight: bold;">DBpedia Property+</span>
      <p style="font-size: 12px; color: #8492A6; margin: 5px 0 0 0;">Include DBpedia data in your content. And more than that.</p>
    </el-card>
    <input-card />
    <div style="text-align: center; color: #8492A6; padding: 4px;">
      ⟱
    </div>
    <result-card />
    <div style="text-align: center; color: #8492A6; padding: 8px 4px; font-size: 14px;">
      ------§ Rule Inspector §------
    </div>
    <rule-card />
  </div>
</template>

<script>
import InputCard from './components/InputCard'
import ResultCard from './components/ResultCard'
import RuleCard from './components/RuleCard'
export default {
  name: 'app',
  components: {
    InputCard, ResultCard, RuleCard
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
