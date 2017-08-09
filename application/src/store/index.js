import Vue from 'vue'
import Vuex from 'vuex'
import * as types from './types'
import * as actions from './actions'
import * as getters from './getters'

Vue.use(Vuex)

const debug = process.env.NODE_ENV !== 'production'

const state = {
  lastSentence: '',
  content: 'birth date of Albert Einstein',
  isProcessingContent: false,
  isProcessingSucceeded: false,
  processingStatusMsg: '',
  processingErrorMsg: '',
  entries: []
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
    state.processingErrorMsg = error
    state.processingStatusMsg = ''
  },
  [types.UPDATE_PROCESSING_STATUS_MSG] (state, newValue) {
    state.processingStatusMsg = newValue
  },
  [types.UPDATE_PROCESSING_ERROR_MSG] (state, newValue) {
    state.processingErrorMsg = newValue
  },
  [types.UPDATE_ENTRIES] (state, newValue) {
    state.entries = newValue
  },
  [types.UPDATE_CONTENT] (state, newValue) {
    state.content = newValue
  }
}

export default new Vuex.Store({
  state,
  actions,
  getters,
  mutations,
  strict: debug,
  plugins: []
})
