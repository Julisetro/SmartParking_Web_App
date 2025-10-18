import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthContext } from '../features/auth/context/AuthContext';
import type { User } from '../features/auth/context/AuthContext';
import type { AuthContextType } from '../features/auth/context/AuthContext';
import { DashboardPage } from './DashboardPage';

// 1. Definimos un usuario simulado (mock) que imita la estructura de datos real.
const mockUser: User = {
  id: 1,
  email: 'john.doe@test.com',
  first_name: 'John',
  last_name: 'Doe',
  cedula: '123456789',
  celular: '3001234567',
};

// 2. Creamos una función de configuración (setup) para evitar repetir código.
// Esta función renderiza el DashboardPage con un contexto de autenticación simulado.
const setup = (contextValue: AuthContextType) => {
  return render(
    <MemoryRouter>
      <AuthContext.Provider value={contextValue}>
        <DashboardPage />
      </AuthContext.Provider>
    </MemoryRouter>
  );
};

describe('DashboardPage', () => {
  it('debería renderizar el mensaje de bienvenida con el nombre del usuario', () => {
    // Arrange: Preparamos un valor de contexto simulado con nuestro usuario
    // y funciones mock para las acciones de autenticación.
    const mockAuthContextValue: AuthContextType = {
      user: mockUser,
      accessToken: 'false-token',
      refreshToken: 'false-token',
      login: vi.fn(),
      logout: vi.fn(),
      register: vi.fn(),
      updateUser: vi.fn(),
      isLoading: false,
    };

    // Act: Renderizamos el componente con la configuración preparada.
    setup(mockAuthContextValue);

    // Assert: Verificamos que el mensaje de bienvenida se muestre correctamente.
    // Usamos una expresión regular para ser flexibles con el texto.
    const welcomeMessage = screen.getByText(/Bienvenido de vuelta, John/i);
    expect(welcomeMessage).toBeInTheDocument();
  });

  it('debería renderizar las tarjetas de información principales', () => {
    // Arrange: Usamos la misma configuración de contexto.
    const mockAuthContextValue: AuthContextType = {
      user: mockUser,
      accessToken: 'false-token',
      refreshToken: 'false-token',
      login: vi.fn(),
      logout: vi.fn(),
      register: vi.fn(),
      updateUser: vi.fn(),
      isLoading: false,
    };

    // Act: Renderizamos el componente.
    setup(mockAuthContextValue);

    // Assert: Verificamos que los títulos de las tarjetas principales del dashboard estén presentes.
    const reservaCard = screen.getByRole('heading', {
      name: /Tu Próxima Reserva/i,
    });
    const horarioCard = screen.getByRole('heading', {
      name: /Horario de Funcionamiento/i,
    });
    const noticiasCard = screen.getByRole('heading', {
      name: /Noticias y Anuncios/i,
    });

    expect(reservaCard).toBeInTheDocument();
    expect(horarioCard).toBeInTheDocument();
    expect(noticiasCard).toBeInTheDocument();
  });

  it('no debería renderizar nada si el usuario no está presente en el contexto', () => {
    // Arrange: Simulamos un estado donde no hay usuario.
    const mockAuthContextValue: AuthContextType = {
      user: null,
      accessToken: 'false-token',
      refreshToken: 'false-token',
      login: vi.fn(),
      logout: vi.fn(),
      register: vi.fn(),
      updateUser: vi.fn(),
      isLoading: false,
    };

    // Act: Renderizamos el componente.
    const { container } = setup(mockAuthContextValue);

    // Assert: El componente no debería renderizar su contenido principal.
    // En este caso, el componente renderiza un div vacío o null,
    // por lo que verificamos que el contenedor principal esté vacío.
    expect(container).toBeEmptyDOMElement();
  });
});
