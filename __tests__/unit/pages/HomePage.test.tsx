import { render, screen } from '@testing-library/react';
import Home from '../../app/page';

// Mock the Supabase client
jest.mock('../../lib/supabase/server', () => ({
  createClient: jest.fn().mockReturnValue({
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockResolvedValue({
      data: [
        { id: 1, name: 'Test Agent', status: 'online', last_active: new Date().toISOString() },
      ],
      error: null,
    }),
  }),
  isSupabaseConfigured: true,
}));

describe('Home Page', () => {
  it('renders the dashboard title', async () => {
    render(<Home />);
    const title = await screen.findByText(/dashboard/i);
    expect(title).toBeInTheDocument();
  });

  it('displays agent status cards', async () => {
    render(<Home />);
    
    // Check for agent status sections
    const agentSections = await screen.findAllByText(/agent/i);
    expect(agentSections.length).toBeGreaterThan(0);
  });

  it('displays recent activity section', async () => {
    render(<Home />);
    
    // Check for recent activity section
    const activitySections = await screen.findAllByText(/activity|recent/i);
    expect(activitySections.length).toBeGreaterThan(0);
  });

  it('displays agent activity chart', async () => {
    render(<Home />);
    
    // Check for the chart container
    const chartContainers = await screen.findAllByRole('figure');
    expect(chartContainers.length).toBeGreaterThan(0);
  });
});
