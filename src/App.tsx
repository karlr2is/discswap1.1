import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SettingsProvider, useSettings } from './contexts/SettingsContext';
import { AuthModal } from './components/auth/AuthModal';
import { Layout } from './components/layout/Layout';
import { ScrollManager } from './components/layout/ScrollManager';
import { HomePage } from './pages/HomePage';
import { ListingDetailPage } from './pages/ListingDetailPage';
import { CreateListingPage } from './pages/CreateListingPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { CategoryListingsPage } from './pages/CategoryListingsPage';
import { ProfilePage } from './pages/ProfilePage';
import { EditProfilePage } from './pages/EditProfilePage';
import { MessagesPage } from './pages/MessagesPage';
import { FiltersPage, FilterOptions } from './pages/FiltersPage';
import { SettingsPage } from './pages/SettingsPage';
import { FavoritesPage } from './pages/FavoritesPage';
import { MyListingsPage } from './pages/MyListingsPage';
import { supabase } from './lib/supabase';
import { ListingCard } from './components/listings/ListingCard';
import { Search, SlidersHorizontal } from 'lucide-react';
import { t } from './utils/translations';

type Page =
  | { type: 'home' }
  | { type: 'listing'; id: string }
  | { type: 'create' }
  | { type: 'categories' }
  | { type: 'category-listings'; categoryId: string; categoryName: string }
  | { type: 'profile'; userId?: string }
  | { type: 'edit-profile' }
  | { type: 'messages'; conversationId?: string; sellerId?: string; listingId?: string }
  | { type: 'filters' }
  | { type: 'filtered-results' }
  | { type: 'settings' }
  | { type: 'favorites' }
  | { type: 'my-listings' };

type Listing = {
  id: string;
  title: string;
  price: number | null;
  condition_score: number | null;
  location: string | null;
  images: string[];
  listing_type: 'for_sale' | 'wanted';
  category_id: string | null;
  disc_speed: number | null;
};

