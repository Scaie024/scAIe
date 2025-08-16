// Importa los métodos de testing-library/jest-dom
import '@testing-library/jest-dom';

// Configuración de mocks globales
// Mock para next/router
jest.mock('next/router', () => ({
  useRouter() {
    return ({
      route: '/',
      pathname: '',
      query: '',
      asPath: '',
      push: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn()
      },
      beforePopState: jest.fn(() => null),
      prefetch: jest.fn(() => Promise.resolve(true))
    });
  },
}));

// Mock para Supabase
jest.mock('@supabase/supabase-js', () => {
  return {
    createClient: jest.fn(() => ({
      auth: {
        signIn: jest.fn(),
        signUp: jest.fn(),
        signOut: jest.fn(),
        user: jest.fn(),
        session: jest.fn(),
      },
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockReturnThis(),
      data: { user: null, session: null },
      error: null,
    })),
  };
});
