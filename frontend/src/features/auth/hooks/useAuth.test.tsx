import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AuthProvider } from '../context/AuthProvider';
import { useAuth } from '../hooks/useAuth';

describe('useAuth', () => {
  it('debería devolver el valor del contexto cuando se usa dentro de un AuthProvider', () => {
    const TestComponent = () => {
      const { user } = useAuth();
      return <div>{user ? 'Usuario' : 'Nulo'}</div>;
    };

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Esperamos a que la carga inicial termine
    expect(screen.getByText('Nulo')).toBeInTheDocument();
  });

  it('debería lanzar un error cuando se usa fuera de un AuthProvider', () => {
    // Suprimimos el error de la consola para no ensuciar la salida de las pruebas
    const originalError = console.error;
    console.error = vi.fn();

    const TestComponent = () => {
      useAuth();
      return null;
    };

    // La función render de RTL envuelve el componente en un bloque try...catch
    // para capturar errores de renderizado.
    expect(() => render(<TestComponent />)).toThrow(
      'useAuth debe usarse dentro de un AuthProvider'
    );

    // Restauramos console.error
    console.error = originalError;
  });
});
