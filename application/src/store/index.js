import Vue from 'vue'
import Vuex from 'vuex'
import * as types from './types'
import * as actions from './actions'
import * as getters from './getters'
import LocalStorage from './modules/LocalStorage'

Vue.use(Vuex)

const debug = process.env.NODE_ENV !== 'production'

const state = {
  lastSentence: '',
  content: 'birth date of Albert Einstein',
  isProcessingContent: false,
  isProcessingSucceeded: false,
  processingStatusMsg: '',
  processingErrorMsg: '',
  entries: null,
  isPPRDialogVisible: false,
  // -PPRPair
  //    A pair of recipes that properties of the second
  //    is a subset of the properties of the first.
  //    e.g. death age: ['birth date', 'death date'], and age: ['birth date']
  PPRPair: [],
  shouldUpdatePriorityRules: false,
  shouldUpdatePriorityRulesMuted: false
}

// mutations
const mutations = {
  [types.START_PROCESSING_CONTENT] (state) {
    state.isProcessingContent = true
    state.processingErrorMsg = null
    state.isProcessingSucceeded = false
    state.processingStatusMsg = 'Processing content...'
    state.entries = []
  },
  [types.STOP_PROCESSING_CONTENT] (state, {entries = [], error = ''}) {
    state.isProcessingContent = false
    state.isProcessingSucceeded = error === ''
    state.entries = entries
    if (entries.length === 0) {
      state.processingErrorMsg = 'No entry detected. Please rephrase your sentence.'
    } else {
      state.processingErrorMsg = error
    }
    state.processingStatusMsg = ''
  },
  [types.UPDATE_PROCESSING_ERROR_MSG] (state, newValue) {
    state.processingErrorMsg = newValue
  },
  [types.UPDATE_ENTRIES] (state, newValue) {
    state.entries = newValue
  },
  [types.UPDATE_CONTENT] (state, newValue) {
    state.content = newValue
  },
  [types.UPDATE_PPR_DIALOG_VISIBILITY] (state, newValue) {
    state.isPPRDialogVisible = newValue
  },
  [types.UPDATE_PPR_PAIR] (state, newValue) {
    state.PPRPair = newValue
  },
  [types.UPDATE_SHOULD_UPDATE_PRIORITY_RULES] (state, newValue) {
    state.shouldUpdatePriorityRules = newValue
  },
  [types.UPDATE_SHOULD_UPDATE_PRIORITY_RULES_MUTED] (state, newValue) {
    state.shouldUpdatePriorityRulesMuted = newValue
  }
}

export default new Vuex.Store({
  state,
  actions,
  getters,
  mutations,
  modules: {
    ls: LocalStorage
  },
  strict: debug,
  plugins: []
})
