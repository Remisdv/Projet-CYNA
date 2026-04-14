import { Link } from 'react-router-dom';
import { Shield, Monitor, Globe, Wrench } from 'lucide-react';

const CATEGORIES = [
  {
    key: 'SOC',
    label: 'SOC',
    description: 'Security Operations Center — surveillance 24/7 de votre infrastructure.',
    icon: Shield,
    color: 'bg-blue-600',
  },
  {
    key: 'EDR',
    label: 'EDR',
    description: 'Endpoint Detection & Response — protection avancée de vos postes.',
    icon: Monitor,
    color: 'bg-indigo-600',
  },
  {
    key: 'XDR',
    label: 'XDR',
    description: 'Extended Detection & Response — vision unifiée multi-vecteurs.',
    icon: Globe,
    color: 'bg-purple-600',
  },
  {
    key: 'Service',
    label: 'Services',
    description: 'Conseil, audit, formation et accompagnement sur mesure.',
    icon: Wrench,
    color: 'bg-cyan-600',
  },
];

export default function CategoryGrid() {
  return (
    <section className="py-16">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="mb-10 text-center text-3xl font-bold text-gray-900">
          Nos domaines d&apos;expertise
        </h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {CATEGORIES.map(({ key, label, description, icon: Icon, color }) => (
            <Link
              key={key}
              to={`/catalog?categorie=${key}`}
              className="group flex flex-col items-center rounded-xl border border-gray-200 bg-white p-6 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className={`mb-4 flex h-14 w-14 items-center justify-center rounded-full ${color} text-white`}>
                <Icon size={28} />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900 group-hover:text-blue-600">
                {label}
              </h3>
              <p className="text-sm text-gray-500">{description}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
