<template>
  <div class="Entry">
    <template
      v-if="entitiesAndProperties[idx].length == 1"
    >
      <p>Entity: <span style="font-weight: bold;">{{entitiesAndProperties[idx][0]["entity"]}}</span></p>
      <p>Property: <span style="font-weight: bold;">{{entitiesAndProperties[idx][0]["property"]}}</span></p>
    </template>
    <template
      v-if="entitiesAndProperties[idx].length != 1"
    >
      <p style="font-size: 12px; color: #8492A6;">Multiple potential entity & property pairs found:</p>
      <el-select v-model="entitiesAndPropertiesSelect[idx]" placeholder="Select">
        <el-option
          v-for="(ep, idxOfEP) in entitiesAndProperties[idx]"
          :key="ep.entity"
          :value="idxOfEP+1"
          :label="idxOfEP+1">
          <span style="float: left">{{idxOfEP+1}}.</span>
          <span style="float: right; color: #8492a6; font-size: 13px">E: {{ ep.entity }} | P: {{ ep.property }}</span>
        </el-option>
      </el-select>
      <p>Entity: <span style="font-weight: bold;">{{entitiesAndProperties[idx][entitiesAndPropertiesSelect[idx]-1]["entity"]}}</span></p>
      <p>Property: <span style="font-weight: bold;">{{entitiesAndProperties[idx][entitiesAndPropertiesSelect[idx]-1]["property"]}}</span></p>
    </template>
    <hr>
    <p style="color: #8492A6;">
      Found DBpedia page <a :href="'http://dbpedia.org/page/'+entitiesAndProperties[idx][entitiesAndPropertiesSelect[idx]-1]['page_name'].replace(/\s/g, '_')" target="blank" style="color: #8492A6;"><span style="font-weight: bold;">{{entitiesAndProperties[idx][entitiesAndPropertiesSelect[idx]-1]['page_name']}}</span></a>, and it's <span style="font-weight: bold;">{{Object.keys(entitiesAndProperties[idx][entitiesAndPropertiesSelect[idx]-1]['page_properties']).length}}</span> properties.
    </p>
    <hr>
    <el-tabs type="border-card">
      <el-tab-pane label="Suggestion">
        <p style="font-size: 12px; color: #8492A6;">Property suggestions:</p>
        <template
          v-if="propertySuggestionSelectionValue(idx) === undefined"
        >
          <div style="height: 50px; font-size: 12px; color: #8492A6; display: flex; align-items: center; justify-content: center;">
            No suggestion.
          </div>
        </template>
        <template
          v-if="propertySuggestionSelectionValue(idx) !== undefined"
        >
          <el-select 
            v-model="propertySuggestionSelection[idx][entitiesAndPropertiesSelect[idx]-1]" 
            placeholder="Select"
            @change="updateSelect"
          >
            <el-option
              v-for="pso in entitiesAndProperties[idx][entitiesAndPropertiesSelect[idx]-1]['propertySuggestionsOptions']"
              :key="pso.value"
              :value="pso.value"
            >
            </el-option>
          </el-select>
          <p style="font-size: 12px; color: #8492A6;">Selected property value:</p>
          <div style="border: 1px solid #dfe6ec; padding: 8px; border-radius: 5px; width: 176px; overflow: auto;">
            <template
              v-if="propertySuggestionSelectionValue(idx).length == 1"
            >
              <template
                v-if="propertySuggestionSelectionValue(idx)[0].type === 'uri'"
              >
                <a :href="propertySuggestionSelectionValue(idx)[0].value">{{propertySuggestionSelectionValue(idx)[0].value.substr(propertySuggestionSelectionValue(idx)[0].value.lastIndexOf('/') + 1).replace(/_/g, ' ')}}</a>
              </template>
              <template
                v-if="propertySuggestionSelectionValue(idx)[0].type !== 'uri'"
                >
                {{propertySuggestionSelectionValue(idx)[0].value}}
              </template>
            </template>
            <template
              v-if="propertySuggestionSelectionValue(idx).length > 1"
            >
              <el-radio 
                v-for="(spi, idxOfSpi) in propertySuggestionSelectionValue(idx)"
                class="radio" 
                v-model="propertySugestionContentListSelection[idx][entitiesAndPropertiesSelect[idx]-1]" 
                :label="idxOfSpi"
                :key="'sp-'+idx+'-spi-'+idxOfSpi"
              >
                <template
                  v-if="propertySuggestionSelectionValue(idx)[idxOfSpi].type === 'uri'"
                >
                  <a :href="propertySuggestionSelectionValue(idx)[idxOfSpi].value">{{propertySuggestionSelectionValue(idx)[idxOfSpi].value.substr(propertySuggestionSelectionValue(idx)[idxOfSpi].value.lastIndexOf('/') + 1).replace(/_/g, ' ')}}</a>
                </template>
                <template
                  v-if="propertySuggestionSelectionValue(idx)[idxOfSpi].type !== 'uri'"
                  >
                  {{propertySuggestionSelectionValue(idx)[idxOfSpi].value}}
                </template>
              </el-radio>
            </template>
          </div>
          <div style="float: right; padding: 16px 0px 4px 0px;">
            <el-button type="danger">Discard</el-button>
            <el-button type="info">Confirm</el-button>
          </div>
          <div class="clearfix" style="font-size: 10px; color: #8492A6;">
            *If the suggested property is relevant, click "Confirm"; else, click "Discard". If multiple suggestions are provided, by clicking "Confirm"/"Discard", the ranking and appearance of the selected suggestion will be affected accordingly.
          </div>
        </template>
      </el-tab-pane>
      <el-tab-pane label="Custom">
        <p style="font-size: 12px; color: #8492A6;">All properties:</p>
        <el-select v-model="propertyAllSelection[idx][entitiesAndPropertiesSelect[idx]-1]" placeholder="Select">
          <el-option
            v-for="po in entitiesAndProperties[idx][entitiesAndPropertiesSelect[idx]-1]['propertyOptions']"
            :key="po.value"
            :value="po.value">
          </el-option>
        </el-select>

        <p style="font-size: 12px; color: #8492A6;">Selected property value:</p>
        <div style="border: 1px solid #dfe6ec; padding: 8px; border-radius: 5px; width: 176px; overflow: auto;">
          <template
            v-if="propertyAllSelectionValue(idx).length == 1"
          >
            <template
              v-if="propertyAllSelectionValue(idx)[0].type === 'uri'"
            >
              <a :href="propertyAllSelectionValue(idx)[0].value">{{propertyAllSelectionValue(idx)[0].value.substr(propertyAllSelectionValue(idx)[0].value.lastIndexOf('/') + 1).replace(/_/g, ' ')}}</a>
            </template>
            <template
              v-if="propertyAllSelectionValue(idx)[0].type !== 'uri'"
              >
              {{propertyAllSelectionValue(idx)[0].value}}
            </template>
          </template>
          <template
            v-if="propertyAllSelectionValue(idx).length > 1"
          >
            <el-radio 
              v-for="(spi, idxOfSpi) in propertyAllSelectionValue(idx)"
              class="radio" 
              v-model="propertyAllContentListSelection[idx][entitiesAndPropertiesSelect[idx]-1]" 
              :label="idxOfSpi"
              :key="'sp-'+idx+'-spi-'+idxOfSpi"
            >
              <template
                v-if="propertyAllSelectionValue(idx)[idxOfSpi].type === 'uri'"
              >
                <a :href="propertyAllSelectionValue(idx)[idxOfSpi].value">{{propertyAllSelectionValue(idx)[idxOfSpi].value.substr(propertyAllSelectionValue(idx)[idxOfSpi].value.lastIndexOf('/') + 1).replace(/_/g, ' ')}}</a>
              </template>
              <template
                v-if="propertyAllSelectionValue(idx)[idxOfSpi].type !== 'uri'"
                >
                {{propertyAllSelectionValue(idx)[idxOfSpi].value}}
              </template>
            </el-radio>
          </template>
        </div>
        <div style="float: right; padding: 16px 0px 4px 0px;">
          <el-button type="danger">Discard</el-button>
          <el-button type="info">Confirm</el-button>
        </div>
        <div class="clearfix" style="font-size: 10px; color: #8492A6;">
          *If the suggested property is relevant, click "Confirm"; else, click "Discard". If multiple suggestions are provided, by clicking "Confirm"/"Discard", the ranking and appearance of the selected suggestion will be affected accordingly.
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
export default {
  name: 'entry-page',
  data () {
    return {
      msg: 'Welcome to Your Vue.js App'
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
