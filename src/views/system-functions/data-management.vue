<template>
  <div style="overflaw: scroll" class="root-data-management">
    <!--选择查询条件-->
    <div class="data_select">
      <!--日期选择-->
      <el-form :inline="true">
        <el-form-item label="查询日期"></el-form-item>
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
        <el-form-item label="查询类型" style="margin-left: 30px"></el-form-item>
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
        <el-button type="primary" icon="el-icon-search" @click="getAllData" style="margin-left: 30px">查询</el-button>
        <el-button type="primary" icon="el-icon-folder-opened" @click="goExport" style="margin-left: 30px">导出所有数据</el-button>
      </el-form>
    </div>
    <div class="grid-content ">
      <!--数据显示-->
      <div class="data-contain">
        <el-table :data="tableData"
                  border
                  style="width: 100%"
                  :header-cell-style="{background:'#eef1f6',color:'#606266'}"
        >
          <el-table-column
            v-for="(item, index) in tableLable1"
            :key="index"
            :prop="item.prop"
            :label="item.label"
            align="center"
          >
          </el-table-column>
          <el-table-column v-if="istype2"
            label="阀的开度调节值 + 蒸汽调节温度"
            align="center"
          >
            <el-table-column
              v-for="(aitem, aindex) in subtableLabletype2"
              :prop="aitem.prop"
              :key="aitem.code"
              :label="aitem.label"
              align="center"
            >
            </el-table-column>
          </el-table-column >
          <el-table-column
            v-if="istype2"
            v-for="(bitem, bindex) in tableLabletype2"
            :key="bitem.id"
            :prop="bitem.prop"
            :label="bitem.label"
            align="center"
          >
          </el-table-column>
          <!--图片路径列-->
          <el-table-column
            width="360"
            v-for="(citem,cindex) in tableLable2"
            :key="citem.id"
            :prop="citem.prop"
            :label="citem.label"
            align="center"
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
import { export2Excel } from '@/assets/js/excelexport'