function MainApp() {
  const { user, loading } = useAuth();
  const { language } = useSettings();
  const [currentPage, setCurrentPage] = useState<Page>({ type: 'home' });
  const [pageHistory, setPageHistory] = useState<Page[]>([{ type: 'home' }]);
  const [filters, setFilters] = useState<FilterOptions | null>(null);
  const [filteredListings, setFilteredListings] = useState<Listing[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Reset search when navigating away from home
  const handleNavigateBasicWithReset = (pageType: string) => {
    if (pageType !== 'home') setSearchQuery('');
    handleNavigateBasic(pageType);
  };

  useEffect(() => {
    if (filters) {
      applyFilters();
    }
  }, [filters]);

  const applyFilters = async () => {
    if (!filters) return;

    let query = supabase
      .from('listings')
      .select('*')
      .eq('status', 'active');

    if (filters.categoryId) {
      query = query.eq('category_id', filters.categoryId);
    }

    if (filters.listingType) {
      query = query.eq('listing_type', filters.listingType);
    }

    if (filters.minPrice) {
      query = query.gte('price', parseFloat(filters.minPrice));
    }

    if (filters.maxPrice) {
      query = query.lte('price', parseFloat(filters.maxPrice));
    }

    if (filters.minCondition) {
      query = query.gte('condition_score', parseInt(filters.minCondition));
    }

    if (filters.minSpeed) {
      query = query.gte('disc_speed', parseInt(filters.minSpeed));
    }

    if (filters.maxSpeed) {
      query = query.lte('disc_speed', parseInt(filters.maxSpeed));
    }

    if (filters.location) {
      query = query.ilike('location', `%${filters.location}%`);
    }

    const { data } = await query.order('created_at', { ascending: false });

    if (data) {
      setFilteredListings(data);
      setCurrentPage({ type: 'filtered-results' });
    }
  };

  const navigate = (page: Page) => {
    setPageHistory((prev) => [...prev, page]);
    setCurrentPage(page);
  };

  const goBack = () => {
    if (pageHistory.length > 1) {
      const newHistory = [...pageHistory];
      newHistory.pop();
      const previousPage = newHistory[newHistory.length - 1];
      setPageHistory(newHistory);
      setCurrentPage(previousPage);
    } else {
      navigate({ type: 'home' });
    }
  };

  const handleNavigateBasic = (pageType: string) => {
    if (pageType === 'home') {
      setCurrentPage({ type: 'home' });
      setFilters(null);
    } else if (pageType === 'categories') {
      setCurrentPage({ type: 'categories' });
    } else if (pageType === 'create') {
      if (!user) {
        setShowAuthModal(true);
        return;
      }
      setCurrentPage({ type: 'create' });
    } else if (pageType === 'messages') {
      if (!user) {
        setShowAuthModal(true);
        return;
      }
      setCurrentPage({ type: 'messages' });
    } else if (pageType === 'profile') {
      if (!user) {
        setShowAuthModal(true);
        return;
      }
      setCurrentPage({ type: 'profile' });
    } else if (pageType === 'search') {
      setCurrentPage({ type: 'filters' });
    } else if (pageType === 'settings') {
      if (!user) {
        setShowAuthModal(true);
        return;
      }
      setCurrentPage({ type: 'settings' });
    } else if (pageType === 'favorites') {
      if (!user) {
        setShowAuthModal(true);
        return;
      }
      setCurrentPage({ type: 'favorites' });
    } else if (pageType === 'my-listings') {
      if (!user) {
        setShowAuthModal(true);
        return;
      }
      setCurrentPage({ type: 'my-listings' });
    } else if (pageType.startsWith('category-')) {
      const categoryId = pageType.replace('category-', '');
      setCurrentPage({ type: 'category-listings', categoryId, categoryName: '' });
    }
  };

  const handleContactSeller = (sellerId: string, listingId: string) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    navigate({ type: 'messages', sellerId, listingId });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">{t('loading', language)}</div>
      </div>
    );
  }

  const getPageType = (page: Page): string => {
    switch (page.type) {
      case 'home':
      case 'filtered-results':
        return 'home';
      case 'categories':
      case 'category-listings':
        return 'categories';
      case 'create':
        return 'create';
      case 'messages':
        return 'messages';
      case 'profile':
      case 'edit-profile':
        return 'profile';
      case 'settings':
        return 'settings';
      case 'favorites':
        return 'favorites';
      default:
        return 'home';
    }
  };

  return (
    <>
      <ScrollManager
        currentPage={currentPage.type}
        pageHistory={pageHistory}
      />

      {showAuthModal && (
        <AuthModal onClose={() => setShowAuthModal(false)} />
      )}

      <Layout
        currentPage={getPageType(currentPage)}
        onNavigate={handleNavigateBasicWithReset}
        onShowAuth={() => setShowAuthModal(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onNavigateToFilters={() => navigate({ type: 'filters' })}
        showSearch={currentPage.type === 'home'}
      >
        {currentPage.type === 'home' && (
        <HomePage
          onNavigateToListing={(id) => navigate({ type: 'listing', id })}
          onNavigateToFilters={() => navigate({ type: 'filters' })}
          searchQuery={searchQuery}
        />
      )}

      {currentPage.type === 'filtered-results' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t('filteredResults', language)} ({filteredListings.length})
            </h1>
            <button
              onClick={() => navigate({ type: 'filters' })}
              className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
            >
              <SlidersHorizontal className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <span className="text-gray-900 dark:text-white">{t('filters', language)}</span>
            </button>
          </div>

          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder={t('searchInResults', language)}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
              />
            </div>
          </div>

          {filteredListings.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">{t('noListingsWithFilters', language)}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredListings
                .filter((listing) =>
                  listing.title.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((listing) => (
                  <ListingCard
                    key={listing.id}
                    listing={listing}
                    onClick={() => navigate({ type: 'listing', id: listing.id })}
                  />
                ))}
            </div>
          )}
        </div>
      )}

      {currentPage.type === 'listing' && (
        <ListingDetailPage
          listingId={currentPage.id}
          onBack={goBack}
          onContactSeller={handleContactSeller}
          onViewProfile={(userId) => navigate({ type: 'profile', userId })}
        />
      )}

      {currentPage.type === 'create' && user && (
        <CreateListingPage
          onBack={goBack}
          onSuccess={() => navigate({ type: 'home' })}
        />
      )}

      {currentPage.type === 'categories' && (
        <CategoriesPage
          onSelectCategory={(categoryId, categoryName) =>
            navigate({ type: 'category-listings', categoryId, categoryName })
          }
          onClose={goBack}
        />
      )}

      {currentPage.type === 'category-listings' && (
        <CategoryListingsPage
          categoryId={currentPage.categoryId}
          categoryName={currentPage.categoryName}
          onBack={goBack}
          onNavigateToListing={(id) => navigate({ type: 'listing', id })}
        />
      )}

      {currentPage.type === 'profile' && (
        <ProfilePage
          userId={currentPage.userId}
          onNavigateToListing={(id) => navigate({ type: 'listing', id })}
          onEditProfile={() => navigate({ type: 'edit-profile' })}
          onBack={currentPage.userId ? goBack : undefined}
        />
      )}

      {currentPage.type === 'edit-profile' && user && (
        <EditProfilePage
          onBack={goBack}
          onSuccess={() => navigate({ type: 'profile' })}
        />
      )}

      {currentPage.type === 'messages' && user && (
        <MessagesPage
          initialConversationId={currentPage.conversationId}
          initialSellerId={currentPage.sellerId}
          initialListingId={currentPage.listingId}
        />
      )}

      {currentPage.type === 'filters' && (
        <FiltersPage
          onApplyFilters={(newFilters) => setFilters(newFilters)}
          onBack={goBack}
        />
      )}

      {currentPage.type === 'settings' && user && (
        <SettingsPage onBack={goBack} />
      )}

      {currentPage.type === 'favorites' && user && (
        <FavoritesPage onBack={goBack} onNavigateToListing={(id) => navigate({ type: 'listing', id })} />
      )}

      {currentPage.type === 'my-listings' && user && (
        <MyListingsPage onBack={goBack} onNavigateToListing={(id) => navigate({ type: 'listing', id })} />
      )}
      </Layout>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <MainApp />
      </SettingsProvider>
    </AuthProvider>
  );
}
