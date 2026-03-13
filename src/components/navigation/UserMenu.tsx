import { useState, useEffect } from 'react';
import { Menu, X, MessageSquare, User, Settings, Heart, LogOut, ListIcon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useSettings } from '../../contexts/SettingsContext';
import { t } from '../../utils/translations';

type UserMenuProps = {
  onNavigate: (page: string) => void;
  externalOpen?: boolean;
  onExternalClose?: () => void;
};

export function UserMenu({ onNavigate, externalOpen, onExternalClose }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { user, profile, signOut } = useAuth();
  const { language } = useSettings();

  const menuOpen = externalOpen !== undefined ? externalOpen : isOpen;

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [menuOpen]);

  if (!user) return null;

  const closeMenu = () => {
    if (onExternalClose) {
      onExternalClose();
    } else {
      setIsOpen(false);
    }
  };

  const handleNavigate = (page: string) => {
    closeMenu();
    onNavigate(page);
  };

  const handleSignOut = async () => {
    await signOut();
    closeMenu();
  };

  return (
    <>
      {externalOpen === undefined && (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          aria-label="User menu"
        >
          <Menu className="w-6 h-6" />
        </button>
      )}

      {menuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-30 z-40 transition-opacity"
            onClick={closeMenu}
          />

          <div className={`fixed top-0 right-0 h-full w-72 md:w-80 bg-white dark:bg-gray-800 shadow-2xl z-50 transform transition-transform duration-300 ${
            menuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}>
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('menu', language)}</h2>
                <button
                  onClick={closeMenu}
                  className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={profile.username}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                      {profile?.username?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">{profile?.username}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                  </div>
                </div>
              </div>

              <nav className="flex-1 p-3 md:p-4 space-y-1">
                <button
                  onClick={() => handleNavigate('messages')}
                  className="w-full flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2.5 md:py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <MessageSquare className="w-5 h-5" />
                  <span className="font-medium text-sm md:text-base">{t('messages', language)}</span>
                </button>

                <button
                  onClick={() => handleNavigate('my-listings')}
                  className="w-full flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2.5 md:py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <ListIcon className="w-5 h-5" />
                  <span className="font-medium text-sm md:text-base">{t('myListings', language)}</span>
                </button>

                <button
                  onClick={() => handleNavigate('favorites')}
                  className="w-full flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2.5 md:py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <Heart className="w-5 h-5" />
                  <span className="font-medium text-sm md:text-base">{t('favorites', language)}</span>
                </button>

                <button
                  onClick={() => handleNavigate('profile')}
                  className="w-full flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2.5 md:py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <User className="w-5 h-5" />
                  <span className="font-medium text-sm md:text-base">{t('profile', language)}</span>
                </button>

                <button
                  onClick={() => handleNavigate('settings')}
                  className="w-full flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2.5 md:py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <Settings className="w-5 h-5" />
                  <span className="font-medium text-sm md:text-base">{t('settings', language)}</span>
                </button>

                <div className="pt-3 md:pt-4 mt-3 md:mt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2.5 md:py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium text-sm md:text-base">{t('logout', language)}</span>
                  </button>
                </div>
              </nav>
            </div>
          </div>
        </>
      )}
    </>
  );
}
