import { useEffect, useState } from 'react';
import { Heart, ArrowLeft } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import { t } from '../utils/translations';

type FavoritesPageProps = {
  onBack: () => void;
};

export function FavoritesPage({ onBack }: FavoritesPageProps) {
  const { language } = useSettings();
  const [favorites] = useState<any[]>([]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-gray-700 dark:text-gray-300" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t('favorites', language)}
        </h1>
      </div>

      {favorites.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 text-gray-400 dark:text-gray-500" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {t('noFavorites', language)}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {t('saveFavorites', language)}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {favorites.map((favorite) => (
            <div key={favorite.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
              <p>{favorite.title}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
