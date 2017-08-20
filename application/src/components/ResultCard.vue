<template>
  <div class="result-card">
    <el-card class="box-card">
      <div
        v-if="entries === null || entries.length === 0"
        v-loading="isProcessingContent"
        :element-loading-text="processingStatusMsg"
        :class="{ error: processingErrorMsg }"
        class="result-card-msg"
      >
        {{processingErrorMsg || 'Click "Process" button to start.'}}
      </div>
      <template
        v-if="entries !== null && entries.length !== 0"
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
    <el-dialog
      title="Potential Priority Rules"
      :visible="isPPRDialogVisible"
      :before-close="beforeClosePPRDialog"
      >
      <div>
        <el-tag type="primary">{{PPRPair[0]}}</el-tag> and <el-tag type="primary">{{PPRPair[1]}}</el-tag> share common properties, do you want to prioritize <el-tag type="primary">{{PPRPair[0]}}</el-tag> when both are available?
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="handlePPRNever">Never Again</el-button>
        <el-button type="warning" @click="handlePPRLater">Later</el-button>
        <el-button type="primary" @click="handlePPRConfirm">Confirm</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import Entry from './Entry'
import {
  UPDATE_PPR_DIALOG_VISIBILITY,
  UPDATE_SHOULD_UPDATE_PRIORITY_RULES,
  UPDATE_SHOULD_UPDATE_PRIORITY_RULES_MUTED
 } from '../store/types'
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
      processingErrorMsg: state => state.processingErrorMsg,
      isPPRDialogVisible: state => state.isPPRDialogVisible,
      PPRPair: state => state.PPRPair
    })
  },
  methods: {
    beforeClosePPRDialog () {
      this.$store.commit(UPDATE_PPR_DIALOG_VISIBILITY, false)
    },
    handlePPRNever () {
      this.$store.commit(UPDATE_PPR_DIALOG_VISIBILITY, false)

      let priorityRulesMuted = this.$ls.get('priorityRulesMuted', [])
      let newRule = `${this.PPRPair[0]}>>>${this.PPRPair[1]}`
      this.$ls.set('priorityRulesMuted', [...priorityRulesMuted, newRule])
      const h = this.$createElement
      this.$notify({
        title: 'Never Ask Again',
        message: h('div', {},
          [
            'Never ask again about priority rule between',
            h('el-tag', { attrs: { type: 'primary' } }, this.PPRPair[0]),
            ' and ',
            h('el-tag', { attrs: { type: 'primary' } }, this.PPRPair[1]),
            '.'
          ]),
        type: 'warning'
      })
      this.$store.commit(UPDATE_SHOULD_UPDATE_PRIORITY_RULES_MUTED, true)
    },
    handlePPRLater () {
      this.$store.commit(UPDATE_PPR_DIALOG_VISIBILITY, false)
    },
    handlePPRConfirm () {
      this.$store.commit(UPDATE_PPR_DIALOG_VISIBILITY, false)

      let priorityRules = this.$ls.get('priorityRules', [])
      let newRule = `${this.PPRPair[0]}>>>${this.PPRPair[1]}`
      if (priorityRules.indexOf(newRule) === -1) {
        this.$ls.set('priorityRules', [...priorityRules, newRule])
        const h = this.$createElement
        this.$notify({
          title: 'Priority Rule Set',
          message: h('div', {},
            [
              'Successfully prioritized ',
              h('el-tag', { attrs: { type: 'primary' } }, this.PPRPair[0]),
              ' against ',
              h('el-tag', { attrs: { type: 'primary' } }, this.PPRPair[1]),
              '.'
            ]),
          type: 'success'
        })
        this.$store.commit(UPDATE_SHOULD_UPDATE_PRIORITY_RULES, true)
      } else {
        this.$notify({
          title: 'Priority Rule Exist',
          message: 'This rule already exists.',
          type: 'warning'
        })
      }
    }
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
