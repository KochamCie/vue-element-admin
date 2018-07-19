<template>
  <div class="tab-container">

    <div class="filter-container">
      <el-input @keyup.enter.native="handleFilter" style="width: 200px;" class="filter-item"
                :placeholder="$t('table.title')" v-model="listQuery.title">
      </el-input>
      <el-select clearable style="width: 90px" class="filter-item" v-model="listQuery.importance"
                 :placeholder="$t('table.importance')">
        <el-option v-for="item in importanceOptions" :key="item" :label="item" :value="item">
        </el-option>
      </el-select>
      <el-select clearable class="filter-item" style="width: 130px" v-model="listQuery.type"
                 :placeholder="$t('table.type')">
        <el-option v-for="item in  moduleTypeOptions" :key="item.key" :label="item.display_name+'('+item.key+')'"
                   :value="item.key">
        </el-option>
      </el-select>
      <el-select @change='handleFilter' style="width: 140px" class="filter-item" v-model="listQuery.sort">
        <el-option v-for="item in sortOptions" :key="item.key" :label="item.label" :value="item.key">
        </el-option>
      </el-select>
      <el-button class="filter-item" type="primary" v-waves icon="el-icon-search" @click="handleFilter">
        {{$t('table.search')}}
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" @click="handleCreate" type="primary"
                 icon="el-icon-edit">{{$t('table.add')}}
      </el-button>
      <el-button class="filter-item" type="primary" :loading="downloadLoading" v-waves icon="el-icon-download"
                 @click="handleDownload">{{$t('table.export')}}
      </el-button>
      <el-checkbox class="filter-item" style='margin-left:15px;' @change='tableKey=tableKey+1' v-model="showReviewer">
        {{$t('table.reviewer')}}
      </el-checkbox>
    </div>

    <el-table :key='tableKey' :data="list" v-loading="listLoading" element-loading-text="给我一点时间" border fit
              highlight-current-row
              style="width: 100%">
      <el-table-column align="center" :label="$t('id')" width="65" v-if="false">
        <template slot-scope="scope">
          <span>{{scope.row.id}}</span>
        </template>
      </el-table-column>
      <el-table-column width="150px" align="center" :label="$t('createTime')" sortable>
        <template slot-scope="scope">
          <span>{{scope.row.createTime | parseTime('{y}-{m}-{d} {h}:{i}')}}</span>
        </template>
      </el-table-column>
      <el-table-column width="110px" align="center" :label="$t('module')">
        <template slot-scope="scope">
          <el-tag>{{scope.row.module}}</el-tag>
        </template>
      </el-table-column>
      <el-table-column width="110px" align="center" :label="$t('ip')">
        <template slot-scope="scope">
          <span>{{scope.row.ip}}</span>
        </template>
      </el-table-column>
      <el-table-column width="110px" align="center" :label="$t('port')" sortable>
        <template slot-scope="scope">
          <span>{{scope.row.port}}</span>
        </template>
      </el-table-column>

      <el-table-column min-width="110px" align="center" :label="$t('description')">
        <template slot-scope="scope">
          <span>{{scope.row.description}}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" :label="$t('actions')" width="300" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" @click="handleUpdate(scope.row)">{{$t('table.edit')}}</el-button>
          <el-button type="success" v-if="scope.row.publish == false" size="small" @click="handlePublish(scope.row)">{{$t('table.publish')}}</el-button>
          <el-button type="info" v-if="scope.row.publish == true" size="small " @click="handlePublish(scope.row)">{{$t('table.unPublish')}}</el-button>
          <el-button type="danger"  size="mini" @click="handleDelete(scope.row,'deleted')">{{$t('table.delete')}}</el-button>
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
      <el-form :rules="rules" ref="dataForm" :model="moduleForm" label-position="left" label-width="100px"
               style='width: 400px; margin-left:50px;'>
        <el-form-item :label="$t('ip')" prop="ip">
          <el-input v-model="moduleForm.ip"></el-input>
        </el-form-item>

        <el-form-item :label="$t('port')" prop="port">
          <el-input-number v-model="moduleForm.port"></el-input-number>
        </el-form-item>

        <el-form-item :label="$t('module')" prop="module">
          <el-select class="filter-item" v-model="moduleForm.module" placeholder="Please select">
            <el-option v-for="item in  moduleTypeOptions" :key="item.key" :label="item.display_name" :value="item.key">
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item :label="$t('description')" prop="description">
          <el-input v-model="moduleForm.description"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">{{$t('table.cancel')}}</el-button>
        <el-button v-if="dialogStatus=='create'" type="primary" @click="createData">{{$t('table.confirm')}}</el-button>
        <el-button v-else type="primary" @click="updateData">{{$t('table.confirm')}}</el-button>
      </div>
    </el-dialog>

    <el-dialog title="Reading statistics" :visible.sync="dialogPvVisible">
      <el-table :data="pvData" border fit highlight-current-row style="width: 100%">
        <el-table-column prop="key" label="Channel"></el-table-column>
        <el-table-column prop="pv" label="Pv"></el-table-column>
      </el-table>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="dialogPvVisible = false">{{$t('table.confirm')}}</el-button>
      </span>
    </el-dialog>

  </div>
