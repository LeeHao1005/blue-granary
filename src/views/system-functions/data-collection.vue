<template>
  <div id="data-collection"
       v-loading="loading"
       element-loading-text="拼命加载中"
  >
    <el-row :gutter="20">
      <el-col :span="14" style="width: 60%">
        <div class="btn-container" align="center">
          <svg class="icon" aria-hidden="true">
            <use xlink:href="#icon-shexiangtou"></use>
          </svg>
          <el-button v-if="use_openButton" type="primary" @click="getCompetence">打开摄像头</el-button>
          <el-button v-if="!use_openButton" type="primary" @click="stopCompetence">关闭摄像头</el-button>
          <el-button type="primary" @click="postPic" style="margin-left: 1vh">识别</el-button>
          <el-upload
            class="avatar-uploader"
            action="#"
            :http-request="httpRequest"
            :show-file-list="false"
            :before-upload="beforeAvatarUpload"
            :on-success="handleAvatarSuccess"
          >
            <el-button slot="trigger" type="success">选取图像</el-button>
          </el-upload>
          <el-button type="success" @click="submitUpload" style="margin-left: 1vh">图像测试</el-button>
        </div>

        <!-- 视频 -->
        <div class="left-contain">
          <!-- 测试图片-->
          <div v-if="testImageUrl && !noAvatar" class="video-contain">
            <img :src="testImageUrl" class="avatar-img"/>
          </div>
          <!--实际画布-->
          <div class="video-contain" v-if="noAvatar">
            <video
              id="videoCamera"
              autoplay
              v-show="use_video"
              :height="videoHeight"
              :width="videoWidth"
            ></video>
            <canvas id="canvasCamera" v-show="!use_video && noAvatar"></canvas>
          </div>
        </div>
      </el-col>
      <!-- 表单 -->
      <el-col :span="10" style="width: 38%; border-left: 3px solid #eeeeee" v-show="use_results">
        <div class="content right-contain">
          <router-view/>
          <el-form ref="form" :model="form" label-width="80px">
            <!--图像名称显示-->
            <el-form-item label="图像名称">
              <el-input
                v-model="form.pictureName"
                :disabled="unmodify"
              >
              </el-input>
            </el-form-item>
            <!--第二类图像第一个参数标签(类型2独有)-->
            <el-form-item :label=this.form.paramstype2lable v-if="istype2">
            </el-form-item>
            <!--图像参数显示（类型2独有）-->
            <el-form-item
              v-for="(item, index) in form.parameterstype2"
              :key="item.id"
              :label="index"
              v-if="istype2"
            >
              <!--显示识别结果-->
              <el-input
                v-model="form.parameterstype2[index]"
                :disabled="unmodify"
              >
              </el-input>
            </el-form-item>
            <!--图像参数显示（通用）-->
            <el-form-item
              v-for="(item, index) in form.parameters"
              :key="item.id"
              :label="index"
            >
              <!--显示识别结果-->
              <el-input
                v-model="form.parameters[index]"
                :disabled="unmodify"
              >
              </el-input>
            </el-form-item>
            <el-form-item class="form-item-btn ">
              <el-select v-model="shipId" placeholder="请选择">
                <el-option
                  v-for="item in shiptableData"
                  :key="item.id"
                  :label="item.shipid + '-' + item.shipname "
                  :value="item.shipid"
                >
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item class="form-item-btn">
              <el-button type="primary" @click="isChange">修改</el-button>
              <el-button type="primary" @click="saveAlert">确认</el-button>
            </el-form-item>
          </el-form>
        </div>
      </el-col>
    </el-row>
    <!--最后保存确定-->
    <el-dialog title="提示" :visible.sync="use_dialog" width="30%">
      <span>确定保存数据？</span>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="onSubmit">确 定</el-button>
        <el-button @click="use_dialog = false">取 消</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import axios from 'axios'

