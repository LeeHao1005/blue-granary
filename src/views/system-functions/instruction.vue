<template>
  <div class="instruction-contain">
    <p class="instruction-head">使用说明</p>
    <p class="instruction-title">一、登录登出</p>
    <p class="instruction-content">
      1. 输入用户名、密码（6-18位） --> 点击“登录” --> 进入系统主界面；
    </p>
    <p class="instruction-content">
      2. 在系统功能界面，点击右上角用户图标 --> 弹出本次登录账号的信息框；
    </p>
    <p class="instruction-content">3. 点击“退出登录” --> 退出系统，进入登录界面；</p>
    <p class="instruction-content">
      4. 点击“重置密码” --> 填入“旧密码”、“新密码” -->点击“确定”
      -->重置密码操作成功；
    </p>
    <p class="instruction-content">
      5. 点击“确认”或点击系统中其他位置，关闭弹出框。
    </p>

    <p class="instruction-title">二、数据采集</p>
    <p class="instruction-content">
      1. 系统功能菜单栏中点击“数据采集” --> 进入数据采集界面；
    </p>
    <p class="instruction-content">
      2. 点击“打开摄像头” --> 进入拍摄状态（摄像头默认打开状态）；
    </p>
    <p class="instruction-content">
      3. 图像清晰后，点击“识别” --> 拍摄照片进行识别 --> 右侧显示识别出的数据信息；
    </p>
    <p class="instruction-content">
      4. 点击“修改” --> 修改数据（默认不可修改状态）；
    </p>
    <p class="instruction-content">5. 点击“确认” --> 保存数据。</p>

    <p class="instruction-title">三、数据管理</p>
    <p class="instruction-content">
      1. 系统功能菜单栏中点击“数据管理” --> 进入数据管理界面；
    </p>
    <p class="instruction-content">
      2. 选择所需查询的日期（可选）、类别 --> 点击查询 -->
      查询结果以表格形式显示，可选择每页显示的数据条数（默认显示间接蒸煮类别的所有时间的数据信息）；
    </p>
    <p class="instruction-content">
      3. 点击“导出所有数据” --> 所有类别的所有数据信息以excel形式导出。
    </p>

    <p class="instruction-title">四、用户管理</p>
    <p class="instruction-content">
      1. 系统功能菜单栏中点击“用户管理” --> 进入用户管理界面；
    </p>
    <p class="instruction-content">
      2. 界面默认显示由本次登录账号创建的所有用户信息；
    </p>
    <p class="instruction-content">
      3. 填入“用户名”或“电话号码” --> 点击搜索 --> 显示查询到的用户信息；
    </p>
    <p class="instruction-content">4. 点击“重置” --> 显示2中的默认用户信息；</p>
    <p class="instruction-content">
      5. 点击“新建用户” --> 填入“用户名”、“密码”、“电话号码” -->
      点击“确认”，新建用户成功，点击“取消”，取消当前新建用户操作。
    </p>

    <p class="instruction-title">五、系统配置</p>
    <p class="instruction-content">
      1. 系统功能菜单栏中点击“打开摄像头配置” --> 打开摄像头配置软件，可根据需求调节摄像头功能；
    </p>
    <p class="instruction-content">
      2. 点击“配置初始参数” --> 显示船舶信息，可进行编辑、新增操作；
    </p>
    <p class="instruction-content">
      3. 点击“一键关闭服务” --> 关闭此系统；
    </p>
    <p class="instruction-title">六、使用说明</p>
    <p class="instruction-content">
      1. 系统功能菜单栏中点击“使用说明” --> 查看系统使用说明。
    </p>
  </div>
</template>
<script>
export default {
  name: "Instruction",
  data() {
    return {};
  },
};
</script>
<style lang="scss">
.instruction-contain {
  margin: 80px;
}
.instruction-contain .instruction-head {
  font-size: 24px;
  font-weight: bold;
  text-align: center;
  margin: 30px;
}

.instruction-contain .instruction-title {
  font-size: 22px;
  top: 10px;
}

.instruction-contain .instruction-content {
  font-size: 18px;
  margin-left: 30px;
}

</style>
