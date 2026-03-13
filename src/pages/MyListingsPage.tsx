import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import { t } from '../utils/translations';
import { ListingCard } from '../components/listings/ListingCard';

type MyListingsPageProps = {
  onBack: () => void;
  onNavigateToListing: (id: string) => void;
};

type Listing = {
  id: string;
  title: string;
  price: number | null;
  condition_score: number | null;
  location: string | null;
  images: string[];
  listing_type: 'for_sale' | 'wanted';
  status: 'active' | 'sold' | 'deleted';
  created_at: string;
};

export function MyListingsPage({ onBack, onNavigateToListing }: MyListingsPageProps) {
  const { user } = useAuth();
  const { language } = useSettings();
  const [activeTab, setActiveTab] = useState<'active' | 'sold'>('active');
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchListings();
    }
  }, [user, activeTab]);

  const fetchListings = async () => {
    if (!user) return;

    setLoading(true);
    const { data } = await supabase
      .from('listings')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', activeTab)
      .order('created_at', { ascending: false });

    if (data) {
      setListings(data);
    }
    setLoading(false);
  };

  const handleMarkAsSold = async (listingId: string) => {
    const { error } = await supabase
      .from('listings')
      .update({ status: 'sold' })
      .eq('id', listingId);

    if (!error) {
      fetchListings();
    }
  };

  const handleDelete = async (listingId: string) => {
    if (!confirm(t('confirmDelete', language))) return;

    const { error } = await supabase
      .from('listings')
      .update({ status: 'deleted' })
      .eq('id', listingId);

    if (!error) {
      fetchListings();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6 dark:text-white" />
          </button>
          <h1 className="text-lg font-semibold dark:text-white">{t('myListings', language)}</h1>
        </div>

        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-4 border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveTab('active')}
              className={`pb-3 px-2 font-medium transition-colors relative ${
                activeTab === 'active'
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              {t('activeListings', language)}
              {activeTab === 'active' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('sold')}
              className={`pb-3 px-2 font-medium transition-colors relative ${
                activeTab === 'sold'
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              {t('soldListings', language)}
              {activeTab === 'sold' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400" />
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">{t('loading', language)}</p>
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              {activeTab === 'active' ? t('noActiveListings', language) : t('noSoldListings', language)}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {listings.map((listing) => (
              <div key={listing.id} className="relative">
                <ListingCard
                  listing={listing}
                  onClick={() => onNavigateToListing(listing.id)}
                />
                {activeTab === 'active' && (
                  <div className="mt-2 flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkAsSold(listing.id);
                      }}
                      className="flex-1 px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                    >
                      {t('markAsSold', language)}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(listing.id);
                      }}
                      className="flex-1 px-3 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                    >
                      {t('deleteListing', language)}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
