import { defineStore } from 'pinia';
import axios from 'axios';
import router from '../router'; // 确保路径正确
import { ElMessage } from 'element-plus';

// Store 的 state 结构
interface UserState {
    token: string | null;
    loading: boolean;
    error: string | null;
}

// !! 重要: 这是一个用于前端测试的模拟标志。记得在连接真实后端时移除或设为 false !!
const MOCK_BACKEND = false; // <--- 添加一个开关来控制模拟行为

export const userStore = defineStore('user', {
    state: (): UserState => ({
        token: localStorage.getItem('token') || null,
        loading: false,
        error: null,
    }),

    getters: {
        isLoggedIn: (state) => !!state.token,
        getToken: (state) => state.token,
    },

    actions: {
        setToken(token: string) {
            this.token = token;
            localStorage.setItem('token', token);
            // 在模拟时，我们可能不需要设置 axios 默认头部，但保留也无妨
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            this.error = null;
        },

        clearToken() {
            this.token = null;
            localStorage.removeItem('token');
            delete axios.defaults.headers.common['Authorization'];
        },

        async login(credentials: { accountNumber: string; password: string }): Promise<boolean> {
            this.loading = true;
            this.error = null;

            if (MOCK_BACKEND) {
                // 模拟后端响应
                return new Promise((resolve) => {
                    setTimeout(() => { // 模拟网络延迟
                        // 根据特定凭据模拟成功或失败
                        if (credentials.accountNumber === 'testuser' && credentials.password === 'password') {
                            const fakeToken = 'mock-jwt-token-12345';
                            this.setToken(fakeToken);
                            ElMessage.success('模拟登录成功！');

                            /*const redirectPath = router.currentRoute.value.query.redirect as string;
                            if (redirectPath && redirectPath !== '/login' && redirectPath !== '/') {
                                router.push(redirectPath);
                            } else {
                                router.push('/'); // 默认跳转
                            }*/
                            resolve(true);
                        } else {
                            this.error = '模拟登录失败：账号或密码错误。';
                            this.clearToken();
                            ElMessage.error(this.error);
                            resolve(false);
                        }
                        this.loading = false;
                    }, 1000); // 1秒延迟
                });
            } else {
                // 原始的后端请求逻辑
                try {
                    const response = await axios.post<{ token: string }>('/api/auth/login', credentials);
                    const { token } = response.data;

                    if (token) {
                        this.setToken(token);
                        const redirectPath = router.currentRoute.value.query.redirect as string;
                        if (redirectPath && redirectPath !== '/login' && redirectPath !== '/') {
                            router.push(redirectPath);
                        } else {
                            router.push('/information-manage');
                        }
                        return true;
                    } else {
                        this.error = '登录响应数据中未找到Token';
                        this.clearToken();
                        return false;
                    }
                } catch (error: any) {
                    console.error('登录失败:', error);
                    this.clearToken();
                    if (error.response && error.response.data && error.response.data.message) {
                        this.error = error.response.data.message;
                    } else {
                        this.error = '账号或密码错误，或服务器无响应。';
                    }
                    return false;
                } finally {
                    this.loading = false;
                }
            }
        },

        logout() {
            this.clearToken();
            ElMessage.success('已成功退出登录');
        },

        async validateCurrentToken(): Promise<boolean> {
            if (MOCK_BACKEND) {
                // 模拟 token 验证
                return new Promise((resolve) => {
                    setTimeout(() => {
                        if (this.token && this.token.startsWith('mock-jwt-token')) {
                            // 假设所有以 'mock-jwt-token' 开头的 token 都有效
                            console.log('模拟Token验证成功');
                            this.error = null;
                            resolve(true);
                        } else {
                            console.log('模拟Token验证失败');
                            this.clearToken();
                            // 如果路由守卫依赖此结果，可能需要在此处重定向，但通常守卫会处理
                            // router.push('/login');
                            resolve(false);
                        }
                        this.loading = false;
                    }, 500);
                });
            } else {
                // 原始的后端请求逻辑
                if (!this.token) {
                    this.clearToken();
                    return false;
                }
                this.loading = true;
                try {
                    await axios.get('/api/auth/validate-token');
                    axios.defaults.headers.common['Authorization'] = `Bearer ${this.token}`;
                    this.error = null;
                    return true;
                } catch (error) {
                    console.error('Token 验证失败:', error);
                    this.clearToken();
                    if (axios.isAxiosError(error) && error.response && error.response.status === 401) {
                        router.push('/login');
                    }
                    return false;
                } finally {
                    this.loading = false;
                }
            }
        }
    },
});