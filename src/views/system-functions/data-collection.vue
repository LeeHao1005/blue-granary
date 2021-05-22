<template>
  <div id="data-collection" >
    <el-row :gutter="20">
      <el-col :span="16">
        <!-- 视频 -->
        <div class="video-grid-content bg-purple left-contain">
          <div class="video-contain">
            <video id="videoCamera" autoplay v-show="use_video"></video>
            <canvas id="canvasCamera" v-show="use_photo"></canvas>
            <!-- style="background-color: #198236" -->
            <div v-if="use_photo" class="img_bg_camera">
              <img :src="imgSrc" alt="" />
            </div>
          </div>
          <div>
<!--            <svg class="icon" aria-hidden="true">-->
<!--              <use xlink:href="#icon-shexiangtou"></use>-->
<!--            </svg>-->
            <el-button type="primary" @click="getCompetence" >
              <svg class="icon" aria-hidden="true">
                <use xlink:href="#icon-shexiangtou"></use>
              </svg>
             打开摄像头</el-button>
            <el-button type="primary" @click="postPic">识别</el-button>
          </div>
        </div>
      </el-col>
      <!-- 表单 -->
      <el-col :span="8" v-show="use_results">
        <div class="content bg-purple right-contain">
          <router-view />
          <el-form ref="form" :model="form" label-width="80px">
            <!--图像名称显示-->
            <el-form-item label="图像名称">
              <el-input
                v-model="form.pictureName"
                :disabled="unmodify"
              ></el-input>
            </el-form-item>
            <!--图像参数显示-->
            <el-form-item
              v-for="(item, index) in form.parameters"
              :key="item.id"
              :label="index"
              v-show="item"
            >
              <!--显示识别结果-->
              <el-input
                v-model="form.parameters[index]"
                :disabled="unmodify"
                v-if="item"
                >`
              </el-input>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="isChange">修改</el-button>
              <el-button type="primary" @click="saveAlert">确认</el-button>
<!--              <el-button type="primary" @click="paramsSet_Type1"-->
<!--                >test</el-button-->

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
import axios from "axios";
export default {
  name: "DataCollection",
  data() {
    return {
      form: {
        pictureType: "-1",
        pictureName: "",
        parameters: {},
        filepath: null,
      },
      orgdata: null,
      imgSrc: "",
      thisCanvas: null,
      thisContext: null,
      thisVideo: null,
      videoWidth: "",
      videoHeight: "",
      use_video: true,
      use_photo: true,
      use_results: false,
      use_dialog: false,
      unmodify: true,
      isSave: true,
    };
  },
  //页面加载后开启 自动打开摄像头
  mounted() {
    this.getCompetence();
  },
  //页面销毁后执行 自动关闭摄像头
  destroyed() {
    this.stopCompetence();
  },
  methods: {
    // 向后台提交图片base64编码，并获取显示结果
    postPic() {
      this.setImage();
      var that = this;
      this.req({
        url: "/camera/getParamsLocal",
        data: {
          picture: that.imgSrc,
        },
        method: "POST",
      }).then(
        (res) => {
          if (res.code == "200") {
            that.use_results = true;
            that.orgdata = res.data.data;
            var datajson = JSON.parse(res.data.data);
            console.log(res);
            // console.log(res.type);
            // console.log(datajson);
            that.form.filepath = res.data.filepath;
            switch (res.data.type) {
              case 1:
                that.form.pictureName = "间接蒸煮";
                that.form.pictureType = 1;
                that.paramsSet_Type1(datajson);
                break;
              case 2:
                that.form.pictureName = "直接蒸煮+固液分离";
                that.form.pictureType = 2;
                that.paramsSet_Type2(datajson);
                // console.log(datajson)
                break;
              case 3:
                that.form.pictureName = "干燥机";
                that.form.pictureType = 3;
                that.paramsSet_Type3(datajson);
                break;
            }
            this.$message({
              message: "识别成功",
              type: "success",
            });
          } else {
            this.$message.error(res.message);
          }
        },
        (err) => {
          that.passwordError = true;
          this.$message.error("识别失败！");
        }
      );
    },
    // 修改数据（格式化数据）
    //第一种类型图
    paramsSet_Type1(p) {
      // const p = {
      //   "1D01A-W01TT03": "25.71℃",
      //   "1D01A-W01TT02": "25.63℃",
      //   "1D01A-W01PT01": "0.21 bar",
      //   "2D01A-W01TT03": "",
      //   "2D01A-W01TT02": "",
      //   "2D01A-W01PT01": "",
      // };
      const temp = {
        "1D01A-W01TT03蒸汽温度": "",
        "1D01A-W01TT02蒸汽温度": "",
        "1D01A-W01PT01进料时压力": "",
        "2D01A-W01TT03蒸汽温度": "",
        "2D01A-W01TT02蒸汽温度": "",
        "2D01A-W01PT01进料时压力": "",
      };
      for (const key in p) {
        if (key == "1D01A-W01TT03" && p[key]) {
          temp[key + "蒸汽温度"] = p[key];
        } else if (key == "2D01A-W01TT03" && p[key]) {
          temp[key + "蒸汽温度"] = p[key];
        } else if (key == "1D01A-W01TT02" && p[key]) {
          temp[key + "蒸汽温度"] = p[key];
        } else if (key == "2D01A-W01TT02" && p[key]) {
          temp[key + "蒸汽温度"] = p[key];
        } else if (key == "1D01A-W01PT01" && p[key]) {
          temp[key + "进料时压力"] = p[key];
        } else if (key == "2D01A-W01PT01" && p[key]) {
          temp[key + "进料时压力"] = p[key];
        }
      }
      this.form.parameters = temp;
    },
    //第二种类型图
    paramsSet_Type2(p) {
      var that = this;
      // var p = {
      //   "1D01A-W02TC01": { SP: "89.0C", CV: "100%" },
      //   "1D01A-W02M01": "0.00%",
      //   "1D01A-W02PT02": "-0.06 bar",
      //   "Diff speed": "9 rpm",
      //   "Bowl speed": "3449 rpm",
      //   "MD Temp": "54 ℃",
      //   "GB Temp": "53 ℃",
      //   "2D01A-W02TC01": "",
      //   "2D01A-W02M01": "",
      //   "2D01A-W02PT02": "",
      // };
      const temp = {
        "1D01A-W02TC01": "",
        "1D01A-W02M01进料速度": "",
        "1D01A-W02PT02气体压力": "",
        "Diff speed离心转速": "",
        "Bowl speed离心转速": "",
        "MD Temp温度": "",
        "GB Temp温度": "",
        "2D01A-W02TC01": "",
        "2D01A-W02M01进料速度": "",
        "2D01A-W02PT02气体压力": "",
      };
      let t = "";
      for (const key in p) {
        if (key == "1D01A-W02TC01" ) {
          for (var ckey in p["1D01A-W02TC01"]) {
            if (ckey == "CV" && p["1D01A-W02TC01"][ckey]) {
              t = t + "阀的开度调节值" + p["1D01A-W02TC01"][ckey];
            } else if (ckey == "SP" && p["1D01A-W02TC01"][ckey]) {
              t = t + "蒸汽调节温度:" + p["1D01A-W02TC01"][ckey] + " ";
            }
          }
          temp["1D01A-W02TC01"] = t;
          t = "";
        } else if (key == "2D01A-W02TC01") {
          for (var ckey in p["2D01A-W02TC01"]) {
            if (ckey == "SP" && p["2D01A-W02TC01"][ckey]) {
              t = t + "蒸汽调节温度：" + p["2D01A-W02TC01"][ckey] + "  ";
            } else if (ckey == "CV" && p["2D01A-W02TC01"][ckey]) {
              t = t + "阀的开度调节值：" + p["2D01A-W02TC01"][ckey];
            }
          }
          temp["2D01A-W02TC01"] = t;
          t = "";
        } else if (key == "1D01A-W02M01" && p[key]) {
          temp[key + "进料速度"] = p[key];
        } else if (key == "2D01A-W02M01" && p[key]) {
          temp[key + "进料速度"] = p[key];
        } else if (key == "1D01A-W02PT02" && p[key]) {
          temp[key + "气体压力"] = p[key];
        } else if (key == "2D01A-W02PT02" && p[key]) {
          temp[key + "气体压力"] = p[key];
        } else if (key == "Diff speed") {
          temp[key + "离心转速"] = p[key];
        } else if (key == "Bowl speed") {
          temp[key + "离心转速"] = p[key];
        } else if (key == "MD Temp") {
          temp[key + "温度"] = p[key];
        } else if (key == "GB Temp") {
          temp[key + "温度"] = p[key];
        }
      }
      that.form.parameters = temp;
    },
    //第三种类型图
    paramsSet_Type3(p) {
      // const p = {
      //   '2J01A-T01CV01': '11.54% Open',
      //   '2J01A-T01TT01': '74.32℃',
      //   '2J01A-T01TT02': '88.55℃',
      //   '2J01A-T01PT01': '0.49 bar',
      //   '2J01A-T01TT04': '94.45℃'
      // }
      const temp = {
        "2J01A-T01CV01": "",
        "2J01A-T01TT01蒸汽温度": "",
        "2J01A-T01TT02蒸汽温度": "",
        "2J01A-T01PT01蒸汽压力": "",
        "2J01A-T01TT04蒸汽温度": "",
      };
      for (const key in p) {
        if (key == "2J01A-T01CV01" && p[key]) {
          temp[key] = p[key];
        } else if (key == "2J01A-T01TT01" && p[key]) {
          temp[key + "蒸汽温度"] = p[key];
        } else if (key == "2J01A-T01TT02" && p[key]) {
          temp[key + "蒸汽温度"] = p[key];
        } else if (key == "2J01A-T01PT01" && p[key]) {
          temp[key + "蒸汽压力"] = p[key];
        } else if (key == "2J01A-T01TT04" && p[key]) {
          temp[key + "蒸汽温度"] = p[key];
        }
      }
      this.form.parameters = temp;
    },
    //改变输入框的可编辑性
    isChange() {
      this.unmodify = false;
    },
    //提交后台数据库，确认键
    onSubmit() {
      this.use_dialog = false;
      let that = this;
      if (that.form.pictureType == "1") {
        if (that.form.parameters["1D01A-W01TT03蒸汽温度"] != "") {
          var orgkey1 = "1D01A-W01TT03蒸汽温度";
          var orgvalue1 = that.form.parameters["1D01A-W01TT03蒸汽温度"];
          var orgkey2 = "1D01A-W01TT02蒸汽温度";
          var orgvalue2 = that.form.parameters["1D01A-W01TT02蒸汽温度"];
          var orgkey3 = "1D01A-W01PT01进料时压力";
          var orgvalue3 = that.form.parameters["1D01A-W01PT01进料时压力"];
        } else if (that.form.parameters["2D01A-W01TT03蒸汽温度"] != "") {
          var orgkey1 = "2D01A-W01TT03蒸汽温度";
          var orgvalue1 = that.form.parameters["2D01A-W01TT03蒸汽温度"];
          var orgkey2 = "2D01A-W01TT02蒸汽温度";
          var orgvalue2 = that.form.parameters["2D01A-W01TT02蒸汽温度"];
          var orgkey3 = "2D01A-W01PT01进料时压力";
          var orgvalue3 = that.form.parameters["2D01A-W01PT01进料时压力"];
        }
        this.req({
          url: "/basicInfo/create1",
          data: {
            photoType: that.form.pictureType,
            shipNumber: "1",
            key1: orgkey1,
            value1: orgvalue1,
            key2: orgkey2,
            value2: orgvalue2,
            key3: orgkey3,
            value3: orgvalue3,
            filepath: that.form.filepath,
          },
          method: "POST",
        }).then(
          (res) => {
            if (res.code == "200") {
              this.$message({ message: "保存成功", type: "success" });
            }
            else{
              this.$message.error(res.message);
            }
          },
          (err) => {
            this.passwordError = true;
            this.$message.error("保存失败");
          }
        );
        that.form.pictureType = "-1"
      } else if (that.form.pictureType == "2") {
        if (that.form.parameters["1D01A-W02TC01"] != "") {
          var orgkey1 = "1D01A-W02TC01";
          var orgvalue1 = that.form.parameters["1D01A-W02TC01"];
          var orgkey2 = "1D01A-W02M01进料速度";
          var orgvalue2 = that.form.parameters["1D01A-W02M01进料速度"];
          var orgkey3 = "1D01A-W02PT02气体压力";
          var orgvalue3 = that.form.parameters["1D01A-W02PT02气体压力"];
          var orgkey4 = "Diff speed离心转速";
          var orgvalue4 = that.form.parameters["Diff speed离心转速"];
          var orgkey5 = "Bowl speed离心转速";
          var orgvalue5 = that.form.parameters["Bowl speed离心转速"];
          var orgkey6 = "MD Temp温度";
          var orgvalue6 = that.form.parameters["MD Temp温度"];
          var orgkey7 = "GB Temp温度";
          var orgvalue7 = that.form.parameters["GB Temp温度"];
        } else if (that.form.parameters["2D01A-W02TC01"] != "") {
          var orgkey1 = "2D01A-W02TC01";
          var orgvalue1 = that.form.parameters["2D01A-W02TC01"];
          var orgkey2 = "2D01A-W02M01进料速度";
          var orgvalue2 = that.form.parameters["2D01A-W02M01进料速度"];
          var orgkey3 = "2D01A-W02PT02气体压力";
          var orgvalue3 = that.form.parameters["2D01A-W02PT02气体压力"];
          var orgkey4 = "Diff speed离心转速";
          var orgvalue4 = that.form.parameters["Diff speed离心转速"];
          var orgkey5 = "Bowl speed离心转速";
          var orgvalue5 = that.form.parameters["Bowl speed离心转速"];
          var orgkey6 = "MD Temp温度";
          var orgvalue6 = that.form.parameters["MD Temp温度"];
          var orgkey7 = "GB Temp温度";
          var orgvalue7 = that.form.parameters["GB Temp温度"];
        }
        this.req({
          url: "/basicInfo/create2",
          data: {
            photoType: that.form.pictureType,
            shipNumber: "1",
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
            filepath: that.form.filepath,
          },
          method: "POST",
        }).then(
          (res) => {
            if (res.code == "200") {
              this.$message({ message: "保存成功", type: "success" });
            }
            else{
              this.$message.error(res.message);
            }
          },
          (err) => {
            this.passwordError = true;
            this.$message.error("保存失败");
          }
        );
        that.form.pictureType = "-1"
      } else if (that.form.pictureType == "3") {
        if (that.form.parameters["2J01A-T01CV01"] != "") {
          var orgkey1 = "2J01A-T01CV01";
          var orgvalue1 = that.form.parameters["2J01A-T01CV01"];
          var orgkey2 = "2J01A-T01TT01蒸汽温度";
          var orgvalue2 = that.form.parameters["2J01A-T01TT01蒸汽温度"];
          var orgkey3 = "2J01A-T01TT02蒸汽温度";
          var orgvalue3 = that.form.parameters["2J01A-T01TT02蒸汽温度"];
          var orgkey4 = "2J01A-T01PT01蒸汽压力";
          var orgvalue4 = that.form.parameters["2J01A-T01PT01蒸汽压力"];
          var orgkey5 = "2J01A-T01TT04蒸汽温度";
          var orgvalue5 = that.form.parameters["2J01A-T01TT04蒸汽温度"];
        }
        this.req({
          url: "/basicInfo/create3",
          data: {
            photoType: that.form.pictureType,
            shipNumber: "1",
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
            filepath: that.form.filepath,
          },
          method: "POST",
        }).then(
          (res) => {

            if (res.code == "200") {
              this.$message({ message: "保存成功", type: "success" });
            }
            else{
              this.$message.error(res.message);
            }
          },
          (err) => {
            this.passwordError = true;
            this.$message.error("保存失败");
          }
        );
        that.form.pictureType = "-1"
      }
      else{
        this.$message.error("保存失败");
      }
    },
    //点取消，对话框消失
    saveAlert() {
      this.use_dialog = true;
    },
    // 打开摄像头
    getCompetence() {
      var _this = this;
      _this.use_video = true;
      _this.use_photo = false;

      this.thisVideo = document.getElementById("videoCamera");
      this.thisCanvas = document.getElementById("canvasCamera");
      this.thisContext = this.thisCanvas.getContext("2d");

      // 旧版本浏览器可能根本不支持mediaDevices，我们首先设置一个空对象
      if (navigator.mediaDevices === undefined) {
        navigator.mediaDevices = {};
      }
      // 一些浏览器实现了部分mediaDevices，我们不能只分配一个对象
      // 使用getUserMedia，因为它会覆盖现有的属性。
      // 这里，如果缺少getUserMedia属性，就添加它。
      if (navigator.mediaDevices.getUserMedia === undefined) {
        navigator.mediaDevices.getUserMedia = function (constraints) {
          // 首先获取现存的getUserMedia(如果存在)
          var getUserMedia =
            navigator.webkitGetUserMedia ||
            navigator.mozGetUserMedia ||
            navigator.getUserMedia;
          // 有些浏览器不支持，会返回错误信息
          // 保持接口一致
          if (!getUserMedia) {
            return Promise.reject(
              new Error("getUserMedia is not implemented in this browser")
            );
          }
          // 否则，使用Promise将调用包装到旧的navigator.getUserMedia
          return new Promise(function (resolve, reject) {
            getUserMedia.call(navigator, constraints, resolve, reject);
          });
        };
      }
      var constraints = {
        audio: false,
        video: {
          width: this.videoWidth,
          height: this.videoHeight,
          // transform: "scaleX(1)",
        },
      };
      navigator.mediaDevices
        .getUserMedia(constraints)
        .then(function (stream) {
          // 旧的浏览器可能没有srcObject
          if ("srcObject" in _this.thisVideo) {
            _this.thisVideo.srcObject = stream;
          } else {
            // 避免在新的浏览器中使用它，因为它正在被弃用。
            _this.thisVideo.src = window.URL.createObjectURL(stream);
          }
          _this.thisVideo.onloadedmetadata = function (e) {
            _this.thisVideo.play();
          };
        })
        .catch((err) => {
          this.$message.error("找不到摄像头，请检查是否连接！");
        });
    },
    // 拍照功能，并显示图片
    setImage() {
      var _this = this;
      _this.use_video = false; //隐藏视频
      _this.use_photo = true; //显示照片
      // 点击，canvas画图
      // this.thisCanvas.setAttribute("width", 1000);
      // this.thisCanvas.setAttribute("height", 1000);
      this.thisContext.drawImage(
        this.thisVideo,
        0,
        0,
        this.thisVideo.videoWidth,
        this.thisVideo.videoHeight
      );
      // 获取图片base64链接
      var image = this.thisCanvas.toDataURL("image/png");
      _this.imgSrc = image;
      this.$emit("refreshDataList", _this.imgSrc);
      // console.log(_this.imgSrc);
      _this.use_video = false;
      this.thisVideo.srcObject.getTracks()[0].stop();
    },
    //关闭摄像头
    stopCompetence() {
      this.thisVideo.srcObject.getTracks()[0].stop();
    },
  },
};
</script>
<style lang="scss">
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
#data-collection .left-contain {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

#data-collection .video-contain {
  display: flex;
  height: 80%;
  width: 80%;
  //border: 3px solid #eee;
  margin: 10vh 0 20px;
}

#videoCamera {
  height: 80%;
  width: 80%;
  margin: 0 auto;
}

#canvasCamera {
  height: 80%;
  width: 80%;
  display: none;
}

/* 右边 */
#data-collection .right-contain {
  height: 100%;
  box-sizing: border-box;
  border-left: 3px solid #eeeeee;
  padding: 40px 20px;
  overflow: auto;
}

.camera_outer {
  position: relative;
  overflow: hidden;
  background-size: 100%;
  video,
  canvas,
  .tx_img {
    -moz-transform: scaleX(-1);
    -webkit-transform: scaleX(-1);
    -o-transform: scaleX(-1);
    transform: scaleX(-1);
  }
  .btn_camera {
    position: absolute;
    bottom: 4px;
    left: 0;
    right: 0;
    height: 50px;
    background-color: rgba(0, 0, 0, 0.3);
    line-height: 50px;
    text-align: center;
    color: #ffffff;
  }
  .bg_r_img {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    top: 0;
  }
  .img_bg_camera {
    position: absolute;
    right: 0;
    top: 0;
    img {
      width: 100%;
      height: 100%;
    }
    .img_btn_camera {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 50px;
      line-height: 50px;
      text-align: center;
      background-color: rgba(0, 0, 0, 0.3);
      color: #ffffff;
      .loding_img {
        width: 50px;
        height: 50px;
      }
    }
  }
}
</style>


