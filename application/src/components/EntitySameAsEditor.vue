<template>
  <div id="entity-same-as-editor">
    <div style="margin-bottom: 10px;">
      Original Entity: 
      <el-tag type="gray">{{entity}}</el-tag>
    </div>
    <el-form :model="form" :rules="rules" label-width="128px" label-position="left">
      <el-form-item label='"sameAs" Entity:' prop="sameAs">
        <el-input v-model="form.sameAs" :class="{ validated: validated }"/>
        <el-button type="primary" :class="{ invalidated: !validated }" @click="addSameAs">Confirm</el-button>
      </el-form-item>
    </el-form>
    <div v-show="validated" style="font-size: 12px; text-align: center;">Found DBpedia page <a :href="`http://dbpedia.org/page/${form.sameAs.replace(/\s/g, '_')}`" target="blank">{{form.sameAs}}</a>!</div>
  </div>
</template>

<script>
import Vue from 'vue'
import { UPDATE_LOCAL_STORAGE_STATE } from '../store/types'
export default {
  name: 'entity-same-as-editor',
  props: ['entity'],
  data () {
    return {
      isRemovePopoverVisible: false,
      form: {
        sameAs: ''
      },
      rules: {
        sameAs: [
          { validator: this.validate, trigger: 'blur, change' }
        ]
      },
      validated: false
    }
  },
  computed: {
    aliasList () {
      let allAlias = this.$ls.get('alias', {})
      return allAlias[this.entity] || []
    }
  },
  methods: {
    addSameAs () {
      let allSameAs = this.$ls.get('sameAs', {})
      let sameAsCurrentEntity = allSameAs[this.entity] || { list: [], default: null }
      if (sameAsCurrentEntity.list.indexOf(this.form.sameAs) === -1) {
        sameAsCurrentEntity.list.push(this.form.sameAs)
        allSameAs[this.entity] = sameAsCurrentEntity
        this.$ls.set('sameAs', allSameAs)
        this.$store.commit(UPDATE_LOCAL_STORAGE_STATE, 'sameAs')
      }
      this.form.value = ''
      this.$emit('close')
    },
    validate (rule, value, callback) {
      this.validated = false
      const that = this
      if (value === '') {
        callback(new Error('Entity name can not be null'))
      } else {
        Vue.http.get(`http://dbpedia.org/page/${value.replace(/\s/g, '_')}`).then(res => {
          callback()
          that.validated = true
        }, res => {
          callback(new Error(`DBpedia page of "${value}" doesn't exist`))
        })
      }
    }
  }
}
</script>

<style>
.el-input.validated {
  width: calc(100% - 90px);
}
.el-button.invalidated {
  display: none;
}
</style>
