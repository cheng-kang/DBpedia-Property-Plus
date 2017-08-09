<template>
  <div class="result-card">
    <el-card class="box-card">
      <div
        v-if="entries.length === 0"
        v-loading="isProcessingContent"
        :element-loading-text="processingStatusMsg"
        :class="{ error: processingErrorMsg }"
        class="result-card-msg"
      >
        {{processingErrorMsg || 'Click "Process" button to start.'}}
      </div>
      <template
        v-if="entries.length !== 0"
      >
        <p style="font-size: 14px; font-weight: bold; color: #8492A6;">
          Found <span style="color: #1F2D3D;">{{entries.length}}</span> potential {{entries.length === 1 ? 'entry' : 'entries'}}:
        </p>
        <el-collapse v-model="collapsingEntrySections">
          <el-collapse-item 
            v-for="(entry, idx) in entries"
            :title="entry.entry"
            :key="`entry-${idx}`"
            :name="idx"
          >
            <entry
              :entryData="entry"
            />
          </el-collapse-item>
        </el-collapse>
      </template>
    </el-card>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import Entry from './Entry'
// import * as types from '../store/types'
export default {
  name: 'result-card',
  components: {
    Entry
  },
  data () {
    return {
      collapsingEntrySections: []
    }
  },
  computed: {
    ...mapState({
      isProcessingContent: state => state.isProcessingContent,
      entries: state => state.entries,
      processingStatusMsg: state => state.processingStatusMsg,
      processingErrorMsg: state => state.processingErrorMsg
    })
  },
  methods: {
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
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
.md-card {
  width: 90%;
}
hr {
  border-top: 0.5px dashed #8492A6;
}
</style>
