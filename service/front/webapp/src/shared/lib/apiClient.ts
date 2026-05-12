import axios from 'axios';

export const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Attach auth token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Redirect to login on 401 (only from protected pages)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const url = error.config?.url || '';
      const responseBody = error.response?.data;
      // eslint-disable-next-line no-console
      console.warn('[apiClient] 401', url, responseBody);

      // Skip auto-logout for auth endpoints: those errors are handled by the calling pages
      // (login form, 2FA form, register form) and a hard redirect would break the UX.
      const isAuthEndpoint = url.includes('/webapp/auth/');

      const publicPaths = ['/', '/catalog', '/support', '/login', '/register', '/forgot-password', '/reset-password', '/2fa'];
      const currentPath = window.location.pathname;
      const isPublic = publicPaths.some(
        (p) => currentPath === p || currentPath.startsWith('/products/') || currentPath.startsWith('/categories/'),
      );
      if (!isPublic && !isAuthEndpoint && localStorage.getItem('access_token')) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);

export default apiClient;
