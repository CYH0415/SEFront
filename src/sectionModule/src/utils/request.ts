import axios from 'axios';

const request = axios.create({
  baseURL: '/api',
  timeout: 5000,
});

request.interceptors.response.use(
  res => res,
  err => {
    console.error(err);
    return Promise.reject(err);
  }
);

export default request;