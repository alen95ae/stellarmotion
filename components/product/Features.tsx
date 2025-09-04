import { Product } from '@/types/product';
import { MapPin, Ruler, Eye, Lightbulb, Building, Globe } from 'lucide-react';
import { IconBox } from '@/components/ui/icon-box';

interface FeaturesProps {
  product: Product;
}

export default function Features({ product }: FeaturesProps) {
  const formatImpressions = (impressions: number) => {
    return new Intl.NumberFormat('es-ES').format(impressions);
  };

  const features = [
    {
      icon: <Ruler className="w-5 h-5 text-gray-600" />,
      label: 'Dimensiones',
      value: product.dimensions
    },
    {
      icon: <Eye className="w-5 h-5 text-gray-600" />,
      label: 'Impactos diarios',
      value: `${formatImpressions(product.dailyImpressions)}`
    },
    {
      icon: <Building className="w-5 h-5 text-gray-600" />,
      label: 'Ciudad',
      value: product.city
    },
    {
      icon: <Globe className="w-5 h-5 text-gray-600" />,
      label: 'País',
      value: product.country
    },
    {
      icon: <Building className="w-5 h-5 text-gray-600" />,
      label: 'Tipo',
      value: product.type
    },
    {
      icon: <Lightbulb className="w-5 h-5 text-gray-600" />,
      label: 'Iluminación',
      value: product.lighting ? 'Sí' : 'No'
    }
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">
        Características del soporte
      </h2>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {features.map((feature, index) => (
          <div
            key={index}
            className="flex flex-col items-center text-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <div className="text-[#D7514C] mb-2">
              {feature.icon}
            </div>
            <dt className="text-sm font-medium text-gray-600 mb-1">
              {feature.label}
            </dt>
            <dd className="text-sm font-semibold text-gray-900">
              {feature.value}
            </dd>
          </div>
        ))}
      </div>

      {/* Tags */}
      {product.tags.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-3">
            Etiquetas
          </h3>
          <div className="flex flex-wrap gap-2">
            {product.tags.map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-[#D7514C]/10 text-[#D7514C] text-xs font-medium rounded-full border border-[#D7514C]/20"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
