<template>
  <div id="entity-same-as-view">
    <div style="margin-top: -15px; margin-bottom: 10px;">
      Original Entity: 
      <el-tag type="gray">{{entity}}</el-tag>
    </div>
    <span v-if="sameAsList.length === 0" style="font-size: 12px;">No "sameAs" for {{entity}}.</span>
    <div v-if="sameAsList.length !== 0" style="font-size: 12px; margin: 10px 0;">Stored sameAs list:</div>
    <table style="width: 100%;">
      <tr v-for="name in sameAsList">
        <td>•</td>
        <td>
          <el-tag type="gray">{{name}}</el-tag>
        </td>
        <td align="right">
          <el-button size="small" type="text" style="color: #FF4949;" @click="removeSameAs(name)">
            remove
          </el-button>
          <el-button size="small" type="text" style="color: #58B7FF;" 
            v-if="name !== sameAsDefault"
            @click="toggleDefault(name, false)"
          >
            default
          </el-button>
          <el-button size="small" type="text" style="color: #58B7FF;" 
            v-if="name === sameAsDefault"
            @click="toggleDefault(name, true)"
          >
            undefault
          </el-button>
          <el-button size="small" type="text" style="color: #13CE66" @click="replace(name)">replace</el-button>
        </td>
      </tr>
    </table>
    <div style="font-size: 12px; margin: 10px 0;">More Search Results:</div>
    <table style="width: 100%;">
      <tr v-for="name in moreSearchResult">
        <td>•</td>
        <td>
          <el-tag type="gray">{{name}}</el-tag>
        </td>
        <td align="right">
          <el-button size="small" type="text" style="color: #58B7FF" @click="use(name)">use</el-button>
        </td>
      </tr>
    </table>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { UPDATE_LOCAL_STORAGE_STATE } from '../store/types'
export default {
  name: 'entity-same-as-view',
  props: ['entity', 'moreSearchResult'],
  data () {
    return {
      sameAs: {}
    }
  },
  computed: {
    ...mapState({
      sameAsUpdated: state => state.ls.sameAs
    }),
    sameAsList () {
      return this.sameAs.list
    },
    sameAsDefault () {
      return this.sameAs.default
    }
  },
  created () {
    let allSameAs = this.$ls.get('sameAs', {})
    this.sameAs = allSameAs[this.entity] || {}
  },
  watch: {
    sameAsUpdated () {
      let allSameAs = this.$ls.get('sameAs', {})
      this.sameAs = allSameAs[this.entity] || {}
    }
  },
  methods: {
    removeSameAs (name) {
      this.isRemovePopoverVisible = false
      this.sameAs.list.splice(this.sameAs.list.indexOf(name), 1)
      if (this.sameAs.default === name) {
        this.sameAs.default = null
      }
      let allSameAs = this.$ls.get('sameAs', {})
      allSameAs[this.entity] = this.sameAs
      this.$ls.set('sameAs', allSameAs)
    },
    toggleDefault (name, wasDefault) {
      if (wasDefault) {
        this.sameAs.default = null
      } else {
        this.sameAs.default = name
      }
      let allSameAs = this.$ls.get('sameAs', {})
      allSameAs[this.entity] = this.sameAs
      this.$ls.set('sameAs', allSameAs)
    },
    replace (name) {
      this.$emit('close')
      this.$emit('loadReplacingPair', name)
    },
    use (name) {
      this.addSameAs(name)
      this.replace(name)
    },
    addSameAs (name) {
      let allSameAs = this.$ls.get('sameAs', {})
      let sameAsCurrentEntity = allSameAs[this.entity] || { list: [], default: null }
      if (sameAsCurrentEntity.list.indexOf(name) === -1) {
        sameAsCurrentEntity.list.push(name)
        allSameAs[this.entity] = sameAsCurrentEntity
        this.$ls.set('sameAs', allSameAs)
        this.$store.commit(UPDATE_LOCAL_STORAGE_STATE, 'sameAs')
      }
    }
  }
}
</script>

<style>
</style>
