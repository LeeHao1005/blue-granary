<template>
  <div class="root-system">
    <!--按钮设置-->
    <div>
      <el-button type="primary"><a href="Amcap:">打开摄像头配置</a></el-button>
      <el-button type="primary" @click="selectShip">配置初始参数</el-button>
      <el-button type="primary" ><a href="STOP:">一键关闭服务</a></el-button>
    </div>
    <!--船舶信息显示-->
    <div v-if="use_set" class="shipData-div">
      <el-button type="primary" icon="el-icon-plus" @click="addShip_sure">新增船舶信息</el-button>
      <el-table :data="tableData"
                class="shipData"
                :header-cell-style="{background:'#eef1f6',color:'#606266'}"
      >
        <el-table-column v-for="(item, index) in tableLable"
                         :key="index"
                         :prop="item.prop"
                         :label="item.label"
                         align="center"
        >
        </el-table-column>
        <!--操作列-->
        <el-table-column label="操作" align="center">
          <template slot-scope="scope">
<!--            <el-link type="danger" @click="deleteShip(scope.row.shipId)">删除</el-link>-->
            <el-link type="primary" @click="updateShip_sure(scope.row.shipid)">编辑</el-link>
          </template>
        </el-table-column>
      </el-table>
      <div class="page-block">
        <el-pagination
          v-if="paginationShow"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page.sync="currentPage"
          :page-sizes="[10, 20, 30, 40]"
          :page-size="pageSize"
          layout="sizes, prev, pager, next"
          :total="total"
        >
        </el-pagination>
      </div>
    </div>
    <!--船舶信息对话框-->
    <div>
      <!--增加船舶信息对话框-->
      <el-dialog title="新增船舶信息"
                 :visible.sync="addShip_dialog"
                 @close="resetAddForms"
                 width="600px" append-to-body
      >
        <el-form ref="addShipForm"
                 :model="addShipForm"
                 :rules="addShipRules"
                 label-width="80px"
                 label-position="left"
        >
          <el-row>
