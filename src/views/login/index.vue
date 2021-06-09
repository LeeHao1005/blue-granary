<template>
  <div class="login-container">
    <el-form
      ref="loginForm"
      :model="loginForm"
      :rules="loginRules"
      class="login-form"
      auto-complete="on"
      label-position="left"
    >
      <div class="title-container">
<!--        <h3 class="title">蓝色粮仓数据采集系统</h3>-->
      </div>

      <el-form-item prop="username">
        <span class="svg-container">
          <svg-icon icon-class="user" />
        </span>
        <el-input
          id="account"
          ref="username"
          v-model="loginForm.username"
          placeholder="用户名"
          name="username"
          type="text"
          tabindex="1"
          auto-complete="on"
        />
      </el-form-item>
      <el-form-item prop="password">
        <span class="svg-container">
          <svg-icon icon-class="password" />
        </span>
        <el-input
          id="psw"
          :key="passwordType"
          ref="password"
          v-model="loginForm.password"
          :type="passwordType"
          placeholder="密码"
          name="password"
          tabindex="2"
          auto-complete="on"
          @keyup.enter.native="handleLogin"
        />
        <span class="show-pwd" @click="showPwd">
          <svg-icon
            :icon-class="passwordType === 'password' ? 'eye' : 'eye-open'"
          />
        </span>
      </el-form-item>
      <el-button
        id="login_btn"
        type="primary"
        style="width: 80%; margin: 30px auto; display: block"
        @click.native.prevent="handleLogin"
        >登录</el-button
      >
    </el-form>
    <div class="info">电子科技大学-信息与软件工程学院</div>
  </div>
</template>

<script>
import md5 from "js-md5";


export default {
  name: "Login",
  data() {
    const validateUsername = (rule, value, callback) => {
      if (value.length == 0) {
        callback(new Error("用户名不能为空！"));
      } else {
        callback();
      }
    };
    const validatePassword = (rule, value, callback) => {
      if (value.length < 6 || value.length > 18) {
        callback(new Error('密码长度需介于6-18位之间！'))
      } else {
        callback();
      }
    };
    return {
      loginForm: {
        username: "",
        password: "",
      },
      loginRules: {
        username: [
          // { required: true, trigger: "blur", validator: validateUsername },
          { required: true, trigger: "blur", validator: validateUsername }
        ],
        password: [
          { required: true, trigger: "blur", validator: validatePassword },
        ],
      },
      passwordType: "password",
      redirect: undefined,
    };
  },

  watch: {
    $route: {
      handler: function(route) {
        this.redirect = route.query && route.query.redirect;
      },
      immediate: true,
    },
  },
  methods: {
    showPwd() {
      if (this.passwordType === "password") {
        this.passwordType = "";
      } else {
        this.passwordType = "password";
      }
      this.$nextTick(() => {
        this.$refs.password.focus();
      });
    },
    handleLogin() {
      let that = this;

      //数据格式验证
      this.$refs.loginForm.validate((valid) => {
        if (valid) {
          this.req({
            url: "/login",
            data: {
              "username": that.loginForm.username,
              "password": that.loginForm.password,
            },
            method: "POST",
          }).then(
            (res) => {
              if (res.code == 200) {
                localStorage.setItem("token", res.data.token);
                localStorage.setItem("name", that.loginForm.username);
                // localStorage.setItem("userInfo", JSON.stringify(res.data.userInfo));
                // this.$router.push({name: "user-management",query:{"username":that.loginForm.username}});
                this.$message({
                  message: "登录成功",
                  type: "success",
                })
                this.$router.push({path: "/system"});
              }
              else{
                this.$message.error(res.message);
              }
            },
            (err) => {
              console.log(err)
              this.$message.error(err.message);
            }
          );
        } else {
          console.log("验证失败");
        }
      });
    }
  }
}
</script>

<style lang="scss">
/* 修复input 背景不协调 和光标变色 */
.info {
  position: fixed;
  bottom: 20px;
  width: 100%;
  text-align: center;
  color: gainsboro;
}
$bg: #283443;
$light_gray: #fff;
$dark: #000;
$cursor: #fff;

@supports (-webkit-mask: none) and (not (cater-color: $cursor)) {
  .login-container .el-input input {
    color: $cursor;
  }
}

/* reset element-ui css */
.login-container {
  .el-input {
    display: inline-block;
    height: 47px;
    width: 85%;

    input {
      background: transparent;
      border: 0px;
      -webkit-appearance: none;
      border-radius: 0px;
      padding: 12px 5px 12px 15px;
      color: $dark;
      height: 47px;
      caret-color: $dark;

      &:-webkit-autofill {
        box-shadow: 0 0 0px 1000px $light_gray inset !important;
        -webkit-text-fill-color: $dark !important;
      }
    }
  }

  .el-form-item {
    margin: 30px auto;
    width: 80%;
    border: 1px solid rgb(255, 255, 255);
    background: rgb(255, 255, 255);
    border-radius: 5px;
    color: #454545;
  }
}
</style>

<style lang="scss" scoped>
$bg: #2d3a4b;
$dark_gray: #889aa4;
$light_gray: #eee;

.login-container {
  min-height: 100%;
  width: 100%;
  //background-color: $bg;
  background-image: url("../../icons/photo/BJ.jpg");
  overflow: hidden;

  .login-form {
    position: relative;
    width: 630px;
    max-width: 100%;
    padding: 100px 0 0;
    margin: 0 auto;
    overflow: hidden;
    box-sizing: border-box;
  }

  .tips {
    font-size: 14px;
    color: #fff;
    margin-bottom: 10px;

    span {
      &:first-of-type {
        margin-right: 16px;
      }
    }
  }

  .svg-container {
    padding: 6px 5px 6px 15px;
    color: $dark_gray;
    vertical-align: middle;
    width: 30px;
    display: inline-block;
  }

  .title-container {
    position: relative;
    height: 104px;
    background-image: url("../../icons/photo/LOGO@NAME.png");

    .title {
      font-size: 26px;
      color: $light_gray;
      margin: 0px auto 40px auto;
      text-align: center;
      font-weight: bold;
    }
  }

  .show-pwd {
    position: absolute;
    right: 10px;
    top: 7px;
    font-size: 16px;
    color: $dark_gray;
    cursor: pointer;
    user-select: none;
  }
}
</style>
