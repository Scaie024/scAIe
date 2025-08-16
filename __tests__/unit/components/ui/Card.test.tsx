import { render, screen } from '@testing-library/react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

describe('Card Components', () => {
  it('renders Card with children', () => {
    render(
      <Card data-testid="test-card">
        <CardContent>Test Content</CardContent>
      </Card>
    );
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('renders CardHeader with title and description', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Test Title</CardTitle>
          <CardDescription>Test Description</CardDescription>
        </CardHeader>
      </Card>
    );
    
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(
      <Card className="custom-card" data-testid="custom-card">
        <CardContent>Test</CardContent>
      </Card>
    );
    
    const card = screen.getByTestId('custom-card');
    expect(card).toHaveClass('custom-card');
  });
});
