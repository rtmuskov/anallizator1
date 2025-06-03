import axios from 'axios';

const API_URL = 'http://localhost:5000/api'; // Убедитесь, что это правильный адрес вашего бэкенда

const $api = axios.create({
    // withCredentials: true, // Отключаем, так как используем токены в заголовке
    baseURL: API_URL
});

// Интерцептор для добавления токена к запросам (если он есть)
$api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Интерцептор для обработки ошибок, например, истекшего токена
$api.interceptors.response.use(response => response, async (error) => {
    // Здесь можно добавить логику обновления токена или перенаправления на страницу входа
    console.error('API Error:', error.response?.data);
    return Promise.reject(error);
});

export const authAPI = {
    async registration(email: string, password: string, profileData: any) {
        const response = await $api.post('/registration', { email, password, profileData });
        // При успешной регистрации сервер может вернуть токен, который мы сохраним
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
        }
        return response.data;
    },
    async login(email: string, password: string) {
        const response = await $api.post('/login', { email, password });
        // При успешном входе сервер должен вернуть токен, который мы сохраним
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
        }
        return response.data;
    },
    async checkAuth() {
        // Этот маршрут на бэкенде должен проверять токен в заголовке
        const response = await $api.get('/auth');
        return response.data; // Бэкенд должен вернуть данные пользователя, если токен валиден
    },
    async getUserProfile() {
        // Этот маршрут получает полный профиль пользователя, включая рост
        const response = await $api.get('/user/profile'); // Предполагаем такой эндпоинт на бэкенде
        return response.data; // Бэкенд должен вернуть объект UserInfo
    }
};

export default $api; // Экспортируем $api по умолчанию 