export default {
  name: 'DataManagement',
  data() {
    return {
      tableData: null,
      tableLable1: [],
      tableLable2: [],
      tableLabletype2: [],
      subtableLabletype2: [],
      options: [
        {
          value: '1',
          label: '间接蒸煮'
        },
        {
          value: '2',
          label: '直接蒸煮+固液分离'
        },
        {
          value: '3',
          label: '干燥机'
        },
        {
          value: '4',
          label: '选项4',
          disabled: true
        },
        {
          value: '5',
          label: '选项5',
          disabled: true
        }
      ],
      total: null,
      paginationShow: true,
      currentPage: 1,
      pageSize: 10,
      istype2:false,
      pic_type: '1',
      min: '',
      max: '',
      // valueDate: [new Date(2000, 10, 10, 10, 10), new Date(2000, 10, 11, 10, 10)],
      valueDate: [],

      json_meta: [
        [
          {
            ' key ': ' charset ',
            ' value ': ' utf- 8 '
          }
        ]
      ],

      titleNameArr: ['间接蒸煮', '直接蒸煮+固液分离', '干燥机'],
      list: [
        [
          [
            // "序号",
            '船号',
            '蒸汽温度1(℃)',
            '蒸汽温度2(℃)',
            '进料时压力(bar)',
            '保存路径',
            '时间'
          ]
        ],
        [
          [
            // "序号",
            '船号',
            // '蒸汽调节温度+阀的开度调节',
            '蒸汽调节温度(℃)',
            '阀的开度调节值(%)',
            '进料速度(%)',
            '气体压力(bar)',
            '离心转速 Diff speed(rpm)',
            '离心转速 Bowl speed(tpm)',
            '温度 MD Temp(℃)',
            '温度 GB Temp(℃)',
            '保存路径',
            '时间'
          ]
        ],
        [
          [
            // "序号",
            '船号',
            '2J01A-T01CV01(%)',
            '蒸汽温度 2J01A-T01TT01(℃)',
            '蒸汽温度 2J01A-T01TT02(℃)',
            '蒸汽压力 2J01A-T01PT01(bar)',
            '蒸汽温度 2J01A-T01TT04(℃)',
            '保存路径',
            '时间'
          ]
        ]
      ],
      excelTitleName: '数据信息汇总'
    }
  },
  mounted: function() {
    this.getAllData()

  },
  methods: {

    // 导出excel分sheet
    goExport() {
      var that = this
      this.req({
        url: 'datas/exportAll',
        data: {},
        method: 'GET'
      }).then(
        (res) => {
          if (res.code == '200') {
            that.dataDeal(res.data)
            export2Excel(this.titleNameArr, this.list, this.excelTitleName)
          } else {
            this.$message.error(res.message)
          }
        },
        (err) => {
          this.$message.error('导出失败！')
        }
      )
    },

    dataDeal(data) {
      var that = this
      for (var item in data) {
        if (item == '1') {
          for (var i in data[1]) {
            var listS = []
            listS = [
              // data[1][i].id,
              data[1][i].shipNumber,
              data[1][i].value1,
              data[1][i].value2,
              data[1][i].value3,
              data[1][i].filepath,
              that.dateFilter(data[1][i].createTime)
            ]
            that.list[0].push(listS)
          }
        } else if (item == '2') {
          for (var i in data[2]) {
            var listS = [];
            listS = [
              // data[2][i].id,
              data[2][i].shipNumber,
              JSON.parse(data[2][i].value1)['蒸汽调节温度(℃)'],
              JSON.parse(data[2][i].value1)['阀的开度调节值(%)'],
              data[2][i].value2,
              data[2][i].value3,
              data[2][i].value4,
              data[2][i].value5,
              data[2][i].value6,
              data[2][i].value7,
              data[2][i].filepath,
              that.dateFilter(data[2][i].createTime)
            ]
            that.list[1].push(listS)
          }
        } else if (item == '3') {
          for (var i in data[3]) {
            var listS = []
            listS = [
              // data[3][i].id,
              data[3][i].shipNumber,
              data[3][i].value1,
              data[3][i].value2,
              data[3][i].value3,
              data[3][i].value4,
              data[3][i].value5,
              data[3][i].filepath,
              that.dateFilter(data[3][i].createTime)
            ]
            that.list[2].push(listS)
          }
        }
      }
    },

    // 处理页码大小变动时候触发的事件
    // 每页显示个数 int
    handleSizeChange(val) {
      var that = this
      that.pageSize = val
      that.currentPage = 1
      that.getAllData()
    },

    // 处理当前页变动时候触发的事件
    // 当前页-默认1 int
    handleCurrentChange(val) {
      var that = this
      that.currentPage = val
      that.getAllData()
    },

    // 展示数据种类 默认第一类 String
    sortChange(selVal) {
      var that = this
      that.pic_type = selVal
    },

    // 时间选择 Date
    dateChoose() {
      var that = this
      that.min = that.valueDate[0]
      that.max = that.valueDate[1]
    },

    // 查询数据
    getAllData() {
      var that = this
      that.paginationShow = false
      that.tableData = null
      that
        .req({
          url:
            '/datas/listAllByType?pageNum=' +
            that.currentPage +
            '&pageSize=' +
            that.pageSize +
            '&type=' +
            that.pic_type +
            '&min=' +
            (that.min == '' ? '1999-01-01' : that.dateToString(that.min)) +
            '&max=' +
            (that.max == '' ? '2999-01-01' : that.dateToString(that.max)),
          data: {},
          method: 'GET'
        })
        .then(
          (res) => {
            if (res.code == 200) {
              var list = res.data.list
              list.forEach((element) => {
                var ss = that.dateFilter(element.createTime)
                element.createTime = ss
              })
              that.tableData = list

              that.total = res.data.total
              switch (that.pic_type) {
                case '1':
                  that.istype2 = false
                  that.tableLable1 = [
                    { label: '船舶编号', prop: 'shipNumber' },
                    { label: '蒸汽温度(℃)', prop: 'value1' },
                    { label: '蒸汽温度(℃)', prop: 'value2' },
                    { label: '进料时压力(bar)', prop: 'value3' },
                    { label: '生成时间', prop: 'createTime' },
                  ]
                  that.tableLable2 = [
                    { label: '图片路径', prop: 'filepath' },
                  ]
                  break
                case '2':
                  that.istype2 = true
                  for(var item in list){
                    that.tableData[item]['value1'] = JSON.parse(list[item]['value1'])
                  }
                  that.tableLable1 = [
                    { label: '船舶编号', prop: 'shipNumber' },
                  ]
                  that.subtableLabletype2 = [
                    { label: '蒸汽调节温度(℃)', prop: 'value1.蒸汽调节温度(℃)' },
                    { label: '阀的开度调节(%)', prop: 'value1.阀的开度调节值(%)' }
                  ]
                  that.tableLabletype2 = [
                    { label: '进料速度(%)', prop: 'value2' },
                    { label: '气体压力(bar)', prop: 'value3' },
                    { label: 'Diff speed离心转速(rpm)', prop: 'value4' },
                    { label: 'Bowl speed离心转速(rpm)', prop: 'value5' },
                    { label: 'MD Temp温度(℃)', prop: 'value6' },
                    { label: 'GB Temp温度(℃)', prop: 'value7' },
                    { label: '生成时间', prop: 'createTime' },
                  ]
                  that.tableLable2=[
                    { label: '图片路径', prop: 'filepath' }
                  ]
                  break
                case '3':
                  that.istype2 = false
                  that.tableLable1 = [
                    { label: '船舶编号', prop: 'shipNumber' },
                    { label: '2J01A-T01CV01(%)', prop: 'value1' },
                    { label: '2J01A-T01TT01蒸汽温度(℃)', prop: 'value2' },
                    { label: '2J01A-T01TT02蒸汽温度(℃)', prop: 'value3' },
                    { label: '2J01A-T01PT01蒸汽压力(bar)', prop: 'value4' },
                    { label: '2J01A-T01TT04蒸汽温度(℃)', prop: 'value5' },
                    { label: '生成时间', prop: 'createTime' },
                  ]
                  that.tableLable2 = [
                    { label: '图片路径', prop: 'filepath' },
                  ]
                  break
              }
            } else {
              this.$message.error(res.message)
            }
          },
          (err) => {
            this.$message.error(err.message)
            that.passwordError = true
            that.loading = false
          }
        )
      that.total = null
      that.min = ''
      that.max = ''
      that.valueDate = []

      this.$nextTick(function() {
        this.paginationShow = true
      })
    },

    dateToString(date) {
      var year = date.getFullYear() //获取完整的年份(4位,1970-????)
      var month = date.getMonth() + 1 //获取当前月份(0-11,0代表1月)
      var day = date.getDate() //获取当前日(1-31)
      if (month < 10) {
        month = '0' + month
      }
      if (day < 10) {
        day = '0' + day
      }
      var dateString = year + '-' + month + '-' + day
      return dateString
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

<style lang="scss">
.root-data-management {
  margin: 50px auto;
  width: 90%;
}
.data_select {
  //margin: 30px auto 30px 30px;
  display: block;
}

.grid-content {
  width: 100%;
  border: 2px solid #eee;
  margin: 20px auto;
}
</style>
