import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useSettings } from '../../contexts/SettingsContext';
import { t } from '../../utils/translations';

type Category = {
  id: string;
  name: string;
  slug: string;
  parent_id?: string | null;
};

type CategoryDropdownProps = {
  category: Category;
  subcategories: Category[];
  isActive: boolean;
  onNavigate: (categoryId: string, categoryName: string) => void;
};

export function CategoryDropdown({ category, subcategories, isActive, onNavigate }: CategoryDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { language } = useSettings();

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button
        onClick={() => onNavigate(category.id, category.name)}
        className={`flex items-center gap-1 px-4 py-2 text-sm font-medium transition-colors ${
          isActive
            ? 'text-blue-600 dark:text-blue-400'
            : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
        }`}
      >
        {category.name}
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-0 pt-1 w-64 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-2">
            <button
              onClick={() => onNavigate(category.id, category.name)}
              className="w-full text-left px-3 py-2 text-sm font-semibold text-blue-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              {t('viewAll', language)} {category.name}
            </button>

            {subcategories.length > 0 && (
              <div className="mt-1 pt-1 border-t border-gray-100 dark:border-gray-700">
                {subcategories.map((subcat) => (
                  <button
                    key={subcat.id}
                    onClick={() => onNavigate(subcat.id, subcat.name)}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    {subcat.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
