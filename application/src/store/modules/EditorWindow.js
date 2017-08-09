import * as types from '../mutation-types'

// initial state
const state = {
  showNavigatorArea: false,
  showUtilityArea: true,
  showSizeConstraintEditor: false,

  isStoryboardDOMChanged: false
}

// getters
const getters = {
}

// actions
const actions = {
}

// mutations
const mutations = {
  [types.TOGGLE_AREA_DISPLAY] (state, { which }) {
    switch (which) {
      case 'nav':
        state.showNavigatorArea = !state.showNavigatorArea
        break
      case 'util':
        state.showUtilityArea = !state.showUtilityArea
        break
    }
  },
  [types.SET_IS_STORYBOARD_DOM_CHANGED] (state, newValue) {
    state.isStoryboardDOMChanged = newValue
  },
  [types.SET_SIZE_CONSTRAINT_EDITOR] (state, newValue) {
    console.log(newValue)
    state.showSizeConstraintEditor = newValue
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}
