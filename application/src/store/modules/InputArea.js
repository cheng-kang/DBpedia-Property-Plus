import * as types from '../mutation-types'

// initial state
const state = {
  lastSentence: '',
  contentToProcess: '',
  isProcessingContent: false
}

// getters
const getters = {
}

// actions
const actions = {
}

// mutations
const mutations = {
  [types.UPDATE_LAST_SENTENCE] (state, newValue) {
    if (state.lastSentence !== newValue) {
      state.lastSentence = newValue
    }
  },
  [types.UPDATE_CONTENT_TO_PROCESS] (state, newValue) {
    if (state.contentToProcess !== newValue) {
      state.contentToProcess = newValue
    }
  },
  [types.UPDATE_IS_PROCESSING_CONTENT] (state, newValue) {
    state.isProcessingContent = newValue
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}
