import Vue from 'vue'
import * as types from './types'

export const processContent = ({commit}, content) => {
  commit(types.START_PROCESSING_CONTENT, true)

  let formData = new FormData()
  formData.append('string', content.indexOf(',') === -1 ? content : content + ':')

  Vue.http.post('http://10.7.6.213:8888/entries', formData).then(res => {
    commit(types.STOP_PROCESSING_CONTENT, {
      entries: res.body
    })
  }, res => {
    commit(types.STOP_PROCESSING_CONTENT, {
      error: 'Content processing failed.'
    })
  })
}
