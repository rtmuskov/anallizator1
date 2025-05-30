import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useMeasurements } from '../context/MeasurementContext';
import { Save, X } from 'lucide-react';

interface FormDataState {
  date: string;
  weight: number;
  bodyFatPercentage: number;
  skeletalMuscleMass: number | null;
  visceralFat: number | null;
  waterPercentage: number | null;
  basalMetabolicRate: number | null;
  metabolicAge: number | null;
}

const DataEntry: React.FC = () => {
  const { user } = useUser();
  const { addMeasurement } = useMeasurements();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<FormDataState>({
    date: new Date().toISOString().split('T')[0], // Формат YYYY-MM-DD
    weight: 0,
    bodyFatPercentage: 0,
    skeletalMuscleMass: null,
    visceralFat: null,
    waterPercentage: null,
    basalMetabolicRate: null,
    metabolicAge: null,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formSubmitted, setFormSubmitted] = useState(false);

  if (!user) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">
          Требуется профиль пользователя
        </h2>
        <p className="text-gray-600 mb-6">
          Пожалуйста, заполните свой профиль перед добавлением измерений.
        </p>
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numberValue = parseFloat(value);
    
    setFormData({
      ...formData,
      [name]: numberValue === undefined || isNaN(numberValue) ? null : numberValue,
    });
    
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
    
    // Required fields
    if (!formData.weight || formData.weight <= 0) {
      newErrors.weight = 'Требуется указать вес больше 0';
    }
    
    // Валидация процента жира, если он не null
    if (formData.bodyFatPercentage != null && (formData.bodyFatPercentage < 0 || formData.bodyFatPercentage > 100)) {
        newErrors.bodyFatPercentage = 'Процент жира должен быть от 0 до 100';
    }
    
    // Валидация мышечной массы, если она не null
    if (formData.skeletalMuscleMass != null && formData.skeletalMuscleMass <= 0) {
       newErrors.skeletalMuscleMass = 'Требуется указать мышечную массу больше 0, если она введена';
    }
    
    // Валидация процента воды, если он не null
    if (formData.waterPercentage != null && (formData.waterPercentage < 0 || formData.waterPercentage > 100)) {
        newErrors.waterPercentage = 'Процент воды должен быть от 0 до 100, если он введен';
    }
    
    // Валидация висцерального жира, если он не null
    if (formData.visceralFat != null && formData.visceralFat < 1) {
        newErrors.visceralFat = 'Уровень висцерального жира должен быть не менее 1, если он введен';
    }

    // Валидация метаболического возраста, если он не null
    if (formData.metabolicAge != null && formData.metabolicAge < 1) {
        newErrors.metabolicAge = 'Метаболический возраст должен быть не менее 1, если он введен';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
    
    if (!validateForm()) {
      return;
    }
    
    // Рассчитываем fatMass из weight и bodyFatPercentage
    const fatMass = formData.weight != null && formData.bodyFatPercentage != null
        ? (formData.weight * formData.bodyFatPercentage) / 100
        : undefined; // undefined, если данные неполные

    // Создаем объект с данными измерения для отправки на бэкенд
    const measurementDataForApi = {
      date: formData.date,
      weight: formData.weight!,
      fatMass: fatMass || 0, // Используем рассчитанный fatMass. Отправляем 0 или null, если расчет не удался.
      skeletalMuscleMass: formData.skeletalMuscleMass || null,
      visceralFat: formData.visceralFat || null,
      waterPercentage: formData.waterPercentage || null,
      basalMetabolicRate: formData.basalMetabolicRate || null,
      metabolicAge: formData.metabolicAge || null,
    };
    
    try {
        await addMeasurement(measurementDataForApi);
        // Navigate to dashboard
        navigate('/');
    } catch (error) {
        console.error('Ошибка при добавлении измерения:', error);
        alert('Произошла ошибка при сохранении измерения. Пожалуйста, попробуйте снова.');
    }
  };

  const handleCancel = () => {
    navigate('/');
  };

  return (
    <div className="animate-slide-up">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Новое измерение</h1>
      </div>
      
      <div className="bg-white rounded-lg shadow-card p-6">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Weight */}
            <div className="mb-4">
              <label htmlFor="weight" className="label">
                Вес (кг) *
              </label>
              <input
                type="number"
                id="weight"
                name="weight"
                value={formData.weight || ''}
                onChange={handleChange}
                className={`input ${errors.weight ? 'border-error-500 focus:border-error-500 focus:ring-error-500' : ''}`}
                step="0.1"
                required
              />
              {errors.weight && <p className="mt-1 text-sm text-error-500">{errors.weight}</p>}
            </div>

            {/* Body Fat Percentage */}
            <div className="mb-4">
              <label htmlFor="bodyFatPercentage" className="label">
                Процент жира (%) *
              </label>
              <input
                type="number"
                id="bodyFatPercentage"
                name="bodyFatPercentage"
                value={formData.bodyFatPercentage || ''}
                onChange={handleChange}
                className={`input ${errors.bodyFatPercentage ? 'border-error-500 focus:border-error-500 focus:ring-error-500' : ''}`}
                step="0.1"
                min="0"
                max="100"
                required
              />
              {errors.bodyFatPercentage && <p className="mt-1 text-sm text-error-500">{errors.bodyFatPercentage}</p>}
            </div>

            {/* Skeletal Muscle Mass */}
            <div className="mb-4">
              <label htmlFor="skeletalMuscleMass" className="label">
                Мышечная масса (кг) *
              </label>
              <input
                type="number"
                id="skeletalMuscleMass"
                name="skeletalMuscleMass"
                value={formData.skeletalMuscleMass || ''}
                onChange={handleChange}
                className={`input ${errors.skeletalMuscleMass ? 'border-error-500 focus:border-error-500 focus:ring-error-500' : ''}`}
                step="0.1"
                required
              />
              {errors.skeletalMuscleMass && <p className="mt-1 text-sm text-error-500">{errors.skeletalMuscleMass}</p>}
            </div>

            {/* Visceral Fat */}
            <div className="mb-4">
              <label htmlFor="visceralFat" className="label">
                Уровень висцерального жира
              </label>
              <input
                type="number"
                id="visceralFat"
                name="visceralFat"
                value={formData.visceralFat || ''}
                onChange={handleChange}
                className="input"
                step="1"
                min="1"
                max="30"
              />
            </div>

            {/* Water Percentage */}
            <div className="mb-4">
              <label htmlFor="waterPercentage" className="label">
                Процент воды в организме (%)
              </label>
              <input
                type="number"
                id="waterPercentage"
                name="waterPercentage"
                value={formData.waterPercentage || ''}
                onChange={handleChange}
                className={`input ${errors.waterPercentage ? 'border-error-500 focus:border-error-500 focus:ring-error-500' : ''}`}
                step="0.1"
                min="0"
                max="100"
              />
              {errors.waterPercentage && <p className="mt-1 text-sm text-error-500">{errors.waterPercentage}</p>}
            </div>

            {/* Basal Metabolic Rate */}
            <div className="mb-4">
              <label htmlFor="basalMetabolicRate" className="label">
                Базовый обмен веществ (ккал)
              </label>
              <input
                type="number"
                id="basalMetabolicRate"
                name="basalMetabolicRate"
                value={formData.basalMetabolicRate || ''}
                onChange={handleChange}
                className="input"
                step="1"
              />
            </div>

            {/* Metabolic Age */}
            <div className="mb-4">
              <label htmlFor="metabolicAge" className="label">
                Метаболический возраст (лет)
              </label>
              <input
                type="number"
                id="metabolicAge"
                name="metabolicAge"
                value={formData.metabolicAge || ''}
                onChange={handleChange}
                className="input"
                step="1"
                min="1"
              />
            </div>
          </div>

          {formSubmitted && Object.keys(errors).length > 0 && (
            <div className="mb-6 p-4 bg-error-50 border border-error-200 rounded-md">
              <p className="text-error-700 font-medium">Пожалуйста, исправьте ошибки перед отправкой.</p>
            </div>
          )}

          <div className="mt-8 flex justify-end space-x-4">
            <button
              type="button"
              onClick={handleCancel}
              className="btn-outline flex items-center"
            >
              <X className="mr-2 h-5 w-5" />
              Отмена
            </button>
            <button
              type="submit"
              className="btn-primary flex items-center"
            >
              <Save className="mr-2 h-5 w-5" />
              Сохранить измерение
            </button>
          </div>
        </form>
      </div>

      <div className="mt-8 bg-blue-50 rounded-lg p-6 border border-blue-100">
        <h3 className="text-lg font-medium text-blue-800 mb-2">
          Как использовать измерения InBody
        </h3>
        <p className="text-blue-700 mb-4">
          Введите значения из отчета вашего сканирования InBody в форму выше. Обязательные поля отмечены звездочкой (*).
        </p>
        <ul className="list-disc pl-5 text-blue-700 space-y-2">
          <li>Вес - Ваш общий вес тела в килограммах</li>
          <li>Процент жира - Процент вашего веса, который составляет жир</li>
          <li>Мышечная масса - Вес ваших скелетных мышц в килограммах</li>
          <li>Висцеральный жир - Оценка жира, окружающего ваши внутренние органы</li>
          <li>Процент воды - Процент вашего веса, который составляет вода</li>
        </ul>
      </div>
    </div>
  );
};

export default DataEntry;