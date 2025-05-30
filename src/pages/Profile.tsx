import React, { useState, useEffect } from 'react';
import { Save, User as UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../api/user';
// import { User } from '../types'; // Возможно, тип User уже не совсем подходит, адаптируем formData

// Определим тип данных формы, основанный на ответе бэкенда
interface ProfileFormData {
  id?: number; // ID записи user_info
  name: string;
  age: number | '';
  gender: string;
  height: number | '';
  email: string; // Добавляем email на верхний уровень для удобства формы
  userId?: number; // ID пользователя из таблицы user
  // Добавьте другие поля user_info, если они есть
}

// Определим тип данных, который приходит с бэкенда
interface BackendProfileData {
    id: number;
    name: string | null;
    age: number | null;
    gender: string | null;
    height: number | null;
    userId: number;
    user: { // Вложенный объект user с маленькой буквы
        email: string;
    };
    // ... другие поля user_info
}

const Profile: React.FC = () => {
  const { user: authUser, isAuth } = useAuth(); // Получаем данные пользователя из контекста аутентификации
  
  const [formData, setFormData] = useState<ProfileFormData | null>(null); // Данные формы
  const [loading, setLoading] = useState(true); // Состояние загрузки данных профиля
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false); // Состояние загрузки при отправке формы

  // Эффект для загрузки данных профиля
  useEffect(() => {
    const fetchProfile = async () => {
      if (isAuth && authUser) { // Проверяем и isAuth, и наличие данных пользователя из контекста
        setLoading(true);
        try {
          const backendData: BackendProfileData = await userAPI.getUserProfile(); // Получаем данные с бэкенда
          
          console.log('Данные с бэкенда для профиля:', backendData); // Временное логирование

          // Преобразуем данные с бэкенда в формат формы
          setFormData({
              id: backendData.id,
              name: backendData.name || '',
              age: backendData.age === null ? '' : backendData.age,
              gender: backendData.gender || '',
              height: backendData.height === null ? '' : backendData.height,
              email: backendData.user.email, // <-- Исправлено: используем backendData.user.email
              userId: backendData.userId,
          });

          console.log('formData после обновления:', formData); // Временное логирование

        } catch (e: any) { // Указываем тип any для временного обхода ошибки, лучше уточнить тип ошибки
          console.error('Ошибка загрузки профиля:', e);
          // Если ошибка 404 (профиль не найден), возможно, пользователь новый, создаем пустую форму с email из контекста
           if (e.response && e.response.status === 404) {
               console.log('Профиль не найден, создаем пустую форму.');
               setFormData({
                   id: undefined,
                   name: '',
                   age: '',
                   gender: '',
                   height: '',
                   email: authUser.email, // Берем email из AuthContext
                   userId: authUser.id,
               });
           } else {
             // Другие ошибки - сбрасываем форму и сообщаем об ошибке
             setFormData(null);
             setErrors({ form: 'Не удалось загрузить данные профиля.' });
           }

        } finally {
          setLoading(false);
        }
      } else {
        // Если пользователь не авторизован или нет данных authUser, сбрасываем форму и isLoading
        setFormData(null);
        setLoading(false);
      }
    };

    fetchProfile();
  }, [isAuth, authUser]); // Зависимости от isAuth и authUser

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const target = e.target as HTMLInputElement | HTMLSelectElement; // Уточняем тип target
    const { name, value, type } = target;
    
    if (!formData) return;

    let newValue: string | number | null = value; // Добавляем null как возможный тип
    if (type === 'number') {
        // Проверяем, является ли значение числом перед парсингом
        newValue = value === '' ? '' : parseFloat(value);
        // Если парсинг дал NaN, считаем это null или '', в зависимости от нужного поведения
        if (isNaN(newValue as number)) newValue = ''; // Или null, если нужно хранить null
    }
    
    setFormData({
      ...formData,
      [name]: newValue,
    });
    
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };

  const validateForm = (): boolean => {
    if (!formData) return false; // Не валидируем, если данных еще нет
    const newErrors: Record<string, string> = {};
    
    // Name validation
    if (!formData.name || !formData.name.trim()) {
      newErrors.name = 'Требуется указать имя';
    }
    
    // Age validation - Проверяем, что это число и больше 0, или пустая строка
    if (formData.age !== '' && (typeof formData.age !== 'number' || formData.age <= 0)) {
      newErrors.age = 'Возраст должен быть числом больше 0 или пустым';
    }
    
    // Height validation - Проверяем, что это число и больше 0, или пустая строка
    if (formData.height !== '' && (typeof formData.height !== 'number' || formData.height <= 0)) {
      newErrors.height = 'Рост должен быть числом больше 0 или пустым';
    }
    
     // Gender validation - Проверяем, что выбран пол (если добавили пустую опцию)
    if (!formData.gender) {
        newErrors.gender = 'Требуется указать пол';
    }

    // Email validation (readOnly, but basic check)
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
       // Это поле readOnly, так что эта валидация, возможно, не нужна на фронте,
       // но оставим как базовую проверку данных.
       // newErrors.email = 'Неверный формат email';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Проверяем наличие formData перед отправкой и валидируем
    if (!formData || !validateForm()) {
      // Если formData null или форма невалидна, возможно, вывести сообщение об ошибке или просто ничего не делать
      console.log('Форма не готова к отправке или невалидна.', formData, errors);
      return;
    }
    
    setSubmitLoading(true);
    setSuccessMessage('');
    setErrors({});

    try {
        // Отправляем только те поля, которые могут быть обновлены через API
        const dataToSubmit = {
            name: formData.name,
            // Отправляем null для возраста и роста, если поле в форме пустое (было '')
            age: typeof formData.age === 'number' ? formData.age : null, // Отправляем null если не число или пустая строка
            gender: formData.gender || null, // Отправляем null если пусто
            height: typeof formData.height === 'number' ? formData.height : null, // Отправляем null если не число или пустая строка
            // Не отправляем email или userId, так как они не должны меняться через этот API
        };

        await userAPI.updateUserProfile(dataToSubmit as any); // Временное приведение типа для обхода ошибки, если API ожидает другой тип
        setSuccessMessage('Профиль успешно обновлен!');
        // После успешного обновления можно еще раз загрузить профиль, чтобы убедиться в актуальности данных
        // fetchProfile(); // Раскомментировать при необходимости

    } catch (e: any) { // Явно указываем тип any
        console.error('Ошибка сохранения профиля:', e);
        setErrors({ form: e.response?.data?.message || 'Ошибка при сохранении профиля.' });
    } finally {
        setSubmitLoading(false);
        setTimeout(() => {
           setSuccessMessage('');
           setErrors({});
         }, 3000);
    }
  };

  // Если данные загружаются, показываем индикатор загрузки
  if (loading) {
    return <p>Загрузка данных профиля...</p>; // Можно использовать компонент Loading
  }

  // Если данные не загружены и не в состоянии загрузки (например, ошибка или не авторизован)
   if (!formData) {
       // Можно отобразить сообщение об ошибке или попросить войти
        return (
            <div>
                <p>Не удалось загрузить данные профиля или нет данных для отображения.</p>
                 {errors.form && <p className="text-red-500">{errors.form}</p>}
            </div>
        );
   }

  return (
    <div className="animate-slide-up">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Профиль пользователя</h1>
      </div>
      
      <div className="bg-white rounded-lg shadow-card p-6">
        <div className="flex items-center mb-6">
          <div className="rounded-full bg-primary-100 p-3">
            <UserIcon className="h-8 w-8 text-primary-600" />
          </div>
          <div className="ml-4">
            <h2 className="text-xl font-semibold text-gray-800">
              {formData.name || formData.email || 'Пользователь'} {/* Показываем имя или email из формы */}
            </h2>
            <p className="text-gray-600">
              {formData.email || 'Нет данных email'} {/* Показываем email из формы */}
            </p>
          </div>
        </div>
        
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md animate-fade-in">
            <p className="text-green-700">{successMessage}</p>
          </div>
        )}

         {errors.form && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md animate-fade-in">
            <p className="text-red-700">{errors.form}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div className="mb-4">
              <label htmlFor="name" className="label">
                Полное имя *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`input ${errors.name ? 'border-error-500 focus:border-error-500 focus:ring-error-500' : ''}`}
                required
              />
              {errors.name && <p className="mt-1 text-sm text-error-500">{errors.name}</p>}
            </div>
            
            {/* Email - Только для чтения */}
            <div className="mb-4">
              <label htmlFor="email" className="label">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                className="input bg-gray-100 cursor-not-allowed" // Добавляем стили для readOnly
                readOnly // Делаем поле только для чтения
              />
               {/* Ошибки для email, если вдруг будут, хотя поле readOnly */}
               {errors.email && <p className="mt-1 text-sm text-error-500">{errors.email}</p>}
            </div>
            
            {/* Age */}
            <div className="mb-4">
              <label htmlFor="age" className="label">
                Возраст (лет) *
              </label>
              <input
                type="number"
                id="age"
                name="age"
                value={formData.age}
                onChange={handleChange}
                className={`input ${errors.age ? 'border-error-500 focus:border-error-500 focus:ring-error-500' : ''}`}
                min="1"
                required
              />
              {errors.age && <p className="mt-1 text-sm text-error-500">{errors.age}</p>}
            </div>
            
            {/* Gender */}
            <div className="mb-4">
              <label htmlFor="gender" className="label">
                Пол *
              </label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="input"
                required
              >
                <option value="">Выберите пол</option>
                <option value="male">Мужской</option>
                <option value="female">Женский</option>
                <option value="other">Другой</option>
              </select>
              {errors.gender && <p className="mt-1 text-sm text-error-500">{errors.gender}</p>}
            </div>
            
            {/* Height */}
            <div className="mb-4">
              <label htmlFor="height" className="label">
                Рост (см) *
              </label>
              <input
                type="number"
                id="height"
                name="height"
                value={formData.height}
                onChange={handleChange}
                className={`input ${errors.height ? 'border-error-500 focus:border-error-500 focus:ring-error-500' : ''}`}
                min="1"
                step="0.1"
                required
              />
              {errors.height && <p className="mt-1 text-sm text-error-500">{errors.height}</p>}
            </div>
          </div>
          
          <div className="mt-8 flex justify-end">
            <button
              type="submit"
              className="btn-primary flex items-center"
              disabled={submitLoading} // Отключаем кнопку во время сохранения
            >
              {submitLoading ? (
                  'Сохранение...'
              ) : (
                 <><Save className="mr-2 h-5 w-5" />Сохранить профиль</>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Health Information */}
      <div className="mt-8 bg-blue-50 rounded-lg p-6 border border-blue-100">
        <h3 className="text-lg font-medium text-blue-800 mb-2">
          Почему важны данные профиля
        </h3>
        <p className="text-blue-700 mb-4">
          Точная информация профиля помогает нам предоставлять лучший анализ и рекомендации:
        </p>
        <ul className="list-disc pl-5 text-blue-700 space-y-2">
          <li>Рост необходим для расчета ИМТ и идеального диапазона веса</li>
          <li>Возраст и пол влияют на здоровые диапазоны показателей состава тела</li>
          <li>Регулярное обновление профиля обеспечивает наиболее точные данные о здоровье</li>
        </ul>
      </div>
    </div>
  );
};

export default Profile;