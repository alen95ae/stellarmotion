import React from 'react';

interface CategoryIconProps {
  type: string;
  className?: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ type, className = "w-12 h-12" }) => {
  const getIconPath = (iconType: string) => {
    const lowerType = iconType.toLowerCase();
    switch (lowerType) {
      case 'valla':
      case 'vallas':
        return '/icons/vallas.svg';
      case 'pantalla':
      case 'pantallas':
      case 'led':
        return '/icons/pantallas.svg';
      case 'mural':
      case 'murales':
        return '/icons/murales.svg';
      case 'mupi':
      case 'mupis':
        return '/icons/mupis.svg';
      case 'parada':
      case 'paradas':
      case 'parada-bus':
      case 'parada_bus':
      case 'bus':
        return '/icons/parada-bus.svg';
      case 'display':
      case 'displays':
        return '/icons/displays.svg';
      case 'letrero':
      case 'letreros':
        return '/icons/letreros.svg';
      case 'cartelera':
      case 'carteleras':
        return '/icons/carteleras.svg';
      default:
        console.warn(`No icon found for type: ${iconType}, using default`);
        return '/icons/vallas.svg'; // Default fallback
    }
  };

  return (
    <img 
      src={getIconPath(type)} 
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
