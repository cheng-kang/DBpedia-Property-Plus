<template>
  <div class="property-value">
    <template
      v-if="property.type === 'uri'"
    >
      <a :href="property.value" target="blank">{{property.value.substr(property.value.lastIndexOf('/') + 1).replace(/_/g, ' ')}}</a>
    </template>
    <template
      v-if="property.type !== 'uri'"
      >
      {{property.value}}
    </template>
  </div>
</template>

<script>
export default {
  name: 'property-value',
  props: [
    'property'
  ],
  data () {
    return {
    }
  },
  methods: {
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.property-value {
  display: inline-block;
}
a {
  color: #4078c0;
  text-decoration: none;
}
</style>
