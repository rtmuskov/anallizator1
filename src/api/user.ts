import $api from './auth'; // Используем экземпляр axios из auth.ts

export const userAPI = {
    async getUserProfile() {
        // Этот маршрут на бэкенде должен возвращать данные профиля для текущего авторизованного пользователя
        const response = await $api.get('/user/profile');
        return response.data;
    },
    async updateUserProfile(profileData: Record<string, any>) {
        // Этот маршрут на бэкенде должен обновлять данные профиля для текущего авторизованного пользователя
        const response = await $api.put('/user/profile', profileData);
        return response.data;
    }
}; 