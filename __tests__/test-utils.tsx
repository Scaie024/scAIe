import { render as rtlRender } from '@testing-library/react';
import { ReactElement } from 'react';

// Simple wrapper for tests
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

// Custom render function that wraps components with necessary providers
export const render = (
  ui: ReactElement,
  options = {}
) => {
  return rtlRender(ui, {
    wrapper: AllTheProviders,
    ...options,
  });
};

// Re-export everything from testing-library/react
export * from '@testing-library/react';
