import { Link } from 'react-router-dom';
import { Shield, Monitor, Globe, Wrench, Lock, Server, Cpu, Eye } from 'lucide-react';
import { usePublicCategories, getCategoryName, getCategoryDescription } from '../catalog/hooks/useCategories';

const ICONS = [Shield, Monitor, Globe, Wrench, Lock, Server, Cpu, Eye];
const COLORS = [
  'bg-blue-600',
  'bg-indigo-600',
  'bg-purple-600',
  'bg-cyan-600',
  'bg-teal-600',
  'bg-violet-600',
  'bg-sky-600',
  'bg-emerald-600',
];

export default function CategoryGrid() {
  const { data: categories = [] } = usePublicCategories();

  return (
    <section className="py-16">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="mb-10 text-center text-3xl font-bold text-gray-900">
          Nos domaines d&apos;expertise
        </h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((cat, i) => {
            const Icon = ICONS[i % ICONS.length];
            const color = COLORS[i % COLORS.length];
            const name = getCategoryName(cat);
            const description = getCategoryDescription(cat);
            return (
              <Link
                key={cat.id}
                to={`/catalog?categorie=${encodeURIComponent(cat.id)}`}
                className="group flex flex-col items-center rounded-xl border border-gray-200 bg-white p-6 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className={`mb-4 flex h-14 w-14 items-center justify-center rounded-full ${color} text-white`}>
                  <Icon size={28} />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900 group-hover:text-blue-600">
                  {name}
                </h3>
                {description && (
                  <p className="text-sm text-gray-500">{description}</p>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
