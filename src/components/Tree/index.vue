<template>
  <div>
  <el-input
    placeholder="输入关键字进行过滤"
    v-model="filterText">
  </el-input>

  <el-tree
    class="filter-tree"
    :data="data2"
    :props="defaultProps"
    :filter-node-method="filterNode"
    ref="tree2">
  </el-tree>
  </div>
</template>

<script>
  import { getRepoTree } from '@/api/gayhub'
  export default {
    watch: {
      filterText(val) {
        this.$refs.tree2.filter(val)
      }
    },
    created() {
      this.getTree()
    },
    methods: {
      getTree() {
        this.listLoading = true
        console.log('getList method')
        getRepoTree('FC1544F7-7CC4-49D9-A506-062C2A49EC5F').then(response => {
          console.log('getRepoTree')
          console.log(response.data.data)
          this.data2 = response.data.data
          this.listLoading = false
        })
      },
      filterNode(value, data) {
        if (!value) return true
        return data.label.indexOf(value) !== -1
      }
    },

    data() {
      return {
        filterText: '',
        data2: [],
        defaultProps: {
          children: 'children',
          label: 'label'
        }
      }
    }
  }
</script>
