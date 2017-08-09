import * as types from '../mutation-types'

// initial state
const state = {
  showObjectLibrary: true,
  showMediaLibrary: false,
  showAttributeInspector: true,
  showConstraintInspector: false
}

// getters
const getters = {
}

// actions
const actions = {
}

// mutations
const mutations = {
  [types.UTIL_AREA_SWITCH_TAB] (state, { which }) {
    console.log(which)
    switch (which) {
      case 'obj':
        state.showObjectLibrary = true
        state.showMediaLibrary = false
        break
      case 'media':
        state.showMediaLibrary = true
        state.showObjectLibrary = false
        break
    }
  },
  [types.SWITCH_UTILITY_AREA_INSPECTOR] (state, which) {
    switch (which) {
      case 'attr':
        state.showAttributeInspector = true
        state.showConstraintInspector = false
        break
      case 'c':
        state.showAttributeInspector = false
        state.showConstraintInspector = true
        break
    }
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}