</template>

<script>
  import tabPane from './components/tabPane'
  import complexTable from '@/views/table/complexTable'
  import { fetchPv, updateArticle } from '@/api/article'
  import { getSource, createSource, deleteSource, publishSource } from '@/api/monitorsource'
  import { parseTime } from '@/utils'
  import waves from '@/directive/waves'
  import router from '@/router'
  // import { asyncRouterMap } from '@/router'

  const moduleTypeOptions = [
    { key: 'SBADMIN', display_name: 'SBADMIN' },
    { key: 'DRUID', display_name: 'DRUID' },
    { key: 'EUREKA', display_name: 'EUREKA' }
  ]
  export default {
    name: 'tab',
    directives: {
      waves
    },
    components: {
      tabPane, complexTable
    },
    data() {
      return {
        tabMapOptions: [
          { label: 'China', key: 'CN' },
          { label: 'USA', key: 'US' },
          { label: 'Japan', key: 'JP' },
          { label: 'Eurozone', key: 'EU' }
        ],
        activeName: 'CN',
        createdTimes: 0,
        moduleForm: {
          module: 'SBADMIN',
          ip: '',
          port: 8080,
          description: '',
          publish: false
        },
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
        importanceOptions: [1, 2, 3],
        moduleTypeOptions,
        sortOptions: [{ label: 'ID Ascending', key: '+id' }, { label: 'ID Descending', key: '-id' }],
        statusOptions: ['published', 'draft', 'deleted'],
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
          // ip: [{ required: true, message: 'ip is required', trigger: 'change' }],
          port: [{ required: true, message: 'port is required', trigger: 'change' }],
          module: [{ required: true, message: 'module is required', trigger: 'blur' }],
          description: [{ required: true, message: 'description is required', trigger: 'blur' }]
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
        getSource(this.listQuery).then(response => {
          console.log('getSource')
          console.log(response.data.data)
          this.list = response.data.data.content
          this.total = response.data.data.totalElements
          console.log(this.list)
          this.listLoading = false
        })
      },
      handleFilter() {
        this.listQuery.pageNo = 1
        this.getList()
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
        this.temp = {
          module: 'SBADMIN',
          ip: '',
          port: 8080,
          description: ''
        }
      },
      handleCreate() {
        this.resetModuleForm()
        this.dialogStatus = 'create'
        this.dialogFormVisible = true
        this.$nextTick(() => {
          this.$refs['dataForm'].clearValidate()
        })
      },
      createData() {
        this.$refs['dataForm'].validate((valid) => {
          if (valid) {
            createSource(this.moduleForm).then((res) => {
              this.dialogFormVisible = false
              if (this.handlerRes(res)) {
                this.list.unshift(this.moduleForm)
              }
            })
          }
        })
      },
      handleUpdate(row) {
        this.moduleForm = Object.assign({}, row)
        this.dialogStatus = 'update'
        this.dialogFormVisible = true
        this.$nextTick(() => {
          this.$refs['dataForm'].clearValidate()
        })
      },
      updateData() {
        this.$refs['dataForm'].validate((valid) => {
          if (valid) {
            const tempData = Object.assign({}, this.temp)
            tempData.timestamp = +new Date(tempData.timestamp) // change Thu Nov 30 2017 16:41:05 GMT+0800 (CST) to 1512031311464
            updateArticle(tempData).then(() => {
              for (const v of this.list) {
                if (v.id === this.temp.id) {
                  const index = this.list.indexOf(v)
                  this.list.splice(index, 1, this.temp)
                  break
                }
              }
              this.dialogFormVisible = false
              this.$notify({
                title: '成功',
                message: '更新成功',
                type: 'success',
                duration: 2000
              })
            })
          }
        })
      },
      handleDelete(row) {
        deleteSource(row.id).then((res) => {
          if (this.handlerRes(res)) {
            const index = this.list.indexOf(row)
            this.total--
            this.list.splice(index, 1)
          }
        })
      },
      handlePublish(row) {
        publishSource(row.id).then(res => {
          if (this.handlerRes(res)) {
            row.publish = !row.publish
            this.$store.dispatch('GetUserInfo').then((res) => {
              const roles = res.data.data.roles
              const sources = res.data.data.sources
              this.$store.dispatch('GenerateRoutes', { roles, sources }).then(() => {
                router.addRoutes(this.$store.getters.addRouters)
              })
            })
          }
        })
      },
      handleFetchPv(pv) {
        fetchPv(pv).then(response => {
          this.pvData = response.data.pvData
          this.dialogPvVisible = true
        })
      },
      handleDownload() {
        this.downloadLoading = true
        import('@/vendor/Export2Excel').then(excel => {
          const tHeader = ['timestamp', 'title', 'type', 'importance', 'status']
          const filterVal = ['timestamp', 'title', 'type', 'importance', 'status']
          const data = this.formatJson(filterVal, this.list)
          excel.export_json_to_excel({
            header: tHeader,
            data,
            filename: 'table-list'
          })
          this.downloadLoading = false
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
</style>
