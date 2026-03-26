// ========== TYPES ==========

export interface MockService {
  id: string;
  name: string;
  category: string;
  categorySlug: string;
  price: number;
  monthlyPrice?: number;
  annualPrice?: number;
  stock: number | 'unlimited';
  status: 'draft' | 'published';
  type: 'product' | 'service';
  lastModified: string;
  description: string;
  shortDescription: string;
  tags: string[];
  slug: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  lowStockThreshold: number;
  images: Array<{ url: string; altText: string; isPrimary: boolean }>;
}

export interface ServiceCategory {
  value: string;
  label: string;
}

// ========== MOCK DATA ==========

const mockServiceCategories: ServiceCategory[] = [
  { value: '', label: 'Toutes les catégories' },
  { value: 'soc', label: 'SOC' },
  { value: 'edr', label: 'EDR' },
  { value: 'xdr', label: 'XDR' },
  { value: 'service', label: 'Service' },
];

const generateMockServices = (): MockService[] => {
  const categories = ['SOC', 'EDR', 'XDR', 'Service'];
  const categoryMap: Record<string, string> = {
    SOC: 'soc',
    EDR: 'edr',
    XDR: 'xdr',
    Service: 'service',
  };
  const statuses: MockService['status'][] = ['draft', 'published'];
  const types: MockService['type'][] = ['product', 'service'];

  const serviceNames = [
    'SOC Monitoring Basic', 'SOC Monitoring Pro', 'SOC Monitoring Enterprise',
    'EDR Protection Lite', 'EDR Protection Standard', 'EDR Protection Advanced',
    'XDR Suite Starter', 'XDR Suite Business', 'XDR Suite Corporate',
    'Threat Intelligence Feed', 'Vulnerability Assessment', 'Penetration Testing',
    'Security Audit', 'Incident Response', 'Forensic Analysis',
    'Compliance Consulting', 'Security Training Basic', 'Security Training Advanced',
    'SIEM Integration', 'Log Management', 'Network Security Monitoring',
    'Endpoint Protection', 'Cloud Security', 'Identity Management',
    'Access Control Pro', 'Data Loss Prevention', 'Email Security Gateway',
    'Web Application Firewall', 'DDoS Protection', 'Zero Trust Architecture',
    'Security Operations Center', 'Managed Detection Response', 'Threat Hunting',
    'Red Team Assessment', 'Blue Team Training', 'Purple Team Exercise',
    'Ransomware Protection', 'Backup & Recovery', 'Disaster Recovery',
    'Business Continuity Planning', 'Risk Assessment', 'Security Policy Review',
  ];

  return serviceNames.map((name, index) => {
    const category = categories[index % categories.length];
    const type = types[index % 2];
    const isService = type === 'service';
    const basePrice = 50 + Math.random() * 500;
    const monthlyPrice = isService ? Math.round(basePrice) : undefined;
    const annualPrice = isService ? Math.round(monthlyPrice! * 12 * 0.85) : undefined;

    return {
      id: `srv-${(index + 1).toString().padStart(3, '0')}`,
      name,
      category,
      categorySlug: categoryMap[category],
      price: isService ? monthlyPrice! : Math.round(basePrice),
      monthlyPrice,
      annualPrice,
      stock: isService ? 'unlimited' : Math.floor(Math.random() * 200),
      status: statuses[Math.floor(Math.random() * 2)],
      type,
      lastModified: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      description: `Description détaillée de ${name}. Ce service/produit offre une protection complète contre les menaces modernes.`,
      shortDescription: `${name} - Solution de cybersécurité professionnelle`,
      tags: ['cybersecurity', category.toLowerCase(), type],
      slug: name.toLowerCase().replace(/\s+/g, '-'),
      metaTitle: `${name} | Cyna Security`,
      metaDescription: `Découvrez ${name}, notre solution de ${category} pour protéger votre entreprise.`,
      keywords: `${name.toLowerCase()}, ${category.toLowerCase()}, cybersecurity, protection`,
      lowStockThreshold: 10,
      images: [
        { url: `https://picsum.photos/seed/${index}/400/300`, altText: name, isPrimary: true },
      ],
    };
  });
};

const mockServices = generateMockServices();

// ========== HOOKS ==========

export const useServices = () => ({
  data: mockServices,
  isLoading: false as const,
  isError: false as const,
});

export const useServiceCategories = () => ({
  data: mockServiceCategories,
  isLoading: false as const,
});
