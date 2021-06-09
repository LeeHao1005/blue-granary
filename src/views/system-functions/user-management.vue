<template>
  <div class="root">
    <!--查询条件-->
    <div>
      <el-form :inline="true">
        <el-form-item label="用户名">
          <el-input v-model="searchName"></el-input>
        </el-form-item>
        <el-form-item label="电话号码">
          <el-input v-model="searchPhone"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button icon="el-icon-search" type="primary" @click="searchUser">搜索</el-button>
        </el-form-item>
        <el-form-item>
          <el-button icon="el-icon-refresh" type="primary" @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    <el-button type="primary" icon="el-icon-plus" @click="register_sure" style="margin:20px auto 0 auto">新建用户</el-button>
    <div>
      <!--用户数据显示-->
      <div>
        <el-table :data="tableData"
                  class="userData"
                  :header-cell-style="{background:'#eef1f6',color:'#606266'}"
        >
          <el-table-column v-for="(item, index) in tableLable"
                           :key="index"
                           :prop="item.prop"
                           :label="item.label"
                           align="center"
          >
          </el-table-column>
          <!--状态列-->
          <el-table-column v-for="(item, index) in statusLable"
                           :key="item.id"
                           :prop="item.prop"
                           :label="item.label"
                           align="center"
          >
            <template slot-scope="scope">
              <el-switch
                v-model="scope.row.status"
                :active-value="1"
                :inactive-value="0"
                active-color="#13ce66"
                inactive-color="#ff4949"
                active-text="启用"
                inactive-text="停用"
                @change="changeStatus(scope.row.username,scope.row.status)"
              >
              </el-switch>
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center">
            <template slot-scope="scope">
              <el-link type="primary" @click="updatepsd_sure(scope.row.username)" style="right: 5px">重置密码</el-link>
              <el-link type="primary" @click="changeInfo_sure((scope.row.username))" style="right: 5px">编辑</el-link>
              <el-link type="danger" @click="deleteUser(scope.row.username)">删除</el-link>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <!--页面、页码-->
      <div class="block">
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
    <!--修改密码对话框-->
    <el-dialog title="密码修改"
               :visible.sync="password_dialog"
               @close="resetUpdatepswForms"
               width="600px" append-to-body
    >
      <el-form ref="updatepsdForm"
               :model="updatepsdForm"
               :rules="updatepsdRules"
               label-width="80px"
      >
        <el-row>
          <el-form-item label="旧密码" prop="old_password">
            <el-input placeholder="请输入旧密码"
                      v-model=updatepsdForm.old_password
                      type="text"
            />
          </el-form-item>
          <el-form-item label="新密码" prop="new_password">
            <el-input placeholder="请输入新密码"
                      v-model=updatepsdForm.new_password
                      type="text"
            />
          </el-form-item>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="updatePassword">确 定</el-button>
        <el-button @click="password_dialog = false">取 消</el-button>
      </div>
    </el-dialog>
    <!--增加用户对话框-->
    <el-dialog title="新增用户"
               :visible.sync="register_dialog"
               @close="resetRegisterForms"
               width="600px" append-to-body
    >
      <el-form ref="registerForm"
               :model="registerForm"
               :rules="registerRules"
               label-width="80px"
               label-position="left"
      >
        <el-row>
          <el-form-item label="用户名" prop="username">
            <el-input placeholder="请输入用户名"
                      v-model=registerForm.username
                      type="text"
            />
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input placeholder="请输入密码"
                      v-model=registerForm.password
                      type="text"
                      @keyup.enter.native="userRegister"
            />
          </el-form-item>
          <el-form-item label="电话号码" prop="phonenumber">
            <el-input placeholder="请输入电话号码"
                      v-model=registerForm.phonenumber
                      type="text"
            />
          </el-form-item>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="userRegister">确 定</el-button>
        <el-button @click="register_dialog = false">取 消</el-button>
      </div>
    </el-dialog>
    <!--编辑信息对话框-->
    <el-dialog title="编辑信息"
               :visible.sync="changeInfo_dialog"
               @close="resetChangeInfoForms"
               width="600px" append-to-body
    >
      <el-form ref="changeInfoForm"
               :model="changeInfoForm"
               :rules="changeInfoRules"
               label-width="80px"
               label-position="left"
      >
        <el-row>
          <el-form-item label="电话号码" prop="phone">
            <el-input placeholder="请输入新的电话号码"
                      v-model=changeInfoForm.phone
                      type="text"
            />
          </el-form-item>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="changeInfo">确 定</el-button>
        <el-button @click="changeInfo_dialog = false">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import login from '../login/index'
