import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the Career Bridge home page', () => {
  render(<App />);

  expect(screen.getByRole('heading', { name: 'Connecting Students and Industry' })).toBeInTheDocument();
  expect(screen.getAllByRole('button', { name: 'Login' })).toHaveLength(2);
  expect(screen.getAllByRole('button', { name: 'Register' })).toHaveLength(2);
});
