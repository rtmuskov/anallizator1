import React from 'react';
import { Heart } from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-white border-t border-gray-200 py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-gray-600 text-sm">
              &copy; {currentYear} Система анализа InBody
            </p>
          </div>
          
          <div className="flex items-center text-sm text-gray-600">
            <span>Сделано с</span>
            <Heart className="h-4 w-4 mx-1 text-error-500" />
            <span>для вашего здоровья</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer