<template>
  <div>
    <iframe :src='this.url' id='show' width='100%' height="780px"  ></iframe>
  </div>
</template>
<style>

</style>
<script>
alert('HtmlPanel in')
export default {
  // 使用时请使用 :url.sync=""传值
  props: {
    url: {
      required: true
    }
  },
  data() {
    return {
      loading: false,
      html: ''
    }
  },
  watch: {
    url(value) {
      this.load(value)
    }
  },
  mounted() {
    alert('mounted')
    this.load(this.url)
  },
  methods: {
    load(url) {
      alert(url)
      if (url && url.length > 0) {
        // 加载中
        this.loading = true
        const param = {
          accept: 'text/html, text/plain'
        }
        this.$http.get(url, param).then((response) => {
          this.loading = false
          // 处理HTML显示
          this.html = response.data
        }).catch(() => {
          this.loading = false
          this.html = '加载失败'
        })
      }
    }
  }
}
</script>
