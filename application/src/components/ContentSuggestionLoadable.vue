<template>
  <div class="content-suggestion-loadable">
    <el-card class="box-card">
      <div style="color: #8492A6; font-weight: bold;">Content:</div>
      <div class="text-box" v-html="content"></div>
      <table style="width: 100%;">
        <tr>
          <td style="font-size: 12px;">
            Copy
          </td>
          <td align="right">
            <el-button-group>
              <el-button size="mini" v-clipboard:copy="content">HTML</el-button>
              <el-button size="mini" v-clipboard:copy="extractTextContent()">Text</el-button>
            </el-button-group>
          </td>
        </tr>
      </table>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'content-suggestion-loadable',
  props: [
    'script', 'contentData'
  ],
  data () {
    return {
      content: '',
      isLoadingContent: false
    }
  },
  created () {
    console.log(this)
  },
  methods: {
    extractTextContent () {
      let span = document.createElement('span')
      span.innerHTML = this.content
      return span.textContent || span.innerText
    },
    getContent () {
      let that = this
      this.content = ''
      this.isLoadingContent = true
      let formData = new FormData()
      formData.append('script', this.script)
      formData.append('contentData', this.contentData)
      this.$http.post('http://svm-kc1u16-test.ecs.soton.ac.uk:8888/customContent', formData).then(res => {
        that.content = res.body
        that.isLoadingContent = false
      }, res => {
        that.content = res.body
        that.isLoadingContent = false
      })
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.content-suggestion {
  margin-bottom: 10px;
}
a {
  color: #4078c0;
  text-decoration: none;
}
.text-box {
  width: 176px;
  max-height: 120px;
  border: 1px solid #dfe6ec;
  padding: 8px;
  border-radius: 5px;
  overflow: auto;
}
</style>
