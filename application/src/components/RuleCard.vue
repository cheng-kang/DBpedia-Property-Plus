<template>
  <div class="rule-card">
    <el-popover
      ref="removePriorityRulePopover"
      placement="top"
      width="160"
      v-model="isRemovePriorityRulePopoverVisible">
      <p>Are you sure to remove this?</p>
      <div style="text-align: right; margin: 0">
        <el-button size="mini" type="text" @click="isRemovePriorityRulePopoverVisible = false">cancel</el-button>
        <el-button type="primary" size="mini" @click="removePriorityRule">confirm</el-button>
      </div>
    </el-popover>
    <el-popover
      ref="unmutePriorityRulePopover"
      placement="top"
      width="160"
      v-model="isUnmutePriorityRulePopoverVisible">
      <p>Are you sure to unmute this?</p>
      <div style="text-align: right; margin: 0">
        <el-button size="mini" type="text" @click="isUnmutePriorityRulePopoverVisible = false">cancel</el-button>
        <el-button type="primary" size="mini" @click="unmutePriorityRule">confirm</el-button>
      </div>
    </el-popover>
    <el-tabs type="border-card">
      <el-tab-pane label="Priority">
        <span v-if="priorityRules.length === 0" style="font-size: 12px;">No Priority Rule.</span>
        <table style="width: 100%;">
          <tr v-for="rule in priorityRules">
            <td>•</td>
            <td>
              <el-tag type="primary">{{getPair(rule)[0]}}</el-tag>
              >
              <el-tag type="primary">{{getPair(rule)[1]}}</el-tag>
            </td>
            <td align="right">
              <el-button type="text" style="color: #FF4949;" v-popover:removePriorityRulePopover @click="handleClickOnRemovePriorityRuleButton(rule)">remove</el-button>
            </td>
          </tr>
        </table>
      </el-tab-pane>
      <el-tab-pane label="Muted">
        <span v-if="priorityRulesMuted.length === 0" style="font-size: 12px;">No Muted Rule.</span>
        <table style="width: 100%;">
          <tr v-for="rule in priorityRulesMuted">
            <td>•</td>
            <td>
              <el-tag type="primary">{{getPair(rule)[0]}}</el-tag>
              >
              <el-tag type="primary">{{getPair(rule)[1]}}</el-tag>
            </td>
            <td align="right">
              <el-button type="text" style="color: #FF4949;" v-popover:unmutePriorityRulePopover @click="handleClickOnRemovePriorityRuleMutedButton(rule)">Unmute</el-button>
            </td>
          </tr>
        </table>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import {
  UPDATE_SHOULD_UPDATE_PRIORITY_RULES,
  UPDATE_SHOULD_UPDATE_PRIORITY_RULES_MUTED
} from '../store/types'
export default {
  name: 'rule-card',
  data () {
    return {
      priorityRules: [],
      priorityRulesMuted: [],
      isRemovePriorityRulePopoverVisible: false,
      isUnmutePriorityRulePopoverVisible: false,
      selectedPriorityRule: null,
      selectedPriorityRuleMuted: null
    }
  },
  computed: {
    ...mapState({
      shouldUpdatePriorityRules: state => state.shouldUpdatePriorityRules,
      shouldUpdatePriorityRulesMuted: state => state.shouldUpdatePriorityRulesMuted
    })
  },
  watch: {
    shouldUpdatePriorityRules (newValue) {
      if (newValue) {
        this.priorityRules = this.$ls.get('priorityRules', [])
        this.$store.commit(UPDATE_SHOULD_UPDATE_PRIORITY_RULES, false)
      }
    },
    shouldUpdatePriorityRulesMuted (newValue) {
      console.log('muted', newValue)
      if (newValue) {
        console.log('muted')
        this.priorityRulesMuted = this.$ls.get('priorityRulesMuted', [])
        this.$store.commit(UPDATE_SHOULD_UPDATE_PRIORITY_RULES_MUTED, false)
      }
    }
  },
  created () {
    this.priorityRules = this.$ls.get('priorityRules', [])
    this.priorityRulesMuted = this.$ls.get('priorityRulesMuted', [])
  },
  methods: {
    getPair (priorityRule) {
      return priorityRule.split('>>>')
    },
    handleClickOnRemovePriorityRuleButton (rule) {
      this.selectedPriorityRule = rule
    },
    handleClickOnRemovePriorityRuleMutedButton (rule) {
      this.selectedPriorityRuleMuted = rule
    },
    removePriorityRule () {
      this.isRemovePriorityRulePopoverVisible = false
      if (this.selectedPriorityRule === null) { return }
      this.priorityRules.splice(this.priorityRules.indexOf(this.selectedPriorityRule), 1)
      this.$ls.set('priorityRules', [...this.priorityRules])
      this.$notify({
        title: 'Priority Rule Removed',
        message: 'This rule will be no longer effective from next time.',
        type: 'success'
      })
      this.selectedPriorityRule = null
    },
    unmutePriorityRule () {
      this.isUnmutePriorityRulePopoverVisible = false
      if (this.selectedPriorityRuleMuted === null) { return }
      this.priorityRulesMuted.splice(this.priorityRulesMuted.indexOf(this.selectedPriorityRuleMuted), 1)
      this.$ls.set('priorityRulesMuted', [...this.priorityRulesMuted])
      this.$notify({
        title: 'Priority Rule Unmuted',
        message: 'This rule will be available from next time.',
        type: 'success'
      })
      this.selectedPriorityRuleMuted = null
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