export default {
  name: 'UserManagement',

  data() {
    //验证注册时用户名
    const validateRegisterUsername = (rule, value, callback) => {
      if (value.length == 0) {
        callback(new Error('用户名不能为空！'))
      } else {
        callback()
      }
    }
    //验证注册时密码
    const validateRegisterPassword = (rule, value, callback) => {
      if (value.length < 6 || value.length > 18) {
        callback(new Error('密码长度需介于6-18位之间！'))
      } else {
        callback()
      }
    }
    //验证修改密码时的新密码
    const validateNewPassword = (rule, value, callback) => {
      if (value.length < 6 || value.length > 18) {
        callback(new Error('密码长度需介于6-18位之间！'))
      } else {
        callback()
      }
    }
    return {
      tableData: null,
      tableLable: [
        { label: '用户名', prop: 'username' },
        { label: '电话号码', prop: 'phone' },
        { label: '添加日期', prop: 'createTime' },
        { label: '操作人', prop: 'operator' }
      ],
      statusLable: [
        { label: '状态', prop: 'status' }
      ],
      headers: {
        token: localStorage.getItem('token')
      },
      //要修改密码或删除或编辑信息的用户名
      update_username: '',
      //分页信息
      total: null,
      paginationShow: true,
      currentPage: 1,
      pageSize: 10,
      //对话框显示
      register_dialog: false,
      changeInfo_dialog: false,
      password_dialog: false,

      // 条件搜索
      searchName: "",
      searchPhone: "",

      updatepsdForm: {
        old_password: '',
        new_password: ''
      },
      updatepsdRules: {
        new_password: [{ required: true, trigger: 'blur', validator: validateNewPassword }],
        old_password: [{ required: true, message: '旧密码不能为空！', trigger: 'blur' }]
      },
      changeInfoForm: {
        phone: ''
      },
      changeInfoRules: {
        phone: [
          { required: true, message: '手机号码不能为空！', trigger: 'blur' },
          {
            pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/,
            message: '请输入正确的手机号码！',
            trigger: 'blur'
          }]
      },
      registerForm: {
        username: '',
        password: '',
        phonenumber: ''
      },
      registerRules: {
        username: [{ required: true, trigger: 'blur', validator: validateRegisterUsername }],
        password: [{ required: true, trigger: 'blur', validator: validateRegisterPassword }],
        phonenumber: [
          { required: true, message: '手机号码不能为空！', trigger: 'blur' },
          {
            pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/,
            message: '请输入正确的手机号码！',
            trigger: 'blur'
          }]
      }
    }
  },
  mounted() {
    this.getAllUser();
  },
  methods: {
    // 搜索用戶username和photo二选一
    searchUser () {
      var that = this;
      if (that.searchPhone || that.searchName) {
        var tableDataCopy = [];
        that.tableData.forEach((element) => {
          if ((that.searchPhone === element.phone) || that.searchName === element.username) {
            tableDataCopy.splice(1, 0, element);
          }
        })
        that.tableData = tableDataCopy;
      }else {
        this.$message({
          message: '请输入查询内容',
          type: 'warning'
        });
      }

    },
    // 重置搜索
    resetSearch() {
      var that = this;
      that.searchPhone = "";
      that.searchName = "";
      that.getAllUser();
    },

    //改变用户状态，停用或启用
    changeStatus(username,old_status){
      var new_status
      var that = this
      that.update_username = username
      if(old_status == 1){
        new_status = 0;
      }else {
        new_status = 1;
      }
      that.req({
        url: '/changeUserStatus?username=' +
            that.update_username +
          '&status='+new_status,
        data: {},
        method: 'GET'
      }).then((res) => {
          if (res.code == 200) {
            this.$message({
              message: "操作成功",
              type: "success",
            })
          } else {
            this.$message.error(res.message)
          }
        },
        (err) => {
          this.$message.error(err.message)
        })
    },
    //重置修改密码表单，清除验证
    resetUpdatepswForms() {
      this.$refs['updatepsdForm'].resetFields()
      this.$refs['updatepsdForm'].clearValidate()
    },
    //重置注册表单，清除验证
    resetRegisterForms() {
      this.$refs['registerForm'].resetFields()
      this.$refs['registerForm'].clearValidate()
    },
    //重置编辑表单，清除验证
    resetChangeInfoForms() {
      this.$refs['changeInfoForm'].resetFields()
      this.$refs['changeInfoForm'].clearValidate()
    },
    //注册框
    register_sure() {
      this.register_dialog = true
    },
    //向后台用户注册
    userRegister() {
      var that = this
      this.$refs.registerForm.validate((valid) => {
        if (valid) {
          that.req({
            url: '/register',
            data: {
              'username': that.registerForm.username,
              'password': that.registerForm.password,
              'phone': that.registerForm.phonenumber,
              'operator': localStorage.getItem('name'),
              'status': 1
            },
            method: 'POST'
          }).then(
            (res) => {
              if (res.code == 200) {
                this.$message({ message: '添加成功', type: 'success' })
                this.register_dialog = false
                this.getAllUser()
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
    //修改密码框
    updatepsd_sure(username) {
      this.password_dialog = true
      this.update_username = username
    },
    //修改密码
    updatePassword() {
      let that = this
      this.$refs.updatepsdForm.validate((valid) => {
        if (valid) {
          that.req({
            url: `/updatePassword`,
            data: {
              username: that.update_username,
              oldPassword: that.updatepsdForm.old_password,
              newPassword: that.updatepsdForm.new_password
            },
            method: 'POST'
          }).then(
            (res) => {
              if (res.code == 200) {
                this.$message({ message: '修改成功', type: 'success' })
                that.password_dialog = false
                this.update_username = ''
              } else {
                this.$message.error(res.message)
              }
            },
            (err) => {
              this.$message.error(err.message)
            })
        }
      })
    },
    //编辑信息框
    changeInfo_sure(username) {
      this.changeInfo_dialog = true
      this.update_username = username
    },
    //提交修改信息
    changeInfo() {
      let that = this
      this.$refs.changeInfoForm.validate((valid) => {
        if (valid) {
          that.req({
            url: '/updateUserInfo?username=' +
              that.update_username +
              '&phone='+that.changeInfoForm.phone,
            data: {},
            method: 'GET'
          }).then(
            (res) => {
              if (res.code == 200) {
                this.$message({ message: '修改成功', type: 'success' })
                that.changeInfo_dialog = false
                this.update_username = ''
                this.getAllUser()
              } else {
                this.$message.error(res.message)
              }
            },
            (err) => {
              this.$message.error(err.message)
            })
        }
      })
    },
    //删除用户
    deleteUser(username) {
      var that = this
      that.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
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
              that.getAllUser()
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
    },
    // 处理页码大小变动时候触发的事件
    // 每页显示个数 int
    handleSizeChange(val) {
      var that = this
      that.pageSize = val
      that.currentPage = 1
      that.getAllUser()
    },
    handleCurrentChange(val) {
      var that = this
      that.currentPage = val
      that.getAllUser()
    },
    // 查询数据
    getAllUser() {
      var that = this
      that.paginationShow = false
      that.tableData = null
      that.req({
        url:
          '/getAllUsers?' +
          'pageNum=' +
          that.currentPage +
          '&pageSize=' +
          that.pageSize +
          '&sort=' + '1' +
          '&operator=' +
          localStorage.getItem('name'),
        data: {},
        method: 'GET'
      }).then((res) => {
          if (res.code == 200) {
            var list = res.data.list;
            list.forEach((element) => {
              var ss = that.dateFilter(element.createTime);
              element.createTime = ss;
            })

            that.tableData = list;
            that.total = res.data.total;
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

    dateFilter(data) {
      var dt = new Date(data)
      var y = dt.getFullYear()
      var m = (dt.getMonth() + 1).toString().padStart(2, '0')
      var d = dt.getDate().toString().padStart(2, '0')
      var h = dt.getHours().toString().padStart(2, '0')
      var mm = dt.getMinutes().toString().padStart(2, '0')
      var s = dt.getSeconds().toString().padStart(2, '0')

      return y + '-' + m + '-' + d + ' ' + h + ':' + mm + ':' + s
    }
  }

}

</script>

<style>
.root {
  margin: 50px auto;
  width: 90%;
}

.userData {
  width: 100%;
  border: 2px solid #eee;
}

.upload {
  width: 200px;
  margin: 20px;
  float: right;
}

.my-pic {
  width: 48px;
  height: 27px;
}

.pagination {
  margin-top: 20px;
  margin-right: 50px;
  float: right;
}

.search {
  width: 50%;
  /* margin-left: 50%; */
}
</style>
