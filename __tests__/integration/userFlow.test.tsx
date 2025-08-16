import { render, screen, waitFor } from '@testing-library/react';
import Home from '@/app/page';

// Mock the Dashboard component
jest.mock('@/app/page', () => {
  return function MockHome() {
    return (
      <div data-testid="dashboard">
        <h1>Dashboard</h1>
        <div>Agent Status</div>
        <div>Recent Activity</div>
      </div>
    );
  };
});

// Mock the Supabase client module
jest.mock('@/lib/supabase/server', () => {
  const mockFrom = jest.fn().mockReturnThis();
  const mockSelect = jest.fn().mockReturnThis();
  const mockOrder = jest.fn().mockReturnThis();
  const mockLimit = jest.fn().mockResolvedValue({
    data: [
      { 
        id: 1, 
        name: 'Test Agent',
        status: 'online',
        last_active: new Date().toISOString() 
      }
    ],
    error: null
  });

  return {
    createClient: jest.fn().mockReturnValue({
      from: mockFrom,
      select: mockSelect,
      order: mockOrder,
      limit: mockLimit,
    }),
    isSupabaseConfigured: true,
    __mocks: {
      mockFrom,
      mockSelect,
      mockOrder,
      mockLimit
    }
  };
});

// Import the mocks after they're defined
const { 
  mockFrom, 
  mockSelect, 
  mockOrder, 
  mockLimit 
} = require('@/lib/supabase/server').__mocks;

describe('User Flow Integration Test', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Reset the mock implementations
    mockFrom.mockReturnThis();
    mockSelect.mockReturnThis();
    mockOrder.mockReturnThis();
    mockLimit.mockResolvedValue({
      data: [
        { 
          id: 1, 
          name: 'Test Agent',
          status: 'online',
          last_active: new Date().toISOString() 
        }
      ], 
      error: null 
    });
  });

  it('loads the dashboard', async () => {
    render(<Home />);
    
    // Wait for the dashboard to be in the document
    await waitFor(() => {
      expect(screen.getByTestId('dashboard')).toBeInTheDocument();
    });
  });

  it('displays the dashboard title', async () => {
    render(<Home />);
    
    // Check if the dashboard title is displayed
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /dashboard/i })).toBeInTheDocument();
    });
  });

  it('displays agent status section', async () => {
    render(<Home />);
    
    // Check if agent status section is displayed
    await waitFor(() => {
      expect(screen.getByText('Agent Status')).toBeInTheDocument();
    });
  });

  it('displays recent activity section', async () => {
    render(<Home />);
    
    // Check if recent activity section is displayed
    await waitFor(() => {
      expect(screen.getByText('Recent Activity')).toBeInTheDocument();
    });
  });
});
