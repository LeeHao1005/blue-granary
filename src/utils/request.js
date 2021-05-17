import axios from 'axios'
import {
  Message
} from 'element-ui'
import router from '../router'
// create an axios instance
const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API, // url = base url + request url
  // withCredentials: true, // send cookies when cross-domain requests
  timeout: 50000 // request timeout
})

// request interceptor
service.interceptors.request.use(
  config => {
    // do something before request is sent
    // console.log(localStorage.getItem('token'))
    config.headers.Authorization = "Bearer "+localStorage.getItem('token')

    return config
  },
  error => {
    // do something with request error
    return Promise.reject(error)
  }
)

// response interceptor
service.interceptors.response.use(
  /**
   * If you want to get http information such as headers or status
   * Please return  response => response
   */

  /**
   * Determine the request status by custom code
   * Here is just an example
   * You can also judge the status by HTTP Status Code
   */
  response => {
    // if the custom code is not 100, it is judged as an error.
    if (res.code == 401) {
      // Message({
      //   message: res.message || 'Error check your token or method',
      //   type: 'error',
      //   duration: 2 * 1000
      // })
      // console.log(1111111111)
      // console.log(this.$router)
      // this.$router.push({path: "/"});
      // // this.$store.dispatch('/').then(() => {
      // //   // this.$router.push({
      // //   //   path: '/'
      // //   // });
      //   console.log(22222)
      // })
      localStorage.clear();     //删除用户信息
      //如果超时就处理 ，指定要跳转的页面(比如登陆页)
      Message({
        message: 'token失效,请重新登录!',
        type: 'warning',
        duration:2000,
        center: true,
        onClose: function() {
          router.replace({
            path: '/',
          })
        }
      })
      return Promise.reject(new Error(res.message || 'Error'))
    } else {
      return res
    }
  },
  error => {
    console.log('err' + error) // for debug
    // Message({
    //   message: error.message,
    //   type: 'error',
    //   duration: 2 * 1000
    // })
    return Promise.reject(error)
  }
)

export default service.request
