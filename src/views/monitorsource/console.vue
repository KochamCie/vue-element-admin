<template>
  <div><iframe :src='this.src' id='show' width='100%' height="780px"  ></iframe></div>
</template>

<style scoped>
  p {
    color: red
  }
</style>
<script>
  export default {
    data() {
      return {
        src: 'https://www.baidu.com'
      }
    },
    mounted() {
      console.log(this.$route.meta.src)
      this.src = this.$route.meta.src
    },
    methods: {}
  }
</script>
