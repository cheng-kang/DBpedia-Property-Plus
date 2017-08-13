<template>
  <div class="content-suggestion">
    <el-card class="box-card">
      <div style="color: #8492A6; font-weight: bold;">Content:</div>
      <div class="text-box" v-html="content"></div>
      <!-- <div style="color: #8492A6; font-weight: bold;">Operations:</div> -->
      <table style="width: 100%;">
        <tr>
          <td style="font-size: 12px;">
            Copy
          </td>
          <td align="right">
            <el-button-group>
              <el-button size="mini" v-clipboard:copy="content" @click="toast">HTML</el-button>
              <el-button size="mini" v-clipboard:copy="extractTextContent()" @click="toast">Text</el-button>
            </el-button-group>
          </td>
        </tr>
        <!-- <tr>
          <td style="font-size: 12px;">
            Replace
          </td>
          <td align="right">
            <el-button-group>
              <el-button size="mini">Sentence</el-button>
              <el-button size="mini">Entity</el-button>
            </el-button-group>
          </td>
        </tr>
        <tr>
          <td style="font-size: 12px;">
            Append to
          </td>
          <td align="right">
            <el-button-group>
              <el-button size="mini">Sentence</el-button>
              <el-button size="mini">Editor</el-button>
            </el-button-group>
          </td>
        </tr> -->
      </table>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'content-suggestion',
  props: [
    'content'
  ],
  data () {
    return {
    }
  },
  methods: {
    extractTextContent () {
      let span = document.createElement('span')
      span.innerHTML = this.content
      return span.textContent || span.innerText
    },
    toast (e, msg = 'Copied!', type = 'success') {
      this.$message({
        message: msg,
        type: type
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
