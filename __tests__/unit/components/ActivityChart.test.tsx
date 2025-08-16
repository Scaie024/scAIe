import { render, screen } from '@testing-library/react';
import ActivityChart from '@/components/ActivityChart';

describe('ActivityChart', () => {
  const mockData = [
    { day: 'Mon', interactions: 10, leads: 2 },
    { day: 'Tue', interactions: 15, leads: 3 },
    { day: 'Wed', interactions: 8, leads: 1 },
  ];

  it('renders the chart with the correct title', () => {
    render(<ActivityChart data={mockData} />);
    const title = screen.getByText(/agent activity/i);
    expect(title).toBeInTheDocument();
  });

  it('displays all data points', () => {
    render(<ActivityChart data={mockData} />);
    
    // Check if all days are displayed
    mockData.forEach(({ day }) => {
      expect(screen.getByText(day)).toBeInTheDocument();
    });
  });

  it('handles empty data gracefully', () => {
    render(<ActivityChart data={[]} />);
    const noDataMessage = screen.getByText(/no data available/i);
    expect(noDataMessage).toBeInTheDocument();
  });
});
