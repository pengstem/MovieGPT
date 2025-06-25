import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders MovieGPT title', () => {
  render(<App />);
  const titleElement = screen.getByText(/MovieGPT/i);
  expect(titleElement).toBeInTheDocument();
});

test('renders welcome text', () => {
  render(<App />);
  const welcomeElement = screen.getByText(/hello/i);
  expect(welcomeElement).toBeInTheDocument();
}); 