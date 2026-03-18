// ========== TYPES ==========

export interface MockUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'client' | 'admin' | 'commercial';
  status: 'active' | 'inactive';
  registeredAt: string;
  lastLogin?: string;
  ordersCount: number;
}

// ========== MOCK DATA ==========

const generateMockUsers = (): MockUser[] => {
  const firstNames = [
    'Jean', 'Marie', 'Pierre', 'Sophie', 'Luc', 'Anne', 'Paul', 'Claire',
    'Marc', 'Julie', 'Thomas', 'Emma', 'Nicolas', 'Laura', 'David', 'Sarah',
    'François', 'Céline', 'Michel', 'Isabelle', 'Jacques', 'Nathalie', 'Philippe', 'Valérie',
  ];

  const lastNames = [
    'Dupont', 'Martin', 'Bernard', 'Petit', 'Robert', 'Richard', 'Durand', 'Dubois',
    'Moreau', 'Simon', 'Laurent', 'Lefebvre', 'Michel', 'Garcia', 'David', 'Bertrand',
    'Roux', 'Vincent', 'Fournier', 'Morel', 'Girard', 'André', 'Lefevre', 'Mercier',
  ];

  // Only Admin and Commercial users (internal users with BO access)
  return Array.from({ length: 35 }, (_, index) => {
    const firstName = firstNames[index % firstNames.length];
    const lastName = lastNames[Math.floor(index / 2) % lastNames.length];
    const role: MockUser['role'] = index < 10 ? 'admin' : 'commercial';
    const status: MockUser['status'] = Math.random() > 0.15 ? 'active' : 'inactive';
    const daysAgo = Math.floor(Math.random() * 730);
    const registeredAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString();

    return {
      id: `user-${(index + 1).toString().padStart(3, '0')}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${index > 20 ? index : ''}@cyna-security.com`,
      firstName,
      lastName,
      role,
      status,
      registeredAt,
      lastLogin: status === 'active'
        ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
        : undefined,
      ordersCount: 0,
    };
  });
};

const mockUsers = generateMockUsers();

// ========== HOOK ==========

export const useUsers = () => ({
  data: mockUsers,
  isLoading: false as const,
  isError: false as const,
});
