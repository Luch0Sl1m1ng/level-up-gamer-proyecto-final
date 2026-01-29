import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import App from './App';

test('Verifica que la aplicacion LevelUp Gamer carga correctamente', () => {
  render(<App />);

  const linkElement = screen.getByText(/LevelUp Gamer/i);
  expect(linkElement).toBeDefined();
});