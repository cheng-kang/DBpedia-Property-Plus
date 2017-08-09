<template>
  <div class="main-page">
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
        <el-collapse v-model="entityList">
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
export default {
  name: 'main-page',
  data () {
    return {
      lastSentence: 'The population of China, and the population of the US',
      contentToProcess: 'birthdate of Albert Einstein',
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
      entries: [],
      detailedEntries: []
    }
  },
  methods: {

    processContent () {
      let that = this

      this.isProcessing = true
      this.processingText = 'Processing content...'
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
            console.info(JSON.stringify(response3.body, null, '\t'))

            that.entitiesAndProperties = response3.body
            that.isProcessing = false
            that.isProcessingSucceeded = true
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
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h1, h2 {
  font-weight: normal;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  display: inline-block;
  margin: 0 10px;
}

a {
  color: #42b983;
}
</style>
