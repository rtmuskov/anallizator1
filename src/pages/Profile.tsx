import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import { User } from '../types';
import { Save, User as UserIcon } from 'lucide-react';

const Profile: React.FC = () => {
  const { user, updateUser } = useUser();
  
  const [formData, setFormData] = useState<User>(
    user || {
      id: '1',
      name: '',
      age: 0,
      gender: 'male',
      height: 0,
      email: '',
    }
  );
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    // Handle number inputs
    if (type === 'number') {
      const numberValue = value === '' ? 0 : parseFloat(value);
      setFormData({
        ...formData,
        [name]: numberValue,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
    
    // Clear error when field is modified
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Требуется указать имя';
    }
    
    // Age validation
    if (!formData.age || formData.age <= 0) {
      newErrors.age = 'Возраст должен быть больше 0';
    }
    
    // Height validation
    if (!formData.height || formData.height <= 0) {
      newErrors.height = 'Рост должен быть больше 0';
    }
    
    // Email validation (optional field)
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Неверный формат email';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    // Update user in context
    updateUser(formData);
    
    // Show success message
    setSuccessMessage('Profile updated successfully!');
    
    // Clear success message after 3 seconds
    setTimeout(() => {
      setSuccessMessage('');
    }, 3000);
  };

  return (
    <div className="animate-slide-up">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">User Profile</h1>
      </div>
      
      <div className="bg-white rounded-lg shadow-card p-6">
        <div className="flex items-center mb-6">
          <div className="rounded-full bg-primary-100 p-3">
            <UserIcon className="h-8 w-8 text-primary-600" />
          </div>
          <div className="ml-4">
            <h2 className="text-xl font-semibold text-gray-800">
              {formData.name || 'New User'}
            </h2>
            <p className="text-gray-600">
              {formData.email || 'No email provided'}
            </p>
          </div>
        </div>
        
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md animate-fade-in">
            <p className="text-green-700">{successMessage}</p>
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
            
            {/* Email */}
            <div className="mb-4">
              <label htmlFor="email" className="label">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email || ''}
                onChange={handleChange}
                className={`input ${errors.email ? 'border-error-500 focus:border-error-500 focus:ring-error-500' : ''}`}
              />
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
                value={formData.age || ''}
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
                <option value="male">Мужской</option>
                <option value="female">Женский</option>
                <option value="other">Другой</option>
              </select>
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
                value={formData.height || ''}
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
            >
              <Save className="mr-2 h-5 w-5" />
              Сохранить профиль
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