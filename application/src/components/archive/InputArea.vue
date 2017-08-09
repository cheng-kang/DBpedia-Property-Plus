<template>
  <div class="input-area">
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
          :loading="isProcessingContent"
        >
          Process
        </el-button>
      </div>
    </el-card>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import * as types from '../../../store/mutation-types'
export default {
  name: 'input-area',
  data () {
    return {
    }
  },
  computed: {
    ...mapState({
      lastSentence: state => state.ia.lastSentence,
      contentToProcess: state => state.ia.contentToProcess,
      isProcessingContent: state => state.ia.isProcessingContent
    })
  },
  methods: {
    processContent () {
      this.$store.commit(types.PROCESS_CONTENT, this.contentToProcess)
      
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
