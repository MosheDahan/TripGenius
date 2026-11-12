import React from 'react';
import { render, screen } from '@testing-library/react';
import { About } from './components/About';

test('shows project information on the public about page', () => {
  render(<About />);
  expect(screen.getByRole('heading', { name: /אודות TripSpark/i })).toBeInTheDocument();
  expect(screen.getByText(/פרטי המפתח\/ת/)).toBeInTheDocument();
});
