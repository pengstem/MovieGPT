import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders MovieGPT title', () => {
  render(<App />);
  const titleElement = screen.getByText(/MovieGPT/i);
  expect(titleElement).toBeInTheDocument();
});

test('renders brand text', () => {
  render(<App />);
  const brandElement = screen.getByText(/404Found/i);
  expect(brandElement).toBeInTheDocument();
});
