import {
  MOUSE_DOWN_ON_PAGE,
  MOUSE_DOWN_ON_OBJECT,
  MOUSE_UP_ON_LIB_CELL,
  SET_SELECTED_OBJECT,
  SET_MULTI_SELECTION_MODE,
  MOUSE_DOWN_ON_DOC_OUTLINE_CELL,
  SET_IS_FOCUS,
  ADD_CONSTRAINT,
  SET_SELECTED_CONSTRAINT,
  UPDATE_SELECTED_CONSTRAINT
} from '../mutation-types'

// initial state
const state = {
  mouseDownPosition: {x: 0, y: 0}, // 鼠标点击位置
  mouseDownObjectStatus: {x: 0, y: 0, w: 0, h: 0}, // 鼠标点击时被点击元素的位置、宽高
  mouseUpPosition: {x: 0, y: 0}, // 鼠标松开时在对应坐标系中的位置

  selectedObject: null,
  selectedObjectVue: null,
  selectedObjects: [],
  selectedObjectsLastPosList: [],
  isEditingObjectName: false,
  isMultiSelectMode: false,
  isFocus: false,
  focusInputName: null,

  constraints: [],
  selectedConstraint: null,

  dragOverPage: null,
  onDragEvent: null
}

// getters
const getters = {
}

// actions
const actions = {
}

// mutations
const mutations = {
  [MOUSE_DOWN_ON_PAGE] (state, { e }) {
    let ele = e.target
    state.mouseDownPosition = {
      x: parseFloat(e.pageX),
      y: parseFloat(e.pageY)
    }
    let eleStyle = window.getComputedStyle(ele)
    state.mouseDownObjectStatus = {
      x: parseFloat(eleStyle.left),
      y: parseFloat(eleStyle.top),
      w: parseFloat(eleStyle.width),
      h: parseFloat(eleStyle.height)
    }
    state.selectedObject = null
    state.selectedObjects = []
    console.log('Deselect')
  },
  [MOUSE_DOWN_ON_OBJECT] (state, e) {
    let ele = e.target
    if (ele.className.indexOf('children') !== -1) {
      ele = ele.parentNode
    }
    // console.log(ele)
    state.mouseDownPosition = {
      x: parseFloat(e.pageX),
      y: parseFloat(e.pageY)
    }

    let eleId = ele.getAttribute('al-id')
    console.log(state)
    handleSelection(state, eleId)
  },
  [MOUSE_DOWN_ON_DOC_OUTLINE_CELL] (state, id) {
    handleSelection(state, id)
  },
  [MOUSE_UP_ON_LIB_CELL] (state, e) {
    console.log('Mouse Up')
    state.mouseUpPosition = {
      x: parseFloat(e.layerX),
      y: parseFloat(e.layerY)
    }
  },
  [SET_SELECTED_OBJECT] (state, { obj }) {
    state.selectedObject = obj
  },
  [SET_MULTI_SELECTION_MODE] (state, newValue) {
    console.log(newValue)
    state.isMultiSelectMode = newValue
  },
  [SET_IS_FOCUS] (state, { isFocus, inputName = '' }) {
    state.isFocus = isFocus
    state.focusInputName = inputName
  },
  [ADD_CONSTRAINT] (state, constraint) {
    state.constraints.push(constraint)
  },
  [SET_SELECTED_CONSTRAINT] (state, newValue) {
    state.selectedConstraint = newValue
  },
  [UPDATE_SELECTED_CONSTRAINT] (state, { which, value }) {
    switch (which) {
      case 'Object':
        state.selectedConstraint.item = value
        break
      case 'Attribute':
        state.selectedConstraint.attribute = value
        break
      case 'Relation':
        state.selectedConstraint.relatedBy = value
        break
      case 'To Object':
        state.selectedConstraint.toItem = value
        break
      case 'To Attribute':
        state.selectedConstraint.toAttribute = value
        break
      case 'Multiplier':
        state.selectedConstraint.multiplier = value
        break
      case 'Constant':
        state.selectedConstraint.constant = value
        break
    }
  }
}

function handleSelection (state, id) {
  let ele = document.getElementById(`al-object-${id}`)
  if (state.isMultiSelectMode) {
    if (state.selectedObject === null) {
      state.selectedObject = id
      state.selectedObjects = []
      state.selectedObjectsLastPosList = []
      console.log('Select')

      let eleStyle = window.getComputedStyle(ele)
      state.mouseDownObjectStatus = {
        x: parseFloat(eleStyle.left),
        y: parseFloat(eleStyle.top),
        w: parseFloat(eleStyle.width),
        h: parseFloat(eleStyle.height)
      }
    } else {
      state.selectedObjects.push(state.selectedObject)
      state.selectedObject = null

      if (state.selectedObjects.indexOf(id) !== -1) {
        console.log('Multi Select -')
        state.selectedObjects.splice(state.selectedObjects.indexOf(id), 1)
        state.selectedObjectsLastPosList.splice(state.selectedObjects.indexOf(id), 1)
      } else {
        let eleLevel = ele.getAttribute('al-level')
        let selectedLevel = document.getElementById(`al-object-${state.selectedObjects[0]}`).getAttribute('al-level')
        if (eleLevel < selectedLevel) {
          console.log('eleLevel < selectedLevel')
          state.selectedObject = id
          state.selectedObjects = []
          state.selectedObjectsLastPosList = []

          let eleStyle = window.getComputedStyle(ele)
          state.mouseDownObjectStatus = {
            x: parseFloat(eleStyle.left),
            y: parseFloat(eleStyle.top),
            w: parseFloat(eleStyle.width),
            h: parseFloat(eleStyle.height)
          }
        } else if (eleLevel === selectedLevel) {
          console.log('eleLevel === selectedLevel')
          console.log('Multi Select +')
          state.selectedObjects.push(id)
        } else {
          console.log('eleLevel > selectedLevel')
          ele = ele.parentNode
          console.log(ele)
          console.log(document.getElementById(`al-object-${state.selectedObjects[0]}`))
          while (ele.getAttribute('al-level') !== selectedLevel) {
            ele = ele.parentNode
          }
          console.log('Multi Select +')
          state.selectedObjects.push(ele.getAttribute('al-id'))
        }
      }
    }
  } else {
    state.selectedObjectsLastPosList = []
    for (let i = 0; i < state.selectedObjects.length; i++) {
      let ele = document.getElementById(`al-object-${state.selectedObjects[i]}`)
      let eleStyle = window.getComputedStyle(ele)
      state.selectedObjectsLastPosList.push({
        x: parseFloat(eleStyle.left),
        y: parseFloat(eleStyle.top)
      })
    }

    if (state.selectedObjects.indexOf(id) !== -1) {
      return
    }
    state.selectedObject = id
    state.selectedObjects = []
    state.selectedObjectsLastPosList = []
    console.log('Select')

    let eleStyle = window.getComputedStyle(ele)
    state.mouseDownObjectStatus = {
      x: parseFloat(eleStyle.left),
      y: parseFloat(eleStyle.top),
      w: parseFloat(eleStyle.width),
      h: parseFloat(eleStyle.height)
    }
  }
}
export default {
  state,
  getters,
  actions,
  mutations
}
