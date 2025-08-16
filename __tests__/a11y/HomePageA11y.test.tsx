import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import Home from '@/app/page';

// Mock Supabase client
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn().mockReturnValue({
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockResolvedValue({ 
      data: [], 
      error: null 
    })
  }),
  isSupabaseConfigured: true
}));

describe('Home Page Accessibility', () => {
  it('should have no accessibility violations', async () => {
    const { container } = render(<Home />);
    
    // Wait for content to load
    await screen.findByRole('heading', { name: /dashboard/i });
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has a proper document title', async () => {
    render(<Home />);
    // Check if document title is set by the page
    expect(document.title).toBeDefined();
    expect(document.title).not.toBe('');
  });

  it('has proper heading structure', async () => {
    render(<Home />);
    
    // Check for main heading
    const headings = await screen.findAllByRole('heading');
    const mainHeading = headings.find(h => h.textContent?.match(/dashboard/i));
    expect(mainHeading).toBeInTheDocument();
    expect(mainHeading).toBeInTheDocument();
  });

  it('has interactive elements with proper roles', async () => {
    render(<Home />);
    
    // Test if interactive elements have proper roles
    const buttons = await screen.findAllByRole('button');
    buttons.forEach(button => {
      expect(button).toBeInTheDocument();
    });
    
    const links = await screen.findAllByRole('link');
    links.forEach(link => {
      expect(link).toBeInTheDocument();
    });
  });
});
