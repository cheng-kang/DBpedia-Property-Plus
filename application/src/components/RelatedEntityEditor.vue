<template>
  <div id="related-entity-editor">
    <div style="margin-bottom: 10px;">
      Original Entity: 
      <el-tag type="gray">{{entity}}{{isEntityExist ? '' : ` (${pageName})`}}</el-tag>
    </div>
    <el-form :model="form" :rules="rules" label-width="128px" label-position="left">
      <el-form-item label="Type:">
        <el-radio-group v-model="form.type">
          <el-radio label="sameAs"></el-radio>
          <el-radio label="wikiPageDisambiguates"></el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label='Related Entity:' prop="relatedEntity">
        <el-input v-model="form.relatedEntity" :class="{ validated: validated }"/>
        <el-button type="primary" :class="{ invalidated: !validated }" @click="add">Confirm</el-button>
      </el-form-item>
    </el-form>
    <div v-show="validated" style="font-size: 12px; text-align: center;">Found DBpedia page <a :href="`http://dbpedia.org/page/${form.relatedEntity.replace(/\s/g, '_')}`" target="blank">{{form.relatedEntity}}</a>!</div>
  </div>
</template>

<script>
import Vue from 'vue'
import { UPDATE_LOCAL_STORAGE_STATE } from '../store/types'
export default {
  name: 'related-entity-editor',
  props: ['entity', 'pageName'],
  data () {
    return {
      isRemovePopoverVisible: false,
      form: {
        relatedEntity: '',
        type: 'sameAs'
      },
      rules: {
        relatedEntity: [
          { validator: this.validate, trigger: 'change' }
        ]
      },
      validated: false
    }
  },
  computed: {
    isEntityExist () {
      return this.entity === this.pageName
    }
  },
  methods: {
    add () {
      let type = this.form.type
      let relatedEntity = this.form.relatedEntity
      let all = this.$ls.get(type, {})
      let current = all[this.entity] || (type === 'sameAs' ? { list: [], default: null } : {list: []})
      if (current.list.indexOf(relatedEntity) === -1) {
        current.list.push(relatedEntity)
        all[this.entity] = current
        this.$ls.set(type, all)
        this.$store.commit(UPDATE_LOCAL_STORAGE_STATE, type)
      }
      this.form.type = 'sameAs'
      this.form.relatedEntity = ''
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
