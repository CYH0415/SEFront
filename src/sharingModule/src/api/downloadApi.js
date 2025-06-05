import axios from 'axios';

const downloadApi = axios.create({
  baseURL: 'http://localhost:8081/sharing-system',
  timeout: 5000
});

export default downloadApi;