<template>
  <div id="related-entity-view">
    <div style="margin-top: -15px; margin-bottom: 10px;">
      Original Entity: 
      <el-tag type="gray">{{entity}}{{isEntityExist ? '' : ` (${pageName})`}}</el-tag>
    </div>
    <span v-if="sameAsList.length === 0" style="font-size: 12px;">No "sameAs" for {{entity}}.</span>
    <div v-if="sameAsList.length !== 0" style="font-size: 12px; margin: 10px 0;">Stored "sameAs" list:</div>
    <table style="width: 100%;">
      <tr v-for="name in sameAsList">
        <td>•</td>
        <td>
          <el-tag type="gray">{{name}}</el-tag>
        </td>
        <td align="right">
          <el-button size="small" type="text" style="color: #FF4949;" @click="remove('sameAs', name)">
            remove
          </el-button>
          <el-button size="small" type="text" style="color: #58B7FF;" 
            v-if="name !== sameAsDefault"
            @click="toggleDefaultSameAs(name, false)"
          >
            default
          </el-button>
          <el-button size="small" type="text" style="color: #58B7FF;" 
            v-if="name === sameAsDefault"
            @click="toggleDefaultSameAs(name, true)"
          >
            undefault
          </el-button>
          <el-button size="small" type="text" style="color: #13CE66" @click="replace(name)">replace</el-button>
        </td>
      </tr>
    </table>
    <span v-if="wikiPageDisambiguatesList.length === 0" style="font-size: 12px;">No "wikiPageDisambiguates" for {{entity}}.</span>
    <div v-if="wikiPageDisambiguatesList.length !== 0" style="font-size: 12px; margin: 10px 0;">Stored "wikiPageDisambiguates" list:</div>
    <table style="width: 100%;">
      <tr v-for="name in wikiPageDisambiguatesList">
        <td>•</td>
        <td>
          <el-tag type="gray">{{name}}</el-tag>
        </td>
        <td align="right">
          <el-button size="small" type="text" style="color: #FF4949;" @click="remove('wikiPageDisambiguates', name)">
            remove
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
          <el-button size="small" type="text" style="color: #58B7FF" @click="use('sameAs', name)">sameAs</el-button>
          <el-button size="small" type="text" style="color: #58B7FF" @click="use('wikiPageDisambiguates', name)">wikiPageDisambiguates</el-button>
        </td>
      </tr>
    </table>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { UPDATE_LOCAL_STORAGE_STATE } from '../store/types'
export default {
  name: 'related-entity-view',
  props: ['entity', 'pageName', 'moreSearchResult'],
  data () {
    return {
      sameAs: {},
      wikiPageDisambiguates: {}
    }
  },
  computed: {
    ...mapState({
      sameAsUpdated: state => state.ls.sameAs,
      wikiPageDisambiguatesUpdated: state => state.ls.wikiPageDisambiguates
    }),
    isEntityExist () {
      return this.entity === this.pageName
    },
    sameAsList () {
      return this.sameAs.list
    },
    sameAsDefault () {
      return this.sameAs.default
    },
    wikiPageDisambiguatesList () {
      return this.wikiPageDisambiguates.list
    }
  },
  created () {
    let allSameAs = this.$ls.get('sameAs', {})
    this.sameAs = allSameAs[this.entity] || {list: [], default: null}
    let allWikiPageDisambiguates = this.$ls.get('wikiPageDisambiguates', {})
    this.wikiPageDisambiguates = allWikiPageDisambiguates[this.entity] || {list: []}
  },
  watch: {
    sameAsUpdated () {
      let allSameAs = this.$ls.get('sameAs', {})
      this.sameAs = allSameAs[this.entity] || {list: [], default: null}
    },
    wikiPageDisambiguatesUpdated () {
      let allWikiPageDisambiguates = this.$ls.get('wikiPageDisambiguates', {})
      this.wikiPageDisambiguates = allWikiPageDisambiguates[this.entity] || {list: []}
    }
  },
  methods: {
    remove (type, name) {
      this[type].list.splice(this[type].list.indexOf(name), 1)
      if (type === 'sameAs') {
        if (this[type].default === name) {
          this[type].default = null
        }
      }
      let all = this.$ls.get(type, {})
      all[this.entity] = this[type]
      this.$ls.set(type, all)

      // if (type === 'sameAs') {
      //   this.sameAs.list.splice(this.sameAs.list.indexOf(name), 1)
      //   if (this.sameAs.default === name) {
      //     this.sameAs.default = null
      //   }
      //   let allSameAs = this.$ls.get('sameAs', {})
      //   allSameAs[this.entity] = this.sameAs
      //   this.$ls.set('sameAs', allSameAs)
      // } else if (type === 'wikiPageDisambiguates') {
      //   this.wikiPageDisambiguates.list.splice(this.wikiPageDisambiguates.list.indexOf(name), 1)
      //   let allWikiPageDisambiguates = this.$ls.get('wikiPageDisambiguates', {})
      //   allWikiPageDisambiguates[this.entity] = this.wikiPageDisambiguates
      //   this.$ls.set('wikiPageDisambiguates', allWikiPageDisambiguates)
      // }
    },
    toggleDefaultSameAs (name, wasDefault) {
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
    use (type, name) {
      this.add(type, name)
      this.replace(name)
    },
    add (type, name) {
      let all = this.$ls.get(type, {})
      let current = all[this.entity] || type === 'sameAs' ? { list: [], default: null } : {list: []}
      if (current.list.indexOf(name) === -1) {
        current.list.push(name)
        all[this.entity] = current
        this.$ls.set(type, all)
        this.$store.commit(UPDATE_LOCAL_STORAGE_STATE, type)
      }
      // let allSameAs = this.$ls.get('sameAs', {})
      // let sameAsCurrentEntity = allSameAs[this.entity] || { list: [], default: null }
      // if (sameAsCurrentEntity.list.indexOf(name) === -1) {
      //   sameAsCurrentEntity.list.push(name)
      //   allSameAs[this.entity] = sameAsCurrentEntity
      //   this.$ls.set('sameAs', allSameAs)
      //   this.$store.commit(UPDATE_LOCAL_STORAGE_STATE, 'sameAs')
      // }
    }
  }
}
</script>

<style>
</style>
