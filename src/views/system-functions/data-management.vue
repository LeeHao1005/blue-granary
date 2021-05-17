<template>
  <div style="overflaw: scroll">
    <!--选择查询条件-->
    <div class="data_select">
      <!--日期选择-->
      <el-date-picker
        v-model="valueDate"
        type="datetimerange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        @change="dateChoose"
      >
      </el-date-picker>

      <!--类别选择-->
      <el-select v-model="pic_type" placeholder="请选择" @change="sortChange">
        <el-option
          v-for="item in options"
          :key="item.value"
          :label="item.label"
          :value="item.value"
          :disabled="item.disabled"
        >
        </el-option>
      </el-select>
      <el-button type="primary" @click="getAllData">查询</el-button>
      <el-button type="primary" @click="goExport">导出所有数据</el-button>
    </div>
    <div class="grid-content all-contain">
      <!--数据显示-->
      <div class="data-contain">
        <el-table :data="tableData" style="width: 100%">
          <el-table-column
            v-for="(item, index) in tableLable"
            :key="index"
            :prop="item.prop"
            :label="item.label"
          >
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
  </div>
</template>
<script>
import { export2Excel } from "@/assets/js/excelexport";
export default {
  name: "DataManagement",
  data() {
    return {
      tableData: null,
      tableLable: [],
      options: [
        {
          value: "1",
          label: "间接蒸煮",
        },
        {
          value: "2",
          label: "直接蒸煮+固液分离",
        },
        {
          value: "3",
          label: "干燥机",
        },
        {
          value: "4",
          label: "选项4",
          disabled: true,
        },
        {
          value: "5",
          label: "选项5",
          disabled: true,
        },
      ],
      total: null,
      paginationShow: true,
      currentPage: 1,
      pageSize: 10,
      pic_type: "1",
      min: "",
      max: "",
      // valueDate: [new Date(2000, 10, 10, 10, 10), new Date(2000, 10, 11, 10, 10)],
      valueDate: [],

      json_meta: [
        [
          {
            " key ": " charset ",
            " value ": " utf- 8 ",
          },
        ],
      ],

      titleNameArr: ["间接蒸煮", "直接蒸煮+固液分离", "干燥机"],
      list: [
        [
          [
            // "序号",
            "船号",
            "蒸汽温度1",
            "蒸汽温度2",
            "进料时压力",
            "保存路径",
            "时间",
          ],
        ],
        [
          [
            // "序号",
            "船号",
            "蒸汽调节温度+阀的开度调节",
            "进料速度",
            "气体压力",
            "离心转速 Diff speed",
            "离心转速 Bowl speed",
            "温度 MD Temp",
            "温度 GB Temp",
            "保存路径",
            "时间",
          ],
        ],
        [
          [
            // "序号",
            "船号",
            "2J01A-T01CV01",
            "蒸汽温度 2J01A-T01TT01",
            "蒸汽温度 2J01A-T01TT02",
            "蒸汽压力 2J01A-T01PT01",
            "蒸汽温度 2J01A-T01TT04",
            "保存路径",
            "时间",
          ],
        ],
      ],
      excelTitleName: "数据信息汇总",
    };
  },
  mounted: function () {
    this.getAllData();
  },
  methods: {
    // 导出excel分sheet
    goExport() {
      var that = this;
      this.req({
        url: "datas/exportAll",
        data: {},
        method: "GET",
      }).then(
        (res) => {
          if (res.code == "200") {
            that.dataDeal(res.data);
            console.log(res);
            export2Excel(this.titleNameArr, this.list, this.excelTitleName);
          } else {
            this.$message.error(res.message);
          }
        },
        (err) => {
          this.$message.error("导出失败！");
        }
      );
    },

    dataDeal(data) {
      var that = this;
      for (var item in data) {
        if (item == "1") {
          for (var i in data[1]) {
            var listS = [];
            listS = [
              // data[1][i].id,
              data[1][i].shipNumber,
              data[1][i].value1,
              data[1][i].value2,
              data[1][i].value3,
              data[1][i].filepath,
              that.dateFilter(data[1][i].createTime),
            ];
            that.list[0].push(listS);
          }
        } else if (item == "2") {
          for (var i in data[2]) {
            var listS = [];
            listS = [
              // data[2][i].id,
              data[2][i].shipNumber,
              data[2][i].value1,
              data[2][i].value2,
              data[2][i].value3,
              data[2][i].value4,
              data[2][i].value5,
              data[2][i].value6,
              data[2][i].value7,
              data[2][i].filepath,
              that.dateFilter(data[2][i].createTime),
            ];
            that.list[1].push(listS);
          }
        } else if (item == "3") {
          for (var i in data[2]) {
            var listS = [];
            listS = [
              // data[3][i].id,
              data[3][i].shipNumber,
              data[3][i].value1,
              data[3][i].value2,
              data[3][i].value3,
              data[3][i].value4,
              data[3][i].value5,
              data[3][i].filepath,
              that.dateFilter(data[3][i].createTime),
            ];
            that.list[2].push(listS);
          }
        }
      }
    },

    // 处理页码大小变动时候触发的事件
    // 每页显示个数 int
    handleSizeChange(val) {
      var that = this;
      that.pageSize = val;

      that.getAllData();
    },

    // 处理当前页变动时候触发的事件
    // 当前页-默认1 int
    handleCurrentChange(val) {
      console.log(val);
      var that = this;
      that.currentPage = val;
      that.getAllData();
    },

    // 展示数据种类 默认第一类 String
    sortChange(selVal) {
      var that = this;
      that.pic_type = selVal;
    },

    // 时间选择 Date
    dateChoose() {
      var that = this;
      that.min = that.valueDate[0];
      that.max = that.valueDate[1];
    },

    // 查询数据
    getAllData() {
      var that = this;
      that.paginationShow = false;
      that.tableData = null;
      that
        .req({
          url:
            "/datas/listAllByType?pageNum=" +
            that.currentPage +
            "&pageSize=" +
            that.pageSize +
            "&type=" +
            that.pic_type +
            "&min=" +
            (that.min == "" ? "1999-01-01" : that.dateToString(that.min)) +
            "&max=" +
            (that.max == "" ? "2999-01-01" : that.dateToString(that.max)),
          data: {},
          method: "GET",
        })
        .then(
          (res) => {
            if (res.code == 200) {
              var list = res.data.list;

              list.forEach((element) => {
                var ss = that.dateFilter(element.createTime);
                element.createTime = ss;
              });

              that.tableData = list;

              that.total = res.data.total;
              switch (that.pic_type) {
                case "1":
                  that.tableLable = [
                    // { label: "编号", prop: "id" },
                    { label: "船舶编号", prop: "shipNumber" },
                    // { label: "图片类型", prop: "photoType" },
                    { label: "生成时间", prop: "createTime" },
                    { label: "图片路径", prop: "filepath" },
                    { label: "蒸汽温度", prop: "value1" },
                    { label: "蒸汽温度", prop: "value2" },
                    { label: "进料时压力", prop: "value3" },
                  ];
                  break;
                case "2":
                  that.tableLable = [
                    // { label: "编号", prop: "id" },
                    { label: "船舶编号", prop: "shipNumber" },
                    // { label: "图片类型", prop: "photoType" },
                    { label: "生成时间", prop: "createTime" },
                    { label: "图片路径", prop: "filepath" },
                    { label: "蒸汽调节温度+阀的开度调节", prop: "value1" },
                    { label: "1D01A-W02M01进料速度", prop: "value2" },
                    { label: "1D01A-W02PT02气体压力", prop: "value3" },
                    { label: "Diff speed离心转速", prop: "value4" },
                    { label: "Bowl speed离心转速", prop: "value5" },
                    { label: "MD Temp温度", prop: "value6" },
                    { label: "GB Temp温度", prop: "value7" },
                  ];
                  break;
                case "3":
                  that.tableLable = [
                    // { label: "编号", prop: "id" },
                    { label: "船舶编号", prop: "shipNumber" },
                    // { label: "图片类型", prop: "photoType" },
                    { label: "生成时间", prop: "createTime" },
                    { label: "图片路径", prop: "filepath" },
                    { label: "2J01A-T01CV01", prop: "value1" },
                    { label: "蒸汽温度 2J01A-T01TT01", prop: "value2" },
                    { label: "蒸汽温度 2J01A-T01TT02", prop: "value3" },
                    { label: "蒸汽压力 2J01A-T01PT01", prop: "value4" },
                    { label: "蒸汽温度 2J01A-T01TT04", prop: "value5" },
                  ];
                  break;
              }
            } else {
              this.$message.error(res.message);
            }
          },
          (err) => {
            this.$message.error(err.message);
            that.passwordError = true;
            that.loading = false;
          }
        );

      that.total = null;
      that.min = "";
      that.max = "";
      that.valueDate = [];

      this.$nextTick(function () {
        this.paginationShow = true;
      });
    },

    dateToString(date) {
      var year = date.getFullYear(); //获取完整的年份(4位,1970-????)
      var month = date.getMonth() + 1; //获取当前月份(0-11,0代表1月)
      var day = date.getDate(); //获取当前日(1-31)
      if (month < 10) {
        month = "0" + month;
      }
      if (day < 10) {
        day = "0" + day;
      }
      var dateString = year + "-" + month + "-" + day;
      return dateString;
    },

    dateFilter(data) {
      var dt = new Date(data);
      var y = dt.getFullYear();
      var m = (dt.getMonth() + 1).toString().padStart(2, "0");
      var d = dt.getDate().toString().padStart(2, "0");
      var h = dt.getHours().toString().padStart(2, "0");
      var mm = dt.getMinutes().toString().padStart(2, "0");
      var s = dt.getSeconds().toString().padStart(2, "0");

      return y + "-" + m + "-" + d + " " + h + ":" + mm + ":" + s;
    },
  },
};
</script>

<style lang="scss">
.data_select {
  margin: 30px auto 30px 30px;
  display: block;
}

.grid-content {
  width: 90%;
  border: 2px solid #eee;
  margin: 10px auto;
}
</style>
