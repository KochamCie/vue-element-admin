<template>
  <div class="tab-container">

    <el-tag
      :key="tag"
      v-for="tag in dynamicTags"
      closable
      :disable-transitions="false"
      @close="handleClose(tag)">
      {{tag}}
    </el-tag>
    <el-input
      class="input-new-tag"
      v-if="inputVisible"
      v-model="inputValue"
      ref="saveTagInput"
      size="small"
      @keyup.enter.native="handleInputConfirm"
      @blur="handleInputConfirm"
    >
    </el-input>
    <el-button v-else class="button-new-tag" size="small" @click="showInput">+ New Tag</el-button>



    <div class="filter-container">

      <el-button class="filter-item" style="margin-left: 10px;" @click="handleCreate" type="primary"
                 icon="el-icon-edit">{{$t('table.add')}}
      </el-button>
    </div>

    <el-table :key='tableKey' :data="list" v-loading="listLoading" element-loading-text="给我一点时间" border fit
              highlight-current-row
              style="width: 100%">
      <el-table-column align="center" :label="$t('id')" width="65" v-if="false">
        <template slot-scope="scope">
          <span>{{scope.row.id}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" :label="$t('createdDate')" sortable>
        <template slot-scope="scope">
          <span>{{scope.row.createdDate | parseTime('{y}-{m}-{d} {h}:{i}')}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" :label="$t('repoUserName')">
        <template slot-scope="scope">
          <span>{{scope.row.repoUserName}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" :label="$t('repoName')">
        <template slot-scope="scope">
          <span>{{scope.row.repoName}}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" :label="$t('actions')" width="300" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button type="primary" v-if="scope.row.initialed == true"  size="mini" style="width: 75px;" @click="handleGenerate(scope.row)">{{$t('table.generate')}}</el-button>
          <el-button type="danger" v-if="scope.row.initialed == true"  size="mini" @click="handleDelete(scope.row,'deleted')">{{$t('table.delete')}}</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-container">
      <el-pagination background @size-change="handleSizeChange" @current-change="handleCurrentChange"
                     :current-page="listQuery.pageNo" :page-sizes="[10,20,30, 50]" :page-size="listQuery.pageSize"
                     layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </div>

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form :rules="rules" ref="dataForm" :model="gitRepoForm" label-position="left" label-width="140px"
               style='width: 400px; margin-left:50px;'>

        <el-form-item :label="$t('id')" v-if="false">
          <el-input v-model="gitRepoForm.id"></el-input>
        </el-form-item>

        <el-form-item :label="$t('repoUserName')" prop="repoUserName">
          <el-input v-model="gitRepoForm.repoUserName"></el-input>
        </el-form-item>

        <el-form-item :label="$t('repoName')" prop="repoName">
          <el-input v-model="gitRepoForm.repoName"></el-input>
        </el-form-item>

      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">{{$t('table.cancel')}}</el-button>
        <el-button v-if="dialogStatus=='create'" type="primary" @click="createData">{{$t('table.confirm')}}</el-button>
        <!--<el-button v-else type="primary" @click="createData">{{$t('table.confirm')}}</el-button>-->
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import complexTable from '@/views/table/complexTable'
  import { getRepo, createRepo, deleteRepo, repoCodeInit } from '@/api/gayhub'
  import { parseTime } from '@/utils'
  import waves from '@/directive/waves'
//  import router from '@/router'
  export default {
    name: 'tab',
    directives: {
      waves
    },
    components: {
      complexTable
    },
    data() {
      return {
        dynamicTags: ['标签一', '标签二', '标签三'],
        inputVisible: true,
        inputValue: '',
        activeName: 'CN',
        createdTimes: 0,
        gitRepoForm: {
          id: '',
          repoUserName: 'KochamCie',
          repoName: 'mybatis-3'
        },
        temp: {},
        tableKey: 0,
        list: null,
        total: null,
        listLoading: true,
        listQuery: {
          pageNo: 1,
          pageSize: 20,
          importance: undefined,
          title: undefined,
          type: undefined,
          sort: '+id'
        },
        showReviewer: false,
        dialogFormVisible: false,
        dialogStatus: '',
        textMap: {
          update: 'Edit',
          create: 'Create'
        },
        dialogPvVisible: false,
        pvData: [],
        rules: {
          ip: [{ required: true, message: 'ip is required', trigger: 'change' }],
          repoUserName: [{ required: true, message: 'repoUserName is required', trigger: 'change' }],
          repoName: [{ required: true, message: 'repoName is required', trigger: 'blur' }]
        },
        downloadLoading: false
      }
    },
    created() {
      this.getList()
    },
    methods: {
      getList() {
        this.listLoading = true
        console.log('getList method')
        getRepo(this.listQuery).then(response => {
          console.log('getRepo')
          console.log(response.data.data)
          this.list = response.data.data.content
          this.total = response.data.data.totalElements
          console.log(this.list)
          this.listLoading = false
        })
      },
      handleDelete(row) {
        deleteRepo(row.id).then((res) => {
          if (this.handlerRes(res)) {
            const index = this.list.indexOf(row)
            this.total--
            this.list.splice(index, 1)
          }
        })
      },
      handleGenerate(row) {
        repoCodeInit(row.id).then((res) => {
          if (this.handlerRes(res)) {
            console.log('handleGenerate')
          }
        })
      },
      handleSizeChange(val) {
        this.listQuery.pageSize = val
        this.getList()
      },
      handleCurrentChange(val) {
        this.listQuery.pageNo = val
        this.getList()
      },
      handleModifyStatus(row, status) {
        this.$message({
          message: '操作成功',
          type: 'success'
        })
        row.status = status
      },
      resetModuleForm() {
        this.gitRepoForm = {
          id: '',
          repoUserName: '',
          repoName: ''
        }
      },
      handleClose(tag) {
        this.dynamicTags.splice(this.dynamicTags.indexOf(tag), 1)
      },

      showInput() {
        this.inputVisible = true
        this.$nextTick(_ => {
          this.$refs.saveTagInput.$refs.input.focus()
        })
      },

      handleInputConfirm() {
        var inputValue = this.inputValue
        if (inputValue) {
          this.dynamicTags.push(inputValue)
        }
        this.inputVisible = false
        this.inputValue = ''
      },
      handleCreate() {
        // this.resetModuleForm()
        this.dialogStatus = 'create'
        this.dialogFormVisible = true
        this.$nextTick(() => {
          this.$refs['dataForm'].clearValidate()
        })
      },
      createData() {
        this.$refs['dataForm'].validate((valid) => {
          if (valid) {
            createRepo(this.gitRepoForm).then((res) => {
              this.dialogFormVisible = false
              if (this.handlerRes(res)) {
                this.list.unshift(res.data.data)
              }
            })
          }
        })
      },
      formatJson(filterVal, jsonData) {
        return jsonData.map(v => filterVal.map(j => {
          if (j === 'timestamp') {
            return parseTime(v[j])
          } else {
            return v[j]
          }
        }))
      }
    }
  }
</script>

<style scoped>
  .tab-container {
    margin: 30px;
  }

  .el-tag + .el-tag {
    margin-left: 10px;
  }
  .button-new-tag {
    margin-left: 10px;
    height: 32px;
    line-height: 30px;
    padding-top: 0;
    padding-bottom: 0;
  }
  .input-new-tag {
    width: 90px;
    margin-left: 10px;
    vertical-align: bottom;
  }
</style>