<!--            <el-form-item label="船舶编号" prop="shipId">-->
<!--              <el-input placeholder="请输入船舶编号"-->
<!--                        v-model=addShipForm.shipId-->
<!--                        type="number"-->
<!--              />-->
<!--            </el-form-item>-->
            <el-form-item label="船舶名称" prop="shipName">
              <el-input placeholder="请输入船舶名称"
                        v-model=addShipForm.shipName
                        type="text"
                        @keyup.enter.native="addShip"
              />
            </el-form-item>
          </el-row>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button type="primary" @click="addShip">确 定</el-button>
          <el-button @click="addShip_dialog = false">取 消</el-button>
        </div>
      </el-dialog>
      <!--修改船舶信息对话框-->
      <el-dialog title="修改船舶信息"
                 :visible.sync="updateShip_dialog"
                 @close="resetUpdateForms"
                 width="600px" append-to-body
      >
        <el-form ref="updateShipForm"
                 :model="updateShipForm"
                 :rules="updateShipRules"
                 label-width="80px"
                 label-position="left"
        >
          <el-row>
            <el-form-item label="船舶名称" prop="shipName">
              <el-input placeholder="请输入船舶名称"
                        v-model=updateShipForm.shipName
                        type="text"
                        @keyup.enter.native="updateShip"
              />
            </el-form-item>
          </el-row>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button type="primary" @click="updateShip">确 定</el-button>
          <el-button @click="updateShip_dialog = false">取 消</el-button>
        </div>
      </el-dialog>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SystemConfig',
  data() {
    return {
      tableData: [],
      tableLable: [
        { label: '船舶编号', prop: 'shipid' },
        { label: '船舶名称', prop: 'shipname' },
      ],
      //是否显示船舶信息
      use_set: false,
      //是否显示对话框
      addShip_dialog: false,
      updateShip_dialog: false,
      //要修改或删除的船舶编号
      updateShipId:'',
      addShipForm: {
        // shipId: '',
        shipName: ''
      },
      addShipRules: {
        // shipId: [{ required: true, message: '船舶编号不能为空！', trigger: 'blur' }],

        shipName: [{ required: true, message: '船舶名称不能为空！', trigger: 'blur' }]
      },
      updateShipForm:{
        shipName: ''
      },
      updateShipRules: {
        shipName: [{ required: true, message: '船舶名称不能为空！', trigger: 'blur' }]
      },
      //分页信息
      total: null,
      paginationShow: true,
      currentPage: 1,
      pageSize: 10,
    }
  },
  mounted() {

  },
  methods: {
    // 处理页码大小变动时候触发的事件
    // 每页显示个数 int
    handleSizeChange(val) {
      var that = this
      that.pageSize = val
      that.currentPage = 1
      that.selectShip()
    },
    handleCurrentChange(val) {
      var that = this
      that.currentPage = val
      that.selectShip()
    },
    //增加船舶信息对话框
    addShip_sure() {
      this.addShip_dialog = true
    },
    //修改船舶信息对话框
    updateShip_sure(id){
      this.updateShip_dialog = true
      this.updateShipId = id
    },
    //重置新增船舶信息表单
    resetAddForms() {
      this.$refs['addShipForm'].resetFields()
      this.$refs['addShipForm'].clearValidate()
    },
    resetUpdateForms(){
      this.$refs['updateShipForm'].resetFields()
      this.$refs['updateShipForm'].clearValidate()
    },
    //设置初始参数
    selectShip() {
      //自动查询后台已有的信息并显示
      let that = this
      that.paginationShow = false;
      that.use_set = true
      that.tableData = null
      that.req({
        url:
          '/ships/getAllShips?' +
          'pageNum=' +
          that.currentPage +
          '&pageSize=' +
          that.pageSize,
        data: {},
        method: 'GET'
      }).then((res) => {
          if (res.code == 200) {
            that.total = res.data.total;
            that.tableData = res.data.list
          } else {
            this.$message.error(res.message)
          }
        },
        (err) => {
          this.$message.error(err.message)
        })

      this.$nextTick(function() {
        this.paginationShow = true
      })

    },
    addShip() {
      let that = this
      this.$refs.addShipForm.validate((valid) => {
        if (valid) {
          that.req({
            url: '/ships/createShip',
            data: {
              'shipname':that.addShipForm.shipName
            },
            method: 'POST'
          }).then(
            (res) => {
              if (res.code == 200) {
                that.$message({ message: '添加成功', type: 'success' })
                that.resetAddForms
                that.addShip_dialog = false
                that.selectShip()
              } else {
                this.$message.error(res.message)
              }
            },
            (err) => {
              this.$message.error(err.message)
            }
          )
        }
      })
    },
    updateShip() {
      let that = this
      this.$refs.updateShipForm.validate((valid) => {
        if (valid) {
          that.req({
            url: '/ships/updateShipName',
            data: {
              'shipid':that.updateShipId,
              'shipname' : that.updateShipForm.shipName
            },
            method: 'POST'
          }).then(
            (res) => {
              if (res.code == 200) {
                that.$message({ message: '修改成功', type: 'success' })
                that.resetUpdateForms
                that.updateShip_dialog = false
                that.selectShip()
              } else {
                this.$message.error(res.message)
              }
            },
            (err) => {
              this.$message.error(err.message)
            }
          )
        }
      })
    },
    deleteShip(id) {
      var that = this
      that.$confirm('此操作将永久删除该船舶信息, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        that.req({
          url:
            '/delete?username='+username,
          data: {},
          method: 'GET'
        }).then((res) => {
            if (res.code == 200) {
              this.$message({
                type: 'success',
                message: '删除成功!'
              })
              that.selectShip()
            } else {
              this.$message.error(res.message)
            }
          },
          (err) => {
            this.$message.error(err.message)
          })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    }
  }
}
</script>
<style lang="scss">
.root-system {
  margin: 50px auto;
  width: 90%;
}



.shipData-div {
  width: 100%;
  margin: 40px auto;
}
.shipData {
  width: 100%;
  border: 2px solid #eee;
  margin: 0 auto;
}
</style>

