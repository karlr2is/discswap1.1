import { useState, useEffect } from 'react';
import { motion, useScroll, useMotionValueEvent } from 'motion/react';
import { Home, Plus, Search, LogIn, Menu, SlidersHorizontal } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useSettings } from '../../contexts/SettingsContext';
import { supabase } from '../../lib/supabase';
import { CategoryDropdown } from '../navigation/CategoryDropdown';
import { UserMenu } from '../navigation/UserMenu';
import { t } from '../../utils/translations';

type NavigationProps = {
  currentPage: string;
  onNavigate: (page: string) => void;
  onShowAuth?: () => void;
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
  onNavigateToFilters?: () => void;
  showSearch?: boolean;
};

type Category = {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
};

type ParentCategory = Category & {
  subcategories: Category[];
};

export function Navigation({
  currentPage,
  onNavigate,
  onShowAuth,
  searchQuery = '',
  onSearchChange,
  onNavigateToFilters,
  showSearch = false,
}: NavigationProps) {
  const { user } = useAuth();
  const { language } = useSettings();
  const [parentCategories, setParentCategories] = useState<ParentCategory[]>([]);
  const [currentCategoryId, setCurrentCategoryId] = useState<string | null>(null);
  const [hidden, setHidden] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, 'change', (current) => {
    const previous = scrollY.getPrevious() ?? 0;
    if (current > previous && current > 150) {
      setHidden(true);
    } else {
      setHidden(false);
    }
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const { data: allCategories } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    if (allCategories) {
      const parents = allCategories.filter(cat => cat.parent_id === null);
      const parentWithSubs: ParentCategory[] = parents.map(parent => ({
        ...parent,
        subcategories: allCategories.filter(cat => cat.parent_id === parent.id)
      }));
      setParentCategories(parentWithSubs);
    }
  };

  const handleCategoryNavigate = (categoryId: string, _categoryName: string) => {
    setCurrentCategoryId(categoryId);
    onNavigate(`category-${categoryId}`);
  };

  const mobileNavItems = [
    { id: 'home', label: t('browse', language), icon: Home },
    ...(user ? [{ id: 'create', label: t('sell', language), icon: Plus }] : []),
    { id: 'categories', label: t('categories', language), icon: Search },
  ];

  return (
    <>
      <motion.header
        className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40"
        animate={{
          y: hidden ? -200 : 0,
          opacity: hidden ? 0 : 1,
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        {/* Top row: logo + nav + actions */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => onNavigate('home')}
              className="flex items-center gap-2 flex-shrink-0"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white rounded-full" />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">DiscSwap</span>
            </button>

            <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
              {parentCategories.map((parentCategory) => (
                <CategoryDropdown
                  key={parentCategory.id}
                  category={parentCategory}
                  subcategories={parentCategory.subcategories}
                  isActive={currentCategoryId === parentCategory.id}
                  onNavigate={handleCategoryNavigate}
                />
              ))}
            </nav>

            <div className="hidden md:flex items-center gap-3">
              {user ? (
                <>
                  <button
                    onClick={() => onNavigate('create')}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors font-medium"
                  >
                    <Plus className="w-5 h-5" />
                    <span>{t('sell', language)}</span>
                  </button>
                  <UserMenu onNavigate={onNavigate} />
                </>
              ) : (
                <button
                  onClick={onShowAuth}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors font-medium"
                >
                  <LogIn className="w-5 h-5" />
                  <span>{t('signIn', language)}</span>
                </button>
              )}
            </div>

            <div className="md:hidden flex items-center gap-2">
              <button
                onClick={() => onNavigate('search')}
                className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg"
              >
                <Search className="w-6 h-6" />
              </button>
              {user ? (
                <UserMenu onNavigate={onNavigate} />
              ) : (
                <button
                  onClick={onShowAuth}
                  className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg"
                >
                  <Menu className="w-6 h-6" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Search bar row — only shown on home page */}
        {showSearch && (
          <div className="border-t border-gray-100 dark:border-gray-700">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder={t('searchForDiscs', language)}
                    value={searchQuery}
                    onChange={(e) => onSearchChange?.(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
                  />
                </div>
                <button
                  onClick={onNavigateToFilters}
                  className="px-3 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                >
                  <SlidersHorizontal className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
            </div>
          </div>
        )}
      </motion.header>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-50">
        <div className="grid grid-cols-3 gap-1 px-2 py-2">
          {mobileNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex flex-col items-center gap-1 py-2 px-1 rounded-lg transition-colors ${
                  currentPage === item.id
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600'
                }`}
              >
                <Icon className="w-6 h-6" />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
