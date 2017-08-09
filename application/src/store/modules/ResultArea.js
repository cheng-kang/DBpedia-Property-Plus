import * as types from '../mutation-types'

// initial state
const state = {
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
  [types.SET_IS_STORYBOARD_DOM_CHANGED] (state, newValue) {
    state.isStoryboardDOMChanged = newValue
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}
