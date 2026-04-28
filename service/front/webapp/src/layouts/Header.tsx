import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Search, Shield, Menu, X, LogIn } from 'lucide-react';
import { useCart } from '@/shared/context/CartContext';
import { useAuth } from '@/shared/context/AuthContext';
import { cn } from '@/shared/lib/utils';

export default function Header() {
  const { itemCount } = useCart();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/catalog?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-gray-900 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <Shield className="h-8 w-8 text-blue-400" />
            <span className="text-2xl font-bold tracking-wide">CYNA</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              to="/"
              className="text-gray-300 hover:text-white text-sm font-medium transition-colors"
            >
              Accueil
            </Link>
            <Link
              to="/catalog"
              className="text-gray-300 hover:text-white text-sm font-medium transition-colors"
            >
              Catalogue
            </Link>
            <Link
              to="/support"
              className="text-gray-300 hover:text-white text-sm font-medium transition-colors"
            >
              Support
            </Link>
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            {/* Search toggle */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
              aria-label="Rechercher"
            >
              <Search className="h-5 w-5 text-gray-300" />
            </button>

            {/* Account / Login */}
            {isAuthenticated ? (
              <Link
                to="/account"
                className="p-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-1"
                aria-label="Mon compte"
              >
                <User className="h-5 w-5 text-gray-300" />
                <span className="hidden lg:inline text-xs text-gray-300">{user?.firstName}</span>
              </Link>
            ) : (
              <Link
                to="/login"
                className="p-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-1"
                aria-label="Se connecter"
              >
                <LogIn className="h-5 w-5 text-gray-300" />
                <span className="hidden lg:inline text-xs text-gray-300">Connexion</span>
              </Link>
            )}

            {/* Cart */}
            <Link
              to="/cart"
              className="relative p-2 rounded-lg hover:bg-gray-700 transition-colors"
              aria-label="Panier"
            >
              <ShoppingCart className="h-5 w-5 text-gray-300" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </Link>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-700 transition-colors"
              aria-label="Menu"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5 text-gray-300" />
              ) : (
                <Menu className="h-5 w-5 text-gray-300" />
              )}
            </button>
          </div>
        </div>

        {/* Search bar (expandable) */}
        <div
          className={cn(
            'overflow-hidden transition-all duration-200',
            searchOpen ? 'max-h-16 pb-3' : 'max-h-0'
          )}
        >
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher des solutions de cybersécurité..."
              className="flex-1 h-9 px-3 rounded-lg bg-gray-700 text-white placeholder:text-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus={searchOpen}
            />
            <button
              type="submit"
              className="px-4 h-9 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors"
            >
              Rechercher
            </button>
          </form>
        </div>

        {/* Mobile nav */}
        <div
          className={cn(
            'md:hidden overflow-hidden transition-all duration-200',
            mobileMenuOpen ? 'max-h-48 pb-3' : 'max-h-0'
          )}
        >
          <nav className="flex flex-col gap-1">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white text-sm font-medium transition-colors"
            >
              Accueil
            </Link>
            <Link
              to="/catalog"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white text-sm font-medium transition-colors"
            >
              Catalogue
            </Link>
            <Link
              to="/support"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white text-sm font-medium transition-colors"
            >
              Support
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
