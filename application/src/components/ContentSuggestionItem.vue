<template>
  <div class="content-suggestion">
    <el-card class="box-card">
      <div style="color: #8492A6; font-weight: bold;">Content:</div>
      <template v-if="content instanceof Array">
        <div class="text-box">
          <template v-for="(item, idx) in content">
            <template v-if="idx === 0">
              
            </template>
          </template>
        </div>
      </template>
      <template v-if="!(content instanceof Array)">
        {{content.map(item => {item.value})}}
      </template>
      <div class="text-box">{{content}}</div>
      <div style="color: #8492A6; font-weight: bold;">Operations:</div>
      <table style="width: 100%;">
        <tr>
          <td style="font-size: 12px;">
            Copy
          </td>
          <td align="right">
            <el-button-group>
              <el-button size="mini">Link</el-button>
              <el-button size="mini">Text</el-button>
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
  computed: {
    singleContent () {
      return this.content.value
    },
    multiContent () {
      let result = ''
      for (let i = 0; i < this.content.length; i++) {
        if (i === 0) {
          result += `${this.content[i]}`
        } else if (i === this.content.length - 1) {
          result += `, and ${this.content[i]}`
        } else {
          result += `, ${this.content[i]}`
        }
      }
      return result
    }
  },
  methods: {
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
