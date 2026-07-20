import React from 'react';
import { render, screen } from '@testing-library/react';
import RevenueChart from '@/app/admin/components/RevenueChart';

// Mock Recharts and next/dynamic to avoid rendering issues in Jest
jest.mock('next/dynamic', () => ({
  __esModule: true,
  default: () => {
    return function MockDynamicComponent(props: any) {
      return <div data-testid="mocked-dynamic-component" {...props}>{props.children}</div>;
    };
  },
}));

describe('RevenueChart Component', () => {
  const mockData = [
    { name: 'Oca', gerceklesen: 10000, hedef: 15000 },
    { name: 'Şub', gerceklesen: 20000, hedef: 18000 },
  ];

  it('renders the chart container without crashing', () => {
    render(<RevenueChart data={mockData} />);
    const container = screen.getByTestId('revenue-chart-container');
    expect(container).toBeInTheDocument();
  });
});
