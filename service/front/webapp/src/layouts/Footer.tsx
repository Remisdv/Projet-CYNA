import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { usePublicCategories, getCategoryName } from '@/features/catalog/hooks/useCategories';

export default function Footer() {
  const { data: categories = [] } = usePublicCategories();

  return (
    <footer className="bg-gray-900 text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="h-6 w-6 text-blue-400" />
              <span className="text-white text-xl font-bold">CYNA</span>
            </div>
            <p className="text-sm leading-relaxed">
              Votre partenaire de confiance en solutions de cybersécurité. Protégez les
              organisations dans le monde entier.
            </p>
          </div>

          {/* Products */}
          <div>
            <h3 className="text-white font-semibold mb-4">Produits</h3>
            <ul className="space-y-2 text-sm">
              {categories.map((cat) => (
                <li key={cat.id}>
                  <Link
                    to={`/catalog?categorie=${encodeURIComponent(cat.id)}`}
                    className="hover:text-white transition-colors"
                  >
                    {getCategoryName(cat)}
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/catalog" className="hover:text-white transition-colors">
                  Tous les Produits
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/support" className="hover:text-white transition-colors">
                  Nous Contacter
                </Link>
              </li>
              <li>
                <Link to="/account" className="hover:text-white transition-colors">
                  Mon Compte
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="mailto:info@cyna.com" className="hover:text-white transition-colors">
                  info@cyna.com
                </a>
              </li>
              <li>
                <a href="tel:+33123456789" className="hover:text-white transition-colors">
                  +33 1 23 45 67 89
                </a>
              </li>
              <li className="text-gray-500">Paris, France</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm">© {new Date().getFullYear()} CYNA. Tous droits réservés.</p>
          <div className="flex gap-6 text-sm">
            <Link to="/privacy" className="hover:text-white transition-colors">
              Politique de Confidentialité
            </Link>
            <Link to="/terms" className="hover:text-white transition-colors">
              Conditions d'Utilisation
            </Link>
            <Link to="/legal" className="hover:text-white transition-colors">
              Mentions Légales
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
