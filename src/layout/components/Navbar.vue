<template>
  <div class="navbar">
    <hamburger :is-active="sidebar.opened" class="hamburger-container" @toggleClick="toggleSideBar" />

    <breadcrumb class="breadcrumb-container" />

    <div class="right-menu">
      <el-popover
        placement="bottom"
        title="个人信息"
        width="500"
        trigger="click"
        v-model="visible">
        <el-form :inline="true">
          <el-form-item label="用户名">
            <el-input v-model="this.username" :disabled="true"></el-input>
          </el-form-item>
          <el-form-item label="电话号码">
            <el-input v-model="this.username" :disabled="true"></el-input>
          </el-form-item>
        </el-form>
        <el-button type="danger" @click="logout">退出登录</el-button>
        <el-button  type="primary" @click="updatepsd_sure">重置密码</el-button>
        <el-button type="primary" @click="visible=false">确认</el-button>
        <a slot="reference">
          <svg class="icon" aria-hidden="true" >
            <use xlink:href="#icon-yonghu"></use>
          </svg>
        </a>
      </el-popover>
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
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import Breadcrumb from '@/components/Breadcrumb'
import Hamburger from '@/components/Hamburger'

export default {
  components: {
    Breadcrumb,
    Hamburger
  },
  computed: {
    ...mapGetters([
      'sidebar',
      'avatar'
    ])
  },
  data(){
    //验证修改密码时的新密码
    const validateNewPassword = (rule, value, callback) => {
      if (value.length < 6) {
        callback(new Error('新密码不能少于6位！'))
      } else {
        callback()
      }
    }
    return{
      username:null,
      visible:false,
      password_dialog: false,
      updatepsdForm: {
        old_password: '',
        new_password: ''
      },
      updatepsdRules: {
        new_password: [{ required: true, trigger: 'blur', validator: validateNewPassword }],
        old_password: [{ required: true, message: '旧密码不能为空！', trigger: 'blur' }]
      },
    }
  },
  mounted() {
    this.username = localStorage.getItem('name')
  },
  methods: {
    toggleSideBar() {
      this.$store.dispatch('app/toggleSideBar')
    },
    async logout() {
      localStorage.removeItem('token')
      this.$router.push(`/?redirect=${this.$route.fullPath}`)
    },
    //重置修改密码表单，清除验证
    resetUpdatepswForms() {
      this.$refs['updatepsdForm'].resetFields()
      this.$refs['updatepsdForm'].clearValidate()
    },
    //修改密码框
    updatepsd_sure() {
      this.password_dialog = true
      this.old_password = null
      this.new_password = null
    },
    //修改密码
    updatePassword() {
      let that = this
      this.$refs.updatepsdForm.validate((valid) => {
        if (valid) {
          that.req({
            url: `/updatePassword`,
            data: {
              username: localStorage.getItem("name"),
              oldPassword: that.updatepsdForm.old_password,
              newPassword: that.updatepsdForm.new_password
            },
            method: 'POST'
          }).then(
            (res) => {
              if (res.code == 200) {
                this.$message({ message: '修改成功', type: 'success' })
                that.password_dialog = false
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

  }
}
</script>

<style lang="scss" scoped>
.navbar {
  height: 50px;
  overflow: hidden;
  position: relative;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0,21,41,.08);

  .hamburger-container {
    line-height: 46px;
    height: 100%;
    float: left;
    cursor: pointer;
    transition: background .3s;
    -webkit-tap-highlight-color:transparent;

    &:hover {
      background: rgba(0, 0, 0, .025)
    }
  }

  .breadcrumb-container {
    float: left;
  }

  .right-menu {
    float: right;
    height: 100%;
    line-height: 50px;
    margin-right: 20px;

    &:focus {
      outline: none;
    }

    .right-menu-item {
      display: inline-block;
      padding: 0 8px;
      height: 100%;
      font-size: 18px;
      color: #5a5e66;
      vertical-align: text-bottom;

      &.hover-effect {
        cursor: pointer;
        transition: background .3s;

        &:hover {
          background: rgba(0, 0, 0, .025)
        }
      }
    }

    .avatar-container {
      margin-right: 30px;

      .avatar-wrapper {
        margin-top: 5px;
        position: relative;

        .user-avatar {
          cursor: pointer;
          width: 40px;
          height: 40px;
          border-radius: 10px;
        }

        .el-icon-caret-bottom {
          cursor: pointer;
          position: absolute;
          right: -20px;
          top: 25px;
          font-size: 12px;
        }
      }
    }
  }
}
</style>
