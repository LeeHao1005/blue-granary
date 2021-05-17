<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
export default {
  name: "App",
  mounted() {
    let beginTime = 0; //开始时间
    let differTime = 0; //时间差
    window.onunload = function () {
      differTime = new Date().getTime() - beginTime;
      if (differTime <= 5) {
        // console.log("这是关闭");
        localStorage.removeItem('token')
        //退出登录跳到首页
        this.$router.push({ path: "/" });
      } else {
        // console.log("这是刷新");
      }
    };
    window.onbeforeunload = function () {
      beginTime = new Date().getTime();
    };
  },
  // destroyed() {
  //   // 关闭浏览器窗口的时候清空浏览器缓存在localStorage的数据
  //   window.onbeforeunload = function (e) {
  //     var storage = window.localStorage;
  //     storage.clear()
  //   }
  // }
}
</script>
<style lang="scss">
.root {
  margin: 50px 25px 0px 25px;
}
.my-flex {
  display: flex;
}
#app {
  height: 100vh !important;
}
</style>