export default {
  name: 'DataCollection',
  data() {
    return {
      imageUrl: '',
      testImageUrl: '',
      //图片信息
      form: {
        pictureType: '-1',
        pictureName: '',
        paramstype2lable: '',
        parameters: {},
        parameterstype2: {},
        filepath: null
      },
      istype2: false,
      imgSrc: '',
      thisCanvas: null,
      thisContext: null,
      thisVideo: null,
      videoWidth: '',
      videoHeight: '',
      use_video: true,
      use_results: false,
      //确定对话框
      use_dialog: false,
      unmodify: true,
      isSave: true,
      //显示打开摄像头或者关闭摄像头
      use_openButton: true,
      noAvatar: true,
      //船舶信息
      shiptableData: [],
      shipId: 1,
      loading: false,
      openvideo: false
    }
  },
  // mounted() {
  //   this.selectShip()
  // },
  //页面销毁后执行 自动关闭摄像头
  destroyed() {
    this.stopCompetence()
  },
  methods: {
    //空的action响应
    httpRequest() {
    },
    //将本地选择的图片提交
    submitUpload() {
      var that = this

      that.postPicLocal()
    },
    beforeAvatarUpload(res) {
      var that = this
      //关闭摄像头
      that.stopCompetence()

      var r = new FileReader()
      r.readAsDataURL(res)
      r.onload = function(e) {
        that.imageUrl = e.target.result
        that.testImageUrl = e.target.result
      }

      // 重新渲染dom
      this.$nextTick(() => {
        this.noAvatar = false
        if (this.use_openButton) {
          this.stopCompetence()
        }
        this.use_openButton = true
      })

    },
    handleAvatarSuccess(res, file) {
      var that = this
      that.testImageUrl = URL.createObjectURL(file.raw)
    },
    //向后台提交本地选择的图片
    postPicLocal() {
      var that = this
      that.unmodify = true
      that.loading = true
      if (that.imageUrl == '') {
        this.$message.error('未上传图片，请上传！')
        that.loading = false
        return
      }
      this.req({
        url: '/camera/getParams',
        data: {
          picture: that.imageUrl
        },
        method: 'POST'
      }).then(
        (res) => {
          if (res.code == '200') {
            that.selectShip()
            that.use_results = true
            var datajson = JSON.parse(res.data.data)
            that.form.filepath = res.data.filepath
            switch (res.data.type) {
              case 1:
                that.form.pictureName = '间接蒸煮'
                that.form.pictureType = 1
                that.paramsSet_Type1(datajson)
                break
              case 2:
                that.form.pictureName = '直接蒸煮+固液分离'
                that.form.pictureType = 2
                that.paramsSet_Type2(datajson)
                break
              case 3:
                that.form.pictureName = '干燥机'
                that.form.pictureType = 3
                that.paramsSet_Type3(datajson)
                break
            }
            that.loading = false
            this.$message({
              message: '识别成功',
              type: 'success'
            })
          } else {
            that.loading = false
            this.$message.error(res.message)
          }
        },
        (err) => {
          that.loading = false
          this.$message.error('识别失败！')
        }
      )
      that.imageUrl = ''
    },
    // 向后台提交当前拍的图片，并获取显示结果
    postPic() {
      var that = this

      that.unmodify = true
      that.loading = true
      if (that.use_openButton == true) {
        this.$message.error('未获取到图像！请打开摄像头！')
        that.loading = false
        return
      }
      that.setImage()
      that.stopCompetence()
      this.req({
        url: '/camera/getParams',
        data: {
          picture: that.imgSrc
        },
        method: 'POST'
      }).then(
        (res) => {
          if (res.code == '200') {
            that.selectShip()
            that.use_results = true
            var datajson = JSON.parse(res.data.data)
            that.form.filepath = res.data.filepath
            switch (res.data.type) {
              case 1:
                that.form.pictureName = '间接蒸煮'
                that.form.pictureType = 1
                that.paramsSet_Type1(datajson)
                break
              case 2:
                that.form.pictureName = '直接蒸煮+固液分离'
                that.form.pictureType = 2
                that.paramsSet_Type2(datajson)
                break
              case 3:
                that.form.pictureName = '干燥机'
                that.form.pictureType = 3
                that.paramsSet_Type3(datajson)
                break
            }
            that.loading = false
            this.$message({
              message: '识别成功',
              type: 'success'
            })
          } else {
            that.loading = false
            this.getCompetence()
            this.$message.error(res.message)
          }
        },
        (err) => {
          that.loading = false
          this.getCompetence()
          this.$message.error('识别失败！')
        }
      )
    },
    // 修改数据（格式化数据）
    //第一种类型图
    paramsSet_Type1(p) {
      var that = this
      that.selectShip()
      that.istype2 = false
      const temp1 = {
        '1D01A-W01TT03蒸汽温度(℃)': '',
        '1D01A-W01TT02蒸汽温度(℃)': '',
        '1D01A-W01PT01进料时压力(bar)': ''

      }
      const temp2 = {
        '2D01A-W01TT03蒸汽温度(℃)': '',
        '2D01A-W01TT02蒸汽温度(℃)': '',
        '2D01A-W01PT01进料时压力(bar)': ''
      }
      for (const key in p) {
        if (key == '1D01A-W01TT03' && p[key]) {
          temp1[key + '蒸汽温度(℃)'] = p[key]
        } else if (key == '2D01A-W01TT03' && p[key]) {
          temp2[key + '蒸汽温度(℃)'] = p[key]
        }
        if (key == '1D01A-W01TT02' && p[key]) {
          temp1[key + '蒸汽温度(℃)'] = p[key]
        } else if (key == '2D01A-W01TT02' && p[key]) {
          temp2[key + '蒸汽温度(℃)'] = p[key]
        }
        if (key == '1D01A-W01PT01' && p[key]) {
          temp1[key + '进料时压力(bar)'] = p[key]
        } else if (key == '2D01A-W01PT01' && p[key]) {
          temp2[key + '进料时压力(bar)'] = p[key]
        }
      }
      if (temp1['1D01A-W01TT03蒸汽温度(℃)'] != '' || temp1['1D01A-W01TT02蒸汽温度(℃)'] != '' || temp1['1D01A-W01PT01进料时压力(bar)'] != '') {
        that.form.parameters = temp1
      } else if (temp2['2D01A-W01TT03蒸汽温度(℃)'] != '' || temp2['2D01A-W01TT02蒸汽温度(℃)'] != '' || temp2['2D01A-W01PT01进料时压力(bar)'] != '') {
        that.form.parameters = temp2
      }
    },
    //第二种类型图
    paramsSet_Type2(p) {
      var that = this
      that.istype2 = true
      const temp1 = {
        '1D01A-W02M01进料速度(%)': '',
        '1D01A-W02PT02气体压力(bar)': '',
        'Diff speed离心转速(rpm)': '',
        'Bowl speed离心转速(rpm)': '',
        'MD Temp温度(℃)': '',
        'GB Temp温度(℃)': ''
      }
      let subtemp1 = { '阀的开度调节值(%)': '', '蒸汽调节温度(℃)': '' }
      const temp2 = {
        '2D01A-W02M01进料速度(%)': '',
        '2D01A-W02PT02气体压力(bar)': '',
        'Diff speed离心转速(rpm)': '',
        'Bowl speed离心转速(rpm)': '',
        'MD Temp温度(℃)': '',
        'GB Temp温度(℃)': ''
      }
      let subtemp2 = { '阀的开度调节值(%)': '', '蒸汽调节温度(℃)': '' }
      let r = { '阀的开度调节值(%)': '', '蒸汽调节温度(℃)': '' }
      for (const key in p) {
        if (key == '1D01A-W02TC01') {
          for (var ckey in p['1D01A-W02TC01']) {
            if (ckey == 'CV' && p['1D01A-W02TC01'][ckey]) {
              r['阀的开度调节值(%)'] = p['1D01A-W02TC01'][ckey]
            }
            if (ckey == 'SP' && p['1D01A-W02TC01'][ckey]) {
              r['蒸汽调节温度(℃)'] = p['1D01A-W02TC01'][ckey]
            }
          }
          subtemp1 = r
          r = { '阀的开度调节值(%)': '', '蒸汽调节温度': '' }
        } else if (key == '2D01A-W02TC01') {
          for (var ckey in p['2D01A-W02TC01']) {
            if (ckey == 'SP' && p['2D01A-W02TC01'][ckey]) {
              r['蒸汽调节温度(℃)'] = p['2D01A-W02TC01'][ckey]
            }
            if (ckey == 'CV' && p['2D01A-W02TC01'][ckey]) {
              r['阀的开度调节值(%)'] = p['2D01A-W02TC01'][ckey]
            }
          }
          subtemp2 = r
          r = { '阀的开度调节值(%)': '', '蒸汽调节温度(℃)': '' }
        }
        if (key == '1D01A-W02M01' && p[key]) {
          temp1[key + '进料速度(%)'] = p[key]
        } else if (key == '2D01A-W02M01' && p[key]) {
          temp2[key + '进料速度(%)'] = p[key]
        }
        if (key == '1D01A-W02PT02' && p[key]) {
          temp1[key + '气体压力(bar)'] = p[key]
        } else if (key == '2D01A-W02PT02' && p[key]) {
          temp2[key + '气体压力(bar)'] = p[key]
        }
        if (key == 'Diff speed') {
          temp1[key + '离心转速(rpm)'] = p[key]
          temp2[key + '离心转速(rpm)'] = p[key]
        }
        if (key == 'Bowl speed') {
          temp1[key + '离心转速(rpm)'] = p[key]
          temp2[key + '离心转速(rpm)'] = p[key]
        }
        if (key == 'MD Temp') {
          temp1[key + '温度(℃)'] = p[key]
          temp2[key + '温度(℃)'] = p[key]
        }
        if (key == 'GB Temp') {
          temp1[key + '温度(℃)'] = p[key]
          temp2[key + '温度(℃)'] = p[key]
        }
      }
      if (subtemp1['阀的开度调节值(%)'] != '' || subtemp1['蒸汽调节温度(℃)'] != '' || temp1['1D01A-W02M01进料速度(%)'] != ''
        || temp1['1D01A-W02PT02气体压力(bar)'] != '') {
        that.form.parameters = temp1
        that.form.parameterstype2 = subtemp1
        that.form.paramstype2lable = '1D01A-W02TC01'
      } else if (subtemp2['阀的开度调节值(%)'] != '' || subtemp2['蒸汽调节温度(℃)'] != '' || temp2['2D01A-W02M01进料速度(%)'] != ''
        || temp2['2D01A-W02PT02气体压力(bar)'] != '') {
        that.form.parameters = temp2
        that.form.parameterstype2 = subtemp2
        that.form.paramstype2lable = '2D01A-W02TC01'
      }
    },
    //第三种类型图
    paramsSet_Type3(p) {
      var that = this
      that.istype2 = false
      const temp = {
        '2J01A-T01CV01(%)': '',
        '2J01A-T01TT01蒸汽温度(℃)': '',
        '2J01A-T01TT02蒸汽温度(℃)': '',
        '2J01A-T01PT01蒸汽压力(bar)': '',
        '2J01A-T01TT04蒸汽温度(℃)': ''
      }
      for (const key in p) {
        if (key == '2J01A-T01CV01' && p[key]) {
          temp[key + '(%)'] = p[key]
        }
        if (key == '2J01A-T01TT01' && p[key]) {
          temp[key + '蒸汽温度(℃)'] = p[key]
        }
        if (key == '2J01A-T01TT02' && p[key]) {
          temp[key + '蒸汽温度(℃)'] = p[key]
        }
        if (key == '2J01A-T01PT01' && p[key]) {
          temp[key + '蒸汽压力(bar)'] = p[key]
        }
        if (key == '2J01A-T01TT04' && p[key]) {
          temp[key + '蒸汽温度(℃)'] = p[key]
        }
      }
      that.form.parameters = temp
    },
    //改变输入框的可编辑性
    isChange() {
      var that = this
      that.unmodify = false
    },
    //查询后台已有的船舶信息，供用户选择
    selectShip() {
      //自动查询后台已有的信息并显示
      let that = this
      that.use_set = true
      that.shiptableData = null
      that.req({
        url:
          '/ships/getAllShips',
        // 'pageNum=' +
        // that.currentPage +
        // '&pageSize=' +
        // that.pageSize,
        data: {},
        method: 'GET'
      }).then((res) => {
          if (res.code == 200) {
            that.shiptableData = res.data.list
          } else {
            this.$message.error(res.message)
          }
        },
        (err) => {
          this.$message.error(err.message)
        })
    },
    //提交后台数据库，确认键
    onSubmit() {
      var that = this
      that.use_dialog = false
      that.unmodify = true
      if (that.form.pictureType == '1') {
        if (that.form.parameters['1D01A-W01TT03蒸汽温度(℃)'] || that.form.parameters['1D01A-W01TT02蒸汽温度(℃)'] || that.form.parameters['1D01A-W01PT01进料时压力(bar)']) {
          var orgkey1 = '1D01A-W01TT03蒸汽温度(℃)'
          var orgvalue1 = that.form.parameters['1D01A-W01TT03蒸汽温度(℃)']
          var orgkey2 = '1D01A-W01TT02蒸汽温度(℃)'
          var orgvalue2 = that.form.parameters['1D01A-W01TT02蒸汽温度(℃)']
          var orgkey3 = '1D01A-W01PT01进料时压力(bar)'
          var orgvalue3 = that.form.parameters['1D01A-W01PT01进料时压力(bar)']
        } else if (that.form.parameters['2D01A-W01TT03蒸汽温度(℃)'] || that.form.parameters['2D01A-W01TT02蒸汽温度(℃)'] || that.form.parameters['2D01A-W01PT01进料时压力(bar)']) {
          var orgkey1 = '2D01A-W01TT03蒸汽温度(℃)'
          var orgvalue1 = that.form.parameters['2D01A-W01TT03蒸汽温度(℃)']
          var orgkey2 = '2D01A-W01TT02蒸汽温度(℃)'
          var orgvalue2 = that.form.parameters['2D01A-W01TT02蒸汽温度(℃)']
          var orgkey3 = '2D01A-W01PT01进料时压力(bar)'
          var orgvalue3 = that.form.parameters['2D01A-W01PT01进料时压力(bar)']
        } else {
          var orgkey1 = '1D01A-W01TT03蒸汽温度(℃)'
          var orgvalue1 = that.form.parameters['1D01A-W01TT03蒸汽温度(℃)']
          var orgkey2 = '1D01A-W01TT02蒸汽温度(℃)'
          var orgvalue2 = that.form.parameters['1D01A-W01TT02蒸汽温度(℃)']
          var orgkey3 = '1D01A-W01PT01进料时压力(bar)'
          var orgvalue3 = that.form.parameters['1D01A-W01PT01进料时压力(bar)']
        }
        this.req({
          url: '/basicInfo/create1',
          data: {
            photoType: that.form.pictureType,
            shipNumber: that.shipId,
            key1: orgkey1,
            value1: orgvalue1,
            key2: orgkey2,
            value2: orgvalue2,
            key3: orgkey3,
            value3: orgvalue3,
            filepath: that.form.filepath
          },
          method: 'POST'
        }).then(
          (res) => {
            if (res.code == '200') {
              this.$message({ message: '保存成功', type: 'success' })
              that.use_results = false
              that.getCompetence()
            } else {
              this.$message.error(res.message)
            }
          },
          (err) => {
            this.$message.error('保存失败')
          }
        )
        that.form.pictureType = '-1'
      } else if (that.form.pictureType == '2') {
        if (that.form.parameters['1D01A-W02M01进料速度(%)'] || that.form.parameters['1D01A-W02PT02气体压力(bar)']) {
          var orgkey1 = '1D01A-W02TC01'
          var orgvalue1 = JSON.stringify(that.form.parameterstype2)
          var orgkey2 = '1D01A-W02M01进料速度(%)'
          var orgvalue2 = that.form.parameters['1D01A-W02M01进料速度(%)']
          var orgkey3 = '1D01A-W02PT02气体压力(bar)'
          var orgvalue3 = that.form.parameters['1D01A-W02PT02气体压力(bar)']
          var orgkey4 = 'Diff speed离心转速(rpm)'
          var orgvalue4 = that.form.parameters['Diff speed离心转速(rpm)']
          var orgkey5 = 'Bowl speed离心转速(rpm)'
          var orgvalue5 = that.form.parameters['Bowl speed离心转速(rpm)']
          var orgkey6 = 'MD Temp温度(℃)'
          var orgvalue6 = that.form.parameters['MD Temp温度(℃)']
          var orgkey7 = 'GB Temp温度(℃)'
          var orgvalue7 = that.form.parameters['GB Temp温度(℃)']
        } else if (that.form.parameters['2D01A-W02M01进料速度(%)'] || that.form.parameters['2D01A-W02PT02气体压力(bar)']) {
          var orgkey1 = '2D01A-W02TC01'
          var orgvalue1 = JSON.stringify(that.form.parameterstype2)
          var orgkey2 = '2D01A-W02M01进料速度(%)'
          var orgvalue2 = that.form.parameters['2D01A-W02M01进料速度(%)']
          var orgkey3 = '2D01A-W02PT02气体压力(bar)'
          var orgvalue3 = that.form.parameters['2D01A-W02PT02气体压力(bar)']
          var orgkey4 = 'Diff speed离心转速(rpm)'
          var orgvalue4 = that.form.parameters['Diff speed离心转速(rpm)']
          var orgkey5 = 'Bowl speed离心转速(rpm)'
          var orgvalue5 = that.form.parameters['Bowl speed离心转速(rpm)']
          var orgkey6 = 'MD Temp温度(℃)'
          var orgvalue6 = that.form.parameters['MD Temp温度(℃)']
          var orgkey7 = 'GB Temp温度(℃)'
          var orgvalue7 = that.form.parameters['GB Temp温度(℃)']
        } else {
          var orgkey1 = '1D01A-W02TC01'
          var orgvalue1 = JSON.stringify(that.form.parameterstype2)
          var orgkey2 = '1D01A-W02M01进料速度(%)'
          var orgvalue2 = that.form.parameters['1D01A-W02M01进料速度(%)']
          var orgkey3 = '1D01A-W02PT02气体压力(bar)'
          var orgvalue3 = that.form.parameters['1D01A-W02PT02气体压力(bar)']
          var orgkey4 = 'Diff speed离心转速(rpm)'
          var orgvalue4 = that.form.parameters['Diff speed离心转速(rpm)']
          var orgkey5 = 'Bowl speed离心转速(rpm)'
          var orgvalue5 = that.form.parameters['Bowl speed离心转速(rpm)']
          var orgkey6 = 'MD Temp温度(℃)'
          var orgvalue6 = that.form.parameters['MD Temp温度(℃)']
          var orgkey7 = 'GB Temp温度(℃)'
          var orgvalue7 = that.form.parameters['GB Temp温度(℃)']
        }
        this.req({
          url: '/basicInfo/create2',
          data: {
            photoType: that.form.pictureType,
            shipNumber: that.shipId,
            key1: orgkey1,
            value1: orgvalue1,
            key2: orgkey2,
            value2: orgvalue2,
            key3: orgkey3,
            value3: orgvalue3,
            key4: orgkey4,
            value4: orgvalue4,
            key5: orgkey5,
            value5: orgvalue5,
            key6: orgkey6,
            value6: orgvalue6,
            key7: orgkey7,
            value7: orgvalue7,
            filepath: that.form.filepath
          },
          method: 'POST'
        }).then(
          (res) => {
            if (res.code == '200') {
              this.$message({ message: '保存成功', type: 'success' })
              that.use_results = false
              that.getCompetence()
            } else {
              this.$message.error(res.message)
            }
          },
          (err) => {
            this.$message.error('保存失败')
          }
        )
        that.form.pictureType = '-1'
      } else if (that.form.pictureType == '3') {
        var orgkey1 = '2J01A-T01CV01(%)'
        var orgvalue1 = that.form.parameters['2J01A-T01CV01(%)']
        var orgkey2 = '2J01A-T01TT01蒸汽温度(℃)'
        var orgvalue2 = that.form.parameters['2J01A-T01TT01蒸汽温度(℃)']
        var orgkey3 = '2J01A-T01TT02蒸汽温度(℃)'
        var orgvalue3 = that.form.parameters['2J01A-T01TT02蒸汽温度(℃)']
        var orgkey4 = '2J01A-T01PT01蒸汽压力(bar)'
        var orgvalue4 = that.form.parameters['2J01A-T01PT01蒸汽压力(bar)']
        var orgkey5 = '2J01A-T01TT04蒸汽温度(℃)'
        var orgvalue5 = that.form.parameters['2J01A-T01TT04蒸汽温度(℃)']
        this.req({
          url: '/basicInfo/create3',
          data: {
            photoType: that.form.pictureType,
            shipNumber: that.shipId,
            key1: orgkey1,
            value1: orgvalue1,
            key2: orgkey2,
            value2: orgvalue2,
            key3: orgkey3,
            value3: orgvalue3,
            key4: orgkey4,
            value4: orgvalue4,
            key5: orgkey5,
            value5: orgvalue5,
            filepath: that.form.filepath
          },
          method: 'POST'
        }).then(
          (res) => {
            if (res.code == '200') {
              this.$message({ message: '保存成功', type: 'success' })
              that.use_results = false
              that.getCompetence()
            } else {
              this.$message.error(res.message)
            }
          },
          (err) => {
            this.$message.error('保存失败')
          }
        )
        that.form.pictureType = '-1'
      } else {
        this.$message.error('保存失败')
      }
    },
    //点取消，保存对话框消失
    saveAlert() {
      this.use_dialog = true
    },
    // 打开摄像头
    getCompetence() {
      var that = this
      that.loading = true

      this.noAvatar = true

      that.testImageUrl = ''
      that.use_video = true

      this.$nextTick(() => {
        var videoContain = document.getElementsByClassName('video-contain')
        that.videoWidth = videoContain[0].offsetWidth
        that.videoHeight = videoContain[0].offsetHeight
        that.thisVideo = document.getElementById('videoCamera')
        that.thisCanvas = document.getElementById('canvasCamera')
        that.thisContext = that.thisCanvas.getContext('2d')

        // 旧版本浏览器可能根本不支持mediaDevices，我们首先设置一个空对象
        if (navigator.mediaDevices === undefined) {
          navigator.mediaDevices = {}
        }
        // 一些浏览器实现了部分mediaDevices，我们不能只分配一个对象
        // 使用getUserMedia，因为它会覆盖现有的属性。
        // 这里，如果缺少getUserMedia属性，就添加它。
        if (navigator.mediaDevices.getUserMedia === undefined) {
          navigator.mediaDevices.getUserMedia = function(constraints) {
            // 首先获取现存的getUserMedia(如果存在)
            var getUserMedia =
              navigator.webkitGetUserMedia ||
              navigator.mozGetUserMedia ||
              navigator.getUserMedia
            // 有些浏览器不支持，会返回错误信息
            // 保持接口一致
            if (!getUserMedia) {
              return Promise.reject(
                new Error('getUserMedia is not implemented in this browser')
              )
            }
            // 否则，使用Promise将调用包装到旧的navigator.getUserMedia
            return new Promise(function(resolve, reject) {
              getUserMedia.call(navigator, constraints, resolve, reject)
            })
          }
        }
        var constraints = {
          audio: false,
          video:
            {
              width: that.videoWidth,
              height: that.videoHeight,
              transform: 'scaleX(-1)'
            }
        }
        navigator.mediaDevices
          .getUserMedia(constraints)
          .then(function(stream) {
            // 旧的浏览器可能没有srcObject
            if ('srcObject' in that.thisVideo) {
              that.thisVideo.srcObject = stream
            } else {
              // 避免在新的浏览器中使用它，因为它正在被弃用。
              that.thisVideo.src = window.URL.createObjectURL(stream)
            }
            that.thisVideo.onloadedmetadata = function(e) {
              that.use_openButton = false
              that.loading = false
              that.thisVideo.play()
            }
          })
          .catch((err) => {
            this.$message.error('找不到摄像头，请检查是否连接！')
            that.loading = false
          })
      })
    },
    // 拍照功能，并显示图片
    setImage() {
      var that = this

      that.use_video = false //隐藏视频
      // if (that.thisCanvas == null) {
      //   this.$message.error('未获取到图像！请打开摄像头！')
      //   return
      // }
      // 点击，canvas画图
      that.thisCanvas.setAttribute('width', that.videoWidth)
      that.thisCanvas.setAttribute('height', that.videoHeight)
      that.thisContext.drawImage(
        that.thisVideo,
        0,
        0,
        that.thisVideo.videoWidth,
        that.thisVideo.videoHeight
      )
      // 获取图片base64链接
      var image = that.thisCanvas.toDataURL('image/png')
      that.imgSrc = image
      that.$emit('refreshDataList', that.imgSrc)
      that.use_video = false
      that.stopCompetence()

      that.videoWidth = ''
      that.videoHeight = ''
    },
    //关闭摄像头
    stopCompetence() {
      var that = this
      if (that.use_openButton == false) {
        that.thisVideo.srcObject.getTracks()[0].stop()
        that.use_openButton = true
      }
    }
  }

}
</script>
<style lang="scss">
.avatar-uploader {
  display: inline-block;
  margin-left: 1vh;
}

