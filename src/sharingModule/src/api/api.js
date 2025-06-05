import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8081/sharing-system',
  timeout: 5000
});

// 响应拦截器
api.interceptors.response.use(
  response => {
    // 成功时直接返回后端返回的对象
    return response.data;
  },
  error => {
    // 失败时返回一个统一格式的 ApiResult 对象
    const result = {
      code: 0,
      msg: (error.response && error.response.data && error.response.data.msg) ||
           error.message || 
           '请求失败',
      data: null
    };
    // 使用 Promise.resolve 让调用处不抛异常
    return Promise.resolve(result);
  }
);

export default api;
