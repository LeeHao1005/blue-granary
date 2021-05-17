<template>
  <div class="root">
    <!---->
    <el-table :data="tableData" class="userData" >
      <el-table-column label="用户名" v-for="(item,index) in tableData" :key=index >
        {{item.username}}
      </el-table-column>
      <el-table-column label="操作">
        <el-button type="primary" @click="dialog_sure">修改密码</el-button>
      </el-table-column>
    </el-table>
    <!--修改密码对话框-->
    <el-dialog title="密码修改" :visible.sync="use_dialog" width="600px" append-to-body>
      <el-form ref="form" label-width="80px">
        <el-row>
          <el-form-item label="旧密码">
            <el-input placeholder="请输入旧密码" v-model=old_password type="text"/>
          </el-form-item>
          <el-form-item label="新密码">
            <el-input placeholder="请输入新密码" v-model=new_password type="text"/>
          </el-form-item>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="updatePassword">确 定</el-button>
        <el-button @click="use_dialog = false">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import login from '../login/index'

export default {
  name: 'UserManagement',
  data() {
    return {
      tableData: [
        { username: "admin" }
      ],
      headers: {
        token: localStorage.getItem('token')
      },
      name: null,
      use_dialog: false,
      old_password: null,
      new_password: null
    }
  },
  methods: {
    dialog_sure() {
      this.use_dialog = true
      this.old_password = null
      this.new_password = null
    },
    updatePassword() {
      let that = this
      if ((that.old_password == null) || (that.new_password == null)) {
        this.$message.error('输入不能为空！')
      } else {
        that.req({
          url: `/updatePassword`,
          data: {
            username: 'admin',
            oldPassword: that.old_password,
            newPassword: that.new_password
          },
          method: 'POST'
        }).then(
          (res) => {
            if (res.code == 200) {
              this.$message({ message: '修改成功', type: 'success' })
              that.use_dialog = false
            } else {
              this.$message.error(res.message)
            }
          },
          (err) => {
            this.$message.error(err.message)
          })
      }
    }
  }
}
</script>

<style>
.userData {
  width: 90%;
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
