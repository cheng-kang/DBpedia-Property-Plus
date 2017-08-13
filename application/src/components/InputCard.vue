<template>
  <div class="input-card">
<!-- 
    <el-card class="box-card" style="background-color: #EFF2F7; margin: 10px 0;">
        <p style="font-size: 12px; color: #475669;">The last sentence has been changed to:</p>
        <p style="font-size: 14px; font-weight: bold;">The population of China compares with the population of the UK</p>
        <div style="float: right; margin-bottom: 4px;">
          <el-button type="text" class="button" style="color: rgb(71, 86, 105);">Ignore</el-button>
          <el-button type="info">Replace</el-button>
        </div>
    </el-card>
     -->
    <el-card class="box-card">
      <p style="font-size: 16px; color: #1F2D3D;">
        Content to process:
      </p>
      <el-input
        type="textarea"
        :autosize="{ minRows: 4, maxRows: 20}"
        placeholder="Please input"
        v-model="contentToProcess"
      />
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
import { UPDATE_CONTENT } from '../store/types'
export default {
  name: 'input-card',
  data () {
    return {
      contentToProcess: ''
    }
  },
  computed: {
    ...mapState({
      lastSentence: state => state.lastSentence,
      content: state => state.content,
      isProcessingContent: state => state.isProcessingContent
    })
  },
  watch: {
    contentToProcess (newValue) {
      this.$store.commit(UPDATE_CONTENT, newValue)
    }
  },
  created () {
    this.contentToProcess = this.content
  },
  methods: {
    processContent () {
      this.$store.dispatch('processContent', this.content)
    }

  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
