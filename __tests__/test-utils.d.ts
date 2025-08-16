// Type declarations for test utilities
declare module '@testing-library/react' {
  // Extend the testing library types
  interface CustomRenderOptions {
    // Add any custom options here
  }

  // Declare our custom render function
  export const customRender: typeof import('@testing-library/react').render;
}

// Simple type for our test utilities
export type TestUtils = {
  render: typeof import('@testing-library/react').render;
};
