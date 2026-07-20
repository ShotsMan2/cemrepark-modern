import React from 'react';
import { render, screen } from '@testing-library/react';
import UserGrowthChart from '@/app/admin/components/UserGrowthChart';

// Mock Recharts and next/dynamic to avoid rendering issues in Jest
jest.mock('next/dynamic', () => ({
  __esModule: true,
  default: () => {
    return function MockDynamicComponent(props: any) {
      return <div data-testid="mocked-dynamic-component" {...props}>{props.children}</div>;
    };
  },
}));

describe('UserGrowthChart Component', () => {
  const mockData = [
    { month: 'Jan', users: 400 },
    { month: 'Feb', users: 600 },
  ];

  it('renders the chart container without crashing', () => {
    render(<UserGrowthChart data={mockData} />);
    const container = screen.getByTestId('user-growth-chart-container');
    expect(container).toBeInTheDocument();
  });
});
