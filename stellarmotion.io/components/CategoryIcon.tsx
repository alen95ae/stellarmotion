import React from 'react';
import { getCategoryIconPath } from '@/lib/categories';

interface CategoryIconProps {
  type: string;
  className?: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ type, className = "w-12 h-12" }) => {
  const iconPath = getCategoryIconPath(type);

  return (
    <img 
      src={iconPath}
      alt={`Icono de ${type}`}
      className={className}
      style={{ 
        filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1))',
        maxWidth: '100%',
        height: 'auto'
      }}
    />
  );
};

export default CategoryIcon;
