<template>
  <div class="home-page">
    <el-card class="box-card" style="background-color: #EFF2F7; margin: 10px 0;">
        <p style="font-size: 12px; color: #475669;">The last sentence has been changed to:</p>
        <p style="font-size: 14px; font-weight: bold;">The population of China compares with the population of the UK</p>
        <div style="float: right; margin-bottom: 4px;">
          <el-button type="text" class="button" style="color: rgb(71, 86, 105);">Ignore</el-button>
          <el-button type="info">Replace</el-button>
        </div>
    </el-card>
    <el-card class="box-card">
      <p style="font-size: 16px; font-weight: bold;">
        Content to process:
      </p>
      <el-input
        id="content-to-process"
        type="textarea"
        :autosize="{ minRows: 4, maxRows: 20}"
        placeholder="Please input"
        :value="contentToProcess"
      >
      </el-input>
      <div class="clearfix" style="float: right; padding: 4px 0px 4px 0px;">
        <el-button type="primary" 
          @click="processContent"
          :loading="isProcessing"
        >
          Process
        </el-button>
      </div>
    </el-card>
    <div style="text-align: center; color: #8492A6; padding: 4px;">
      ⟱
    </div>
    <el-card class="box-card">
      <p style="font-size: 14px; font-weight: bold; color: #8492A6;">
        Generating results with:
      </p>
      <el-select v-model="methodSelect" placeholder="Select">
        <el-option
          v-for="item in methodSelectOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value">
        </el-option>
      </el-select>
      <hr>
      <div
        v-if="!isProcessingSucceeded"
        v-loading="isProcessing"
        :element-loading-text="processingText"
        :class="{ error: hasError }"
        class="result-card-msg"
      >
        {{resultCardMsg}}
      </div>
      <template
        v-if="isProcessingSucceeded"
      >
        <p style="font-size: 14px; font-weight: bold; color: #8492A6;">
          Found <span style="color: #1F2D3D;">{{entries.length}}</span> potential entries:
        </p>
        <el-collapse v-model="entityList" @change="handleChange">
          <el-collapse-item 
            v-for="(entryName, idx) in entries" 
            :title="entryName" 
            :name="idx" 
            :key="entryName+idx">
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
          </el-collapse-item>
        </el-collapse>
      </template>
    </el-card>
    <div style="text-align: center; color: #8492A6; padding: 4px;">
      ⟱
    </div>
    <el-card class="box-card">
      <p style="font-size: 14px; font-weight: bold; color: #8492A6;">
        New Content Editor:
      </p>
      <el-input
        type="textarea"
        :autosize="{ minRows: 4, maxRows: 20}"
        placeholder="Please input"
        value=""
        :disabled="!isNewContentEditorEnabled"
      >
      </el-input>
      <div class="clearfix" style="float: right; padding: 10px 0px;">
        <el-button-group>
          <el-button type="info" :disabled="!isNewContentEditorEnabled">Copy</el-button>
          <el-button type="info" :disabled="!isNewContentEditorEnabled">Append</el-button>
          <el-button type="info" :disabled="!isNewContentEditorEnabled">Replace</el-button>
        </el-button-group>
      </div>
    </el-card>
  </div>
</template>

<script>
import fuzz from 'fuzzball'
export default {
  name: 'home-page',
  data () {
    return {
      lastSentence: 'The population of China, and the population of the US',
      contentToProcess: 'birthdate of Albert Einstein',
      entries: [],
      entitiesAndProperties: [],
      // If multiple entity-property pairs available,
      // entitiesAndPropertiesSelect[n] is the index of the selected pair of n-th entry;
      // if only one entity-property pair exists, then entitiesAndPropertiesSelect[n] = 0
      entitiesAndPropertiesSelect: [],
      // If multiple property suggestions exist,
      // propertySuggestionSelection[n][m] is the index of the selected property suggestion
      // of the m-th entity-property pair of the n-th entry
      propertySuggestionSelection: [],
      // If multiple property exist,
      // propertyAllSelection[n][m] is the index of the selected property (custom tab)
      // of the m-th entity-property pair of the n-th entry
      propertyAllSelection: [],
      propertySuggestionContentListSelection: [],
      propertyAllContentListSelection: [],
      entityList: [],
      sentenceFrameList: [],
      methodSelect: 'Sentence Parsing',
      methodSelectOptions: [
        {
          label: 'Sentence Parsing',
          value: 'Sentence Parsing'
        },
        {
          label: 'NER by Dandelion',
          value: 'NER by Dandelion'
        },
        {
          label: 'Wolfram | Alpha',
          value: 'Wolfram | Alpha'
        }
      ],
      isProcessing: false,
      processingText: '',
      isProcessingSucceeded: false,
      hasError: false,
      resultCardMsg: 'Click the "Process" button to start.',
      isNewContentEditorEnabled: false
    }
  },
  methods: {
    getEntitiesAndPropertiesSelectIndex (entryIndex, entityName) {
      let idx = 0
      console.info('length')
      for (let i = 0; i < this.entitiesAndProperties[entryIndex].length; i++) {
        if (this.entitiesAndProperties[entryIndex][i].entity === entityName) {
          idx = i
          break
        }
      }
      return idx
    },
    processContent () {
      let that = this

      this.isProcessing = true
      this.processingText = 'Processing content...'
      // reset
      this.propertySuggestionSelection = []
      this.propertyAllSelection = []
      this.propertySugestionContentListSelection = []
      this.propertyAllContentListSelection = []
      this.entitiesAndPropertiesSelect = []
      this.hasError = false
      this.isProcessingSucceeded = false

      console.info('Start to process content:')
      let content = document.getElementById('content-to-process').children[0].value
      console.info('"' + content + '"')
      let formData1 = new FormData()
      formData1.append('string', content.indexOf(',') === -1 ? content : content + ':')

      console.info('\t1. Parsing the content...')
      this.processingText = 'Parsing the sentence...'
      this.$http.post('http://10.7.6.213:8888/parser', formData1).then(response1 => {
        that.processingText = 'Sentence parsing completed.'
        console.info('\t\tContent parsing completed.')
        console.info(response1.body)

        console.info('\t2. Extracting entries...')
        that.processingText = 'Extracting potential entries...'
        let formData2 = new FormData()
        formData2.append('string', response1.body.sentences[0].parse)
        this.$http.post('http://10.7.6.213:8888/entry_extraction', formData2).then(response2 => {
          that.processingText = 'Entry extraction completed.'
          console.info('\t\tEntries extraction completed.')
          console.info(response2.body)
          that.entries = response2.body

          that.processingText = 'Extracting entity and property...'
          console.info('\t3. Extracting entity and property...')
          let formData3 = new FormData()
          formData3.append('entries', JSON.stringify(response2.body))
          this.$http.post('http://10.7.6.213:8888/entity_property_extraction', formData3).then(response3 => {
            that.processingText = 'Entity and property extraction completed.'
            console.info('\t\tEntity and property extraction completed.')
            // console.info(JSON.stringify(response3.body, null, '\t'))

            that.processingText = 'Generating suggestions...'
            that.entitiesAndProperties = response3.body
            for (let i = 0; i < response3.body.length; i++) {
              that.entitiesAndPropertiesSelect.push(1)

              that.propertyAllSelection.push([])
              that.propertySuggestionSelection.push([])
              that.propertySugestionContentListSelection.push([])
              that.propertyAllContentListSelection.push([])

              for (let j = 0; j < response3.body[i].length; j++) {
                let propertyNames = Object.keys(response3.body[i][j].page_properties)
                let propertySuggestionsOptions = []
                let propertyOptions = []
                for (let k = 0; k < propertyNames.length; k++) {
                  propertyOptions.push({
                    value: propertyNames[k],
                    label: propertyNames[k]
                  })
                  let score = fuzz.token_set_ratio(response3.body[i][j].property, propertyNames[k])
                  if (score === 100) {
                    propertySuggestionsOptions.push({
                      value: propertyNames[k],
                      label: propertyNames[k]
                    })
                  }
                }
                that.entitiesAndProperties[i][j].propertyOptions = propertyOptions || []
                that.propertyAllSelection[i].push(propertyOptions.length > 0 ? propertyOptions[0].value : '')
                that.entitiesAndProperties[i][j].propertySuggestionsOptions = propertySuggestionsOptions || []
                that.propertySuggestionSelection[i].push(propertySuggestionsOptions.length > 0 ? propertySuggestionsOptions[0].value : '')
                that.propertySugestionContentListSelection.push(0)
                that.propertyAllContentListSelection.push(0)
              }
            }

            that.isProcessing = false
            that.isProcessingSucceeded = true

            // for (let i = 0; i < response3.body.length; i++) {
            //   console.info(response3.body[i])
            // }
          }, response3 => {
            that.processingText = ''
            that.isProcessing = false
            that.hasError = true
            that.resultCardMsg = 'Entity and property extraction failed.'
            console.error('\t\t!!Entity and property extraction failed.')
          })
        }, response2 => {
          that.processingText = ''
          that.isProcessing = false
          that.hasError = true
          that.resultCardMsg = 'Entry extraction failed.'
          console.error('\t\t!!Entry extraction failed.')
          console.log(response2)
        })
      }, response1 => {
        that.processingText = ''
        that.isProcessing = false
        that.hasError = true
        that.resultCardMsg = 'Content parsing failed.'
        console.error('\t\t!!Content parsing failed.')
        console.log(response1)
      })
    },
    propertySuggestionSelectionValue (idx) {
      let entity = this.entitiesAndProperties[idx][this.entitiesAndPropertiesSelect[idx] - 1]
      let propKey = this.propertySuggestionSelection[idx][this.entitiesAndPropertiesSelect[idx] - 1]
      return entity['page_properties'][propKey]
    },
    propertyAllSelectionValue (idx) {
      let entity = this.entitiesAndProperties[idx][this.entitiesAndPropertiesSelect[idx] - 1]
      let propKey = this.propertyAllSelection[idx][this.entitiesAndPropertiesSelect[idx] - 1]
      return entity['page_properties'][propKey]
    },
    handleChange () {
      // PASS
    },
    updateSelect (selected) {
      console.info(selected)
      console.info('--------')
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.home-page {
}
.md-card {
  width: 90%;
}
.el-select {
  width: 100%;
}
hr {
  border-top: 0.5px dashed #8492A6;
}
.clearfix {
  clear: both;
}
.box-card {
  margin: 10px 0;
}
.result-card-msg {
  height: 150px; 
  font-size: 12px; 
  color: #8492A6; 
  display: flex; 
  align-items: center; 
  justify-content: center;
}
.error {
  color: red;
}
.el-radio+.el-radio {
  margin-left: 0;
}

.el-radio__label > a {
  color: #4078c0;
  text-decoration: none;
}
</style>