.avatar-uploader .el-upload {
  display: block !important;
  text-align: left !important;
}

.avatar-img {
  height: 100%;
  width: 100%;
  margin: 0 auto;
  max-width: 630px;
  max-height: 450px;
}

#data-collection,
.el-row,
.el-col {
  height: 100%;
}

.icon {
  width: 1em;
  height: 1em;
  vertical-align: -0.15em;
  fill: currentColor;
  overflow: hidden;
}

/* 左边 */
.left-contain {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin: 2vh;
}

.btn-container {
  margin: 2vh;
}


.video-contain {
  display: flex;
  width: 88vh;
  height: 50vh;
  max-width: 630px;
  max-height: 360px;
  //height: 450px;
  //width: ;
  // border: 3px solid #eee;
  //margin: 8vh auto;
}

.video-contain #videoCamera {
  height: 100%;
  width: 100%;
  //margin: 0 10px 0 10px;
}

.video-contain #canvasCamera {
  height: 100%;
  width: 100%;
  // display: none;
}

/* 右边 */
#data-collection .right-contain {
  //display: flex;
  height: 100%;
  box-sizing: border-box;

  padding: 40px 20px;
  overflow: auto;
}

.right-contain .el-form-item__label {
  width: 210px !important;
  text-align: left;
}

.right-contain .el-form-item__content {
  margin-left: 210px !important;
}

.form-item-btn .el-form-item__content {
  margin: 0 auto !important;
  text-align: center
}
</style>


