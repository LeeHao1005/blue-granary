import Vue from 'vue'
import 'normalize.css/normalize.css' // A modern alternative to CSS resets

import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import locale from 'element-ui/lib/locale/lang/zh-CN' // lang i18n

//引入 iconfont
import "./assets/iconfont/iconfont.js";
import "./assets/iconfont/iconfont.css"
// import SvgIcon from "@/components/svg-icon.vue";


import '@/styles/index.scss' // global css

import App from './App'
import store from './store'
import router from './router'
import request from '@/utils/request'

import '@/icons' // icon
import '@/permission' // permission control

import JsonExcel from 'vue-json-excel'

Vue.component('downloadExcel', JsonExcel)

// Vue.component("svg-icon", SvgIcon);

// set ElementUI lang to EN
Vue.use(ElementUI, { locale })

Vue.prototype.req = request

Vue.config.productionTip = false

new Vue({

  el: '#app',
  router,
  store,
  render: h => h(App)
})
