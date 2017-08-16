import { UPDATE_LOCAL_STORAGE_STATE } from '../types'

// initial state
const state = {
  preference: 0,
  priorityRule: 0,
  priorityRuleMuted: 0,
  sameAs: 0
}

// getters
const getters = {
}

// actions
const actions = {
}

// mutations
const mutations = {
  [UPDATE_LOCAL_STORAGE_STATE] (state, which) {
    state[which] += 1
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}
